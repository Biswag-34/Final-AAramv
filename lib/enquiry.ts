export function validateEnquiry(fields: {name: string; phone: string; email: string; consent: boolean}) {
  const issues: Record<string, string> = {};
  if (fields.name.trim().length < 2) issues.name = 'Please enter your name.';
  const phone = fields.phone.replace(/[\s()-]/g, '').replace(/^\+/, '');
  if (!/^(?:91)?[6-9]\d{9}$/.test(phone)) issues.phone = 'Please enter a valid mobile number with country code.';
  const email = fields.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.email = 'Please check the email address or leave this field blank.';
  if (!fields.consent) issues.consent = 'Please agree to be contacted about this enquiry before continuing.';
  return issues;
}
