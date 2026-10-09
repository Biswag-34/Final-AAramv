export function validateEnquiry(fields: {name: string; phone: string; email: string; consent: boolean}) {
  const issues: Record<string, string> = {};
  if (fields.name.trim().length < 2) issues.name = 'Please enter your full name.';
  const phone = fields.phone.replace(/[\s()-]/g, '').replace(/^\+/, '');
  if (!/^(?:91)?[6-9]\d{9}$/.test(phone)) issues.phone = 'Enter a valid Indian mobile number.';
  const email = fields.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.email = 'Please check your email address.';
  if (!fields.consent) issues.consent = 'Please agree to be contacted about this enquiry.';
  return issues;
}
