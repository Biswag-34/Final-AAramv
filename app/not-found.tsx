import { connection } from 'next/server';
import Site from './site';

// Next.js reserves /404. Reuse the original designed recovery screen there.
export default async function NotFound() {
  await connection();
  return <Site />;
}
