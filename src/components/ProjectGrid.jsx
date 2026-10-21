import { useEffect, useId, useRef, useState } from 'react';
import * as portfolio from '../data/portfolio.js';
import { projectMedia } from '../data/media.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';
import '../project-media.css';
import BookCarousel from './BookCarousel.jsx';

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

function ProjectDetail({ project }) {
  const media = projectMedia[project.title];
  return <>
    <p className="book-detail-category">{project.category}</p>
    <h3>{project.title}</h3>
    <p className="book-detail-description">{project.description}</p>
    {project.outcome ? <p className="book-detail-outcome">{project.outcome}</p> : null}
    <ul className="book-detail-tags">{project.tags?.map(tag => <li key={tag}>{tag}</li>)}</ul>
    <ProjectLinks project={project} />
    {media ? <MediaFigure className="book-source-image" media={media} title={project.title} /> : null}
  </>;
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
  const collectionRefs = useRef([]);
  const collectionId = useId();
  const archive = Array.isArray(portfolio.projectArchive) ? portfolio.projectArchive : [];
  const selectedTitles = new Set(portfolio.projects.map((project) => project.title));
  const extraProjects = archive.filter((project) => !selectedTitles.has(project.title));
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

  return (
    <section aria-labelledby="builds-title" className="content-section section-shell projects-section" id="builds">
      <div className="section-heading">
        <div><h2 id="builds-title">Selected <em>projects.</em></h2></div>
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
        <BookCarousel active={collection === 'featured'} projects={portfolio.projects} media={projectMedia} renderDetails={project => <ProjectDetail project={project} />} />
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
