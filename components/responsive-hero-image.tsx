const images={
  about:{directory:'company',desktop:'about-office-desktop.webp',compact:'about-office-compact.webp',width:1448,height:1086,alt:'Homebuyers and an advisor reviewing floor plans together in an Aaramv-branded office.'},
  localities:{directory:'localities-hero',desktop:'lakeside-desktop.webp',compact:'lakeside-compact.webp',width:1619,height:971,alt:'A leafy Bengaluru lakeside neighbourhood with homes, walking paths and a tree-lined road.'},
};

export function ResponsiveHeroImage({page}:{page:keyof typeof images}){
  const image=images[page];
  return <picture className={`company-hero-picture company-hero-picture-${page}`} data-page-image={page}>
    <source media="(min-width: 1024px)" srcSet={`/images/${image.directory}/${image.desktop}`}/>
    <img src={`/images/${image.directory}/${image.compact}`} alt={image.alt} width={image.width} height={image.height} fetchPriority="high" decoding="async"/>
  </picture>;
}
