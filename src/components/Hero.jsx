import { profile, impactStats } from '../data/portfolio.js';
import {
  ArrowUpRightIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
} from './Icons.jsx';

const imageBase = `${import.meta.env.BASE_URL}images/`;

export default function Hero() {
  return (
    <section className="hero section-shell" id="profile" aria-labelledby="hero-title" data-reveal>
      <div className="hero-layout">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" aria-hidden="true" />
            {profile.availability}
          </div>

          <p className="hero-name">Computer Science at NUS · {profile.location}</p>
          <h1 id="hero-title">
            Ian Abiel<br /><em>Wangsa.</em>
          </h1>
          <p className="hero-role">Software engineering. Applied AI. Quantitative systems.</p>
          <p className="hero-introduction">{profile.introduction}</p>

          <div className="hero-actions">
            <a className="button button-primary" href="#builds">
              View projects <ArrowUpRightIcon />
            </a>
            <a className="button button-secondary" href={profile.resumeUrl} target="_blank" rel="noreferrer">
              Résumé <DownloadIcon />
            </a>
          </div>

          <div className="hero-socials" aria-label="Contact links">
            <a href={profile.github} target="_blank" rel="noreferrer"><GitHubIcon size={18} /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon size={18} /> LinkedIn</a>
            <a href={`mailto:${profile.email}`}><MailIcon size={18} /> Email</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-index" aria-hidden="true">01</div>
          <figure className="portrait-frame">
            <picture>
              <source
                media="(min-width: 900px)"
                srcSet={`${imageBase}ian-westminster-1600.webp 1600w, ${imageBase}ian-westminster-960.webp 960w`}
                sizes="(min-width: 1100px) 420px, 38vw"
              />
              <img
                alt="Ian in front of Westminster Abbey in London"
                className="portrait-image"
                decoding="async"
                fetchPriority="high"
                height="1200"
                src={`${imageBase}ian-westminster-960.webp`}
                width="960"
              />
            </picture>
            <figcaption>
              <span>London, United Kingdom</span>
              <span>Outside the code</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <dl className="impact-strip" aria-label="Selected impact">
        {impactStats.map((stat, index) => (
          <div key={stat.label} style={{ '--stat-delay': `${index * 80}ms` }}>
            <dt>{stat.value}</dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>

    </section>
  );
}
