import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {getDb,REPO_ROOT} from './lib/db.mjs';import {migrate} from './migrate.mjs';import {seed} from './seed.mjs';import {run,format} from './telecom.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'telecom-demo-'));process.env.DATA_DIR=path.join(dir,'db');process.env.OUTPUT_DIR=dir;process.env.DATABASE_URL='';
const db=await getDb();try{await migrate(db);await seed(db);for(const c of ['bill-audit','credit-chase','renewals-due'])console.log('\n'+c+'\n'+format(await run(db,c)));}finally{await db.close();}
for(const script of ['view','docs']){const res=spawnSync(process.execPath,[`scripts/${script}.mjs`],{cwd:REPO_ROOT,encoding:'utf8',env:process.env});if(res.status!==0)throw Error(res.stderr||res.stdout);console.log(res.stdout.trim());}
console.log('Fictional data. Reports: '+dir);
