import {properties} from '@/app/data';

export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{propertyId:string;documentIndex:string}>}) {
  const {propertyId,documentIndex}=await params;
  const p=properties.find(item=>item.id===propertyId);
  const document=p&&/^\d+$/.test(documentIndex)?p.documents[Number(documentIndex)]:undefined;
  if(!p||!document?.url)return new Response('Brochure not found.',{status:404});
  try {
    // The URL comes exclusively from the validated catalogue, never a request URL parameter.
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),60000);
    let upstream:Response;
    try {upstream=await fetch(new URL(document.url,new URL(_request.url).origin),{cache:'no-store',signal:controller.signal});}
    finally {clearTimeout(timeout);}
    const contentType=upstream.headers.get('content-type')||'';
    if(!upstream.ok||!upstream.body||/text\/html/i.test(contentType))return new Response('The brochure could not be downloaded. Please use “Open original” on the project page.',{status:502});
    // Stream the file without a whole-transfer timeout: some catalogue hosts send PDFs slowly.
    return new Response(upstream.body,{headers:{'Content-Type':contentType||'application/pdf','Content-Disposition':`attachment; filename="${p.id}-brochure-${Number(documentIndex)+1}.pdf"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=300'}});
  } catch {return new Response('The brochure could not be downloaded. Please use “Open original” on the project page.',{status:502});}
}
