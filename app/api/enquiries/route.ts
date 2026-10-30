import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {validateEnquiry} from '@/lib/enquiry';

export const runtime = 'nodejs';
const responseHeaders = {'Cache-Control': 'no-store'};
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  // Next's internal URL can use localhost even when the browser uses 127.0.0.1.
  // Match the browser origin to the incoming Host, including the port.
  const sameOrigin = (() => {try {const from = new URL(origin || '');return ['http:', 'https:'].includes(from.protocol) && from.host === request.headers.get('host');} catch {return false;}})();
  if (!sameOrigin) return Response.json({error: 'Please submit your request from this website.'}, {status: 403, headers: responseHeaders});
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({error: 'Use a JSON request.'}, {status: 415, headers: responseHeaders});
  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({error: 'Your request is empty.'}, {status: 400, headers: responseHeaders});
    const chunks: Uint8Array[] = [];let length = 0;
    while (true) {const part = await reader.read();if (part.done) break;length += part.value.length;if (length > 8192) {await reader.cancel();return Response.json({error: 'Please shorten your request.'}, {status: 413, headers: responseHeaders});} chunks.push(part.value);}
    let input: Record<string, unknown>;
    try {input = JSON.parse(Buffer.concat(chunks).toString('utf8'));} catch {return Response.json({error: 'Your request could not be read.'}, {status: 400, headers: responseHeaders});}
    if (!input || typeof input !== 'object' || Array.isArray(input)) return Response.json({error: 'Check your request details.'}, {status: 400, headers: responseHeaders});
    const text = (key: string, max: number) => typeof input[key] === 'string' ? input[key].trim().slice(0, max) : '';
    const name = text('name', 100), phone = text('phone', 30), email = text('email', 254);
    const errors = validateEnquiry({name, phone, email, consent: input.consent === true});
    const requestId = text('requestId', 36);
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId)) errors.requestId = 'Please refresh the form and try again.';
    if (text('website', 100)) return Response.json({error: 'Unable to record this request.'}, {status: 400, headers: responseHeaders});
    const preferredDate = text('preferredDate', 10);
    const todayParts = new Intl.DateTimeFormat('en', {timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date());
    const today = ['year', 'month', 'day'].map(type => todayParts.find(part => part.type === type)?.value).join('-');
    if (preferredDate && (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !Number.isFinite(Date.parse(preferredDate)) || new Date(preferredDate).toISOString().slice(0,10) !== preferredDate || preferredDate < today)) errors.preferredDate = 'Choose today or a future date.';
    if (Object.keys(errors).length) return Response.json({error: 'Please check your details.', errors}, {status: 400, headers: responseHeaders});
    const reference = `AR-${requestId.toUpperCase()}`;
    const record = {reference, receivedAt: new Date().toISOString(), name, phone, email, consent: true, context: text('context', 500), interest: text('interest', 200), budget: text('budget', 100), message: text('message', 2000), preferredDate, intent: input.intent === 'visit' ? 'visit' : 'callback', status: 'recorded'};
    const directory = path.join(process.cwd(), '.local', 'enquiries');
    await mkdir(directory, {recursive: true});
    const file = path.join(directory, `${requestId.toLowerCase()}.json`);
    try {await writeFile(file, JSON.stringify(record, null, 2), {encoding: 'utf8', flag: 'wx', mode: 0o600});}
    catch (error) {if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;const previous = JSON.parse(await readFile(file, 'utf8'));if (previous.phone !== phone || previous.name !== name) return Response.json({error: 'Start a new enquiry to submit different details.'}, {status: 409, headers: responseHeaders});}
    return Response.json({reference, status: 'recorded'}, {status: 201, headers: responseHeaders});
  } catch {return Response.json({error: 'We could not record your request. Please try again.'}, {status: 503, headers: responseHeaders});}
}
