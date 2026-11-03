export type SubmissionResult =
  | {status: 'delivered'; reference: string}
  | {status: 'failed' | 'uncertain'; message: string; errors: Record<string, string>};

export async function submitEnquiry(input: Record<string, unknown>, send: typeof fetch = fetch): Promise<SubmissionResult> {
  const reference = `AR-${String(input.requestId).toUpperCase()}`;
  const uncertain = (): SubmissionResult => ({
    status: 'uncertain', errors: {},
    message: `We couldn’t confirm whether your enquiry was submitted. Please contact our team and quote ${reference} before trying again.`,
  });
  try {
    const response = await send('/api/enquiries', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(input),
      signal: AbortSignal.timeout(20_000),
    });
    let result: unknown;
    try {result = await response.json();} catch {
      if (!response.ok && response.status >= 400 && response.status < 500 && response.status !== 408) {
        return {status: 'failed', errors: {}, message: 'Your enquiry could not be submitted. Please refresh the page and try again.'};
      }
      return uncertain();
    }
    const body = result && typeof result === 'object' && !Array.isArray(result) ? result as Record<string, unknown> : {};
    // Require our API's explicit confirmation for this exact attempt, rather
    // than accepting any HTTP 200 (including an old or unrelated response).
    if (response.ok && body.status === 'delivered' && body.reference === reference && !body.error && body.success !== false) {
      return {status: 'delivered', reference};
    }
    if (response.ok || body.retryable === false || body.status === 'uncertain' || response.status === 408) return uncertain();
    const errors: Record<string, string> = {};
    if (body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
      for (const [key, value] of Object.entries(body.errors)) if (typeof value === 'string') errors[key] = value;
    }
    if (response.status >= 500 && body.status !== 'failed' && body.retryable !== true) return uncertain();
    return {
      status: 'failed', errors,
      message: typeof body.error === 'string' && body.error.trim() ? body.error : 'Your enquiry could not be submitted. Please try again.',
    };
  } catch {return uncertain();}
}
