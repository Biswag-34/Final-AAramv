export const ENQUIRY_BUDGETS=['Under ₹1 Cr','₹1–2 Cr','₹2–3 Cr','Above ₹3 Cr','Still exploring'] as const;

export function validateEnquiry(fields: {name: string; phone: string; email: string; budget?:string; consent: boolean}) {
  const issues: Record<string, string> = {};
  if (fields.name.trim().length < 2 || fields.name.trim().length > 100 || !/^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-]*$/u.test(fields.name.trim())) issues.name = 'Please enter your name using letters, spaces, apostrophes or hyphens.';
  const phone = fields.phone.replace(/[\s()-]/g, '').replace(/^\+/, '');
  if (!/^(?:91)?[6-9]\d{9}$/.test(phone)) issues.phone = 'Please enter a valid mobile number with country code.';
  const email = fields.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.email = 'Please check the email address or leave this field blank.';
  if (fields.budget && !ENQUIRY_BUDGETS.includes(fields.budget as typeof ENQUIRY_BUDGETS[number])) issues.budget = 'Choose a listed budget or leave this field blank.';
  if (!fields.consent) issues.consent = 'Please agree to be contacted about this enquiry before continuing.';
  return issues;
}
