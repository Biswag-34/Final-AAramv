import assert from 'node:assert/strict';
import test from 'node:test';
import {readScrollPositions,routeScrollAction,stickySidebarMetrics} from '../lib/scroll-restoration.ts';

test('new searches and footer destinations start at the page head rather than restoring old positions',()=>{
  assert.equal(routeScrollAction('/#journey','/properties?q=Bagalur',false),'top');
  assert.equal(routeScrollAction('/properties?q=Bagalur','/properties?q=Thanisandra',false),'top');
  assert.equal(routeScrollAction('/about','/properties',false),'top');
  assert.equal(routeScrollAction('/properties','/contact',false),'top');
});

test('browser Back and Back to results restore their entry while explicit section links target the section',()=>{
  assert.equal(routeScrollAction('/properties/brigade-el-dorado','/properties?q=Bagalur',true),'restore');
  assert.equal(routeScrollAction('/contact','/#journey',true),'anchor');
  assert.equal(routeScrollAction('/properties/brigade-el-dorado','/properties/brigade-el-dorado#layouts',false),'anchor');
});

test('loading more cards preserves context but changing filters starts the new results at the head',()=>{
  assert.equal(routeScrollAction('/properties?q=Bagalur','/properties?q=Bagalur&limit=12',false),'preserve');
  assert.equal(routeScrollAction('/properties?limit=12&q=Bagalur','/properties?q=Bagalur&limit=18',false),'preserve');
  assert.equal(routeScrollAction('/properties?type=Apartment','/properties?type=Plot',false),'top');
  assert.equal(routeScrollAction('/tools?tool=emi','/tools?tool=yield',false),'preserve');
});

test('first load and a stored zero position safely recover at the head',()=>{
  assert.equal(routeScrollAction('','/properties',false),'top');
  assert.deepEqual(readScrollPositions('{"/properties":{"top":0}}'),{'/properties':{top:0}});
});

test('corrupt scroll storage cannot break navigation or inject an invalid target',()=>{
  for(const value of ['broken','null','[]','42'])assert.deepEqual(readScrollPositions(value),{});
  assert.deepEqual(readScrollPositions(JSON.stringify({
    '/negative':{top:-1},'/invalid':{top:'footer'},'https://example.com':{top:12},
    '/properties':{top:1220,anchor:'card:brigade-el-dorado',offset:120},
    '/contact':{top:24,anchor:'[invalid-selector]',offset:'invalid'},
  })),{
    '/properties':{top:1220,anchor:'card:brigade-el-dorado',offset:120},
    '/contact':{top:24},
  });
});

test('sticky enquiry is bounded below the actual header on normal and short desktop screens',()=>{
  for(const height of [480,540,600,640,700,768,900,1080]){
    const metrics=stickySidebarMetrics(height,96,650,'top');
    assert.equal(metrics.top,104);
    assert.ok(metrics.availableHeight>=0);
    assert.equal(metrics.top+metrics.availableHeight+16,height);
  }
});

test('a taller header and a resized visual viewport leave space for the complete sticky panel',()=>{
  assert.deepEqual(stickySidebarMetrics(600,128.4,450,'top'),{top:137,availableHeight:447});
  assert.deepEqual(stickySidebarMetrics(540,128.4,450,'top'),{top:137,availableHeight:387});
  assert.deepEqual(stickySidebarMetrics(100,128.4,450,'top'),{top:137,availableHeight:0});
});

test('tall adaptive sidebars retain their existing bottom-edge reading behaviour',()=>{
  assert.deepEqual(stickySidebarMetrics(700,88,900,'adaptive'),{top:-224,availableHeight:684});
  assert.equal(stickySidebarMetrics(900,130,400,'adaptive').top,96);
});
