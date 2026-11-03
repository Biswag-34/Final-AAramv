import type { PropertyRecord } from '@/lib/catalog-schema';
import { recordDate } from '@/lib/catalog';

export function CatalogEvidence({ record }: { record: Pick<PropertyRecord, 'sources' | 'updatedAt'> }) {
  const sources = record.sources.filter(source => source.url && new URL(source.url).hostname !== 'www.aaramvreality.com');
  return <section className="catalog-evidence" aria-label="Sources and catalogue notes">
    <h2>Sources &amp; catalogue notes</h2>
    <p>Published by <a href="/about">Aaramv Realty</a>{record.updatedAt && <> · Catalogue record updated <time dateTime={record.updatedAt}>{recordDate(record.updatedAt)}</time></>}.</p>
    <p>Source material supports this catalogue record. Confirm current availability, unit pricing and phase details with the developer before making a decision.</p>
    {sources.length > 0 && <details><summary>View source references</summary><ul>{sources.map((source, index) => <li key={`${source.url}-${index}`}>
      <a href={source.url!} target="_blank" rel="noopener noreferrer">{source.label} · {new URL(source.url!).hostname.replace(/^www\./, '')}</a>
      {source.checkedAt && <span> — source checked <time dateTime={source.checkedAt}>{recordDate(source.checkedAt)}</time></span>}
    </li>)}</ul></details>}
  </section>;
}
