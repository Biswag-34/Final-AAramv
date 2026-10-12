import Link from 'next/link';

export function Brand({className = 'brand'}: {className?: string}) {
  return <Link href="/" className={`${className} brand-logo`} aria-label="Aaramv Realty home">
    <img src="/images/aaramv-realty-logo.png" alt="Aaramv Realty" width={2172} height={724}/>
  </Link>;
}
