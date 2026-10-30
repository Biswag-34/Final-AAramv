// Add only business-confirmed information. The report's sample fields are not facts.
export const businessDetails = {
  tradingName: 'Aaramv Realty',
  legalName: "Aaramv Realty" as string | null,
  phone: "9071100611" as string | null,
  whatsapp: null as string | null,
  responseTime: "Within 30 minutes" as string | null,
  email: "aaramvrealty@gmail.com" as string | null,
  address: null as string | null,
  hours: null as string | null,
  officeMapUrl: null as string | null,
  agentRegistration: null as string | null,
  feePolicy: null as string | null,
  team: [] as {name: string; role: string; photo?: string}[],
  reviews: [] as {name: string; quote: string; source: string; sourceUrl?: string}[],
  socialProfiles: [] as {name: string; url: string}[],
};
