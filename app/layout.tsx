import type { Metadata } from 'next';
import { pageMetadata, SITE_URL, SITE_NAME } from '@/lib/seo';
import {FloatingWhatsapp} from '@/components/floating-whatsapp';
import './globals.css';
import './desktop.css';
import './catalog.css';
import './responsive-shared.css';
import './mobile.css';
import './tablet.css';
import './refinements.css';
import './experience.css';
import './visual-refinements.css';
import './research-details.css';
import './buyer-upgrades.css';
import './iteration-two.css';
import './section-revision.css';
import './enquiry-refresh.css';
import './hero-carousel.css';
import './scroll-comparison.css';
import './company-pages.css';
import './about-handoff.css';
import './compact-screen-fixes.css';
import './property-enquiry-fit.css';
import localFont from 'next/font/local';
const inter=localFont({src:'../public/fonts/InterVariable.woff2',weight:'100 900',style:'normal',display:'swap',variable:'--font-inter',preload:true});
export const metadata: Metadata = {
  ...pageMetadata('/'), metadataBase: new URL(SITE_URL), applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '16x16 32x32 48x48 64x64' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" className={inter.variable}><body>{children}<FloatingWhatsapp/></body></html>}
