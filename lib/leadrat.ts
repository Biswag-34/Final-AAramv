// Server-side only: imported by the enquiry API, never by a client component.
export const LEADRAT_ENDPOINT = 'https://connect.leadrat.com/api/v1/integration/Website';

export type LeadEnquiry = {
  reference: string; receivedAt: string; name: string; phone: string; email: string;
  context: string; interest: string; project: string; budget: string; message: string;
  preferredDate: string; intent: string; consent: boolean;
};
export type ProjectDetails = {name: string; type: string; location?: string; city?: string; state?: string};

export class LeadratError extends Error {
  outcome: 'rejected' | 'uncertain';
  httpStatus?: number;
  constructor(outcome: 'rejected' | 'uncertain', httpStatus?: number) {
    super('LeadRat delivery could not be confirmed.');
    this.outcome = outcome;
    this.httpStatus = httpStatus;
  }
}

export function buildLeadratLead(enquiry: LeadEnquiry, project?: ProjectDetails) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(enquiry.receivedAt));
  const part = (name: string) => parts.find(item => item.type === name)?.value;
  const propertyType = project?.type || (['Apartment', 'Villa', 'Plot'].includes(enquiry.interest) ? enquiry.interest : '');
  return {
    name: enquiry.name,
    mobile: enquiry.phone.replace(/[\s()+-]/g, '').replace(/^91(?=\d{10}$)/, ''),
    countryCode: '91',
    email: enquiry.email,
    // Only use a canonical project name, never a generic property preference.
    ...(project ? {project: project.name, state: project.state || '', city: project.city || '', location: project.location || ''} : {}),
    ...(propertyType ? {propertyType: propertyType === 'Apartment' ? 'Flat' : propertyType} : {}),
    source: 'Website',
    subSource: process.env.LEADRAT_SUBSOURCE?.trim() || 'Aaramv Realty Website',
    submittedDate: `${part('day')}-${part('month')}-${part('year')}`,
    submittedTime: `${part('hour')}:${part('minute')}:${part('second')}`,
    notes: [
      `Website reference: ${enquiry.reference}`, `Form: ${enquiry.context}`,
      `Request: ${enquiry.intent === 'visit' ? 'Site visit enquiry (appointment not confirmed)' : 'Callback'}`,
      enquiry.interest && `Interest: ${enquiry.interest}`,
      enquiry.budget && `Budget preference: ${enquiry.budget}`,
      enquiry.preferredDate && `Preferred date: ${enquiry.preferredDate} (not confirmed)`,
      enquiry.message,
    ].filter(Boolean).join('\n'),
    additionalProperties: {
      WebsiteReference: enquiry.reference, FormContext: enquiry.context,
      Interest: enquiry.interest, BudgetPreference: enquiry.budget,
      RequestType: enquiry.intent, PreferredDate: enquiry.preferredDate,
      ContactConsent: String(enquiry.consent),
    },
    // Budget choices are ranges, not exact rupee amounts. Keep them in notes.
    // A website enquiry must not set booked/scheduled CRM stages or assign users.
  };
}

export async function pushLeadratLead(enquiry: LeadEnquiry, project?: ProjectDetails, send: typeof fetch = fetch) {
  const apiKey = process.env.LEADRAT_API_KEY?.trim();
  if (!apiKey) throw new LeadratError('rejected');
  try {
    const response = await send(LEADRAT_ENDPOINT, {
      method: 'POST',
      headers: {'API-Key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify([buildLeadratLead(enquiry, project)]),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new LeadratError(response.status >= 500 || response.status === 408 ? 'uncertain' : 'rejected', response.status);
    const body = await response.text();
    // The supplied contract defines HTTP 200 as success. Also honour explicit
    // application-level failures when the provider returns a JSON envelope.
    let result: unknown;
    try {result = body ? JSON.parse(body) : undefined;} catch {throw new LeadratError('uncertain', response.status);}
    const failed = (value: unknown): boolean => {
      if(value===false)return true;
      if (Array.isArray(value)) return value.some(failed);
      if (!value || typeof value !== 'object') return false;
      const record = value as Record<string, unknown>;
      const isFalse=(flag:unknown)=>flag===false||(typeof flag==='string'&&flag.toLowerCase()==='false');
      const hasErrors=(errors:unknown)=>Array.isArray(errors)?errors.length>0:!!errors&&(typeof errors!=='object'||Object.keys(errors).length>0);
      return isFalse(record.success) || isFalse(record.isSuccess) || isFalse(record.succeeded) || record.status === false ||
        (typeof record.status === 'string' && ['error', 'failed', 'failure'].includes(record.status.toLowerCase())) ||
        (typeof record.statusCode === 'number' && record.statusCode >= 400) || hasErrors(record.error) || hasErrors(record.errors) ||
        (record.data !== undefined && failed(record.data));
    };
    if (failed(result)) throw new LeadratError('rejected', response.status);
    return {status: 'delivered' as const};
  } catch (error) {
    // Never log or return the upstream body: it may contain contact details.
    if (error instanceof LeadratError) throw error;
    throw new LeadratError('uncertain');
  }
}
