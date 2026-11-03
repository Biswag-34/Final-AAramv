// Only loaded by the HTTP test's child process; never imported by the app.
import {appendFile} from 'node:fs/promises';
const originalFetch=globalThis.fetch;
globalThis.fetch=async (url,options)=>{
  if(String(url)!=='https://connect.leadrat.com/api/v1/integration/Website')return originalFetch(url,options);
  const leads=JSON.parse(options.body);
  await appendFile(process.env.LEADRAT_TEST_CAPTURE,JSON.stringify({leads,key:options.headers['API-Key']})+'\n');
  if(leads[0].name==='Rejected Test')return Response.json({isSuccess:false},{status:400});
  if(leads[0].name==='Failed Envelope Test')return Response.json({error:'Provider rejected lead'});
  if(leads[0].name==='Uncertain Test')throw new TypeError('Simulated lost response');
  return Response.json({isSuccess:true});
};
