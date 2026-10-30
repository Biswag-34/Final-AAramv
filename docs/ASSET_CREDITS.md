# Image resources and credits

All images are included in `public/images/`. The website loads these local files, not remote image URLs. The original JSON manifest is preserved unchanged; its `file` values record historical download paths. Use the portable paths below.

| Local file | Photographer | Source |
| --- | --- | --- |
| `public/images/apartment-green.jpg` | Aalo Lens | [Photo source](https://unsplash.com/photos/modern-apartment-building-with-balconies-and-greenery-otrBpvmVmNk) |
| `public/images/apartment-balconies.jpg` | George Pagan III | [Photo source](https://unsplash.com/photos/modern-apartment-building-with-balconies-against-sky-6uUniqSXoPU) |
| `public/images/villa.jpg` | John Fornander | [Photo source](https://unsplash.com/photos/modern-white-villa-with-swimming-pool-Id7u0EkTjBE) |
| `public/images/living-room.jpg` | ASR Design Studio | [Photo source](https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-kitchen-B22qL4LX4_8) |
| `public/images/bengaluru-skyline.jpg` | Umang S | [Photo source](https://unsplash.com/photos/aerial-view-of-city-under-cloudy-sky-during-daytime-4zOV4Qn2Jp0) |
| `public/images/cubbon-park.jpg` | Mohnish Landge | [Photo source](https://unsplash.com/photos/a-park-filled-with-lots-of-trees-and-green-grass-PfV40sukkN8) |
| `public/images/indiranagar.jpg` | Priyansh Patidar | [Photo source](https://unsplash.com/photos/aerial-view-of-a-bustling-city-intersection-at-night-8L8FTArJk44) |

The source manifest identifies the [Unsplash License](https://unsplash.com/license) for these images and records their illustrative or location-specific usage. Property photographs are illustrative; they do not establish that a depicted building is an actual Aaramv listing.

Brand assets remain in the existing brand component and public images. Interface icons: `lucide-react`. Interface type uses the self-hosted [Inter variable font](https://rsms.me/inter/) at `public/fonts/InterVariable.woff2`, with its SIL Open Font License in `public/fonts/Inter-LICENSE.txt`. Arial/Helvetica provide fallbacks; Georgia supplies the marketing emphasis. Third-party package notices are supplied with their installed npm packages.


## Responsive hero backgrounds

`public/images/hero/bengaluru-{desktop,tablet,mobile}.webp` and `north-bengaluru-{desktop,tablet,mobile}.webp` were supplied in the user’s `AARAMV-HERO-IMAGE-PACK.zip`. The PNG masters remain in the local pack; the site uses WebP derivatives at the original pixel dimensions, encoded at quality 88. Browser picture sources select desktop at 1024px, tablet at 768px and portrait below 768px.

The Bengaluru scene is an architectural illustration. The North Bengaluru images are AI-assisted editorial collages based on the supplied pack’s listed marketing references: Prestige Finsbury Park, Brigade El Dorado and Purva Atmosphere. They represent separate projects, rather than a literal shared location or construction record. The North Bengaluru slide is captioned “Illustrative project collage.” The existing buyer/advisor hero remains the first slide.


## About and Localities page imagery

The user supplied four PNGs for these pages. Production WebP derivatives retain the original pixel dimensions and are encoded at quality 90. Source PNGs remain outside the repository in Downloads.

| Page | Desktop image (1024px and above) | Tablet/mobile image (below 1024px) |
| --- | --- | --- |
| About | `public/images/company/about-office-desktop.webp` — “Aaramv Reality Office Planning Session-1.png”, 1774 × 887 | `public/images/company/about-office-compact.webp` — “Aaramv Reality team reviewing floor plans-2.png”, 1448 × 1086 |
| Localities | `public/images/localities-hero/lakeside-desktop.webp` — “Leafy Bengaluru lakeside neighborhood-4.png”, 1774 × 887 | `public/images/localities-hero/lakeside-compact.webp` — “Bengaluru Lakefront Morning-3.png”, 1619 × 971 |

The images are user-supplied illustrative scenes. They do not establish an office address, staff identity, or a particular listed development’s location. Native aspect ratios keep faces, signage and neighbourhood features visible.
