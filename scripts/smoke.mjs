import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {getDb,REPO_ROOT} from './lib/db.mjs';import {checkDomain} from './check-domain.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'telecom-test-'));process.env.DATA_DIR=path.join(dir,'db');process.env.OUTPUT_DIR=dir;process.env.DATABASE_URL='';
let db;
try{db=await getDb();const result=await checkDomain(db,dir);await db.close();db=null;
 const exec=(script,args=[])=>spawnSync(process.execPath,[`scripts/${script}.mjs`,...args],{cwd:REPO_ROOT,encoding:'utf8',env:process.env});
 for(const c of ['view','docs']){const res=exec(c);assert.equal(res.status,0,res.stderr||res.stdout);}
 const files=fs.readdirSync(path.join(dir,'views'));assert.equal(files.length,3);
 const html=fs.readFileSync(path.join(dir,'docs-out','renewal-brief',fs.readdirSync(path.join(dir,'docs-out','renewal-brief')).find(f=>f.startsWith('test-service'))),'utf8');assert(!html.includes('<script>alert(1)</script>'));assert(html.includes('&lt;script&gt;'));
 const good=exec('telecom',['services','--json']);assert.equal(good.status,0,good.stderr);assert(JSON.parse(good.stdout).length>=4);
 const ambiguous=exec('telecom',['history','Auckland','--json']);assert.equal(ambiguous.status,1);assert.equal(JSON.parse(ambiguous.stderr).candidates.length,2);
 const bad=exec('telecom',['unknown','--json']);assert.equal(bad.status,1);assert(JSON.parse(bad.stderr).error.includes('Unknown'));
 console.log(`PASS: ${result.commands} CLI commands; import preview, replay and rollback; money, state and account guards; complete exports; private drafts; three branded views and three document types; escaped HTML.`);
}finally{if(db)await db.close();fs.rmSync(dir,{recursive:true,force:true});}
