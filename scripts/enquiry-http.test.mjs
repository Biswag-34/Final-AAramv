import assert from 'node:assert/strict';
import {readFile, unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const base = 'http://127.0.0.1:3000';
const requestId = randomUUID();
const file = path.resolve('.local/enquiries', `${requestId}.json`);
const input = {requestId, name:'Local QA Test', phone:'9876543210', consent:true, context:'Automated local test', interest:'Test only', intent:'visit', preferredDate:'2099-01-01'};
const post = (body, headers = {'Content-Type':'application/json', Origin:base}) => fetch(`${base}/api/enquiries`, {method:'POST', headers, body:JSON.stringify(body)});
try {
  assert.equal((await post(input, {'Content-Type':'application/json',Origin:'https://unrelated.example'})).status,403);
  assert.equal((await post(input, {'Content-Type':'application/json'})).status,403);
  assert.equal((await post({...input,phone:'123',consent:false})).status,400);
  assert.equal((await post({...input,requestId:'../../unsafe'})).status,400);
  assert.equal((await post({...input,website:'bot field'})).status,400);
  assert.equal((await post({...input,preferredDate:'2026-02-31'})).status,400);
  assert.equal((await post({...input,message:'x'.repeat(9000)})).status,413);
  const response = await post(input);
  assert.equal(response.status,201);
  const result = await response.json();
  assert.equal(result.reference,`AR-${requestId.toUpperCase()}`);
  const stored = JSON.parse(await readFile(file,'utf8'));
  assert.equal(stored.context,input.context);assert.equal(stored.intent,'visit');assert.equal(stored.preferredDate,input.preferredDate);assert.equal(stored.consent,true);
  const before = stored.receivedAt;
  assert.equal((await post(input)).status,201);
  assert.equal(JSON.parse(await readFile(file,'utf8')).receivedAt,before,'Retries should not duplicate or overwrite the record');
  assert.equal((await post({...input,name:'Different Person'})).status,409);
  assert.equal((await fetch(`${base}/api/enquiries`)).status,405);
  console.log('Passed 11 enquiry HTTP checks, including persisted context, origin protection, validation and duplicate-safe retries.');
} finally {
  // Remove only this run’s synthetic fixture. No real enquiry is touched.
  await unlink(file).catch(error=>{if(error.code!=='ENOENT')throw error;});
}
