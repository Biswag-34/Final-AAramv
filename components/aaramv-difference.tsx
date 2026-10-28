'use client';

import {useId} from 'react';
import Link from 'next/link';
import styles from './aaramv-difference.module.css';

function ArtworkIcon({kind}:{kind:'person'|'search'|'document'|'home'|'arrow'}) {
  return <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind==='person'&&<><circle cx="18" cy="10" r="6"/><path d="M7 32v-4c0-10 22-10 22 0v4"/></>}
    {kind==='search'&&<><circle cx="15" cy="15" r="10.5"/><path d="m23 23 9 9"/></>}
    {kind==='document'&&<><path d="M8 3h15l7 7v23H8zM23 3v8h7M13 17h11M13 23h11M13 28h7"/></>}
    {kind==='home'&&<><path d="m3 16 15-13 15 13M8 13v19h7V21h7v11h6V13"/></>}
    {kind==='arrow'&&<path d="M8 28 28 8M9 8h19v19"/>}
  </svg>;
}

function Documents() {
  const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  const papers=[{first:'Your',second:'needs',kind:'person' as const,from:'#fffefa',to:'#f4f2ec'}, {first:'Our',second:'research',kind:'search' as const,from:'#f0f9f3',to:'#dceee6'}, {first:'Your',second:'shortlist',kind:'home' as const,from:'#e4f6ed',to:'#c7e9dc'}];
  return <div className={styles.documentsArt}>
    <svg className={styles.mobilePaperLine} viewBox="0 0 350 187" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><path d="M-20 128C8 128 14 103 45 103H306C330 103 346 122 370 128" stroke="#0a8774" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>
    <ol className={styles.documents} aria-label="From your needs to your shortlist">{papers.map((paper,index)=><li className={`${styles.paper} ${styles[`paper${index}`]}`} key={paper.second}>
      <svg className={styles.paperShape} viewBox="0 0 145 190" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><linearGradient id={`${id}-paper-${index}`} x1="0" y1="0" x2="100%" y2="100%"><stop stopColor={paper.from}/><stop offset="1" stopColor={paper.to}/></linearGradient><filter id={`${id}-shadow-${index}`} x="-40%" y="-25%" width="180%" height="180%"><feDropShadow dx="0" dy="11" stdDeviation="11" floodColor="#143b34" floodOpacity=".14"/></filter></defs><path d="M12 0H120L145 25V178Q145 190 133 190H12Q0 190 0 178V12Q0 0 12 0Z" fill={`url(#${id}-paper-${index})`} filter={`url(#${id}-shadow-${index})`}/><path d="M120 0v20q0 5 5 5h20Z" fill="#a9d5c7" opacity={index===2?'.58':'.32'}/></svg>
      <span className={styles.paperIcon}><ArtworkIcon kind={paper.kind}/></span>
      <p className={styles.paperLabel}><span>{paper.first}</span>{' '}<span>{paper.second}</span></p>
      <div className={`${styles.paperLines} ${index===2?styles.checklist:''}`} aria-hidden="true"><span/><span/><span/></div>
    </li>)}</ol>
  </div>;
}

function Journey() {
  return <div className={styles.journey}>
    <svg className={styles.journeyLine} viewBox="0 0 600 254" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><path d="M100 143H392Q458 143 500 133" stroke="#0b8c76" strokeWidth="2.4" vectorEffect="non-scaling-stroke"/></svg>
    <ol className={styles.stages} aria-label="Support from your first search to move-in">
      <li className={styles.stage}><span className={styles.stageIcon}><ArtworkIcon kind="search"/></span><span className={styles.searchMarker} aria-hidden="true"/><span className={styles.stageLabel}>Search</span></li>
      <li className={styles.stage}><span className={styles.stageIcon}><ArtworkIcon kind="document"/></span><span className={styles.bookingMarker} aria-hidden="true"/><span className={styles.stageLabel}>Booking</span><span className={styles.annotation}>Still with you</span></li>
      <li className={`${styles.stage} ${styles.moveIn}`}><span className={styles.endpoint}><span className={styles.homeDisk}><ArtworkIcon kind="home"/></span><svg className={styles.sparks} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false"><path d="m70 12 1-12M83 23l12-11M89 40l11-1" stroke="#099b83" strokeWidth="2" strokeLinecap="round"/></svg></span><span className={styles.stageLabel}>Move-in</span></li>
    </ol>
  </div>;
}

export function AaramvDifference({onEnquire}:{onEnquire?:()=>void}) {
  const headingId=useId();
  const actionContents=<>Tell us what you need <ArtworkIcon kind="arrow"/></>;
  return <section className={styles.section} data-aaramv-difference aria-labelledby={headingId}>
    <div className={styles.wrap}>
      <header className={styles.heading}><p className={styles.eyebrow}>THE AARAMV DIFFERENCE</p><h2 className={styles.headline} id={headingId}><span>We start with your needs.</span><em>We stay till you move in.</em></h2></header>
      <div className={styles.body}>
        <svg className={styles.mintShape} viewBox="0 0 900 320" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M180 0C104 0 94 40 86 94C74 181 47 238 0 260C78 284 89 320 188 320H900V0Z" fill="#e7f3eb"/></svg>
        <svg className={styles.connector} viewBox="0 0 1280 254" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><path d="M-35 174C5 174 0 128 45 128H450C520 128 526 192 587 172S653 143 691 143H745" stroke="#0a8774" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>
        <div className={styles.research}><div className={styles.researchText}><h3 className={styles.featureTitle}>A shortlist built around you.</h3><p className={styles.featureBody}>Your needs guide our research and property recommendations.</p></div><Documents/></div>
        <div className={styles.support}><div className={styles.supportText}><h3 className={styles.featureTitle}><span>Booking is a milestone.</span>{' '}<span>Not our finish line.</span></h3><p className={styles.featureBody}>We stay alongside you from your first search to move-in.</p></div><Journey/></div>
      </div>
      {onEnquire?<button type="button" className={styles.cta} onClick={onEnquire}>{actionContents}</button>:<Link href="/contact" className={styles.cta}>{actionContents}</Link>}
    </div>
  </section>;
}
