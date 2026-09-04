import { profile, projects } from '../data/portfolio.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';
import PixelSprite from './PixelSprites.jsx';

const projectSignals = {
  AlphaEngine: { value: '100ms', label: 'Unified analysis grid', code: 'L2 / LIVE', sprite: 'signal', xp: '96%' },
  'BrainHack TIL-AI': { value: '1st', label: 'National AI competition', code: '05 / SERVICES', sprite: 'circuit', xp: '100%' },
  'Delta1 Research': { value: 'W/F', label: 'Walk-forward validation', code: 'COST / AWARE', sprite: 'signal', xp: '88%' },
  'CS2 Decision Coach': { value: '.DEM', label: 'Native match telemetry', code: 'EVIDENCE / ONLY', sprite: 'stack', xp: '91%' },
  'Agentic Fraud Investigation Crew': { value: 'HITL', label: 'Human-controlled decisions', code: 'AML / AGENTS', sprite: 'circuit', xp: '94%' },
};

function ProjectVisual({ project }) {
  const signal = projectSignals[project.title];

  return (
    <div className="project-visual" aria-hidden="true">
      <div className="visual-toolbar">
        <span><i /><i /><i /></span>
        <code>QUEST DATA // {signal.code}</code>
      </div>
      <div className="visual-canvas">
        <div className="signal-readout">
          <small>Encounter cleared</small>
          <strong>{signal.value}</strong>
          <span>{signal.label}</span>
        </div>
        <div className="battle-sprite">
          <PixelSprite type={signal.sprite} />
          <span className="battle-shadow" />
        </div>
        <div className="quest-xp">
          <span>BUILD XP</span>
          <div><i style={{ width: signal.xp }} /></div>
          <strong>{signal.xp}</strong>
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
          <span>QUEST {String(index + 1).padStart(2, '0')} / 05</span>
          <span>{project.category}</span>
        </div>

        <h3>{project.title}</h3>
        <p className="project-description">{project.description}</p>

        <div className="project-result">
          <span>Quest result</span>
          <p>{project.outcome}</p>
        </div>

        <ul className="tag-list" aria-label={`${project.title} technologies`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>

        <div className="project-links">
          <a href={project.repository} target="_blank" rel="noreferrer">
            {project.repositoryLabel ? null : <GitHubIcon size={18} />}
            {project.repositoryLabel || 'Inspect source'} <ArrowUpRightIcon size={16} />
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer">
              Launch demo <ArrowUpRightIcon size={16} />
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
          <div className="section-kicker"><span>03</span><p>Quest log</p></div>
          <h2 id="builds-title">Hard problems. <em>Quests cleared.</em></h2>
        </div>
        <div className="section-intro">
          <p>Five selected missions across quantitative infrastructure, applied AI, cybersecurity, and decision support.</p>
          <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">
            Browse all quests <ArrowUpRightIcon size={16} />
          </a>
        </div>
      </div>

      <div className="project-grid">
        {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}
      </div>
    </section>
  );
}
