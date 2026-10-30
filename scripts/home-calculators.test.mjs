import test from 'node:test';
import assert from 'node:assert/strict';
import {monthlyPayment,netRentalYield} from '../lib/home-calculators.ts';

test('the review loan example produces the expected monthly repayment',()=>{
  const result=monthlyPayment(10000000,2000000,8.5,20);
  assert.equal(result.principal,8000000);
  assert.equal(Math.round(result.monthly),69426);
  assert.ok(result.interest>0);
});
test('a zero-interest or fully paid home remains meaningful',()=>{
  assert.equal(monthlyPayment(1200000,0,0,10).monthly,10000);
  assert.equal(monthlyPayment(1200000,1200000,8.5,20).monthly,0);
});
test('invalid loan assumptions have an empty result',()=>{
  for(const values of [[1,2,8,20],[1,-1,8,20],[1,0,-1,20],[1,0,8,0],[NaN,0,8,20]]) assert.equal(monthlyPayment(...values),null);
});
test('missing rent is empty, explicit zero is valid and net expenses are included',()=>{
  assert.equal(netRentalYield(10000000,0,null,0),null);
  assert.equal(netRentalYield(10000000,0,0,0),0);
  assert.equal(netRentalYield(10000000,0,30000,60000),3);
  assert.equal(netRentalYield(0,0,30000,0),null);
  assert.ok(netRentalYield(10000000,1000000,30000,60000)<3);
});
