# Ian Abiel Wangsa — Personal Portfolio

A Next.js 15 App Router portfolio with Ian’s original green, five-tab layout: Profile, Projects, Experience, Skills and Awards.

Live site: https://manutd1234.github.io/Personal-Website/

## Stack and interactions

- TypeScript, React 19, Tailwind CSS 4, Framer Motion and Lucide icons. Self-hosted Fraunces headings and italic accents pair with DM Sans body text; both font families are distributed with their SIL Open Font Licences in `app/fonts/`.
- Original large-name hero, taped real portrait, green navigation and painterly accents, with irregular brush underlines, paper borders and restrained hover details.
- Automatic typing and rolling hero roles with reduced-motion support.
- One draggable 3D carousel for all twelve projects, with solid six-face page blocks, varied binding thickness, textured hardcovers, lined paper edges and cloth headbands, individual cover colours and typography, spring momentum, keyboard navigation and direct entry from the Workbench. Selecting a book enlarges it, opens its cover and fans layered paper leaves beside the project details. Every cover has relevant project imagery; PneuRelief uses a labelled implementation diagram. BrainHack and Hack the Future photos live inside their relevant books; source links and private-access labels remain available. The extra project heading and dropdown have been removed.
- An interactive Profile workbench with larger real previews and Problem / Build / Proof walkthroughs for AlphaEngine, BrainHack and RE:DECIDE.
- Experience, Education, Leadership & CCAs and Volunteering as 36 interactive field-note cards: real date stamps, organisation logos where available, boxed résumé highlights, gentle 3D tilt and stories preserving every original contribution. Click either face to turn a card; nested links, text selection, dragging and keyboard buttons remain independent. Summaries and contributions all use bullets. Each deck rolls continuously at 24 pixels per second with an invisible loop seam, and pauses for hover, reading, focus or manual browsing. Motion stops offscreen, in inactive tabs, in hidden documents and for reduced motion. Swipes, arrows, dots, keyboard navigation and exploration progress remain available.
- A realistic tablet home screen with all 37 award and credential records available as app icons, supported by 37 award-document, completion-record, medal, photo or patch previews. A graphite bezel, camera, glass wallpaper and functional category dock frame the scrollable app grid; each icon opens its existing evidence in one click. Missing scans use clearly labelled representative issuer or subject emblems. IPPT Gold and Marksmanship use credited representative cloth patch photographs beside cropped personal award evidence. Category/search controls, full-size previews, multi-year documents, project associations and credential-status labels remain available.
- A Matter.js playground with all 79 skill pills, irregular releases into clear entry gaps, gentle gravity and low-bounce collisions, rotation, dragging and smoothed flinging. The drop replays each time the Skills tab opens. Eight category highlights and search light up matching pills without removing the rest. Keyboard controls, a full text list, replay and tidy arrangement remain available. Physics stops while hidden or offscreen; reduced motion uses static pills. Spoken languages and eleven grouped credentials remain below the board, including seven named DataCamp completion-record previews with direct verification links and Cisco branding with its expired status preserved.
- Experience and Skills keep their core browsing interfaces without the additional student-team and toolkit project-preview sections. Skills retain direct keyboard access to the pills without a picker row.
- A Profile-only Polaroid photo board with 20 real photographs: four travel, five people, four food, four learning and three gym images. The selection uses clean photographs rather than Instagram Story frames, including scenery-only Grindelwald, original army graduation groups and a BrainHack team photo. Consistent square mats and restrained tilts keep rows tidy, while the lightbox preserves the complete frame. Category filters, drag/reorder, shuffle, full-screen browsing and idle autoplay remain available. Public copies are optimized and stripped of metadata; source photos remain unchanged, with no generated face details.
- A green mint-paper contact panel with oversized italic typography, a rolling invitation, prominent email action, two-second copy feedback and the original professional links. The invitation pauses offscreen and respects reduced motion.
- Sticky five-tab navigation, clear project actions and filter counts, light/dark themes and visible focus states.

## Content hierarchy

Each tab has one main heading. The Profile introduces Ian without repeating the detailed work history; the Workbench keeps its three interactive walkthroughs. Books show highlights, links and screenshots first, with their longer challenge/build/proof narratives under **Design notes**. Skills keep one short interaction hint and expandable keyboard guidance. Experience cards retain all contributions without repeated footer labels, and Awards use one results count. Contact keeps the rolling invitation, email/copy actions and professional links. All 12 projects, 36 experience/community records, 37 awards and credentials, 79 skills and 20 photographs remain available.

## Run locally

```sh
npm ci
npm run dev
```

The development site serves at http://127.0.0.1:3000. The scripts call Node entrypoints directly because this checkout’s parent path contains a colon.

## Production checks

```sh
npm run typecheck
NEXT_PUBLIC_BASE_PATH=/Personal-Website npm run build
```

The production static export is generated in `out/`. GitHub Actions builds with `/Personal-Website` as the base path and deploys `out/` to the existing GitHub Pages site. Images are pre-optimized WebP assets, with explicit dimensions or reserved aspect ratios. There are no runtime server or external API requirements.

For a standalone root-hosted preview, run `npm run build` without the base-path variable, then `npm run preview` and open http://127.0.0.1:8766.

## Source

```text
app/                  App Router entry, layout, metadata and global styling
components/           Interactive TypeScript sections and shared controls
content/portfolio.ts  Verified career, project, skill and award records
content/media.ts      Authentic screenshots, photos and certificate catalogue
content/card-decks.ts Experience card types, factual highlights and organisation logos
content/credential-providers.ts Official credential-provider logo catalogue
content/build-notes.ts Engineering case-study notes
content/life-photos.ts Selected personal photo gallery
content/paths.ts      Static-hosting asset path helper
public/               Résumé, case study, photos, screenshots, certificates and organisation logos
```

Professional details come from the supplied résumé and LinkedIn material. Repository URLs, original project screenshots, research output and team photographs are retained. Unverified running times, music preferences and personal anecdotes are not invented. Off-duty interactions use Ian’s existing hobbies.

## Image sources

Project imagery comes from saved development screenshots, research charts, competition demos and the supplied case study. Personal medal photographs and cropped service transcript excerpts support the corresponding award records; identification numbers are omitted. Source originals remain unchanged.

The Stealth Startup logo is the public mark on the [LinkedIn listing associated with Ian’s experience](https://www.linkedin.com/company/stealth-startup-community/); the operating company remains private. The Eunoia Junior College wordmark comes from [the official college website](https://www.eunoiajc.moe.edu.sg/), and the NUSSU mark from [NUSSU](https://nussu.net/). The SST Football badge, EJC Softball badge and EJC team photo were supplied by Ian. The softball badge received a clarity enhancement with the built-in image tool. The team photo uses a lossless WebP copy with identical RGB pixels and dimensions to the supplied original; no generated face detail is used.

Representative No.4 patch photographs are credited in their award details: [IPPT Gold](https://g-military.com/products/ippt-gold-no-4-badge) and [Marksmanship](https://g-military.com/products/marksmanship-army-no-4-badge), photographed by G Military. They are distinguished from Ian’s own award photographs and transcript evidence.

The Anthropic wordmark comes from its official homepage and the Databricks logo from its official brand kit; both are used in Skills and the awards provider previews. Cisco branding comes from the [official Brand Center](https://www.cisco.com/c/en/us/about/brand-center.html), and the DataCamp logomark from [DataCamp Waffles](https://waffles.datacamp.com/components/brand/?tab=logos). DataCamp completion links were recovered from Ian’s LinkedIn credentials and verified on the issuer’s public pages. Their previews show the named public completion records, not certificate scans; each entry links back to its official verification page. Cisco’s expired credential and the DataCamp AWS course are labelled accurately.
