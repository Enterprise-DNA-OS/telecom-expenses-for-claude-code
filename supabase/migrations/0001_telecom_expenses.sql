create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table carriers (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger carriers_updated before update on carriers for each row execute function touch_updated();
alter table carriers enable row level security;
revoke all on carriers from public;
create table accounts (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, carrier_id uuid not null references carriers, currency text not null check(currency ~ '^[A-Z]{3}$'), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger accounts_updated before update on accounts for each row execute function touch_updated();
alter table accounts enable row level security;
revoke all on accounts from public;
create table centres (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger centres_updated before update on centres for each row execute function touch_updated();
alter table centres enable row level security;
revoke all on centres from public;
create table services (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, account_id uuid not null references accounts,
 centre_id uuid references centres, owner_name text not null default '', location text not null default '',
 monthly_cents bigint not null check(monthly_cents between 0 and 100000000000),
 status text not null default 'active' check(status in ('active','ceased')),
 ceased_on date, renewal_on date not null, notice_days integer not null default 30 check(notice_days between 0 and 730),
 purpose text not null default '', privacy_review_on date,
 check((status='ceased' and ceased_on is not null) or (status='active' and ceased_on is null)), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger services_updated before update on services for each row execute function touch_updated();
alter table services enable row level security;
revoke all on services from public;
create table invoices (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, account_id uuid not null references accounts,
 issued_on date not null, period_start date not null, period_end date not null, due_on date not null,
 total_cents bigint not null check(total_cents between 0 and 100000000000),
 tax_year_end date not null, retain_until date not null, evidence text not null default '',
 status text not null default 'draft' check(status in ('draft','reviewed')),
 check(period_end>=period_start), check(due_on>=issued_on), check(tax_year_end>=issued_on), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger invoices_updated before update on invoices for each row execute function touch_updated();
alter table invoices enable row level security;
revoke all on invoices from public;
create table charges (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, invoice_id uuid not null references invoices,
 service_id uuid references services, service_ref text not null default '',
 kind text not null check(kind in ('recurring','usage','one_off','tax')),
 amount_cents bigint not null check(amount_cents between 0 and 100000000000), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger charges_updated before update on charges for each row execute function touch_updated();
alter table charges enable row level security;
revoke all on charges from public;
create table allocations (id uuid primary key default gen_random_uuid(), charge_id uuid not null references charges, centre_id uuid not null references centres, amount_cents bigint not null check(amount_cents>0), unique(charge_id,centre_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger allocations_updated before update on allocations for each row execute function touch_updated();
alter table allocations enable row level security;
revoke all on allocations from public;
create table disputes (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, charge_id uuid not null references charges,
 requested_cents bigint not null check(requested_cents>0), reason text not null,
 follow_up_on date not null, evidence text not null,
 status text not null default 'open' check(status in ('open','submitted','accepted','rejected','closed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger disputes_updated before update on disputes for each row execute function touch_updated();
alter table disputes enable row level security;
revoke all on disputes from public;
create table credits (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, dispute_id uuid not null references disputes,
 invoice_id uuid not null references invoices, amount_cents bigint not null check(amount_cents>0),
 received_on date not null, evidence text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger credits_updated before update on credits for each row execute function touch_updated();
alter table credits enable row level security;
revoke all on credits from public;
create table notes (id uuid primary key default gen_random_uuid(), service_id uuid not null references services, body text not null, actor text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger notes_updated before update on notes for each row execute function touch_updated();
alter table notes enable row level security;
revoke all on notes from public;
create table actions (id uuid primary key default gen_random_uuid(), actor text not null, action text not null, record_id uuid, detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger actions_updated before update on actions for each row execute function touch_updated();
alter table actions enable row level security;
revoke all on actions from public;
create table import_batches (id uuid primary key default gen_random_uuid(), code text not null unique, digest text not null, counts jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger import_batches_updated before update on import_batches for each row execute function touch_updated();
alter table import_batches enable row level security;
revoke all on import_batches from public;

create index on services(account_id); create index on charges(invoice_id); create index on charges(service_id);
create index on allocations(charge_id); create index on disputes(charge_id); create index on credits(dispute_id);
create view v_bill_audit as
 select c.id,c.code as charge,c.name,i.code as invoice,s.code as service,a.currency,c.amount_cents,
 case when c.service_id is null and c.kind<>'tax' then 'unknown service'
 when s.status='ceased' and i.period_start>s.ceased_on then 'billed after cessation'
 when c.kind='recurring' and c.amount_cents>s.monthly_cents then 'above monthly reference'
 else null end as issue
 from charges c join invoices i on i.id=c.invoice_id join accounts a on a.id=i.account_id
 left join services s on s.id=c.service_id;
create view v_allocations as
 select c.id,c.code as charge,i.code as invoice,a.currency,c.amount_cents,
 coalesce((select sum(x.amount_cents) from allocations x where x.charge_id=c.id),0)::bigint as allocated_cents,
 (c.amount_cents-coalesce((select sum(x.amount_cents) from allocations x where x.charge_id=c.id),0))::bigint as remaining_cents
 from charges c join invoices i on i.id=c.invoice_id join accounts a on a.id=i.account_id;
create view v_credit_chase as
 select d.id,d.code as dispute,d.name,c.code as charge,a.currency,d.requested_cents,
 coalesce((select sum(k.amount_cents) from credits k where k.dispute_id=d.id),0)::bigint as received_cents,
 (d.requested_cents-coalesce((select sum(k.amount_cents) from credits k where k.dispute_id=d.id),0))::bigint as remaining_cents,
 d.status,d.follow_up_on from disputes d join charges c on c.id=d.charge_id
 join invoices i on i.id=c.invoice_id join accounts a on a.id=i.account_id;
create view v_renewals as
 select s.id,s.code as service,s.name,s.location,a.currency,s.monthly_cents,s.renewal_on,
 s.renewal_on-s.notice_days as decision_on from services s join accounts a on a.id=s.account_id where s.status='active';
create view v_compliance as
 select id,code as record,'NZ-TAX-7'::text as rule,'Missing invoice evidence or retention shorter than seven years after tax year end'::text as issue
 from invoices where evidence='' or retain_until < (tax_year_end+interval '7 years')::date
 union all select id,code,'NZ-IPP9','Review owner information purpose and retention'
 from services where owner_name<>'' and (purpose='' or privacy_review_on is null or privacy_review_on<current_date);
create view v_invoice_review as
 select i.id,i.code as invoice,a.currency,i.total_cents,
 coalesce((select sum(c.amount_cents) from charges c where c.invoice_id=i.id),0)::bigint as loaded_cents,
 i.due_on,i.status,i.evidence from invoices i join accounts a on a.id=i.account_id;
create view v_cost_centres as
 select z.code as centre,z.name,a.currency,sum(x.amount_cents)::bigint as allocated_cents
 from allocations x join centres z on z.id=x.centre_id join charges c on c.id=x.charge_id
 join invoices i on i.id=c.invoice_id join accounts a on a.id=i.account_id group by z.code,z.name,a.currency;
revoke all on v_bill_audit,v_allocations,v_credit_chase,v_renewals,v_compliance,v_invoice_review,v_cost_centres from public;
