import { profile, projects } from '../data/portfolio.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';
import SectionKicker from './SectionKicker.jsx';

const projectSignals = {
  AlphaEngine: { value: '100ms', label: 'Unified analysis grid', code: 'L2 / LIVE' },
  'BrainHack TIL-AI': { value: '1st', label: 'National AI competition', code: '05 / SERVICES' },
  'Delta1 Research': { value: 'W/F', label: 'Walk-forward validation', code: 'COST / AWARE' },
  'CS2 Decision Coach': { value: '.DEM', label: 'Native match telemetry', code: 'EVIDENCE / ONLY' },
  'Agentic Fraud Investigation Crew': { value: 'HITL', label: 'Human-controlled decisions', code: 'AML / AGENTS' },
};

function ProjectVisual({ project }) {
  const signal = projectSignals[project.title];

  return (
    <div className="project-visual" aria-hidden="true">
      <div className="visual-toolbar">
        <span><i /><i /><i /></span>
        <code>{signal.code}</code>
      </div>
      <div className="visual-canvas">
        <div className="signal-orbit"><span /></div>
        <div className="signal-bars">
          {[34, 58, 42, 78, 54, 88, 66, 94].map((height, index) => (
            <i key={`${project.title}-${height}`} style={{ '--bar-height': `${height}%`, '--bar-delay': `${index * 90}ms` }} />
          ))}
        </div>
        <div className="signal-readout">
          <strong>{signal.value}</strong>
          <span>{signal.label}</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <article
      className={`project-card project-${project.accent}${project.featured ? ' project-featured' : ''}`}
      data-reveal
      style={{ '--card-index': index }}
    >
      <div className="project-copy">
        <div className="project-topline">
          <span>Quest {String(index + 1).padStart(2, '0')} / 05</span>
          <span>{project.category}</span>
        </div>

        <h3>{project.title}</h3>
        <p className="project-description">{project.description}</p>

        <div className="project-result">
          <span>What mattered</span>
          <p>{project.outcome}</p>
        </div>

        <ul className="tag-list" aria-label={`${project.title} technologies`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>

        <div className="project-links">
          <a href={project.repository} target="_blank" rel="noreferrer">
            {project.repositoryLabel ? null : <GitHubIcon size={18} />}
            {project.repositoryLabel || 'View repository'} <ArrowUpRightIcon size={16} />
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer">
              Open live system <ArrowUpRightIcon size={16} />
            </a>
          )}
        </div>
      </div>
      <ProjectVisual project={project} />
    </article>
  );
}

export default function ProjectGrid() {
  return (
    <section className="content-section section-shell projects-section" id="builds" aria-labelledby="builds-title">
      <div className="section-heading" data-reveal>
        <div>
          <SectionKicker number="03" label="Selected work · Quest log" />
          <h2 id="builds-title">Built for the messy part between idea and <em>impact.</em></h2>
        </div>
        <div className="section-intro">
          <p>Five projects across quantitative infrastructure, applied AI, cybersecurity, and decision support.</p>
          <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">
            All repositories <ArrowUpRightIcon size={16} />
          </a>
        </div>
      </div>

      <div className="project-grid">
        {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}
      </div>
    </section>
  );
}
