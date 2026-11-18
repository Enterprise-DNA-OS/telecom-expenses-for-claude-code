#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const entities=['carriers','accounts','centres','services','invoices','charges','allocations','disputes','credits','notes','actions','import_batches'];
export const specs={
 carrier:{table:'carriers',fields:['code','name']},
 account:{table:'accounts',fields:['code','name','carrier','currency'],refs:{carrier:'carriers'}},
 centre:{table:'centres',fields:['code','name']},
 service:{table:'services',fields:['code','name','account','centre?','owner_name?','location?','monthly_cents','renewal_on','notice_days?','purpose?','privacy_review_on?'],refs:{account:'accounts',centre:'centres'}},
 invoice:{table:'invoices',fields:['code','name','account','issued_on','period_start','period_end','due_on','total_cents','tax_year_end','retain_until','evidence?'],refs:{account:'accounts'}},
 charge:{table:'charges',fields:['code','name','invoice','service?','service_ref?','kind','amount_cents'],refs:{invoice:'invoices',service:'services'}},
};
export const reads={
 carriers:'select code,name from carriers order by code',
 accounts:'select a.code,a.name,c.name as carrier,a.currency from accounts a join carriers c on c.id=a.carrier_id order by a.code',
 centres:'select code,name from centres order by code',
 services:'select s.code,s.name,a.code as account,s.location,s.status,a.currency,s.monthly_cents,s.renewal_on from services s join accounts a on a.id=s.account_id order by s.code',
 invoices:'select * from v_invoice_review order by due_on,invoice',
 charges:'select * from v_bill_audit order by invoice,charge',
 'bill-audit':'select charge,invoice,service,issue,currency,amount_cents from v_bill_audit where issue is not null order by charge',
 'allocation-review':'select charge,invoice,currency,amount_cents,allocated_cents,remaining_cents from v_allocations where remaining_cents<>0 order by charge',
 'cost-centres':'select * from v_cost_centres order by centre,currency',
 'renewals-due':"select service,name,decision_on,renewal_on,currency,monthly_cents from v_renewals where decision_on<=current_date+60 order by decision_on,service",
 disputes:'select * from v_credit_chase order by follow_up_on,dispute',
 'credit-chase':"select dispute,name,currency,requested_cents,received_cents,remaining_cents,follow_up_on from v_credit_chase where status in ('open','submitted','accepted') and remaining_cents>0 order by follow_up_on,dispute",
 compliance:'select record,rule,issue from v_compliance order by rule,record',
 audit:'select actor,action,record_id,detail,created_at from actions order by created_at,id',
 imports:'select code,digest,counts,created_at from import_batches order by created_at,id'
};
export const questions=[
 ['Which ceased services are still billed?',"select charge,service,invoice,currency,amount_cents from v_bill_audit where issue='billed after cessation' order by charge"],
 ['Which recurring charges exceed the service reference?',"select charge,service,invoice,currency,amount_cents from v_bill_audit where issue='above monthly reference' order by charge"],
 ['Which charges have no known service?',"select charge,invoice,currency,amount_cents from v_bill_audit where issue='unknown service' order by charge"],
 ['Which service decisions are due before renewal?',reads['renewals-due']],
 ['Which accepted disputes still await a credit?',"select dispute,currency,remaining_cents,follow_up_on from v_credit_chase where status='accepted' and remaining_cents>0 order by dispute"],
 ['Which charges remain partly or wholly unallocated?',reads['allocation-review']],
 ['Which invoices disagree with loaded charge totals?',"select invoice,currency,total_cents,loaded_cents from v_invoice_review where total_cents<>loaded_cents order by invoice"],
 ['Which active services have no cost centre?',"select code,name,location from services where status='active' and centre_id is null order by code"],
 ['Which unreviewed invoices are overdue?',"select invoice,currency,total_cents,due_on from v_invoice_review where status='draft' and due_on<current_date order by due_on,invoice"],
 ['Which billed services also need a privacy review?',"select distinct s.code,s.name from services s join charges c on c.service_id=s.id join v_compliance v on v.id=s.id where v.rule='NZ-IPP9' order by s.code"]
];
function required(v,k){if(v===undefined||v===null||String(v).trim()==='')throw Error(`Missing ${k}`);return String(v).trim();}
function integer(v,k){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||Number(v)>100000000000)throw Error(`Invalid nonnegative integer ${k}`);return Number(v);}
function date(v,k){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`Invalid calendar date ${k}`);return v;}
export async function resolve(db,t,q){
 required(q,t);if(!entities.includes(t))throw Error('Unknown entity');
 const exact=await db.query(`select * from ${t} where id::text=$1 or lower(code)=lower($1)`,[q]);
 if(exact.length===1)return exact[0];
 const rows=await db.query(`select * from ${t} where starts_with(id::text,lower($1)) or strpos(lower(name),lower($1))>0 order by code`,[q]);
 if(rows.length!==1){const e=Error(rows.length?`Ambiguous ${t}: ${q}`:`No ${t}: ${q}`);e.candidates=rows.map(r=>({id:r.id,code:r.code,name:r.name}));throw e;}return rows[0];
}
async function audit(db,actor,action,id,detail){await db.query('insert into actions(actor,action,record_id,detail) values($1,$2,$3,$4)',[required(actor,'actor'),action,id,JSON.stringify(detail)]);}
async function insert(db,t,v){const keys=Object.keys(v);return (await db.query(`insert into ${t} (${keys.join(',')}) values (${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(v)))[0];}
async function invoiceDraft(db,id){const row=(await db.query('select * from invoices where id=$1 for update',[id]))[0];if(!row||row.status!=='draft')throw Error('Invoice is reviewed or missing; original charges are locked');return row;}
export async function add(db,kind,input,actor){
 const spec=specs[kind];if(!spec)throw Error('Unknown record kind');const v={};
 const allowed=new Set(spec.fields.map(f=>f.replace('?','')));for(const k of Object.keys(input))if(!allowed.has(k))throw Error(`Unknown ${kind} field ${k}`);
 for(const f of spec.fields){const k=f.replace('?',''),x=input[k];if(x===undefined||x===''){if(f.endsWith('?'))continue;required(x,k);}
 let value=required(x,k);
 if(spec.refs?.[k]){v[k+'_id']=(await resolve(db,spec.refs[k],value)).id;continue;}
 if(k.endsWith('_cents')||k==='notice_days')value=integer(value,k);
 if(k.endsWith('_on')||['period_start','period_end','tax_year_end','retain_until'].includes(k))value=date(value,k);
 v[k]=value;
 }
 if(v.currency)v.currency=v.currency.toUpperCase();
 if(kind==='charge'){
  const i=await invoiceDraft(db,v.invoice_id);
  if(v.service_id){const s=(await db.query('select * from services where id=$1',[v.service_id]))[0];if(s.account_id!==i.account_id)throw Error('Service belongs to a different account');v.service_ref ||=s.code;}
 }
 const r=await insert(db,spec.table,v);await audit(db,actor,`add-${kind}`,r.id,r);return r;
}
async function mutate(db,cmd,args,o){
 const actor=required(o.actor,'--actor');const q=args[0];
 if(cmd.startsWith('add-')){const input={...o};delete input.actor;delete input.json;return add(db,cmd.slice(4),input,actor);}
 if(cmd==='allocate'){
  const c=await resolve(db,'charges',q);await invoiceDraft(db,c.invoice_id);const z=await resolve(db,'centres',required(o.centre,'centre'));const amount=integer(required(o.cents,'cents'),'cents');if(amount<=0)throw Error('Allocation must be positive');
  const sum=Number((await db.query('select coalesce(sum(amount_cents),0)::bigint as n from allocations where charge_id=$1 and centre_id<>$2',[c.id,z.id]))[0].n);
  if(sum+amount>Number(c.amount_cents))throw Error('Allocation exceeds charge');
  const r=(await db.query('insert into allocations(charge_id,centre_id,amount_cents) values($1,$2,$3) on conflict(charge_id,centre_id) do update set amount_cents=excluded.amount_cents returning *',[c.id,z.id,amount]))[0];await audit(db,actor,cmd,c.id,r);return r;
 }
 if(cmd==='link-charge'){
  const c=await resolve(db,'charges',q);const i=await invoiceDraft(db,c.invoice_id);const s=await resolve(db,'services',required(o.service,'service'));
  if(s.account_id!==i.account_id)throw Error('Service belongs to a different account');
  const r=(await db.query('update charges set service_id=$2,service_ref=$3 where id=$1 returning *',[c.id,s.id,s.code]))[0];await audit(db,actor,cmd,c.id,{before:c,after:r,evidence:required(o.evidence,'evidence')});return r;
 }
 if(cmd==='review-service'){
  const s=await resolve(db,'services',q);if(s.status!=='active')throw Error('Only active services can be renewed');
  const centre=await resolve(db,'centres',required(o.centre,'centre'));
  const r=(await db.query('update services set monthly_cents=$2,renewal_on=$3,notice_days=$4,centre_id=$5 where id=$1 returning *',[s.id,integer(required(o.monthly_cents,'monthly_cents'),'monthly_cents'),date(required(o.renewal_on,'renewal_on'),'renewal_on'),integer(required(o.notice_days,'notice_days'),'notice_days'),centre.id]))[0];await audit(db,actor,cmd,s.id,{before:s,after:r,evidence:required(o.evidence,'evidence')});return r;
 }
 if(cmd==='follow-up'){
  const d=await resolve(db,'disputes',q);if(['closed','rejected'].includes(d.status))throw Error('Dispute is final');
  const r=(await db.query('update disputes set follow_up_on=$2 where id=$1 returning *',[d.id,date(required(o.follow_up_on,'follow_up_on'),'follow_up_on')]))[0];await audit(db,actor,cmd,d.id,{before:d,after:r,note:required(o.note,'note')});return r;
 }
 if(cmd==='open-dispute'){
  const c=await resolve(db,'charges',q);await db.query('select id from charges where id=$1 for update',[c.id]);const amount=integer(required(o.cents,'cents'),'cents');
  const claimed=Number((await db.query("select coalesce(sum(requested_cents),0)::bigint as n from disputes where charge_id=$1 and status<>'rejected'",[c.id]))[0].n);
  if(!amount||claimed+amount>Number(c.amount_cents))throw Error('Dispute exceeds unclaimed charge');
  const r=await insert(db,'disputes',{code:required(o.code,'code'),name:required(o.name,'name'),charge_id:c.id,requested_cents:amount,reason:required(o.reason,'reason'),follow_up_on:date(required(o.follow_up_on,'follow_up_on'),'follow_up_on'),evidence:required(o.evidence,'evidence')});await audit(db,actor,cmd,r.id,r);return r;
 }
 if(cmd==='dispute-status'){
  const found=await resolve(db,'disputes',q);const d=(await db.query('select * from disputes where id=$1 for update',[found.id]))[0];const next=required(o.status,'status');
  const transitions={open:['submitted','rejected'],submitted:['accepted','rejected'],accepted:['closed'],rejected:[],closed:[]};if(!transitions[d.status].includes(next))throw Error(`Invalid dispute transition ${d.status} to ${next}`);
  const received=Number((await db.query('select coalesce(sum(amount_cents),0)::bigint as n from credits where dispute_id=$1',[d.id]))[0].n);
  if(next==='closed'&&received<Number(d.requested_cents))throw Error('Cannot close before all credits are evidenced');
  const r=(await db.query('update disputes set status=$2,evidence=$3 where id=$1 returning *',[d.id,next,required(o.evidence,'evidence')]))[0];await audit(db,actor,cmd,d.id,{before:d,after:r});return r;
 }
 if(cmd==='record-credit'){
  const found=await resolve(db,'disputes',q);const d=(await db.query('select * from disputes where id=$1 for update',[found.id]))[0];if(d.status!=='accepted')throw Error('Credit requires an accepted dispute');
  const i=await resolve(db,'invoices',required(o.invoice,'invoice'));const origin=(await db.query('select i.account_id from invoices i join charges c on c.invoice_id=i.id where c.id=$1',[d.charge_id]))[0];if(i.account_id!==origin.account_id)throw Error('Credit invoice must belong to the original carrier account');
  const n=integer(required(o.cents,'cents'),'cents');const got=Number((await db.query('select coalesce(sum(amount_cents),0)::bigint as n from credits where dispute_id=$1',[d.id]))[0].n);if(!n||got+n>Number(d.requested_cents))throw Error('Credit exceeds outstanding dispute');
  const r=await insert(db,'credits',{code:required(o.code,'code'),name:required(o.name,'name'),dispute_id:d.id,invoice_id:i.id,amount_cents:n,received_on:date(required(o.received_on,'received_on'),'received_on'),evidence:required(o.evidence,'evidence')});await audit(db,actor,cmd,d.id,r);return r;
 }
 if(cmd==='service-status'){
  const s=await resolve(db,'services',q);if(s.status!=='active'||o.status!=='ceased')throw Error('Only active to ceased is supported');const when=date(required(o.ceased_on,'ceased_on'),'ceased_on');if(when>new Date().toISOString().slice(0,10))throw Error('Cannot record a future cessation as completed');
  const r=(await db.query("update services set status='ceased',ceased_on=$2 where id=$1 and status='active' returning *",[s.id,when]))[0];if(!r)throw Error('Service changed; reread it');await audit(db,actor,cmd,s.id,{before:s,after:r,evidence:required(o.evidence,'evidence')});return r;
 }
 if(cmd==='review-invoice'){
  const found=await resolve(db,'invoices',q);const i=await invoiceDraft(db,found.id);const v=(await db.query('select * from v_invoice_review where id=$1',[i.id]))[0];if(!i.evidence||Number(v.total_cents)!==Number(v.loaded_cents))throw Error('Invoice needs evidence and matching charge totals');
  if((await db.query('select 1 from v_allocations v join charges c on c.id=v.id where c.invoice_id=$1 and v.remaining_cents<>0',[i.id])).length)throw Error('Allocate all charges first');
  if((await db.query("select 1 from charges where invoice_id=$1 and service_id is null and kind<>'tax'",[i.id])).length)throw Error('Resolve unknown services before review');
  const r=(await db.query("update invoices set status='reviewed' where id=$1 returning *",[i.id]))[0];await audit(db,actor,cmd,i.id,{before:i,after:r,evidence:required(o.evidence,'evidence')});return r;
 }
 if(cmd==='invoice-evidence'){
  const found=await resolve(db,'invoices',q);const i=await invoiceDraft(db,found.id);
  const r=(await db.query('update invoices set evidence=$2,tax_year_end=$3,retain_until=$4 where id=$1 returning *',[i.id,required(o.evidence,'evidence'),date(required(o.tax_year_end,'tax_year_end'),'tax_year_end'),date(required(o.retain_until,'retain_until'),'retain_until')]))[0];await audit(db,actor,cmd,i.id,{before:i,after:r});return r;
 }
 if(cmd==='review-privacy'){
  const s=await resolve(db,'services',q);const when=date(required(o.review_on,'review_on'),'review_on');const r=(await db.query('update services set purpose=$2,privacy_review_on=$3 where id=$1 returning *',[s.id,required(o.purpose,'purpose'),when]))[0];await audit(db,actor,cmd,s.id,{before:s,after:r,evidence:required(o.evidence,'evidence')});return r;
 }
 if(cmd==='log'){
  const s=await resolve(db,'services',q);const r=await insert(db,'notes',{service_id:s.id,body:required(o.body,'body'),actor});await audit(db,actor,cmd,s.id,r);return r;
 }
 throw Error(`Unknown command: ${cmd}`);
}
export const mutations=[...Object.keys(specs).map(k=>'add-'+k),'allocate','link-charge','review-service','follow-up','open-dispute','dispute-status','record-credit','service-status','review-invoice','invoice-evidence','review-privacy','log'];
export const commands=[...Object.keys(reads),'attention','insights','weekly-review','history',...mutations,'import','export','draft-disputes'];
async function importReports(db,args,o){
 if(args[0]!=='calero')throw Error('Supported import: calero <folder>');const dir=path.resolve(required(args[1],'folder'));const mapping=o.mapping?JSON.parse(fs.readFileSync(o.mapping,'utf8')):{};
 const order=Object.keys(specs);for(const key of Object.keys(mapping))if(!order.includes(key))throw Error(`Unknown mapping entity ${key}`);
 const files=order.map(kind=>({kind,file:path.join(dir,specs[kind].table+'.csv')})).filter(x=>fs.existsSync(x.file));if(!files.length)throw Error('No supported CSV reports');
 const text=files.map(f=>({...f,text:fs.readFileSync(f.file,'utf8')}));const digest=createHash('sha256').update(JSON.stringify({files:text.map(f=>[f.kind,f.text]),mapping})).digest('hex');
 const code=required(o.batch,'batch'),actor=required(o.actor,'actor');
 await db.exec('BEGIN');try{
  const prior=(await db.query('select * from import_batches where code=$1',[code]))[0];if(prior){if(prior.digest!==digest)throw Error('Batch name already used for different input');await db.exec('ROLLBACK');return {batch:code,replayed:true,counts:prior.counts};}
  const counts={};for(const f of text){const rows=parseCsv(f.text);counts[specs[f.kind].table]=rows.length;
   for(const row of rows){let input=row;if(mapping[f.kind]){input={};for(const [k,column]of Object.entries(mapping[f.kind])){if(!(column in row))throw Error(`Missing source column ${column}`);input[k]=row[column];}}
    await add(db,f.kind,input,actor);
   }
  }
  await insert(db,'import_batches',{code,digest,counts:JSON.stringify(counts)});
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return {batch:code,dry_run:!!o['dry-run'],counts};
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export async function run(db,cmd,args=[],o={}){
 if(cmd==='help'||cmd==='--help'||!cmd)return {commands,usage:'npm run telecom -- <command> [record] --field=value --actor="Name" [--json]',add_fields:specs};
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='attention'||cmd==='weekly-review')return {bills:await db.query(reads['bill-audit']),allocations:await db.query(reads['allocation-review']),credits:await db.query(reads['credit-chase']),renewals:await db.query(reads['renewals-due']),compliance:await db.query(reads.compliance)};
 if(cmd==='insights'){const out=[];for(const [question,sql]of questions)out.push({question,rows:await db.query(sql)});return out;}
 if(cmd==='history'){const s=await resolve(db,'services',args[0]);return {service:s,charges:await db.query('select * from charges where service_id=$1 order by created_at',[s.id]),notes:await db.query('select body,actor,created_at from notes where service_id=$1 order by created_at',[s.id]),actions:await db.query('select * from actions where record_id=$1 order by created_at',[s.id])};}
 if(cmd==='import')return importReports(db,args,o);
 if(cmd==='export'){
  const out={format:'telecom-expenses-v1',exported_at:new Date().toISOString(),records:{}};await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of entities)out.records[t]=await db.query(`select * from ${t} order by id`);}finally{await db.exec('ROLLBACK');}
  const file=writePrivate('exports',o.file||`telecom-${randomUUID()}.json`,JSON.stringify(out,null,2));return {file,counts:Object.fromEntries(Object.entries(out.records).map(([k,v])=>[k,v.length]))};
 }
 if(cmd==='draft-disputes'){
  const rows=await db.query(reads['credit-chase']);const file=writePrivate('drafts',`carrier-review-${randomUUID()}.md`,'# Carrier credit review\n\nDraft only. A person checks and sends. Amounts are integer cents.\n\n'+format(rows));return {file,disputes:rows.length};
 }
 if(!mutations.includes(cmd))throw Error(`Unknown command: ${cmd}`);
 await db.exec('BEGIN');try{const result=await mutate(db,cmd,args,o);await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}
}
function writePrivate(dir,name,body){if(path.basename(name)!==name||!name)throw Error('Output file must be a basename');const dest=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir);fs.mkdirSync(dest,{recursive:true,mode:0o700});const file=path.join(dest,name);fs.writeFileSync(file,body+'\n',{mode:0o600,flag:'wx'});return file;}
export function format(data){
 if(Array.isArray(data)){
  if(data.length&&data[0].question)return data.map(d=>d.question+'\n'+format(d.rows)).join('\n\n');
  if(!data.length)return '(none)';const keys=Object.keys(data[0]);return table(data.map(r=>Object.fromEntries(keys.map(k=>[k,typeof r[k]==='object'&&r[k]!==null?JSON.stringify(r[k]):r[k]]))),keys.map(k=>({key:k,label:k.replace(/_/g,' ')})));
 }
 if(data&&typeof data==='object')return Object.entries(data).map(([k,v])=>`${k}:\n${Array.isArray(v)?format(v):typeof v==='object'?JSON.stringify(v,null,2):v}`).join('\n');return String(data);
}
export function parseArgs(argv){const args=[],o={};for(const a of argv){if(a.startsWith('--')){const ix=a.indexOf('=');o[a.slice(2,ix<0?undefined:ix)]=ix<0?true:a.slice(ix+1);}else args.push(a);}return {cmd:args.shift()||'help',args,o};}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;const {cmd,args,o}=parseArgs(process.argv.slice(2));try{db=await getDb();const result=await run(db,cmd,args,o);console.log(o.json?JSON.stringify(result,null,2):format(result));}catch(e){console.error(o.json?JSON.stringify({error:e.message,candidates:e.candidates||[]}):e.message+(e.candidates?.length?'\n'+format(e.candidates):''));process.exitCode=1;}finally{if(db)await db.close();}
}
