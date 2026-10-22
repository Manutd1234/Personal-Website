# Ian Abiel Wangsa — Personal Portfolio

A Next.js 15 App Router portfolio with Ian’s original green, five-tab layout: Profile, Projects, Experience, Skills and Awards.

Live site: https://manutd1234.github.io/Personal-Website/

## Stack and interactions

- TypeScript, React 19, Tailwind CSS 4, Framer Motion and Lucide icons.
- Original large-name hero, taped real portrait, green navigation and painterly accents.
- Automatic typing and rolling hero roles with reduced-motion support.
- One draggable 3D carousel for all twelve projects, with individual cover colours and typography, spring momentum, keyboard navigation, smooth open/back transitions, a named project picker and direct entry from the Workbench. BrainHack and Hack the Future photos live inside their relevant books; source links and private-access labels remain available.
- An interactive Profile workbench with larger real previews and Problem / Build / Proof walkthroughs for AlphaEngine, BrainHack and RE:DECIDE.
- Experience, Education, Leadership & CCAs and Volunteering as a trading-card showcase: 36 large, light cards with type-coloured foil frames (silver for cards before 2021), the organisation's official logo where one can be shown, one or two boxed highlights, 3D mouse tilt with a holo sheen, and flip-to-read backs that keep every original bullet and add certificate links where they exist. A per-deck `COLLECTED` tally counts cards once they have stayed on screen, and decks browse by swipe, arrows, dots or ← → keys. Highlights condense real résumé bullets; LVL (the start year) and rarity are game flavour.
- A collectible award-card collection with 37 verified records and 25 real award-document or trophy previews. Category/search controls, full-size previews, multi-year documents, project notes and credential-status labels remain available.
- A falling-block skill board with all 79 skills, eight category highlights, search, drag/tap/keyboard sorting, replay and reset. Filters highlight matching blocks without removing the rest. Spoken languages and grouped credentials remain below the board.
- A Profile-only Polaroid photo board with twelve curated personal, learning, food, travel, friends and gym photographs, category filters and full-screen browsing. Pictures cycle every seven seconds in fixed frames while visible and idle; interaction, hidden panels and reduced motion stop the timer. The gym and food selections include copies exported through Photos. All public personal-photo copies have metadata removed; original files remain unchanged.
- Sticky five-tab navigation, clear project actions and filter counts, aligned award categories, copy-email feedback, light/dark themes and visible focus states.

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
content/card-decks.ts Trading-card layer (types, highlights, logos) over the career records
content/build-notes.ts Engineering case-study notes
content/life-photos.ts Selected personal photo gallery
content/paths.ts      Static-hosting asset path helper
public/               Résumé, case study, photos, screenshots, certificates and organisation logos
```

Professional details come from the supplied résumé and LinkedIn material. Repository URLs, original project screenshots, research output and team photographs are retained. Unverified running times, music preferences and personal anecdotes are not invented. Off-duty interactions use Ian’s existing hobbies.
