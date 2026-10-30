import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEnquiry} from '../lib/enquiry.ts';

const valid = {name: 'Preview Tester', phone: '9876543210', email: '', consent: true};
test('enquiries require a real name, Indian mobile and contact consent', () => {
  assert.deepEqual(validateEnquiry(valid), {});
  assert.deepEqual(Object.keys(validateEnquiry({name: ' ', phone: '', email: '', consent: false})), ['name', 'phone', 'consent']);
  for (const phone of ['1234567890', '987654321', '98765432100', '+1 9876543210', 'abc9876543210', '++91 9876543210']) {
    assert.ok(validateEnquiry({...valid, phone}).phone);
  }
});
test('mobile numbers accept local and country-code formats', () => {
  for (const phone of ['9876543210', '+91 98765 43210', '919876543210', '6789012345']) {
    assert.deepEqual(validateEnquiry({...valid, phone}), {});
  }
});
test('email is optional but must be valid when supplied', () => {
  for (const email of ['', ' ', 'preview@example.com', ' preview+visit@example.co.in ']) {
    assert.deepEqual(validateEnquiry({...valid, email}), {});
  }
  for (const email of ['missing-at.example.com', 'preview@', 'preview@example', 'preview @example.com']) {
    assert.ok(validateEnquiry({...valid, email}).email);
  }
});
test('names allow real punctuation and Unicode while rejecting numbers and markup',()=>{
  for(const name of ['Asha Rao',"D’Souza",'Anne-Marie', 'आशा']) assert.equal(validateEnquiry({...valid,name}).name,undefined);
  for(const name of ['12345','<script>','A','x'.repeat(101)]) assert.ok(validateEnquiry({...valid,name}).name);
});
test('optional budget accepts only the listed choices',()=>{
  for(const budget of ['', 'Under ₹1 Cr','₹1–2 Cr','₹2–3 Cr','Above ₹3 Cr','Still exploring']) assert.equal(validateEnquiry({...valid,budget}).budget,undefined);
  assert.ok(validateEnquiry({...valid,budget:'invalid'}).budget);
});
