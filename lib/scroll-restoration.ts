export type ScrollPosition = {top:number; anchor?:string; offset?:number};
export type ScrollAction = 'top'|'restore'|'anchor'|'preserve';

export function routeScrollAction(previous:string, next:string, restore:boolean):ScrollAction {
  const destination=new URL(next,'http://aaramv.local');
  if(destination.hash)return 'anchor';
  if(restore)return 'restore';
  if(!previous)return 'top';
  const origin=new URL(previous,'http://aaramv.local');
  if(origin.pathname!==destination.pathname)return 'top';
  if(destination.pathname==='/properties'){
    const before=new URLSearchParams(origin.search),after=new URLSearchParams(destination.search);
    before.delete('limit');after.delete('limit');
    before.sort();after.sort();
    if(before.toString()!==after.toString())return 'top';
  }
  return 'preserve';
}

export function readScrollPositions(raw:string|null):Record<string,ScrollPosition> {
  try {
    const parsed:unknown=JSON.parse(raw||'{}');
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {};
    return Object.fromEntries(Object.entries(parsed).filter(([key,value])=>key.startsWith('/')&&value&&typeof value==='object'&&Number.isFinite(value.top)&&value.top>=0).map(([key,value])=>[key,{
      top:value.top,
      ...(typeof value.anchor==='string'&&/^(card|section):[a-zA-Z0-9_-]+$/.test(value.anchor)?{anchor:value.anchor}:{}),
      ...(Number.isFinite(value.offset)?{offset:value.offset}:{}),
    }]));
  } catch {return {};}
}

export function stickySidebarMetrics(viewportHeight:number,headerBottom:number,sidebarHeight:number,mode:'adaptive'|'top') {
  const clearance=Math.max(96,Math.ceil(headerBottom)+8);
  const top=mode==='top'?clearance:Math.min(96,viewportHeight-sidebarHeight-24);
  return {top,availableHeight:Math.max(0,Math.floor(viewportHeight-Math.max(0,top)-16))};
}
