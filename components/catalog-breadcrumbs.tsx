import Link from 'next/link';

export function CatalogBreadcrumbs({ section, name }: { section: 'properties' | 'localities'; name: string }) {
  return <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><ol>
    <li><Link href="/">Home</Link></li>
    <li><Link href={`/${section}`}>{section === 'properties' ? 'Properties' : 'Localities'}</Link></li>
    <li aria-current="page">{name}</li>
  </ol></nav>;
}
