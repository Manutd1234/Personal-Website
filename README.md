# Ian Abiel Wangsa — Personal Portfolio

A Next.js 15 App Router portfolio with Ian’s original green, five-tab layout: Profile, Projects, Experience, Skills and Awards.

Live site: https://manutd1234.github.io/Personal-Website/

## Stack and interactions

- TypeScript, React 19, Tailwind CSS 4, Framer Motion and Lucide icons.
- Original large-name hero, taped real portrait, green navigation and painterly accents.
- Interactive role roll, bounded Matter.js skill playground, keyboard nudges and reset.
- A draggable 3D bookshelf for five featured projects, with keyboard navigation, animated open/close, engineering notes, authentic media and source links.
- Seven more builds in a filterable card collection with uniform 16:10 previews, equal grid rows and private-access labels.
- An interactive Profile workbench with larger real previews and Problem / Build / Proof walkthroughs for AlphaEngine, BrainHack and RE:DECIDE.
- Original mint-and-cream role browser, tinted education/leadership/volunteering cards and colourful award categories, with all certificate links preserved.
- Searchable skill category pills, spacious toolkit cards, spoken languages and grouped credentials; the physics playground stays available in a disclosure.
- A continuously rolling personal photo gallery with category filters, full-screen browsing and reduced-motion/manual controls. Original drive photos are read-only; the site uses optimized, metadata-free copies.
- Copy-email feedback, light/dark themes, visible focus states and reduced-motion support.

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
content/build-notes.ts Engineering case-study notes
content/life-photos.ts Selected personal photo gallery
content/paths.ts      Static-hosting asset path helper
public/               Résumé, case study, photos, screenshots and certificates
```

Professional details come from the supplied résumé and LinkedIn material. Repository URLs, original project screenshots, research output and team photographs are retained. Unverified running times, music preferences and personal anecdotes are not invented. Off-duty interactions use Ian’s existing hobbies.
