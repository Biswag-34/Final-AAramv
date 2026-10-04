import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const projectsDir = path.join(root, '.codex/uploaded-projects/projects');
const outDir = path.join(root, 'data');

const nameByLocality = {
  bagalur: 'Bagalur',
  'ivc-road-devanahalli': 'IVC Road, Devanahalli',
  'kiadb-aerospace-park': 'KIADB Aerospace Park',
  thanisandra: 'Thanisandra',
  devanahalli: 'Devanahalli',
  chikkagubbi: 'Chikkagubbi',
  jakkur: 'Jakkur',
  'hennur-road': 'Hennur Road',
  rachenahalli: 'Rachenahalli',
  vidyaranyapura: 'Vidyaranyapura',
  'thanisandra-kannur': 'Thanisandra-Kannur',
  sadahalli: 'Sadahalli',
  'kannamangala-devanahalli': 'Kannamangala, Devanahalli',
  kogilu: 'Kogilu',
  bellahalli: 'Bellahalli',
  'manyata-tech-park': 'Manyata Tech Park',
  'devanahalli-boodihal': 'Devanahalli-Boodihal',
};

const zoneByLocality = {
  devanahalli: 'Airport Corridor',
  'ivc-road-devanahalli': 'Airport Corridor',
  sadahalli: 'Airport Corridor',
  'kannamangala-devanahalli': 'Airport Corridor',
  'devanahalli-boodihal': 'Airport Corridor',
  bagalur: 'North Bengaluru',
  'kiadb-aerospace-park': 'North Bengaluru',
  thanisandra: 'North Bengaluru',
  chikkagubbi: 'North Bengaluru',
  jakkur: 'North Bengaluru',
  'hennur-road': 'North Bengaluru',
  rachenahalli: 'North Bengaluru',
  vidyaranyapura: 'North Bengaluru',
  'thanisandra-kannur': 'North Bengaluru',
  kogilu: 'North Bengaluru',
  bellahalli: 'North Bengaluru',
  'manyata-tech-park': 'North Bengaluru',
};

const dateOnly = value => typeof value === 'string' && value.length >= 10 ? value.slice(0, 10) : null;
const coordinates = value => {
  if (!value) return null;
  if (Number.isFinite(value.latitude) && Number.isFinite(value.longitude)) return value;
  if (Number.isFinite(value.lat) && Number.isFinite(value.lng)) return { latitude: value.lat, longitude: value.lng };
  return null;
};
const unique = values => [...new Set(values.filter(Boolean))];
const plural = (count, one, many = `${one}s`) => count === 1 ? one : many;
const titleCase = value => String(value || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, char => char.toUpperCase());
const monthYear = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};
const stripDisplayText = value => String(value || '')
  .replace(/\s+/g, ' ')
  .replace(/\b(?:Homz N Space|Housing\.com|Housiey|99acres|MagicBricks|NoBroker|SquareYards)\b/gi, '')
  .replace(/\b(?:channel[- ]partner|portal|source|sources|published|advertised|retrieval|dated)\b/gi, '')
  .replace(/\b(?:reported|marked|marks|listed|states|mentions|cited|review|reviews|correction needed|review needed)\b/gi, '')
  .replace(/\b(?:verify|verified|verification|reconfirm|reconfirmation|confirm|confirmation|authenticated|independently)\b/gi, '')
  .replace(/\b(?:indicative|not live offers?|not a developer quote|not interchangeable|not actual|representative|illustrative)\b/gi, '')
  .replace(/\b(?:requires?|must be|need(?:s|ed)?|should be)\s+(?:a\s+)?(?:fresh\s+)?(?:quotation|check(?:ed)?|review(?:ed)?|confirmation|clarification)\b/gi, '')
  .replace(/\b(?:may be an artist.?s impression|dimensions and revisions|road distance will be longer|listing age approximately [^.]+)\b/gi, '')
  .replace(/\s*;\s*/g, '. ')
  .replace(/\s*,\s*,/g, ',')
  .replace(/\s+\./g, '.')
  .replace(/\.\s*\./g, '.')
  .replace(/\s+,/g, ',')
  .replace(/^\W+|\W+$/g, '')
  .trim();
const cleanSentence = (value, fallback = '') => {
  const cleaned = stripDisplayText(value);
  return cleaned && cleaned.length > 10 ? cleaned : fallback;
};
const imageCaption = (project, image) => {
  const kind = image.kind === 'floor-plan' ? 'floor plan' : image.kind === 'master-plan' ? 'master plan' : image.kind === 'map' ? 'location map' : image.kind === 'construction' ? 'construction update' : image.kind;
  const fromAlt = stripDisplayText(String(image.alt || '').replace(project.name, '').replace(/[—-]/g, ' '));
  return `${project.name} ${fromAlt || titleCase(kind)}`.replace(/\s+/g, ' ').trim();
};
const amenityDescription = title => {
  const lower = String(title || '').toLowerCase();
  if (lower.includes('pool')) return 'A dedicated swimming zone for leisure and fitness.';
  if (lower.includes('gym') || lower.includes('fitness')) return 'A fitness space planned for everyday workouts.';
  if (lower.includes('club')) return 'A clubhouse setting for community and indoor recreation.';
  if (lower.includes('garden') || lower.includes('park') || lower.includes('landscape')) return 'Green open spaces woven into the community plan.';
  if (lower.includes('child') || lower.includes('play')) return 'A play area designed for younger residents.';
  if (lower.includes('sport') || lower.includes('court') || lower.includes('tennis') || lower.includes('basket')) return 'Outdoor sport facilities for active routines.';
  if (lower.includes('track') || lower.includes('jog')) return 'Walking and jogging spaces for daily movement.';
  return `${title} available within the community amenities.`;
};
const placeDescription = place => {
  const distance = Number.isFinite(place.distanceKm) ? `${place.distanceKm} km` : '';
  const time = Number.isFinite(place.travelMinutes) ? `${place.travelMinutes} min` : '';
  const detail = [distance, time].filter(Boolean).join(' / ');
  const category = place.category ? place.category.toLowerCase() : 'destination';
  return detail ? `${place.name} is a nearby ${category} (${detail}).` : `${place.name} is a nearby ${category}.`;
};
const cleanTitle = value => titleCase(stripDisplayText(value)).replace(/\bBy\b/g, 'by').replace(/\bAnd\b/g, 'and');
const cleanDisplayValue = value => {
  if (typeof value !== 'string') return value;
  const cleaned = stripDisplayText(value)
    .replace(/\btied to different layout sizes\b/gi, 'Across available layout sizes')
    .replace(/\bdeveloper[- ]?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || value;
};
const documentValue = document => {
  const label = cleanTitle(document.label);
  if (/rera/i.test(label) || /^PRM\//i.test(document.value)) return cleanDisplayValue(document.value);
  if (/brochure/i.test(label)) return 'Brochure';
  if (/price/i.test(label)) return 'Price sheet';
  if (/plan/i.test(label)) return 'Plan kit';
  if (/payment/i.test(label)) return 'Payment schedule';
  return label || 'Document';
};
const possessionLabel = project => {
  if (project.status === 'Ready to move') return 'Ready to move';
  const date = project.possession?.date ? monthYear(project.possession.date) : null;
  if (date) return `${project.status} - ${date}`;
  return project.status;
};
const configurationLabel = configuration => cleanSentence(configuration.label, configuration.label);
const cleanProject = project => {
  const configurations = project.configurations.map(configuration => ({
    ...configuration,
    label: configurationLabel(configuration),
    priceNote: '',
  }));
  const primaryConfigurationId = configurations.some(configuration => configuration.id === project.primaryConfigurationId)
    ? project.primaryConfigurationId
    : configurations[0].id;
  const typeLabel = project.type === 'Plot' ? 'residential plots' : project.type.toLowerCase();
  const possession = { label: possessionLabel(project), date: dateOnly(project.possession?.date) };
  const overview = cleanSentence(
    project.description,
    `${project.name} by ${project.developerName || 'the developer'} offers ${typeLabel} in ${project.address || 'Bengaluru'}. The project brings together practical home choices, planned amenities and access to key city conveniences.`
  );
  const highlights = project.highlights.map(item => ({
    ...item,
    title: cleanTitle(item.title),
    description: cleanSentence(item.description, item.description),
  })).filter(item => item.title && item.description);
  const amenities = project.amenities.map(item => ({
    ...item,
    title: cleanTitle(item.title),
    description: amenityDescription(item.title),
  }));
  const nearbyPlaces = project.nearbyPlaces.map(place => ({
    ...place,
    description: placeDescription(place),
  }));
  const documents = project.documents.map(document => ({
    ...document,
    label: cleanTitle(document.label).replace(/^Rera Id/i, 'RERA ID') || document.label.replace(/^Published\s+/i, ''),
    value: documentValue(document),
    url: null,
  }));
  const configSummary = unique(configurations.map(configuration => configuration.label)).slice(0, 6).join(', ');
  const faqConfig = project.type === 'Plot' ? 'What plot sizes are available?' : 'What configurations are available?';
  return {
    ...project,
    published: true,
    coordinates: coordinates(project.coordinates),
    updatedAt: dateOnly(project.updatedAt),
    images: project.images.map(image => ({
      ...image,
      alt: cleanSentence(image.alt, `${project.name} ${titleCase(image.kind)}`),
      caption: imageCaption(project, image),
      credit: '',
    })),
    possession,
    description: overview,
    primaryConfigurationId,
    configurations,
    facts: project.facts.map(fact => ({
      ...fact,
      label: cleanTitle(fact.label) || fact.label,
      value: cleanDisplayValue(fact.value),
    })),
    highlights,
    amenities,
    nearbyPlaces,
    documents,
    content: {
      overviewTitle: `About ${project.name}`,
      layoutsTitle: project.type === 'Plot' ? 'Plot Sizes' : 'Homes and Floor Plans',
      layoutsNote: '',
      amenitiesTitle: 'Amenities',
      amenitiesNote: '',
      locationTitle: 'Location',
      locationDescription: `${project.name} is located in ${project.address || project.localityId}, with access to nearby workplaces, schools, retail and daily conveniences.`,
      documentsTitle: 'Project Documents',
      documentsDescription: '',
      faqsTitle: 'Questions',
    },
    faqs: [
      { question: faqConfig, answer: configSummary || 'Configuration details are available in the floor plan table.' },
      { question: 'What is the project status?', answer: possession.label },
      { question: 'Where is the project located?', answer: project.address || `${nameByLocality[project.localityId] ?? titleCase(project.localityId)}, Bengaluru` },
      { question: 'Who is the developer?', answer: project.developerName || 'Developer details are available on request.' },
    ],
    sources: [],
  };
};

const files = (await readdir(projectsDir)).filter(file => file.endsWith('.json')).sort();
const rawProjects = await Promise.all(files.map(async file => JSON.parse(await readFile(path.join(projectsDir, file), 'utf8'))));
const properties = rawProjects.map(cleanProject);

const localityIds = unique(properties.map(project => project.localityId));
const localities = localityIds.map(localityId => {
  const projects = properties.filter(project => project.localityId === localityId);
  const first = projects[0];
  const name = nameByLocality[localityId] ?? localityId.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
  const zone = zoneByLocality[localityId] ?? 'Bengaluru';
  const cover = first.images.find(image => image.id === first.coverImageId) ?? first.images[0];
  const types = unique(projects.map(project => project.type));
  const projectNames = projects.map(project => project.name);
  const nearby = unique(projects.flatMap(project => project.nearbyPlaces.map(place => place.name))).slice(0, 4);
  return {
    schemaVersion: 2,
    id: localityId,
    published: true,
    isDemo: false,
    name,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    zone,
    tagline: `${projects.length} ${plural(projects.length, 'residential option')} in ${zone}`,
    description: `${name} brings together ${types.join(', ').toLowerCase()} options across ${projectNames.join(', ')}. The locality works well for buyers comparing North Bengaluru connectivity, community amenities and long-term residential convenience.`,
    tags: unique([zone, ...types, ...projects.map(project => project.developerName).slice(0, 2)]).slice(0, 5),
    searchKeywords: unique([name, localityId, zone, ...types, ...nearby]),
    coverImageId: 'cover',
    images: [
      {
        id: 'cover',
        src: cover.src,
        alt: `${name} residential locality visual`,
        caption: `${name} residential locality`,
        kind: 'locality',
        credit: '',
      },
    ],
    coordinates: null,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, Bengaluru, Karnataka`)}`,
    considerations: [
      `${name} offers access to residential communities, city conveniences and key movement corridors in ${zone}.`,
    ],
    highlights: [
      { icon: 'Building2', title: `${projects.length} ${plural(projects.length, 'listed project')}`, description: projectNames.join(' | ') },
      { icon: 'House', title: 'Home types', description: types.join(' | ') },
      { icon: 'MapPin', title: 'Micro-market', description: zone },
      { icon: 'Compass', title: 'AaramV shortlist', description: 'Curated projects with layouts, prices, amenities and location context in one place.' },
    ],
    metrics: [
      { label: 'Listed projects', value: projects.length, unit: '', icon: 'Building2', asOf: '2026-10-02', note: '' },
      { label: 'Property types', value: types.join(', '), unit: '', icon: 'House', asOf: '2026-10-02', note: '' },
    ],
    connectivity: nearby.map(place => ({
      name: place,
      category: 'Nearby destination',
      icon: 'MapPin',
      description: `${place} is a useful landmark for comparing homes around ${name}.`,
      distanceKm: null,
      travelMinutes: null,
      travelMode: null,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, Bengaluru`)}`,
    })),
    nearbyPlaces: [],
    infrastructure: [],
    market: null,
    faqs: [
      {
        question: `Which projects are listed in ${name}?`,
        answer: projectNames.join(', '),
      },
      {
        question: `How should I compare homes in ${name}?`,
        answer: 'Compare configurations, starting prices, possession status, amenities, location context and developer profile across the project pages.',
      },
    ],
    sources: [],
    updatedAt: '2026-10-02',
  };
});

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'properties.json'), `${JSON.stringify(properties, null, 2)}\n`);
await writeFile(path.join(outDir, 'localities.json'), `${JSON.stringify(localities, null, 2)}\n`);
console.log(`Imported ${properties.length} properties and ${localities.length} localities.`);
