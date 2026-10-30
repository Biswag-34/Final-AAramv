import content from '@/data/buyer-guidance.json';
export type ProjectGuidance = {
  bestFor?: string;
  strengths?: string[];
  tradeOffs?: string[];
  unitAdvice?: string[];
  maintenance?: string;
  constructionUpdate?: string;
  developerBackground?: string;
  paymentPlan?: {milestone: string; amount: string}[];
  approvals?: {title: string; status: string; url?: string}[];
  allInclusivePrices?: {configuration: string; amount: string; includes: string}[];
};
export type LocalityGuidance = {
  lifestyle?: string;
  bestFor?: string[];
  strengths?: string[];
  watchOuts?: string[];
  priceTrend?: {period: string; pricePerSqFtInr: number}[];
};
export const buyerGuidance = content as {projects: Record<string, ProjectGuidance>; localities: Record<string, LocalityGuidance>};
