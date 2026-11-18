import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {getDb} from './lib/db.mjs';import {checkDomain} from './check-domain.mjs';
if(!process.env.TEST_DATABASE_URL)throw Error('TEST_DATABASE_URL must point at an empty disposable database');process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'telecom-pg-'));process.env.OUTPUT_DIR=dir;const db=await getDb();
try{if((await db.query("select 1 from information_schema.tables where table_schema='public' and table_name='carriers'")).length)throw Error('Test requires a fresh database');const r=await checkDomain(db,dir);console.log(`PASS: PostgreSQL, ${r.commands} commands`);}finally{await db.close();fs.rmSync(dir,{recursive:true,force:true});}
