import { linkedinDetails, projects as portfolioProjects, profile } from '../data/portfolio.js';
import { ArrowUpRightIcon, GitHubIcon } from './Icons.jsx';

const portfolioOnlyProjects = portfolioProjects.filter(
  ({ title }) => !['BrainHack TIL-AI', 'CS2 Decision Coach', 'Agentic Fraud Investigation Crew'].includes(title),
);

const projectCards = [
  ...linkedinDetails.projects.map((project, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: project.title,
    category: project.organisation,
    description: project.note,
    outcome: project.skills ? `Core stack · ${project.skills.join(' · ')}` : 'Project details from LinkedIn',
    tags: project.skills || [],
    repository: project.repository || profile.linkedin,
    repositoryLabel: project.repository ? 'Repository' : 'LinkedIn project',
    live: project.live,
    accent: ['cobalt', 'gold', 'alpine'][index % 3],
  })),
  ...portfolioOnlyProjects.map((project, index) => ({
    ...project,
    number: String(linkedinDetails.projects.length + index + 1).padStart(2, '0'),
  })),
];

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
          <p className="eyebrow">03 / PROJECT INDEX</p>
          <h2 id="builds-title">Software for decisions, operations, and risk.</h2>
        </div>
        <p>
          From low-latency market data to evidence-grounded AI, these builds show how I move from a messy brief to a system
          people can actually operate.
        </p>
      </div>

      <div className="project-grid">
        {projectCards.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
