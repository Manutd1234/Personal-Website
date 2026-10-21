import { useEffect, useId, useRef, useState } from 'react';
import * as portfolio from '../data/portfolio.js';
import { projectMedia } from '../data/media.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';
import SectionKicker from './SectionKicker.jsx';
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
export function MediaFigure({ media, title, className = '', priority = false, onImageError }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const captionId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
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
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <img
          alt={media.alt || title}
          decoding="async"
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

function ProjectLinks({ project }) {
  if (!project.repository && !project.live) return null;
  return (
    <div className="project-links">
      {project.repository ? (
        <a aria-label={`${project.repositoryLabel || 'Repository'}: ${project.title}`} href={project.repository} rel="noreferrer" target="_blank">
          {project.repositoryLabel ? null : <GitHubIcon size={17} />}
          {project.repositoryLabel || 'Repository'} <ArrowUpRightIcon size={15} />
        </a>
      ) : null}
      {project.live ? <a aria-label={`View project: ${project.title}`} href={project.live} rel="noreferrer" target="_blank">View project <ArrowUpRightIcon size={15} /></a> : null}
    </div>
  );
}

function ProjectCard({ project, index, prominent = false }) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const media = mediaFailed ? null : projectMedia[project.title];
  return (
    <article
      className={`project-card portfolio-project-card${prominent ? ' portfolio-project-featured' : ''}${media?.src ? '' : ' portfolio-project-text-only'}`}
      data-reveal
      style={{ '--card-index': index }}
    >
      <div className="project-copy">
        {project.category ? <p className="portfolio-project-category">{project.category}</p> : null}
        <h3>{project.title}</h3>
        <p className="project-description">{project.description}</p>
        {project.outcome ? <p className="portfolio-project-outcome">{project.outcome}</p> : null}
        {project.tags?.length ? (
          <ul aria-label={`${project.title} technologies`} className="tag-list">
            {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        ) : null}
        <ProjectLinks project={project} />
      </div>
      {media?.secondaryImage ? (
        <div className="portfolio-project-image portfolio-project-media-pair">
          <MediaFigure media={media} onImageError={() => setMediaFailed(true)} priority={index === 0} title={`${project.title} — live arena`} />
          <MediaFigure className="portfolio-project-secondary-image" media={media.secondaryImage} title={`${project.title} — final results`} />
        </div>
      ) : (
        <MediaFigure className="portfolio-project-image" media={media} onImageError={() => setMediaFailed(true)} priority={index === 0} title={project.title} />
      )}
    </article>
  );
}

function ProjectArchiveCard({ project }) {
  return (
    <article className="portfolio-archive-project">
      {project.category ? <p className="portfolio-project-category">{project.category}</p> : null}
      <h4>{project.title}</h4>
      <p>{project.description || project.note}</p>
      <ProjectLinks project={project} />
    </article>
  );
}

function matchesFilter(project, filter) {
  if (filter === 'All') return true;
  const context = [project.group, ...(project.groups || []), project.category, project.title].filter(Boolean).join(' ').toLowerCase();
  if (filter === 'Quant') return /quant|trading|alphaengine|delta1|fleet|optimis|optimiz/.test(context);
  return /\bai\b|agent|multimodal|brainhack|cs2|fraud|nexus|formforward|dealmachine|risksignal|machine learning/.test(context);
}

export default function ProjectGrid() {
  const [filter, setFilter] = useState('All');
  const archive = Array.isArray(portfolio.projectArchive) ? portfolio.projectArchive : [];
  const selectedTitles = new Set(portfolio.projects.map((project) => project.title));
  const extraProjects = archive.filter((project) => !selectedTitles.has(project.title));
  const visibleProjects = portfolio.projects.filter((project) => matchesFilter(project, filter));
  const visualProjects = visibleProjects.filter((project) => projectMedia[project.title]?.src);
  const textProjects = visibleProjects.filter((project) => !projectMedia[project.title]?.src);
  const pairedProjects = visualProjects.filter((project) => !project.featured);
  const finalProminentTitle = pairedProjects.length % 2 === 1 ? pairedProjects.at(-1).title : null;
  const visibleArchive = extraProjects.filter((project) => matchesFilter(project, filter));
  const visibleCount = visibleProjects.length + visibleArchive.length;

  return (
    <section aria-labelledby="builds-title" className="content-section section-shell projects-section" id="builds">
      <div className="section-heading" data-reveal>
        <div>
          <SectionKicker label="Selected work" number="03" />
          <h2 id="builds-title">From complex problems to <em>working systems.</em></h2>
        </div>
        <div className="section-intro">
          <p>Quantitative infrastructure, applied AI and products built around real decisions.</p>
          <a className="text-link" href={portfolio.profile.github} rel="noreferrer" target="_blank">All repositories <ArrowUpRightIcon size={16} /></a>
        </div>
      </div>
      <div className="portfolio-project-controls">
        <div aria-label="Filter projects by field" className="portfolio-project-filters" role="group">
          {['All', 'AI', 'Quant'].map((option) => (
            <button aria-controls="portfolio-project-results" aria-pressed={filter === option} key={option} onClick={() => setFilter(option)} type="button">
              {option === 'All' ? 'All work' : option}
            </button>
          ))}
        </div>
        <p aria-live="polite" aria-atomic="true" className="portfolio-project-count">{visibleCount} {visibleCount === 1 ? 'project' : 'projects'}</p>
      </div>
      <div id="portfolio-project-results">
        <div className="project-grid portfolio-project-grid">
          {visualProjects.map((project, index) => (
            <ProjectCard index={index} key={project.title} project={project} prominent={project.featured || project.title === finalProminentTitle} />
          ))}
          {textProjects.map((project, index) => <ProjectCard index={visualProjects.length + index} key={project.title} project={project} />)}
        </div>
        {visibleArchive.length ? (
          <div className="portfolio-project-archive">
            <h3>More projects</h3>
            <div className="portfolio-project-archive-grid">
              {visibleArchive.map((project) => <ProjectArchiveCard key={project.title} project={project} />)}
            </div>
          </div>
        ) : null}
        {visibleCount === 0 ? <p className="portfolio-project-empty">No projects in this field yet. Choose All work to explore the full collection.</p> : null}
      </div>
    </section>
  );
}
