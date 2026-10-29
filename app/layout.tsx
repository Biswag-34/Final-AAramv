import type { Metadata } from 'next';
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
export const metadata:Metadata={metadataBase:new URL('https://www.aaramvreality.com'),title:'Bengaluru Homes and Buyer First Guidance | Aaramv Realty',description:'Compare Bengaluru homes around your budget, everyday routes and priorities. Get a researched shortlist and Aaramv support from first search through move-in.',alternates:{canonical:'/'},robots:{index:false,follow:false},icons:{icon:{url:'/images/aaramv-realty-logo.png',type:'image/png'},apple:'/images/aaramv-realty-logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
