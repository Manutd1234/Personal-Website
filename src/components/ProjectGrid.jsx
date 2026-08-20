import { projects } from '../data/portfolio.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';

function ProjectCard({ project }) {
  return (
    <article className={`project-card project-${project.accent}${project.featured ? ' project-featured' : ''}`}>
      <div className="project-topline">
        <span className="project-number">{project.number}</span>
        <span className="project-category">{project.category}</span>
      </div>

      <div className="project-body">
        <div>
          <h3>{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>

        {project.featured && (
          <div className="system-route" aria-label="AlphaEngine system flow">
            <span>MARKET DATA</span>
            <i aria-hidden="true" />
            <span>RISK CORE</span>
            <i aria-hidden="true" />
            <span>OPERATOR</span>
          </div>
        )}

        <div className="project-note">
          <span>FIELD RESULT</span>
          <p>{project.outcome}</p>
        </div>

        <ul className="tag-list" aria-label={`${project.title} technologies`}>
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>

      <div className="project-links">
        <a href={project.repository} target="_blank" rel="noreferrer">
          {project.repositoryLabel === 'LinkedIn project' ? null : <GitHubIcon size={18} />}
          {project.repositoryLabel || 'Repository'} <ArrowUpRightIcon size={17} />
        </a>
        {project.live && (
          <a href={project.live} target="_blank" rel="noreferrer">
            Live workspace <ArrowUpRightIcon size={17} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function ProjectGrid() {
  return (
    <section className="content-section section-shell" id="builds" aria-labelledby="builds-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / TRAINER PARTY</p>
          <h2 id="builds-title">The systems in my party.</h2>
        </div>
        <p>
          Each build has a type, a role, and a reason to exist. Choose a card to inspect the move set.
        </p>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
