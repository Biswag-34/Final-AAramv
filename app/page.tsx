import Site from './site';
import { SeoStructuredData } from '@/components/seo-structured-data';
export const dynamic='force-dynamic';
export default function Page(){return <><SeoStructuredData path="/"/><Site/></>}
