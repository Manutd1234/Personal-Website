# Ian Abiel Wangsa — Personal Portfolio

A responsive field-journal portfolio for Ian Abiel Wangsa, built around selected work in quantitative systems,
applied AI, and full-stack engineering.

## What is included

- An original hero and section design inspired by tactile game interfaces and engineering field notes.
- Verified project summaries for AlphaEngine, BrainHack TIL-AI, and Delta1 research.
- Complete experience, education, leadership, skills, and certification sections sourced from the supplied résumé.
- Direct links to Ian's GitHub, LinkedIn, email, live AlphaEngine workspace, and downloadable résumé.
- Responsive desktop and mobile layouts with keyboard-accessible tabs, visible focus states, and reduced-motion support.
- Optimized WebP photographs and a relative Vite asset base suitable for repository-hosted deployments.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Production check

```bash
npm run check
npm run preview
```

`npm run check` creates the optimized production bundle in `dist/`. The preview command serves that exact bundle
for a final browser review.

## Project structure

```text
public/                 Static résumé, favicon, and optimized photographs
src/components/         Accessible page sections and reusable icons
src/data/portfolio.js   Portfolio content kept separate from presentation
src/App.jsx             Page composition
src/styles.css          Responsive visual system
```

## Content notes

Professional details were assembled from Ian's supplied résumé and the LinkedIn profile URL provided for this
project. Repository links and project descriptions were checked against Ian's public GitHub projects. The original
photographs remain outside the repository; only web-optimized derivatives are committed.
