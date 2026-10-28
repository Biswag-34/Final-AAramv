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
export async function generateMetadata({params}:Props){if(!knownRoute((await params).slug))notFound();return {};}
export default async function Page({params}:Props){if(!knownRoute((await params).slug))notFound();return <Site/>}
