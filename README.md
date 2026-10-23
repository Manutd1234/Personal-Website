# Ian Abiel Wangsa — Personal Portfolio

A Next.js 15 App Router portfolio with Ian’s original green, five-tab layout: Profile, Projects, Experience, Skills and Awards.

Live site: https://manutd1234.github.io/Personal-Website/

## Stack and interactions

- TypeScript, React 19, Tailwind CSS 4, Framer Motion and Lucide icons. Self-hosted Fraunces headings and italic accents pair with DM Sans body text; both font families are distributed with their SIL Open Font Licences in `app/fonts/`.
- Original large-name hero, taped real portrait, green navigation and painterly accents, with irregular brush underlines, paper borders and restrained hover details.
- Typewriter hero phrases spanning engineering, NUS, sport, service and travel, with reduced-motion support. The wordmark shows Ian’s name without a job-title subtitle.
- One draggable 3D carousel for all twelve projects, with solid six-face page blocks, varied binding thickness, textured hardcovers, lined paper edges and cloth headbands, individual cover colours and typography, spring momentum, keyboard navigation and direct project entry. Hovering a book gently opens its cover and fans three layered paper leaves; clicking opens a full spread beside the project details. Cover screenshots share a consistent 16:9 mat and placement. Every cover has relevant project imagery; PneuRelief uses a labelled implementation diagram. BrainHack and Hack the Future photos live inside their relevant books; source links and private-access labels remain available. The extra project heading and dropdown have been removed.
- An animated Profile notebook showing a technical build process: Define, Model, Build, Verify and Refine, with invariants, typed contracts, vertical slices, regression checks and baseline-driven iteration. Each step has its own engineering sketch, a real work example, direct selection and keyboard navigation; autoplay advances every four seconds. Playback pauses when hidden or offscreen, supports manual pause and respects reduced motion.
- Experience, Education, Leadership & CCAs and Volunteering as 36 interactive field-note cards: real date stamps, organisation logos where available, boxed résumé highlights, gentle 3D tilt and stories preserving every original contribution. Click either face to turn a card; nested links, text selection, dragging and keyboard buttons remain independent. Summaries and contributions all use bullets. Each deck rolls continuously at 24 pixels per second with an invisible loop seam, and pauses for hover, reading, focus or manual browsing. Motion stops offscreen, in inactive tabs, in hidden documents and for reduced motion. Swipes, arrows, dots, keyboard navigation and exploration progress remain available.
- A realistic tablet home screen with all 37 award and credential records presented as framed photo and certificate app icons, with provider or subject fallbacks where personal evidence is unavailable. A graphite bezel, camera, glass wallpaper and functional category dock frame the scrollable app grid; each icon opens its existing evidence in one click. Missing scans use clearly labelled representative issuer or subject emblems. IPPT Gold and Marksmanship use credited representative cloth patch photographs beside cropped personal award evidence. Category/search controls, full-size previews, multi-year documents, project associations and credential-status labels remain available.
- A Matter.js paper worktable with all 79 skills drawn as tickets, tags, scraps and soft ovals. Small staggered releases, varied materials, gentle gravity and low-bounce collisions support rotation, dragging and smoothed flinging. The drop replays each time the Skills tab opens. Eight category highlights and search light up matching pills without removing the rest. Keyboard controls, a full text list, replay and tidy arrangement remain available. Physics stops while hidden or offscreen; reduced motion uses static pills. Spoken languages and eleven grouped credentials remain below the board, including seven named DataCamp completion-record previews with direct verification links and Cisco branding with its expired status preserved.
- Experience and Skills keep their core browsing interfaces without the additional student-team and toolkit project-preview sections. Skills retain direct keyboard access to the pills without a picker row.
- A Profile-only rotating portrait frame with 51 real photographs: nine travel, fourteen people, eleven food, eight learning and nine fitness images. The category icon and caption change with each image every 3.8 seconds; each filter shows one portrait without photo counts or a side control panel. Filters, shuffle, pause, swipe, keyboard navigation and a full-size lightbox remain available; autoplay pauses offscreen, during keyboard focus, when a photo is open and for reduced motion. The selection includes scenery-only Grindelwald, original army and BrainHack groups, two friend-group originals selected by Ian, original Australia steak and gym photographs, and fifteen food, family, church, friend-group and outdoor photographs supplied directly by Ian. Additional originals from My Passport cover school projects, classmates, volunteering and London; native Photos provides full-size London, Munich, Singapore and Jakarta fitness images. Public copies are optimized and stripped of metadata; source photos remain unchanged. The crowd parade photograph was removed at Ian’s request. Source provenance stays private.
- A green mint-paper contact panel with oversized italic typography, a rolling invitation, prominent email action, two-second copy feedback and the original professional links. The invitation pauses offscreen and respects reduced motion.
- Sticky five-tab navigation, clear project actions and filter counts, light/dark themes and visible focus states.

## Content hierarchy

Each tab has one main heading. The Profile introduces Ian without repeating the detailed work history; a five-step animated notebook explains how he builds. Books show highlights, links and screenshots first, with their longer challenge/build/proof narratives under **Design notes**. Skills keep one short interaction hint and expandable keyboard guidance. Experience cards retain all contributions without repeated footer labels, and Awards use one results count. Contact keeps the rolling invitation, email/copy actions and professional links. All 12 projects, 36 experience/community records, 37 awards and credentials, 79 skills and 51 photographs remain available.

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
