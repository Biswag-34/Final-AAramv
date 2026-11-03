import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {submitEnquiry} from '../lib/enquiry-submission.ts';
import {saveEnquiryReceipt,readEnquiryReceipt,clearEnquiryReceipt} from '../lib/enquiry-receipt.ts';

const input={requestId:randomUUID(),name:'Form Tester'};
const reference=`AR-${input.requestId.toUpperCase()}`;
const send=body=>async()=>Response.json(body);

test('only an explicit delivered response for this request can show success',async()=>{
  assert.deepEqual(await submitEnquiry(input,send({status:'delivered',reference})),{status:'delivered',reference});
  for(const body of [{},{success:true},{status:'recorded',reference},{status:'failed',reference},{status:'delivered',reference:'AR-different'},{status:'delivered',reference,error:'Rejected'},null,[]]){
    assert.equal((await submitEnquiry(input,send(body))).status,'uncertain',JSON.stringify(body));
  }
});

test('validation and rejected leads stay failed and retain useful field errors',async()=>{
  const result=await submitEnquiry(input,async()=>Response.json({error:'Please check your details.',errors:{phone:'Invalid number',unsafe:{}},status:'failed'},{status:400}));
  assert.equal(result.status,'failed');assert.deepEqual(result.errors,{phone:'Invalid number'});
  assert.equal(result.message,'Please check your details.');
  for(const status of [401,403,409,422,503]){
    const failed=await submitEnquiry(input,async()=>Response.json({status:'failed',retryable:true,error:'Your enquiry was not submitted.'},{status}));
    assert.equal(failed.status,'failed');assert.match(failed.message,/not submitted/);
  }
});

test('timeouts, lost responses, unreadable successes and ambiguous server errors never show success',async()=>{
  for(const fetcher of [async()=>{throw new TypeError('offline');},async()=>{throw new DOMException('Timed out','TimeoutError');},async()=>new Response('<html>Error</html>'),async()=>Response.json({},{status:502}),async()=>new Response('Gateway Timeout',{status:504}),async()=>Response.json({retryable:false},{status:503})]){
    const result=await submitEnquiry(input,fetcher);assert.equal(result.status,'uncertain');assert.match(result.message,new RegExp(reference));
  }
  assert.equal((await submitEnquiry(input,async()=>new Response('Forbidden',{status:403}))).status,'failed');
});

test('thank-you receipts require confirmed delivery and expire instead of reusing stale success',()=>{
  const data=new Map();
  globalThis.sessionStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
  clearEnquiryReceipt();assert.equal(readEnquiryReceipt(),null);
  const receipt={reference,intent:'callback',status:'delivered',confirmedAt:Date.now()};
  saveEnquiryReceipt(receipt);assert.equal(readEnquiryReceipt().reference,reference);
  clearEnquiryReceipt();assert.equal(readEnquiryReceipt(),null,'A new attempt must remove the previous success');
  for(const value of [{reference,intent:'callback'},{...receipt,status:'failed'},{...receipt,reference:'fake'},{...receipt,confirmedAt:Date.now()-61*60_000},{...receipt,confirmedAt:Date.now()+60_000}]){
    data.set('aaramv-enquiry-receipt',JSON.stringify(value));assert.equal(readEnquiryReceipt(),null);
  }
  data.set('aaramv-enquiry-receipt','broken-json');assert.equal(readEnquiryReceipt(),null);
  delete globalThis.sessionStorage;
  saveEnquiryReceipt(receipt);assert.equal(readEnquiryReceipt().reference,reference,'Confirmation still works when storage is unavailable');
  clearEnquiryReceipt();assert.equal(readEnquiryReceipt(),null);
});
