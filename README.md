# Ian Abiel Wangsa — Personal Portfolio

A Next.js 15 App Router portfolio with Ian’s original green, five-tab layout: Profile, Projects, Experience, Skills and Awards.

Live site: https://manutd1234.github.io/Personal-Website/

## Stack and interactions

- TypeScript, React 19, Tailwind CSS 4, Framer Motion and Lucide icons. Self-hosted Fraunces headings and italic accents pair with DM Sans body text; both font families are distributed with their SIL Open Font Licences in `app/fonts/`.
- Original large-name hero, taped real portrait, green navigation and painterly accents, with irregular brush underlines, paper borders and restrained hover details.
- Typewriter hero phrases spanning engineering, NUS, sport, service and travel, with reduced-motion support. The wordmark shows Ian’s name without a job-title subtitle.
- One draggable 3D carousel for all twelve projects, with solid six-face page blocks, textured hardcovers, lined paper edges, individual cover colours and typography, spring momentum and keyboard navigation. Hovering opens a cover and flips preview leaves; clicking completes the cover animation before entering the book reader. Desktop shows two-page spreads; mobile shows one page with swipe navigation. Queued turns, a contents menu, chapter jumps and stable closing transitions support browsing. Every book opens with a plain-language summary, intended audience, problem and individual contribution, followed by expanded feature, implementation and results chapters. Each bullet connects a concrete capability or engineering choice to its practical purpose. Short, word-budgeted pages keep the detail readable alongside imagery and sources. Team contributions, simulated research and private repositories are identified. The separate 360° inspection mode has been removed. Cover screenshots share a consistent 16:9 mat; PneuRelief uses a labelled implementation diagram, and BrainHack and Hack the Future team photos appear inside their books.
- An original animated SVG builder character presents five automatic technical chapters: Frame, Stack, Architect, Code, and Test & ship. First-person reasoning covers problem statements, stack tradeoffs, service boundaries, vertical slices, tests, CI and deployment verification. Fraunces headings and DM Sans labels match the rest of the site. Persistent scene layers crossfade without shifting the layout, with staged block placement, typing and launch motion. Scenes change every six seconds without timer bars or clickable stages. Playback pauses when hidden or offscreen, supports a global pause, and shows all five readable chapters with reduced motion.
- Experience, Education, Leadership & CCAs and Volunteering as 36 interactive field-note cards: real date stamps, organisation logos where available, boxed résumé highlights, gentle 3D tilt and stories preserving every original contribution. Click either face to turn a card; nested links, text selection, dragging and keyboard buttons remain independent. Summaries and contributions all use bullets. Each deck rolls continuously at 24 pixels per second with an invisible loop seam, and pauses for hover, reading, focus or manual browsing. Motion stops offscreen, in inactive tabs, in hidden documents and for reduced motion. Swipes, arrows, dots, keyboard navigation and exploration progress remain available.
- A realistic tablet home screen with all 37 award and credential records presented as framed photographic and issuer-artwork app icons, with provider or subject fillers where personal evidence is unavailable. User-selected event and organisation branding identifies the award apps; supporting personal/event photos, trophy/patch photos and full certificates stay inside the details. A graphite bezel, camera, glass wallpaper and functional category dock frame the scrollable app grid; each icon opens its existing evidence in one click. Missing scans use clearly labelled representative issuer or subject emblems. IPPT Gold and Marksmanship use credited representative cloth patch photographs beside cropped personal award evidence. Category/search controls, full-size previews, multi-year documents, project associations and credential-status labels remain available.
- A Matter.js paper worktable with all 123 skills in small, medium and large self-hosted DM Sans labels, capsule, rounded-card, tag and lozenge shapes, and category colours. The frame is 500px tall on desktop and 420px on mobile; compact spacing removes the label dots, and internal scrolling keeps every label reachable when needed. Font-aware measurements fix the label width before measuring its wrapped height, keeping words centered inside their shapes. Gentle gravity, limited tilts and measured label bounds keep the text readable while allowing dragging and smoothed flinging. The drop replays each time the Skills tab opens. Nine category highlights and search light up matches without removing the rest. The visible keyboard-help and full-list panels are removed; direct keyboard interaction, screen-reader guidance, replay and tidy arrangement remain. The catalogue includes the technical résumé and complete live LinkedIn Skills listing. Physics stops while hidden or offscreen; reduced motion uses static pills. Eleven grouped credentials sit below the board, followed by spoken languages with Bahasa Indonesia marked Fluent, including seven named DataCamp completion-record previews with direct verification links and Cisco branding with its expired status preserved.
- Experience and Skills keep their core browsing interfaces without the additional student-team and toolkit project-preview sections. Skills retain direct keyboard access to the pills without a picker row.
- A Profile-only rotating portrait frame with 56 real photographs: fourteen travel, fourteen people, eleven food, eight learning and nine fitness images. The category icon and caption change with each image every 3.8 seconds; each filter shows one portrait without photo counts or a side control panel. Filters, shuffle, pause, swipe, keyboard navigation and a full-size lightbox remain available; autoplay pauses offscreen, during keyboard focus, when a photo is open and for reduced motion. The selection includes scenery-only Grindelwald, original army and BrainHack groups, two friend-group originals selected by Ian, original Australia steak and gym photographs, and fifteen food, family, church, friend-group and outdoor photographs supplied directly by Ian. Additional originals from My Passport cover school projects, classmates, volunteering and London; native Photos provides full-size London, Munich, Singapore and Jakarta fitness images. Public copies are optimized and stripped of metadata; source photos remain unchanged. Thirty-one photos have been re-exported directly from larger originals at up to 2400 pixels, with responsive display copies; no generated detail or face retouching is used. The crowd parade photograph and the BHID afternoon photo were removed from the gallery at Ian’s request; the latter remains attached to its award evidence. The dusk field and heritage street were replaced with Australian stars and the Colosseum; the latest additions include Venice, the Mona Lisa, Old Trafford, the Louvre, an Indonesian mountain and a family outing in Indonesia. These eight supplied photos use lossless full-size copies with their original framing. Source provenance stays private.
- A green mint-paper contact panel with oversized italic typography, a rolling invitation, prominent email action, two-second copy feedback and the original professional links. The invitation pauses offscreen and respects reduced motion.
- Sticky five-tab navigation, clear project actions and filter counts, light/dark themes and visible focus states.

## Content hierarchy

Each tab has one main heading. The Profile introduces Ian without repeating the detailed work history; five automatic cartoon chapters explain how he builds. Project books explain who each build helps, what problem it addresses and Ian’s contribution before presenting features, engineering detail, results, imagery and sources. Technical terms are explained in context for readers from different backgrounds. Skills keep one short interaction hint. Each of the 36 Experience, Education, Leadership & CCAs and Volunteering cards has five explicit skills learned: role-specific technical and professional skills, educational fundamentals, or relevant community and teamwork skills. Work cards identify concrete technical tools and methods. Leadership/CCA cards separate technical or practical skills from soft skills, retaining exactly five skills per card. Awards use one results count. Contact keeps the rolling invitation, email/copy actions and professional links. All 12 projects, 36 experience/community records, 37 awards and credentials, 123 skills and 56 photographs remain available.

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
content/build-notes.ts Evidence captions and fallback engineering notes
content/project-stories*.ts Expanded, audience-aware project-book chapters
content/life-photos.ts Selected personal photo gallery
content/paths.ts      Static-hosting asset path helper
public/               Résumé, case study, photos, screenshots, certificates and organisation logos
```

Professional details come from the supplied résumé and LinkedIn material. Repository URLs, original project screenshots, research output and team photographs are retained. Unverified running times, music preferences and personal anecdotes are not invented. Off-duty interactions use Ian’s existing hobbies.

## Image sources

Project imagery comes from saved development screenshots, research charts, competition demos and the supplied case study. Personal medal photographs and cropped service transcript excerpts support the corresponding award records; identification numbers are omitted. Source originals remain unchanged.

The Stealth Startup logo is the public mark on the [LinkedIn listing associated with Ian’s experience](https://www.linkedin.com/company/stealth-startup-community/); the operating company remains private. The Eunoia Junior College wordmark comes from [the official college website](https://www.eunoiajc.moe.edu.sg/), and the NUSSU mark from [NUSSU](https://nussu.net/). SST and Bukit Timah Primary School logos are refreshed from official school originals. RunNUS uses its transparent logo without a dark backing, and the SST Football badge has a larger display size. The SST Football badge, EJC Softball badge and EJC team photo were supplied by Ian. The softball badge received a clarity enhancement with the built-in image tool. The team photo uses a lossless WebP copy with identical RGB pixels and dimensions to the supplied original; no generated face detail is used.

Representative No.4 patch photographs are credited in their award details: [IPPT Gold](https://g-military.com/products/ippt-gold-no-4-badge) and [Marksmanship](https://g-military.com/products/marksmanship-army-no-4-badge), photographed by G Military. They are distinguished from Ian’s own award photographs and transcript evidence.

The SunnyHacks representative emblem uses the [official February 2026 event](https://sunnyhacks-feb-2026.devpost.com/)'s original 1024 × 1024 artwork, replacing the enlarged 100 × 100 thumbnail. The detail view uses the lossless original-size WebP. The award app now uses Ian’s supplied Devpost wordmark, shared with The Merge Hackathon. No generated detail is added.

The Anthropic wordmark comes from its official homepage and the Databricks logo from its official brand kit; both are used in Skills and the awards provider previews. Cisco branding comes from the [official Brand Center](https://www.cisco.com/c/en/us/about/brand-center.html), and the DataCamp logomark from [DataCamp Waffles](https://waffles.datacamp.com/components/brand/?tab=logos). DataCamp completion links were recovered from Ian’s LinkedIn credentials and verified on the issuer’s public pages. Their previews show the named public completion records, not certificate scans; each entry links back to its official verification page. Cisco’s expired credential and the DataCamp AWS course are labelled accurately.

The award apps use Ian’s supplied BügleRock wordmark and Today I Learned–AI badge. Hack the Future displays only the branding area of the original poster through a CSS crop; the registration section and QR code are outside the icon. National School Games and the SSSC Colours Award share Ian’s supplied Singapore Schools Sports Council crest. Both Innofest awards use his supplied Innofest logo. Project BHID uses the NUS Community Service Club heart, and National Service · Outstanding Performance & Conduct uses the Singapore Army logo. These app icons are independent of the supporting photos and certificate records in each detail view.

The CDF National Education award app uses a 160 Squadron crest restored from Ian’s supplied image with the built-in image tool (1254 × 1254 master, 256-pixel icon). The lettering remains “160 SQUADRON” and “ALERT ALWAYS”; fine outlines and leaves are reconstructed, so this is a restored representative emblem rather than an official high-resolution source. The original award photo remains in its detail view.
