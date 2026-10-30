'use client';

import {createContext, useContext, type ButtonHTMLAttributes} from 'react';

export type EnquiryDownload = {url:string; filename:string};
export type OpenEnquiry = (context:string, project?:string, download?:EnquiryDownload) => void;
export const EnquiryContext = createContext<OpenEnquiry>(()=>{});

export function EnquiryButton({context,project,download,children,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{context:string;project?:string;download?:EnquiryDownload}) {
  const enquire=useContext(EnquiryContext);
  return <button {...props} type="button" onClick={()=>enquire(context,project,download)}>{children}</button>;
}
