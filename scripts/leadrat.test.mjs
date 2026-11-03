import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {buildLeadratLead, pushLeadratLead, LeadratError, LEADRAT_ENDPOINT} from '../lib/leadrat.ts';
import {deliverEnquiry, EnquiryConflict} from '../lib/enquiry-delivery.ts';

const sample = () => ({reference:`AR-${randomUUID().toUpperCase()}`, receivedAt:'2026-11-01T20:00:05.000Z', name:'Integration Tester', phone:'+91 98765 43210', email:'test@example.com', consent:true, context:'Project consultation', project:'', interest:'Apartment', budget:'₹1–2 Cr', message:'Please call after 5pm.', preferredDate:'', intent:'callback'});

test('maps real values without inventing budgets, appointments, projects or users', () => {
  const lead = buildLeadratLead(sample());
  assert.equal(lead.mobile,'9876543210'); assert.equal(lead.countryCode,'91');
  assert.equal(lead.submittedDate,'02-11-2026'); assert.equal(lead.submittedTime,'01:30:05');
  assert.equal(lead.propertyType,'Flat'); assert.equal(lead.source,'Website');
  assert.match(lead.notes,/₹1–2 Cr/); assert.match(lead.notes,/Please call after 5pm/);
  for (const key of ['budget','leadExpectedBudget','leadStatus','scheduledDate','leadScheduledDate','primaryUser','secondaryUser','project']) assert.equal(key in lead,false,key);
  assert.equal(lead.additionalProperties.ContactConsent,'true');
  const project = buildLeadratLead({...sample(),intent:'visit',preferredDate:'2099-01-01'}, {name:'Real Project',type:'Villa',location:'Bagalur',city:'Bengaluru',state:'Karnataka'});
  assert.equal(project.project,'Real Project'); assert.equal(project.propertyType,'Villa'); assert.equal(project.location,'Bagalur');
  assert.match(project.notes,/appointment not confirmed/); assert.match(project.notes,/2099-01-01/);
});

test('all accepted phone formats produce a ten-digit mobile', () => {
  for (const phone of ['9876543210','+91 98765 43210','919876543210','(98765) 43210']) assert.equal(buildLeadratLead({...sample(),phone}).mobile,'9876543210');
});

test('sends one array item to the supplied HTTPS endpoint with a private key', async () => {
  process.env.LEADRAT_API_KEY='test-only-key';
  await pushLeadratLead(sample(), undefined, async (url, options) => {
    assert.equal(url,LEADRAT_ENDPOINT); assert.equal(options.method,'POST');
    assert.equal(options.headers['API-Key'],'test-only-key'); assert.equal(options.headers['Content-Type'],'application/json');
    assert.equal(options.redirect,'error'); assert.equal(options.cache,'no-store'); assert.ok(options.signal);
    const body=JSON.parse(options.body); assert.equal(body.length,1); assert.equal(body[0].name,'Integration Tester');
    assert.equal(options.body.includes('test-only-key'),false);
    return Response.json({isSuccess:true});
  });
});

test('missing credentials never make an outbound request', async () => {
  delete process.env.LEADRAT_API_KEY;
  await assert.rejects(pushLeadratLead(sample(),undefined,()=>assert.fail('must not send')), error => error instanceof LeadratError && error.outcome==='rejected');
  process.env.LEADRAT_API_KEY='test-only-key';
});

test('handles provider rejections, failed envelopes and ambiguous network/server results', async () => {
  for (const status of [400,401,403,422,429]) await assert.rejects(pushLeadratLead(sample(),undefined,async()=>Response.json({error:'private details'},{status})), error=>error.outcome==='rejected' && !error.message.includes('private details'));
  for (const body of [false,{success:false},{isSuccess:false},{success:'false'},{succeeded:false},{status:false},{status:'Failed'},{error:'Invalid lead'},{statusCode:400},{errors:['Invalid lead']},[{success:false}],{data:{isSuccess:false}}]) await assert.rejects(pushLeadratLead(sample(),undefined,async()=>Response.json(body)), error=>error.outcome==='rejected');
  await pushLeadratLead(sample(),undefined,async()=>Response.json({success:true,errors:{}}));
  for (const send of [async()=>{throw new TypeError('network');},async()=>new Response('',{status:500}),async()=>new Response('<html>proxy error</html>')]) await assert.rejects(pushLeadratLead(sample(),undefined,send), error=>error.outcome==='uncertain');
  await pushLeadratLead(sample(),undefined,async()=>new Response(null,{status:200}));
});

test('Vercel delivers without disk and coalesces concurrent warm-instance retries', async () => {
  process.env.VERCEL='1'; process.env.ENQUIRY_STORAGE_DIR='Z:/unwritable-test-only';
  const enquiry=sample(); let calls=0; let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const send=async()=>{calls++;await gate;return Response.json({success:true});};
  const first=deliverEnquiry(enquiry,undefined,send);
  const second=deliverEnquiry(enquiry,undefined,send); release();
  await Promise.all([first,second]); await deliverEnquiry(enquiry,undefined,send);
  assert.equal(calls,1);
  await assert.rejects(deliverEnquiry({...enquiry,name:'Someone Else'},undefined,send), EnquiryConflict);
  delete process.env.VERCEL; delete process.env.ENQUIRY_STORAGE_DIR;
});

test('uncertain sends are not retried; explicit rejections can be retried', async () => {
  process.env.VERCEL='1';
  const enquiry=sample(); let calls=0;
  const send=async()=>{calls++;throw new TypeError('lost response');};
  await assert.rejects(deliverEnquiry(enquiry,undefined,send));
  await assert.rejects(deliverEnquiry(enquiry,undefined,send)); assert.equal(calls,1);
  const rejected=sample();
  await assert.rejects(deliverEnquiry(rejected,undefined,async()=>Response.json({}, {status:400})));
  await deliverEnquiry(rejected,undefined,async()=>Response.json({success:true}));
  delete process.env.VERCEL;
});

test('local receipts persist delivery across module restarts and reject uncertain replays', async () => {
  const directory=await mkdtemp(path.join(tmpdir(),'aaramv-leadrat-'));
  process.env.ENQUIRY_STORAGE_DIR=directory;
  try {
    const enquiry=sample();
    await deliverEnquiry(enquiry,undefined,async()=>Response.json({success:true}));
    const file=path.join(directory,`${enquiry.reference.slice(3).toLowerCase()}.json`);
    assert.equal(JSON.parse(await readFile(file,'utf8')).status,'delivered');
    const fresh=await import(`../lib/enquiry-delivery.ts?instance=${randomUUID()}`);
    await fresh.deliverEnquiry(enquiry,undefined,()=>assert.fail('already delivered'));
    const pending=sample();
    await writeFile(path.join(directory,`${pending.reference.slice(3).toLowerCase()}.json`),JSON.stringify({...pending,status:'pending'}));
    await assert.rejects(fresh.deliverEnquiry(pending,undefined,()=>assert.fail('unknown delivery must be reviewed')),error=>error.outcome==='uncertain');
  } finally {delete process.env.ENQUIRY_STORAGE_DIR;await rm(directory,{recursive:true,force:true});}
});
