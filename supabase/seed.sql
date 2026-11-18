do $$ begin
 if exists(select 1 from carriers where code='DEMO-CARRIER') then return; end if;
 insert into carriers(code,name) values ('DEMO-CARRIER','Harbour Telecom Demo');
 insert into accounts(code,name,carrier_id,currency) select 'DEMO-NZ','Harbour NZ account',id,'NZD' from carriers where code='DEMO-CARRIER';
 insert into centres(code,name) values ('OPS','Operations'),('OFFICE','Office');
 insert into services(code,name,account_id,centre_id,owner_name,location,monthly_cents,renewal_on,notice_days,purpose,privacy_review_on)
 select 'AKL-FIBRE','Auckland fibre',a.id,z.id,'Office manager','Auckland',30000,current_date+20,30,'Service contact',current_date-3 from accounts a,centres z where a.code='DEMO-NZ' and z.code='OFFICE';
 insert into services(code,name,account_id,location,monthly_cents,status,ceased_on,renewal_on)
 select 'WLG-OLD','Wellington old circuit',id,'Wellington',20000,'ceased',current_date-60,current_date-20 from accounts where code='DEMO-NZ';
 insert into services(code,name,account_id,centre_id,location,monthly_cents,renewal_on)
 select 'AKL-BACKUP','Auckland backup',a.id,z.id,'Auckland',10000,current_date+120 from accounts a,centres z where a.code='DEMO-NZ' and z.code='OPS';
 insert into invoices(code,name,account_id,issued_on,period_start,period_end,due_on,total_cents,tax_year_end,retain_until,evidence)
 select 'DEMO-NOV','Monthly carrier bill',id,current_date-10,current_date-30,current_date-1,current_date-2,65000,(extract(year from current_date)::int+1||'-03-31')::date,(extract(year from current_date)::int+8||'-03-31')::date,'demo://carrier-invoice' from accounts where code='DEMO-NZ';
 insert into charges(code,name,invoice_id,service_id,service_ref,kind,amount_cents)
 select 'CH-001','Fibre monthly charge',i.id,s.id,s.code,'recurring',35000 from invoices i,services s where i.code='DEMO-NOV' and s.code='AKL-FIBRE';
 insert into charges(code,name,invoice_id,service_id,service_ref,kind,amount_cents)
 select 'CH-002','Ceased circuit billed',i.id,s.id,s.code,'recurring',20000 from invoices i,services s where i.code='DEMO-NOV' and s.code='WLG-OLD';
 insert into charges(code,name,invoice_id,service_ref,kind,amount_cents)
 select 'CH-003','Unmatched service charge',id,'UNKNOWN-009','recurring',10000 from invoices where code='DEMO-NOV';
 insert into allocations(charge_id,centre_id,amount_cents) select c.id,z.id,35000 from charges c,centres z where c.code='CH-001' and z.code='OFFICE';
 insert into disputes(code,name,charge_id,requested_cents,reason,follow_up_on,evidence,status)
 select 'DSP-001','Ceased service credit',id,20000,'Billed after confirmed cessation',current_date-5,'demo://cessation-confirmation','accepted' from charges where code='CH-002';
 insert into credits(code,name,dispute_id,invoice_id,amount_cents,received_on,evidence)
 select 'CR-001','Partial carrier credit',d.id,i.id,5000,current_date-2,'demo://credit-note' from disputes d,invoices i where d.code='DSP-001' and i.code='DEMO-NOV';
 insert into notes(service_id,body,actor) select id,'Cessation confirmed. Check the next carrier bill.','Demo operator' from services where code='WLG-OLD';
end $$;
