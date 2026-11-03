import { connection } from 'next/server';
import Site from './site';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata('/404');

// Next.js reserves /404. Reuse the original designed recovery screen there.
export default async function NotFound() {
  await connection();
  return <Site />;
}
