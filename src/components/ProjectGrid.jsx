import { useEffect, useId, useRef, useState } from 'react';
import * as portfolio from '../data/portfolio.js';
import { projectMedia } from '../data/media.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';
import '../project-media.css';

function imageUrl(src) {
  if (/^(?:https?:|data:|blob:)/i.test(src)) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '').replace(/^public\//, '')}`;
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

// Native modal dialogs contain focus and make the background inert.
export function MediaFigure({ media, title, className = '', priority = false, onImageError, onSwipe }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);
  const titleId = useId();
  const captionId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const closeOnNavigation = () => setOpen(false);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    window.addEventListener('hashchange', closeOnNavigation);
    return () => {
      window.removeEventListener('hashchange', closeOnNavigation);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!media?.src || failed) return null;
  const src = imageUrl(media.src);
  const isPhoto = /photo|team|event/i.test(media.kind || '');
  function closeDialog() { setOpen(false); }

  return (
    <figure className={`portfolio-media${isPhoto ? ' portfolio-media-photo' : ''} ${className}`}>
      <button
        aria-haspopup="dialog"
        aria-label={`Enlarge image: ${title}`}
        className="portfolio-media-trigger"
        onClick={() => {
          if (suppressClickRef.current) { suppressClickRef.current = false; return; }
          setOpen(true);
        }}
        onPointerDown={onSwipe ? (event) => {
          if (!event.isPrimary || event.button !== 0) return;
          suppressClickRef.current = false;
          gestureRef.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        } : undefined}
        onPointerUp={onSwipe ? (event) => {
          const start = gestureRef.current;
          gestureRef.current = null;
          if (!start) return;
          const distance = event.clientX - start.x;
          if (Math.abs(distance) < 50 || Math.abs(distance) < Math.abs(event.clientY - start.y) * 1.2) return;
          suppressClickRef.current = true;
          onSwipe(distance < 0 ? 1 : -1);
        } : undefined}
        onPointerCancel={() => { gestureRef.current = null; }}
        ref={triggerRef}
        type="button"
      >
        <img
          alt={media.alt || title}
          decoding="async"
          draggable={onSwipe ? false : undefined}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => { setFailed(true); onImageError?.(); }}
          src={src}
        />
        <span className="portfolio-media-expand"><ExpandIcon /> View image</span>
      </button>
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
      <dialog
        aria-describedby={media.caption ? captionId : undefined}
        aria-labelledby={titleId}
        className="portfolio-lightbox"
        onCancel={(event) => { event.preventDefault(); closeDialog(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}
        onClose={closeDialog}
        ref={dialogRef}
      >
        <div className="portfolio-lightbox-panel">
          <div className="portfolio-lightbox-toolbar">
            <h2 id={titleId}>{title}</h2>
            <button aria-label="Close enlarged image" autoFocus className="portfolio-lightbox-close" onClick={closeDialog} type="button">
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          {open ? <img alt={media.alt || title} className="portfolio-lightbox-image" src={src} /> : null}
          <div className="portfolio-lightbox-footer">
            {media.caption ? <p id={captionId}>{media.caption}</p> : <span />}
            <a href={src} rel="noreferrer" target="_blank">Open original <ArrowUpRightIcon size={15} /></a>
          </div>
        </div>
      </dialog>
    </figure>
  );
}

function isCodeSource(source) {
  return /^https?:\/\/github\.com\/[^/]+\/[^/#?]+/i.test(source.url) && !/\.pdf(?:$|[?#])/i.test(source.url);
}

function ProjectSourceLink({ source, project }) {
  const repository = source.url.match(/^https?:\/\/github\.com\/([^/]+\/[^/#?]+)/i)?.[1]?.replace(/\.git$/, '');
  const isCode = isCodeSource(source);
  const label = isCode ? 'View code' : source.label || 'Project details';
  const isPrivate = source.visibility === 'private';
  return (
    <div className="project-link-record">
      <a aria-label={`${label}${repository ? `, ${repository}` : ''}: ${project.title}${isCode && source.label ? ` — ${source.label}` : ''}${isPrivate ? ' (private repository, access required)' : ''}`} href={source.url} rel="noreferrer" target="_blank">
        <span className="project-link-label">{repository ? <GitHubIcon size={16} /> : null}{label} <ArrowUpRightIcon size={15} /></span>
        {isCode && source.label ? <span className="project-repository-context">{source.label.replace(/\s*\(private\)/i, '')}</span> : null}
        {repository ? <span className="project-repository-name">{repository}</span> : null}
      </a>
      {isPrivate ? <span className="project-private-note">Private · access required</span> : null}
    </div>
  );
}

function ProjectLinks({ project }) {
  const candidates = [
    ...(project.repository ? [{ url: project.repository, label: project.repositoryLabel, visibility: project.repositoryVisibility }] : []),
    ...(project.repositories || []),
  ];
  const seen = new Set();
  const sources = candidates.filter((source) => {
    if (!source.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
  if (!sources.length && !project.live) return null;
  const [primarySource, ...additionalSources] = sources;
  const additionalLabel = additionalSources.every(isCodeSource)
    ? additionalSources.length === 1 ? 'repository' : 'repositories'
    : additionalSources.length === 1 ? 'source' : 'sources';

  return (
    <div className="project-links">
      {primarySource ? <ProjectSourceLink project={project} source={primarySource} /> : null}
      {project.live ? (
        <div className="project-link-record">
          <a aria-label={`View live project: ${project.title}`} href={project.live} rel="noreferrer" target="_blank">
            <span className="project-link-label">Live project <ArrowUpRightIcon size={15} /></span>
          </a>
        </div>
      ) : null}
      {additionalSources.length ? (
        <details className="project-source-disclosure">
          <summary>{additionalSources.length} more {additionalLabel}</summary>
          <div className="project-extra-links">
            {additionalSources.map((source) => <ProjectSourceLink key={source.url} project={project} source={source} />)}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function ProjectDetail({ project, id, titleId, position, total, direction, onSwipe, onPreview }) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const media = mediaFailed ? null : projectMedia[project.title];
  const adjacentProjects = total > 1 ? [-1, 1].map((step) => ({ step, project: portfolio.projects[(position - 1 + step + total) % total] })) : [];

  return (
    <article aria-label={`${position} of ${total}`} aria-roledescription="slide" className={`portfolio-project-detail${media ? '' : ' portfolio-project-without-media'}`} data-direction={direction} id={id} role="group">
      {media ? (
        <div className="portfolio-project-deck">
          {adjacentProjects.map(({ step, project: adjacent }) => projectMedia[adjacent.title]?.src ? (
            <button aria-label={`${step < 0 ? 'Previous' : 'Next'} project: ${adjacent.title}`} className={`portfolio-deck-preview portfolio-deck-preview-${step < 0 ? 'previous' : 'next'}`} key={step} onClick={() => onPreview(step)} type="button">
              <img alt="" decoding="async" draggable="false" loading="lazy" src={imageUrl(projectMedia[adjacent.title].src)} />
            </button>
          ) : null)}
          <div className="project-dossier">
            <div aria-hidden="true" className="project-dossier-label"><span>{String(position).padStart(2, '0')}</span><span>{media.kind}</span></div>
            <MediaFigure className="portfolio-project-preview" media={media} onImageError={() => setMediaFailed(true)} onSwipe={onSwipe} priority title={project.title} />
          </div>
        </div>
      ) : null}
      <div className="portfolio-project-detail-copy">
        <header className="portfolio-project-detail-heading">
          {project.category ? <p>{project.category}</p> : null}
          <h3 id={titleId}>{project.title}</h3>
        </header>
        <p className="project-description">{project.description}</p>
        {project.outcome ? <p className="portfolio-project-outcome">{project.outcome}</p> : null}
        {project.tags?.length ? (
          <ul aria-label={`${project.title} technologies`} className="portfolio-project-stack">
            {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        ) : null}
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}

function ProjectArchiveRow({ project }) {
  return (
    <article className="portfolio-more-project">
      <header>
        {project.category ? <p className="portfolio-project-category">{project.category}</p> : null}
        <h3>{project.title}</h3>
      </header>
      <p>{project.description || project.note}</p>
      {project.outcome ? <p>{project.outcome}</p> : null}
      {project.tags?.length ? <p className="portfolio-more-stack">{project.tags.join(' · ')}</p> : null}
      <ProjectLinks project={project} />
    </article>
  );
}

export default function ProjectGrid() {
  const [collection, setCollection] = useState('featured');
  const [selectedTitle, setSelectedTitle] = useState(() => portfolio.projects.find((project) => project.title === 'AlphaEngine')?.title || portfolio.projects[0]?.title);
  const [direction, setDirection] = useState('next');
  const collectionRefs = useRef([]);
  const projectRefs = useRef([]);
  const arrowRefs = useRef([]);
  const collectionId = useId();
  const archive = Array.isArray(portfolio.projectArchive) ? portfolio.projectArchive : [];
  const selectedTitles = new Set(portfolio.projects.map((project) => project.title));
  const extraProjects = archive.filter((project) => !selectedTitles.has(project.title));
  const selectedProject = portfolio.projects.find((project) => project.title === selectedTitle) || portfolio.projects[0];
  const selectedIndex = portfolio.projects.indexOf(selectedProject);
  const detailId = `${collectionId}-detail`;
  const detailTitleId = `${collectionId}-detail-title`;
  const pickerId = `${collectionId}-picker`;
  const instructionsId = `${collectionId}-instructions`;
  const collections = [
    { id: 'featured', label: 'Featured', count: portfolio.projects.length },
    { id: 'more', label: 'More projects', count: extraProjects.length },
  ];

  function navigateCollections(event, index) {
    const lastIndex = collections.length - 1;
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % collections.length
      : event.key === 'ArrowLeft' ? (index + lastIndex) % collections.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? lastIndex
            : null;
    if (nextIndex === null) return;
    event.preventDefault();
    setCollection(collections[nextIndex].id);
    collectionRefs.current[nextIndex]?.focus();
  }

  function selectProject(index, nextDirection) {
    if (index === selectedIndex || !portfolio.projects[index]) return;
    setDirection(nextDirection || (index > selectedIndex ? 'next' : 'previous'));
    setSelectedTitle(portfolio.projects[index].title);
  }

  function moveProject(step) {
    selectProject((selectedIndex + step + portfolio.projects.length) % portfolio.projects.length, step > 0 ? 'next' : 'previous');
  }

  function navigateProjects(event) {
    if (event.target.closest('input, select, textarea, summary, dialog, [contenteditable="true"]')) return;
    const lastIndex = portfolio.projects.length - 1;
    const nextIndex = event.key === 'ArrowRight' ? (selectedIndex + 1) % portfolio.projects.length
      : event.key === 'ArrowLeft' ? (selectedIndex + lastIndex) % portfolio.projects.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? lastIndex : null;
    if (nextIndex === null) return;
    event.preventDefault();
    selectProject(nextIndex, event.key === 'ArrowLeft' ? 'previous' : event.key === 'ArrowRight' ? 'next' : undefined);
    if (event.target.closest('.portfolio-project-choice')) projectRefs.current[nextIndex]?.focus();
    else if (event.target.closest('.portfolio-project-detail')) arrowRefs.current[event.key === 'ArrowLeft' || event.key === 'Home' ? 0 : 1]?.focus({ preventScroll: true });
  }

  return (
    <section aria-labelledby="builds-title" className="content-section section-shell projects-section" id="builds">
      <div className="section-heading">
        <div><h2 id="builds-title">Selected projects</h2></div>
        <div className="section-intro">
          <p>Research tools, competition builds and other things I’ve worked on.</p>
          <a className="text-link" href={portfolio.profile.github} rel="noreferrer" target="_blank">GitHub <ArrowUpRightIcon size={16} /></a>
        </div>
      </div>
      <div aria-label="Project collections" className="portfolio-project-browse" role="tablist">
        {collections.map((item, index) => (
          <button
            aria-controls={`${collectionId}-${item.id}-panel`}
            aria-selected={collection === item.id}
            id={`${collectionId}-${item.id}-tab`}
            key={item.id}
            onClick={() => setCollection(item.id)}
            onKeyDown={(event) => navigateCollections(event, index)}
            ref={(element) => { collectionRefs.current[index] = element; }}
            role="tab"
            tabIndex={collection === item.id ? 0 : -1}
            type="button"
          >
            {item.label}<span>{item.count}</span>
          </button>
        ))}
      </div>
      <div aria-labelledby={`${collectionId}-featured-tab`} className="portfolio-project-panel" hidden={collection !== 'featured'} id={`${collectionId}-featured-panel`} role="tabpanel" tabIndex={0}>
        {selectedProject ? (
          <div aria-describedby={instructionsId} aria-label="Featured projects" aria-roledescription="carousel" className="portfolio-project-carousel" onKeyDown={navigateProjects} role="region">
            <p className="portfolio-project-status" id={instructionsId}>Use the previous and next buttons or left and right arrow keys to browse. Swipe the image to change projects, or click it to enlarge.</p>
            <div className="portfolio-carousel-controls">
              <p aria-hidden="true" className="portfolio-carousel-count">{String(selectedIndex + 1).padStart(2, '0')}<span>/ {String(portfolio.projects.length).padStart(2, '0')}</span></p>
              <div className="portfolio-carousel-arrows">
                <button aria-controls={detailId} aria-label="Previous project" disabled={portfolio.projects.length < 2} onClick={() => moveProject(-1)} ref={(element) => { arrowRefs.current[0] = element; }} type="button"><span aria-hidden="true">←</span></button>
                <button aria-controls={detailId} aria-label="Next project" disabled={portfolio.projects.length < 2} onClick={() => moveProject(1)} ref={(element) => { arrowRefs.current[1] = element; }} type="button"><span aria-hidden="true">→</span></button>
              </div>
            </div>
            <div className="portfolio-project-mobile-picker">
              <label htmlFor={pickerId}>Featured project</label>
              <select id={pickerId} onChange={(event) => selectProject(portfolio.projects.findIndex((project) => project.title === event.target.value))} value={selectedProject.title}>
                {portfolio.projects.map((project) => <option key={project.title} value={project.title}>{project.title}</option>)}
              </select>
            </div>
            <div className="portfolio-project-stage">
              <p className="portfolio-project-status" role="status">Project {selectedIndex + 1} of {portfolio.projects.length}: {selectedProject.title}</p>
              <ProjectDetail direction={direction} id={detailId} key={selectedProject.title} onPreview={(step) => { moveProject(step); arrowRefs.current[step < 0 ? 0 : 1]?.focus({ preventScroll: true }); }} onSwipe={moveProject} position={selectedIndex + 1} project={selectedProject} titleId={detailTitleId} total={portfolio.projects.length} />
            </div>
            <div aria-label="Choose a featured project" className="portfolio-project-selector" role="group">
              {portfolio.projects.map((project, index) => (
                <button aria-controls={detailId} aria-pressed={selectedProject.title === project.title} className="portfolio-project-choice" key={project.title} onClick={() => selectProject(index)} ref={(element) => { projectRefs.current[index] = element; }} type="button">
                  <span aria-hidden="true" className="portfolio-project-choice-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="portfolio-project-choice-title">{project.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : <p className="portfolio-project-empty">No featured projects to show yet.</p>}
      </div>
      <div aria-labelledby={`${collectionId}-more-tab`} className="portfolio-project-panel" hidden={collection !== 'more'} id={`${collectionId}-more-panel`} role="tabpanel" tabIndex={0}>
        <div className="portfolio-more-projects">
          {extraProjects.map((project) => <ProjectArchiveRow key={project.title} project={project} />)}
        </div>
        {extraProjects.length === 0 ? <p className="portfolio-project-empty">No additional projects to show yet.</p> : null}
      </div>
    </section>
  );
}
