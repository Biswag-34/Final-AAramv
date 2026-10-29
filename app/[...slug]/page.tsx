import type {Metadata} from 'next';
import Site from '../site';
import {notFound} from 'next/navigation';
import {properties,localities} from '../data';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string[]}>};
function knownRoute(slug:string[]){
  if(slug.length===1)return ['properties','localities','about','contact','privacy','terms','coming-soon'].includes(slug[0]);
  if(slug.length!==2)return false;
  return slug[0]==='properties'?properties.some(p=>p.id===slug[1]):slug[0]==='localities'&&localities.some(l=>l.id===slug[1]);
}
// Validate before streaming so the existing recovery design receives a real 404 status.
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const slug=(await params).slug;
 if(!knownRoute(slug))return {title:'Page not found | Aaramv Realty',description:'Explore our current homes or return to the homepage.',robots:{index:false,follow:false},alternates:{canonical:null}};
 const route='/'+slug.join('/');
 const pages:Record<string,[string,string]>={
 '/properties':['Compare Bengaluru Properties | Aaramv Realty',"Explore Aaramv's Bengaluru catalogue by locality, home type and budget. Review layouts and project details, then ask about current availability and complete costs."],
 '/localities':['Explore Bengaluru Neighbourhoods | Aaramv Realty',"Compare the places in Aaramv's catalogue by listed projects and home types, with location context and everyday routes to check."],
 '/about':['Buyer First Property Guidance | About Aaramv Realty','Learn how Aaramv understands your needs, researches suitable homes and helps coordinate your search through move-in in Bengaluru.'],
 '/contact':['Share Your Home Buying Brief | Aaramv Realty','Share your preferred areas, budget and priorities with Aaramv Realty. Ask about a project or request a separately confirmed site visit.'],
 '/privacy':['Privacy Policy | Aaramv Realty','How this website handles enquiry details and saved homes.'],
 '/terms':['Terms and Conditions | Aaramv Realty','The role of this website and the information to confirm before a property transaction.'],
 '/coming-soon':['This page is being prepared | Aaramv Realty','Explore our current catalogue while we finish this page.'],
 };
 let [title,description]=pages[route]||['Aaramv Realty','Buyer-first property guidance in Bengaluru.'];
 if(slug.length===2&&slug[0]==='properties'){
  const p=properties.find(p=>p.id===slug[1])!;
  title=`${p.name} in ${p.locality} Layouts and Details | Aaramv Realty`;
  description=`Explore ${p.name} in ${p.locality}. Review its home formats, project highlights and layout details, then ask for current availability and complete costs.`;
 }
 if(slug.length===2&&slug[0]==='localities'){
  const l=localities.find(l=>l.id===slug[1])!;
  title=`Homes in ${l.name} Bengaluru | Aaramv Realty`;
  description=`Explore Aaramv's listed homes in ${l.name}, Bengaluru. Compare the home formats and projects, with clear location context and routes to check.`;
 }
 return {title,description,alternates:{canonical:route}};
}
export default async function Page({params}:Props){if(!knownRoute((await params).slug))notFound();return <Site/>}
