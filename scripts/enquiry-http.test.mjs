import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {once} from 'node:events';
import net from 'node:net';
import path from 'node:path';
import {tmpdir} from 'node:os';
const base='http://127.0.0.1:3000';
// Refuse to touch a running app, which could have live CRM credentials.
await new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',()=>reject(new Error('Stop the existing project server on port 3000 before running isolated HTTP tests.')));server.listen(3000,'127.0.0.1',()=>server.close(resolve));});
const directory=await mkdtemp(path.join(tmpdir(),'aaramv-enquiry-http-'));
const capture=path.join(directory,'requests.jsonl');
const configFiles=['next-env.d.ts','tsconfig.json'];
const originalConfigs=await Promise.all(configFiles.map(file=>readFile(file)));
const require=createRequire(import.meta.url);
const child=spawn(process.execPath,['--import',new URL('./leadrat-http-mock.mjs',import.meta.url).href,require.resolve('next/dist/bin/next'),'dev','--webpack','--hostname','127.0.0.1','--port','3000'],{env:{...process.env,VERCEL:'1',LEADRAT_API_KEY:'http-test-only-key',LEADRAT_SUBSOURCE:'Website Test',LEADRAT_TEST_CAPTURE:capture,NEXT_BUILD_DIR:'.next-enquiry-test'},stdio:['ignore','pipe','pipe']});
let output='';child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{output+=chunk;});
const post=(body,headers={'Content-Type':'application/json',Origin:base})=>fetch(`${base}/api/enquiries`,{method:'POST',headers,body:JSON.stringify(body)});
const input={requestId:randomUUID(),name:'Local QA Test',phone:'9876543210',consent:true,context:'Automated local test',interest:'Apartment',budget:'₹1–2 Cr',intent:'visit',preferredDate:'2099-01-01'};
const requests=async()=>{try{return (await readFile(capture,'utf8')).trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));}catch(error){if(error.code==='ENOENT')return [];throw error;}};
try {
  let ready=false;
  for(let attempt=0;attempt<120;attempt++){
    if(child.exitCode!==null)throw new Error('Isolated Next server failed: '+output);
    try{await fetch(`${base}/api/enquiries`);ready=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,500));}
  }
  assert.ok(ready,'Test server did not start: '+output);
  assert.equal((await post(input,{'Content-Type':'application/json',Origin:'https://unrelated.example'})).status,403);
  assert.equal((await post(input,{'Content-Type':'application/json'})).status,403);
  assert.equal((await post(input,{'Content-Type':'text/plain',Origin:base})).status,415);
  for(const invalid of [{phone:'123',consent:false},{requestId:'../../unsafe'},{website:'bot'},{preferredDate:'2026-02-31'},{budget:'invalid'}])assert.equal((await post({...input,...invalid})).status,400);
  assert.equal((await post({...input,message:'x'.repeat(9000)})).status,413);
  assert.equal((await requests()).length,0,'Invalid requests must never reach CRM');
  const response=await post(input);assert.equal(response.status,201);
  const result=await response.json();assert.equal(result.status,'delivered');assert.equal(result.reference,`AR-${input.requestId.toUpperCase()}`);
  assert.equal((await post(input)).status,201);assert.equal((await requests()).length,1,'Warm retries must not send again');
  assert.equal((await post({...input,name:'Different Person'})).status,409);
  const [request]=await requests();assert.equal(request.key,'http-test-only-key');assert.equal(request.leads[0].propertyType,'Flat');assert.match(request.leads[0].notes,/₹1–2 Cr/);assert.equal(request.leads[0].leadStatus,undefined);assert.equal(request.leads[0].subSource,'Website Test');
  const project={...input,requestId:randomUUID(),project:'Prestige Finsbury Park',interest:'Prestige Finsbury Park'};
  assert.equal((await post(project)).status,201);
  const projectLead=(await requests()).at(-1).leads[0];assert.equal(projectLead.project,project.project);assert.equal(projectLead.city,'Bengaluru');assert.equal(projectLead.location,'Bagalur');
  const rejected=await post({...input,requestId:randomUUID(),name:'Rejected Test'});assert.equal(rejected.status,503);assert.equal((await rejected.json()).retryable,true);
  const uncertain={...input,requestId:randomUUID(),name:'Uncertain Test'};
  const unknown=await post(uncertain);assert.equal(unknown.status,503);assert.equal((await unknown.json()).retryable,false);
  const before=(await requests()).length;assert.equal((await post(uncertain)).status,503);assert.equal((await requests()).length,before);
  assert.equal((await fetch(`${base}/api/enquiries`)).status,405);
  assert.ok(!JSON.stringify(result).includes('http-test-only-key'));
  console.log('Passed isolated HTTP checks: validation, private credentials, Vercel delivery, field mapping, provider failures, and warm retries. No live CRM requests were sent.');
} finally {
  child.kill();
  await Promise.race([once(child,'exit'),new Promise(resolve=>setTimeout(resolve,5000))]);
  // Next rewrites these for the test distDir. Keep those generated references
  // out of the user's checkout after the isolated server exits.
  await Promise.all(configFiles.map((file,index)=>writeFile(file,originalConfigs[index])));
  await rm(directory,{recursive:true,force:true});
}
