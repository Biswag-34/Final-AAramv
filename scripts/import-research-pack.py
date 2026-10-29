"""Import the supplied October 2026 pack without discarding its research metadata."""
import json
import shutil
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'tmp/updated-json-pack/Aaramv_Updated_JSON_Pack'

def repair(value):
    if isinstance(value, list): return [repair(v) for v in value]
    if isinstance(value, dict): return {k: repair(v) for k, v in value.items()}
    if not isinstance(value, str): return value
    pattern = r'[\u00c2-\u00f4][\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u2026\u2030\u2039\u203a\u20ac\u2122]{1,3}'
    def decode_match(match):
        try: return match[0].encode('cp1252').decode('utf-8')
        except UnicodeError: return match[0]
    for _ in range(3): value = re.sub(pattern, decode_match, value)
    for _ in range(3):
        if not any(c in value for c in ['\u00c2', '\u00c3', '\u00e2\u20ac', '\u00e2\u201a']): break
        try: fixed = value.encode('cp1252').decode('utf-8')
        except (UnicodeError, LookupError): break
        if fixed == value: break
        value = fixed
    return value

records = {}
for name in ['properties', 'localities']:
    records[name] = repair(json.loads((PACK / f'data/{name}.json').read_text(encoding='utf-8')))
    (ROOT / f'data/{name}.json').write_text(json.dumps(records[name], ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
shutil.copytree(PACK / 'public/images', ROOT / 'public/images', dirs_exist_ok=True)
(ROOT / 'data/research').mkdir(exist_ok=True)
for name in ['sources.json', 'coverage.json', 'issues.json', 'missing-exact-plans.json']:
    shutil.copy2(PACK / 'audit' / name, ROOT / 'data/research' / name)

# Generate strict, typed extensions from the supplied field shapes. Existing core
# validators continue to enforce IDs, money, dates, URLs and catalogue relations.
def infer(values):
    nonnull = [v for v in values if v is not None]
    if not nonnull: return 'z.null()'
    types = {type(v) for v in nonnull}
    if len(types) > 1:
        expr = 'z.union(['+', '.join(infer([v for v in nonnull if type(v) is t]) for t in sorted(types, key=str))+'])'
    elif isinstance(nonnull[0], dict):
        keys = sorted({k for v in nonnull for k in v})
        expr = 'z.object({'+', '.join(json.dumps(k)+': '+infer([v[k] for v in nonnull if k in v])+('.optional()' if any(k not in v for v in nonnull) else '') for k in keys)+'}).strict()'
    elif isinstance(nonnull[0], list):
        items = [x for v in nonnull for x in v]
        expr = 'z.array('+ (infer(items) if items else 'z.unknown()') +')'
    elif isinstance(nonnull[0], bool): expr = 'z.boolean()'
    elif isinstance(nonnull[0], (int, float)): expr = 'z.number().finite()'
    else: expr = 'z.string()'
    return expr+'.nullable()' if len(nonnull) < len(values) else expr

ps, ls = records['properties'], records['localities']
core_p = set('schemaVersion id published isDemo name localityId type status developerName phaseName address postalCode description possession searchKeywords coverImageId images coordinates mapUrl primaryConfigurationId configurations icons facts highlights amenities nearbyPlaces documents relatedPropertyIds content faqs sources updatedAt totalUnits'.split())
core_l = set('schemaVersion id published isDemo name city state country zone tagline description tags searchKeywords coverImageId images coordinates mapUrl considerations highlights metrics connectivity nearbyPlaces infrastructure market faqs sources updatedAt'.split())
def extensions(rows, core):
    keys = sorted({k for r in rows for k in r} - core)
    return '{\n'+',\n'.join('  '+json.dumps(k)+': '+ ('z.record(z.string())' if k == 'configurationIdAliases' else infer([r[k] for r in rows if k in r])) + '.optional()' for k in keys)+'\n}'
schema = "// Typed research extensions imported from the supplied 28 October 2026 pack.\nimport {z} from 'zod';\n"
schema += 'export const propertyResearchFields = '+extensions(ps, core_p)+';\n'
schema += 'export const localityResearchFields = '+extensions(ls, core_l)+';\n'
for name, rows, core in [
    ('mediaResearchFields', [i for r in ps+ls for i in r['images']], set('id src alt caption kind credit'.split())),
    ('configurationResearchFields', [c for r in ps for c in r['configurations']], set('id label bedrooms bathrooms areaSqFt areaBasis startingPriceInr priceNote availability floorPlanImageId'.split())),
    ('possessionResearchFields', [r['possession'] for r in ps], {'label','date'}),
    ('amenityResearchFields', [a for r in ps for a in r['amenities']], {'title','description','icon'}),
]: schema += 'export const '+name+' = '+extensions(rows, core)+';\n'
schema += 'export const researchDocumentSchema = z.object({id:z.string(),title:z.string(),url:z.string().url(),type:z.string(),sourceId:z.string()}).strict();\n'
(ROOT / 'lib/research-fields.ts').write_text(schema, encoding='utf-8')
print('Imported', len(ps), 'properties and', len(ls), 'localities; copied source media and generated typed extensions.')
