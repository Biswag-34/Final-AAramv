import type { Metadata } from 'next';
import './globals.css';
import './desktop.css';
import './catalog.css';
import './responsive-shared.css';
import './mobile.css';
import './tablet.css';
import './refinements.css';
import './experience.css';
export const metadata:Metadata={title:'Aaramv Realty — Find your place in Bengaluru',description:'An interactive design concept for Aaramv Realty. Explore homes, neighbourhoods and a guided property buying journey.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
