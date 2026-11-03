import type {EnquiryDownload} from '@/components/enquiry-context';

export type EnquiryReceipt={reference:string;status:'delivered';confirmedAt:number;intent:'visit'|'callback';project?:string;download?:EnquiryDownload};
let latest:EnquiryReceipt|null=null;
function confirmed(receipt:unknown):receipt is EnquiryReceipt {
  if(!receipt||typeof receipt!=='object')return false;
  const value=receipt as Partial<EnquiryReceipt>;
  return value.status==='delivered'&&typeof value.reference==='string'&&/^AR-[A-F0-9]{8}-[A-F0-9]{4}-4[A-F0-9]{3}-[89AB][A-F0-9]{3}-[A-F0-9]{12}$/.test(value.reference)&&
    (value.intent==='visit'||value.intent==='callback')&&typeof value.confirmedAt==='number'&&value.confirmedAt<=Date.now()&&Date.now()-value.confirmedAt<60*60_000;
}
export function clearEnquiryReceipt(){latest=null;try{sessionStorage.removeItem('aaramv-enquiry-receipt');}catch{}}
export function saveEnquiryReceipt(receipt:EnquiryReceipt){if(!confirmed(receipt)){clearEnquiryReceipt();return;}latest=receipt;try{sessionStorage.setItem('aaramv-enquiry-receipt',JSON.stringify(receipt));}catch{}}
export function readEnquiryReceipt():EnquiryReceipt|null{
  let raw:string|null;
  try{raw=sessionStorage.getItem('aaramv-enquiry-receipt');}catch{return confirmed(latest)?latest:null;}
  if(raw){try{const saved:unknown=JSON.parse(raw);if(confirmed(saved))return saved;}catch{}clearEnquiryReceipt();return null;}
  return confirmed(latest)?latest:null;
}
export function consumeEnquiryDownload(){const receipt=readEnquiryReceipt();if(receipt)saveEnquiryReceipt({...receipt,download:undefined});}
