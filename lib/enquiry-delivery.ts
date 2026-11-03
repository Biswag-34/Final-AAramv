import {mkdir, readFile, writeFile, rename} from 'node:fs/promises';
import path from 'node:path';
import {LeadratError, pushLeadratLead, type LeadEnquiry, type ProjectDetails} from './leadrat.ts';

type SavedEnquiry = LeadEnquiry & {status: 'pending' | 'delivered' | 'rejected' | 'uncertain'};
export class EnquiryConflict extends Error {}

// Coalesce retries on a warm Vercel instance. This is deliberately bounded and
// does not claim cross-instance idempotency; the CRM has no documented idempotency key.
const deliveries = new Map<string, {identity: string; result: Promise<void>; expires: number}>();
export async function deliverEnquiry(enquiry: LeadEnquiry, project?: ProjectDetails, send: typeof fetch = fetch) {
  const now = Date.now();
  for (const [key, entry] of deliveries) if (entry.expires < now) deliveries.delete(key);
  const identity = JSON.stringify([enquiry.name, enquiry.phone.replace(/[\s()+-]/g, ''), enquiry.email]);
  const existing = deliveries.get(enquiry.reference);
  if (existing) {
    if (existing.identity !== identity) throw new EnquiryConflict();
    return existing.result;
  }
  // Vercel's deployment filesystem is read-only. Production delivery must not
  // depend on disk; persistent local receipts are only used outside Vercel.
  const serverless = !!process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.ENQUIRY_STORAGE_DIR);
  const directory = serverless ? undefined : path.resolve(process.env.ENQUIRY_STORAGE_DIR || '.local/enquiries');
  const result = deliver(enquiry, directory, project, send);
  if (deliveries.size < 1000) {
    deliveries.set(enquiry.reference, {identity, result, expires: now + 30 * 60_000});
    void result.catch(error => {
      if (!(error instanceof LeadratError) || error.outcome === 'rejected') deliveries.delete(enquiry.reference);
    });
  }
  return result;
}

async function deliver(enquiry: LeadEnquiry, directory: string | undefined, project: ProjectDetails | undefined, send: typeof fetch) {
  let saved: SavedEnquiry = {...enquiry, status: 'pending'};
  const file = directory ? path.join(directory, `${enquiry.reference.slice(3).toLowerCase()}.json`) : undefined;
  if (directory && file) {
    await mkdir(directory, {recursive: true});
    try {await writeFile(file, JSON.stringify(saved, null, 2), {encoding: 'utf8', flag: 'wx', mode: 0o600});}
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const previous = JSON.parse(await readFile(file, 'utf8')) as SavedEnquiry;
      if (previous.name !== enquiry.name || previous.phone !== enquiry.phone || previous.email !== enquiry.email) throw new EnquiryConflict();
      if (previous.status === 'delivered') return;
      if (previous.status === 'pending' || previous.status === 'uncertain') throw new LeadratError('uncertain');
      // A legacy 'recorded' receipt or rejected attempt can be sent using the
      // original timestamp and details, without creating another local record.
      saved = {...previous, project: previous.project || '', status: 'pending'};
      await persist(file, saved);
    }
  }
  try {await pushLeadratLead(saved, project, send);}
  catch (error) {
    saved.status = error instanceof LeadratError ? error.outcome : 'uncertain';
    if (file) {
      try {await persist(file, saved);} catch {console.error('Could not update failed enquiry receipt:', enquiry.reference);}
    }
    throw error;
  }
  saved.status = 'delivered';
  if (file) {
    try {await persist(file, saved);}
    catch {
      // The lead is already accepted. Do not invite a duplicate submission if
      // updating the optional local receipt fails after successful delivery.
      console.error('Could not update delivered enquiry receipt:', enquiry.reference);
    }
  }
}

async function persist(file: string, record: SavedEnquiry) {
  const temporary = `${file}.tmp`;
  await writeFile(temporary, JSON.stringify(record, null, 2), {encoding: 'utf8', mode: 0o600});
  await rename(temporary, file);
}
