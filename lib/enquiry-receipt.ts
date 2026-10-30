import type {EnquiryDownload} from '@/components/enquiry-context';

export type EnquiryReceipt={reference:string;intent:'visit'|'callback';project?:string;download?:EnquiryDownload};
let latest:EnquiryReceipt|null=null;
export function saveEnquiryReceipt(receipt:EnquiryReceipt){latest=receipt;try{sessionStorage.setItem('aaramv-enquiry-receipt',JSON.stringify(receipt));}catch{}}
export function readEnquiryReceipt():EnquiryReceipt|null{try{const raw=sessionStorage.getItem('aaramv-enquiry-receipt');if(raw)return JSON.parse(raw);}catch{}return latest;}
export function consumeEnquiryDownload(){const receipt=readEnquiryReceipt();if(receipt)saveEnquiryReceipt({...receipt,download:undefined});}
