# Ian Abiel Wangsa — Personal Portfolio

A Next.js 15 App Router portfolio with Ian’s original green, five-tab layout: Profile, Projects, Experience, Skills and Awards.

Live site: https://manutd1234.github.io/Personal-Website/

## Stack and interactions

- TypeScript, React 19, Tailwind CSS 4, Framer Motion and Lucide icons.
- Original large-name hero, taped real portrait, green navigation and painterly accents.
- Automatic typing and rolling hero roles with reduced-motion support.
- One draggable 3D carousel for all twelve projects, with solid six-face page blocks, individual cover colours and typography, spring momentum, keyboard navigation and direct entry from the Workbench. Selecting a book enlarges it, opens its cover and turns a printed paper leaf beside the project details. Every cover has relevant project imagery; PneuRelief uses a labelled implementation diagram. BrainHack and Hack the Future photos live inside their relevant books; source links and private-access labels remain available. The extra project heading and dropdown have been removed.
- An interactive Profile workbench with larger real previews and Problem / Build / Proof walkthroughs for AlphaEngine, BrainHack and RE:DECIDE.
- Experience, Education, Leadership & CCAs and Volunteering as 36 interactive field-note cards: real date stamps, organisation logos where available, boxed résumé highlights, gentle 3D tilt and flip-to-read stories preserving every original contribution. Summaries and contributions all use bullets. Each deck rolls continuously at 24 pixels per second with an invisible loop seam, and pauses for hover, reading, focus or manual browsing. Motion stops offscreen, in inactive tabs, in hidden documents and for reduced motion. Swipes, arrows, dots, keyboard navigation and exploration progress remain available.
- A trophy cabinet with all 37 award and credential records on display by default, supported by 37 award-document, completion-record, medal, photo or patch previews. Framed certificates, medals and patches sit on responsive shelves; each opens its existing evidence in one click. Missing scans use clearly labelled representative issuer or subject emblems. IPPT Gold and Marksmanship use credited representative cloth patch photographs beside cropped personal award evidence. Category/search controls, full-size previews, multi-year documents, project associations and credential-status labels remain available.
- A Matter.js playground with all 79 skill pills, slower staggered drops, rotation, collisions, dragging and flinging. The drop replays each time the Skills tab opens. Eight category highlights and search light up matching pills without removing the rest. Keyboard controls, a full text list, replay and tidy arrangement remain available. Physics stops while hidden or offscreen; reduced motion uses static pills. Spoken languages and eleven grouped credentials remain below the board, including seven named DataCamp completion-record previews with direct verification links and Cisco branding with its expired status preserved.
- Experience and Skills keep their core browsing interfaces without the additional student-team and toolkit project-preview sections. Skills retain direct keyboard access to the pills without a picker row.
- A Profile-only Polaroid photo board with 24 real photographs: seven travel, five people, six food, three learning and three gym images. New selections include Grindelwald mountains, Lake Lungern, steak, pasta, a shared lunch in Medan and nostalgic group photos, alongside Ian’s all-guys group and BrainHack team. Smaller filtered groups fill the board, and people photos preserve the whole frame. Category filters and full-screen browsing remain available. Pictures cycle every seven seconds in fixed frames while visible and idle; interaction, hidden panels and reduced motion stop the timer. Public copies are optimized and stripped of metadata; Photos and backup originals remain unchanged.
- A green mint-paper contact panel with oversized italic typography, a rolling invitation, prominent email action, two-second copy feedback and the original professional links. The invitation pauses offscreen and respects reduced motion.
- Sticky five-tab navigation, clear project actions and filter counts, light/dark themes and visible focus states.

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

The Eunoia Junior College wordmark comes from [the official college website](https://www.eunoiajc.moe.edu.sg/), and the NUSSU mark from [NUSSU](https://nussu.net/). The SST Football badge, EJC Softball badge and EJC team photo were supplied by Ian. The softball badge received a clarity enhancement with the built-in image tool. The team photo uses a lossless WebP copy with identical RGB pixels and dimensions to the supplied original; no generated face detail is used.

Representative No.4 patch photographs are credited in their award details: [IPPT Gold](https://g-military.com/products/ippt-gold-no-4-badge) and [Marksmanship](https://g-military.com/products/marksmanship-army-no-4-badge), photographed by G Military. They are distinguished from Ian’s own award photographs and transcript evidence.

Cisco branding comes from the [official Brand Center](https://www.cisco.com/c/en/us/about/brand-center.html), and the DataCamp logomark from [DataCamp Waffles](https://waffles.datacamp.com/components/brand/?tab=logos). DataCamp completion links were recovered from Ian’s LinkedIn credentials and verified on the issuer’s public pages. Their previews show the named public completion records, not certificate scans; each entry links back to its official verification page. Cisco’s expired credential and the DataCamp AWS course are labelled accurately.
