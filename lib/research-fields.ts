// Typed research extensions imported from the supplied 28 October 2026 pack.
import {z} from 'zod';
export const propertyResearchFields = {
  "aliases": z.array(z.string()).optional(),
  "amenitiesSummary": z.object({"countType": z.string(), "displayText": z.string(), "isCompleteDeveloperCount": z.boolean(), "label": z.string(), "namedAmenitiesCount": z.number().finite(), "onSiteVerified": z.boolean(), "totalCount": z.number().finite()}).strict().optional(),
  "configurationIdAliases": z.record(z.string()).optional(),
  "configurationSummary": z.array(z.string()).optional(),
  "coordinatesSource": z.string().nullable().optional(),
  "galleryImageIds": z.array(z.string()).optional(),
  "locationMap": z.object({"coordinateNote": z.string(), "developerEmbeds": z.array(z.object({"sourceUrl": z.string(), "url": z.string()}).strict()), "query": z.string(), "type": z.string(), "url": z.string()}).strict().optional(),
  "otherProductFamilies": z.array(z.object({"configuration": z.string(), "reraCarpetAreaSqFt": z.union([z.number().finite(), z.number().finite()]), "superBuiltUpAreaSqFt": z.number().finite(), "type": z.string()}).strict()).optional(),
  "overview": z.object({"highlights": z.array(z.string()), "note": z.string(), "possessionDisplay": z.string(), "priceDisplay": z.string(), "projectFacts": z.array(z.object({"icon": z.string(), "label": z.string(), "unit": z.string(), "value": z.union([z.number().finite(), z.number().finite(), z.string()])}).strict()), "sourceIds": z.array(z.string()), "summary": z.string(), "title": z.string()}).strict().optional(),
  "plotSizeSchedule": z.object({"availability": z.string().optional(), "developerPublishedOptions": z.array(z.object({"areaRangeSqFt": z.object({"max": z.number().finite(), "min": z.number().finite()}).strict().optional(), "areaSqFt": z.number().finite().optional(), "label": z.string()}).strict()).optional(), "legacyCpOption": z.object({"areaSqFt": z.number().finite(), "label": z.string()}).strict().optional(), "note": z.string().optional(), "publishedRangeSqFt": z.object({"max": z.number().finite(), "min": z.number().finite()}).strict().optional(), "sourceId": z.string().optional(), "sourceIds": z.array(z.string()).optional()}).strict().optional(),
  "pricing": z.object({"checkedAt": z.string(), "currency": z.string(), "currentUnitQuoteConfirmed": z.boolean(), "displayMode": z.string(), "displayScope": z.string(), "displayText": z.string(), "exclusions": z.string(), "footnote": z.string(), "maxStartingPriceInr": z.number().finite().nullable(), "minStartingPriceInr": z.number().finite(), "priceEffectiveDate": z.null(), "publicationStatus": z.string(), "quotes": z.array(z.object({"applicability": z.string().optional(), "areaBasis": z.string().optional(), "areaMaxSqFt": z.number().finite().nullable().optional(), "areaSqFt": z.union([z.number().finite(), z.number().finite()]).nullable(), "availability": z.string().optional(), "basis": z.string(), "canAttachToConfiguration": z.boolean().optional(), "checkedAt": z.string(), "exactTowerConfirmed": z.boolean().optional(), "label": z.string(), "phaseName": z.string().nullable().optional(), "priceEffectiveDate": z.string().nullable(), "scope": z.string(), "sourceId": z.string(), "sourceUrl": z.string(), "startingPriceInr": z.number().finite(), "upperQuotedPriceInr": z.number().finite().optional()}).strict()), "rangeMeaning": z.string(), "referenceRange": z.object({"coverage": z.string(), "displayText": z.string(), "highestConfigurationStartInr": z.number().finite(), "lowestConfigurationStartInr": z.number().finite()}).strict(), "suffix": z.string()}).strict().optional(),
  "projectScale": z.object({"floorArrangement": z.string(), "landAreaAcres": z.union([z.number().finite(), z.number().finite()]), "landAreaScope": z.string(), "sourceIds": z.array(z.string()), "totalHomesOrPlots": z.number().finite().nullable(), "towerCount": z.number().finite().nullable(), "verification": z.string()}).strict().optional(),
  "research": z.object({"archivedPlanReferences": z.array(z.object({"alt": z.string(), "caption": z.string(), "checkedAt": z.string(), "credit": z.string(), "id": z.string(), "kind": z.string(), "representation": z.string(), "rightsStatus": z.string(), "sourcePageUrl": z.string(), "sourceUrl": z.string(), "usage": z.string()}).strict()), "checkedAt": z.string(), "currentInventoryConfirmed": z.boolean(), "fullAddressStatus": z.string(), "fullSanctionedLayoutScheduleCertified": z.boolean(), "historicalPriceReferences": z.array(z.object({"areaSqFt": z.number().finite(), "availability": z.string(), "basis": z.string(), "canPublishAsCurrent": z.boolean(), "checkedAt": z.string(), "historical": z.boolean(), "label": z.string(), "priceEffectiveDate": z.null(), "scope": z.string(), "sourceId": z.string(), "sourceUrl": z.string(), "startingPriceInr": z.number().finite(), "upperQuotedPriceInr": z.number().finite()}).strict()).optional(), "independentSiteInspection": z.boolean(), "legacyConfigurations": z.array(z.object({"areaBasis": z.string(), "areaSqFt": z.number().finite(), "availability": z.string(), "bathrooms": z.null(), "bedrooms": z.number().finite(), "floorPlanImageId": z.string(), "id": z.string(), "label": z.string(), "priceNote": z.string(), "priceSourceIds": z.array(z.unknown()), "sourceIds": z.array(z.string()), "startingPriceInr": z.null()}).strict()).optional(), "notes": z.array(z.string()), "requiredFieldCoverage": z.object({"address": z.string(), "amenities": z.string(), "configurationOptions": z.string(), "faqs": z.string(), "heroImage": z.string(), "layoutPlans": z.string(), "map": z.string(), "multipleGalleryImages": z.string(), "name": z.string(), "price": z.string(), "projectScale": z.string(), "statusAndPossession": z.string()}).strict(), "sourcePriority": z.array(z.string()), "thirdPartyMediaReferences": z.array(z.object({"alt": z.string(), "caption": z.string(), "checkedAt": z.string(), "credit": z.string(), "id": z.string(), "kind": z.string(), "representation": z.string(), "rightsStatus": z.string(), "sourcePageUrl": z.string(), "sourceUrl": z.string(), "usage": z.string()}).strict())}).strict().optional(),
  "researchFormatNote": z.string().optional(),
  "sourceIds": z.array(z.string()).optional(),
  "statusNote": z.string().optional()
};
export const localityResearchFields = {
  "aaramvPerspective": z.string().optional(),
  "linkedPropertyIds": z.array(z.string()).optional(),
  "research": z.object({"boundaryCertified": z.boolean(), "checkedAt": z.string(), "currentTransitOperatingStatusClaimed": z.boolean(), "imageScope": z.string(), "perspectiveType": z.string()}).strict().optional(),
  "sourceIds": z.array(z.string()).optional(),
  "usp": z.array(z.string()).optional(),
  "zoneType": z.string().optional()
};
export const mediaResearchFields = {
  "bytes": z.number().finite().optional(),
  "capturedAt": z.string().nullable().optional(),
  "checkedAt": z.string().optional(),
  "height": z.number().finite().optional(),
  "license": z.string().nullable().optional(),
  "licenseUrl": z.string().nullable().optional(),
  "representation": z.string().optional(),
  "rightsStatus": z.string().optional(),
  "sha256": z.string().optional(),
  "sourceDocumentUrl": z.string().optional(),
  "sourcePageNumber": z.number().finite().optional(),
  "sourcePageUrl": z.string().optional(),
  "sourceUrl": z.string().optional(),
  "usage": z.string().optional(),
  "width": z.number().finite().optional()
};
export const configurationResearchFields = {
  "areaBasisLabel": z.string().optional(),
  "areaIsRangeMinimum": z.boolean().optional(),
  "areaMaxSqFt": z.number().finite().optional(),
  "balconyAreaSqFt": z.number().finite().optional(),
  "carpetAreaSqFt": z.union([z.number().finite(), z.number().finite()]).optional(),
  "combinedReraAndBalconyAreaSqFt": z.number().finite().optional(),
  "floorPlanImageIds": z.array(z.string()).optional(),
  "floorPlanMatch": z.string().optional(),
  "phaseName": z.string().nullable().optional(),
  "planActionLabel": z.string().optional(),
  "planScope": z.string().optional(),
  "priceSourceIds": z.array(z.string()).optional(),
  "sourceIds": z.array(z.string()).optional(),
  "sourcePageNumber": z.number().finite().optional(),
  "towerName": z.string().optional()
};
export const possessionResearchFields = {
  "checkedAt": z.string().optional(),
  "isContractualCommitment": z.boolean().optional(),
  "month": z.number().finite().optional(),
  "precision": z.string().optional(),
  "sourceId": z.string().optional(),
  "sourceUrl": z.string().optional(),
  "year": z.number().finite().optional()
};
export const amenityResearchFields = {
  "deliveryStatus": z.string().optional(),
  "sourceIds": z.array(z.string()).optional()
};
export const researchDocumentSchema = z.object({id:z.string(),title:z.string(),url:z.string().url(),type:z.string(),sourceId:z.string()}).strict();
