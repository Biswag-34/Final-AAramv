import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Site from '../site';
import { pageDetails, pageMetadata, hasPrivateQuery, type SearchParams } from '@/lib/seo';
import { SeoStructuredData } from '@/components/seo-structured-data';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  return pageMetadata('/' + (await params).slug.join('/'), await searchParams);
}

export default async function Page({ params, searchParams }: Props) {
  const path = '/' + (await params).slug.join('/');
  // Keep unknown and unpublished projects as real HTTP 404s.
  if (!pageDetails(path)) notFound();
  return <>{!hasPrivateQuery(path, await searchParams) && <SeoStructuredData path={path}/>}<Site/></>;
}
