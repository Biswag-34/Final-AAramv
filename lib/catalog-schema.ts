import { z } from 'zod';
import {propertyResearchFields, localityResearchFields, mediaResearchFields, configurationResearchFields, possessionResearchFields, amenityResearchFields, researchDocumentSchema} from './research-fields.ts';

export const iconNames = ['Building2', 'House', 'LandPlot', 'BedDouble', 'Maximize', 'ShieldCheck', 'Handshake', 'KeyRound', 'Compass', 'MapPin', 'TreePine', 'Dumbbell', 'Waves', 'Car', 'Users', 'TrainFront', 'BriefcaseBusiness', 'School', 'Clock', 'CheckCircle2', 'FileText', 'Hospital', 'ShoppingBag', 'Bath', 'Ruler', 'Activity', 'CalendarDays', 'GraduationCap', 'IndianRupee', 'Trees', 'Baby', 'Bike', 'BookOpen', 'Clapperboard', 'Drama', 'Flower2', 'Footprints', 'Goal', 'HeartPulse', 'PawPrint', 'PersonStanding', 'Sparkles', 'Store', 'TentTree', 'Trophy', 'Volleyball', 'Armchair', 'ParkingCircle'] as const;
const icon = z.enum(iconNames);
const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase hyphenated ID');
const url = z.string().refine(value => /^\/(?!\/)[^\s\\]*$/.test(value) || /^https:\/\/[^\s\\]+$/.test(value) && (() => { try { const u = new URL(value); return !!u.hostname && !u.username && !u.password; } catch { return false; } })(), 'Use a /public-relative path or an HTTPS URL');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Use a real YYYY-MM-DD date');
const amount = z.number().finite().positive();
const coordinates = z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).strict().nullable();
const source = z.object({ label: text, url: url.nullable(), checkedAt: date.nullable() }).strict();
const media = z.object({ ...mediaResearchFields, id, src: url, alt: text, caption: z.string(), kind: z.enum(['exterior', 'interior', 'amenity', 'floor-plan', 'map', 'locality', 'master-plan', 'construction', 'landmark-photograph', 'location-map']), credit: z.string() }).strict();
const faq = z.object({ question: text, answer: text }).strict();
const fact = z.object({ label: text, value: z.union([text, z.number().finite()]), unit: z.string(), icon }).strict();
const highlight = z.object({ icon, title: text, description: z.string() }).strict();
const place = z.object({ name: text, category: text, icon, description: z.string(), distanceKm: z.number().finite().nonnegative().nullable(), travelMinutes: z.number().int().nonnegative().nullable(), travelMode: z.enum(['walk', 'walking', 'drive', 'transit']).nullable(), mapUrl: url.nullable() }).strict();
const configuration = z.object({
  ...configurationResearchFields,
  id, label: text, bedrooms: z.number().int().min(0).max(30).nullable(), bathrooms: z.number().int().min(0).max(30).nullable(),
  areaSqFt: amount.nullable(), areaBasis: z.enum(['carpet', 'built-up', 'super-built-up', 'saleable', 'plot', 'unspecified']),
  startingPriceInr: amount.int().nullable(), priceNote: z.string(), availability: z.enum(['available', 'limited', 'sold-out', 'on-request']), floorPlanImageId: id.nullable(),
}).strict();

const common = {
  schemaVersion: z.literal(2), id, published: z.boolean(), isDemo: z.boolean(), name: text,
  searchKeywords: z.array(text), coverImageId: id, images: z.array(media).min(1),
  coordinates, mapUrl: url.nullable(), faqs: z.array(faq), sources: z.array(source), updatedAt: date.nullable(),
};

export const propertySchema = z.object({
  ...propertyResearchFields,
  ...common, localityId: id, type: z.enum(['Apartment', 'Villa', 'Plot', 'Row House', 'Apartment and Villa']), status: z.enum(['Ready to move', 'Under construction', 'New launch']),
  developerName: text.nullable(), phaseName: text.nullable(), address: text.nullable(), postalCode: z.string().regex(/^\d{6}$/).nullable(),
  totalUnits: z.number().int().positive().nullable().optional(),
  description: text, possession: z.object({ ...possessionResearchFields, label: text, date: date.nullable() }).strict(),
  primaryConfigurationId: id, configurations: z.array(configuration).min(1),
  icons: z.object({ configuration: icon, area: icon, status: icon, possession: icon, location: icon }).strict(),
  facts: z.array(fact), highlights: z.array(highlight), amenities: z.array(highlight.extend(amenityResearchFields).strict()), nearbyPlaces: z.array(place),
  documents: z.array(z.union([z.object({ label: text, value: text, icon, url: url.nullable() }).strict(), researchDocumentSchema])),
  relatedPropertyIds: z.array(id),
  content: z.object({ overviewTitle: text, layoutsTitle: text, layoutsNote: z.string(), amenitiesTitle: text, amenitiesNote: z.string(), locationTitle: text, locationDescription: z.string(), documentsTitle: text, documentsDescription: z.string(), faqsTitle: text }).strict(),
}).strict();

export const localitySchema = z.object({
  ...localityResearchFields,
  ...common, city: text, state: text, country: text, zone: text, tagline: text, description: text,
  tags: z.array(text), considerations: z.array(text), highlights: z.array(highlight),
  metrics: z.array(fact.extend({ asOf: date.nullable(), note: z.string() }).strict()),
  connectivity: z.array(place), nearbyPlaces: z.array(place),
  infrastructure: z.array(z.object({ title: text, icon, status: z.enum(['operational', 'under-construction', 'proposed']), description: text, expectedCompletion: date.nullable(), sourceUrl: url.nullable() }).strict()),
  market: z.object({ summary: text, minPricePerSqFtInr: amount.nullable(), maxPricePerSqFtInr: amount.nullable(), rentalYieldPercent: z.number().min(0).max(100).nullable(), asOf: date.nullable(), sourceUrl: url.nullable() }).strict().nullable(),
}).strict();

export type PropertyRecord = z.infer<typeof propertySchema>;
export type LocalityRecord = z.infer<typeof localitySchema>;
export type IconName = typeof iconNames[number];
export type Place = z.infer<typeof place>;

// Validate relationships as well as individual records, before any page consumes the catalog.
export const catalogSchema = z.object({ properties: z.array(propertySchema), localities: z.array(localitySchema) }).strict().superRefine((catalog, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
  const unique = (values: string[], path: (string | number)[]) => { const seen = new Set<string>(); values.forEach((v, i) => { if (seen.has(v)) issue([...path, i], `Duplicate ID: ${v}`); seen.add(v); }); };
  unique(catalog.properties.map(p => p.id), ['properties']);
  unique(catalog.localities.map(l => l.id), ['localities']);
  for (const group of ['properties', 'localities'] as const) catalog[group].forEach((record, i) => {
    unique(record.images.map(image => image.id), [group, i, 'images']);
    if (!record.images.some(image => image.id === record.coverImageId)) issue([group, i, 'coverImageId'], 'Must reference an image in this record');
  });
  catalog.properties.forEach((p, i) => {
    const base = ['properties', i];
    const locality = catalog.localities.find(l => l.id === p.localityId);
    if (!locality || p.published && !locality.published) issue([...base, 'localityId'], 'Must reference an existing locality; published properties need a published locality');
    unique(p.configurations.map(c => c.id), [...base, 'configurations']);
    p.galleryImageIds?.forEach((imageId,j)=>{if(!p.images.some(image=>image.id===imageId))issue([...base,'galleryImageIds',j],'Must reference an image in this property');});
    Object.entries(p.configurationIdAliases||{}).forEach(([alias,target])=>{if(!p.configurations.some(c=>c.id===target))issue([...base,'configurationIdAliases',alias],'Must reference an existing configuration');});
    if (!p.configurations.some(c => c.id === p.primaryConfigurationId)) issue([...base, 'primaryConfigurationId'], 'Must reference a configuration in this property');
    p.configurations.forEach((c, j) => {
      if (p.type === 'Plot' && (c.bedrooms !== null || c.bathrooms !== null)) issue([...base, 'configurations', j], 'Plots must have null bedrooms and bathrooms');
      if (c.floorPlanImageId && !p.images.some(image => image.id === c.floorPlanImageId && (image.kind === 'floor-plan' || p.type==='Plot'&&image.kind==='master-plan'))) issue([...base, 'configurations', j, 'floorPlanImageId'], 'Must reference a floor plan or plot site layout in this property');
      c.floorPlanImageIds?.forEach((imageId,k)=>{if(!p.images.some(image=>image.id===imageId&&(image.kind==='floor-plan'||image.kind==='master-plan'))&&!p.research?.archivedPlanReferences.some(image=>image.id===imageId))issue([...base,'configurations',j,'floorPlanImageIds',k],'Must reference a live or archived plan image');});
    });
    unique(p.relatedPropertyIds, [...base, 'relatedPropertyIds']);
    p.relatedPropertyIds.forEach((related, j) => { if (related === p.id || !catalog.properties.some(other => other.id === related)) issue([...base, 'relatedPropertyIds', j], 'Must reference a different existing property'); });
  });
  catalog.localities.forEach((l, i) => { const m = l.market; if (m?.minPricePerSqFtInr != null && m.maxPricePerSqFtInr != null && m.minPricePerSqFtInr > m.maxPricePerSqFtInr) issue(['localities', i, 'market'], 'Minimum price must not exceed maximum price'); });
});
