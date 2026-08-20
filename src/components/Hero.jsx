import { profile, impactStats } from '../data/portfolio.js';
import {
  ArrowUpRightIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  MapPinIcon,
  SparkIcon,
} from './Icons.jsx';

const imageBase = `${import.meta.env.BASE_URL}images/`;

export default function Hero() {
  return (
    <section className="hero section-shell" id="profile" aria-labelledby="hero-title">
      <div className="hero-card">
        <div className="corner-mark corner-mark-top-left" aria-hidden="true" />
        <div className="corner-mark corner-mark-top-right" aria-hidden="true" />
        <div className="corner-mark corner-mark-bottom-left" aria-hidden="true" />
        <div className="corner-mark corner-mark-bottom-right" aria-hidden="true" />

        <div className="portrait-column">
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
              <span>LONDON · FIELD NOTE 01</span>
              <span>2026</span>
            </figcaption>
          </figure>

          <div className="availability-chip">
            <span className="status-dot" aria-hidden="true" />
            {profile.availability}
          </div>

          <div className="social-row" aria-label="Contact links">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="Ian’s GitHub profile">
              <GitHubIcon />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Ian’s LinkedIn profile">
              <LinkedInIcon />
            </a>
            <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}>
              <MailIcon />
            </a>
          </div>
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            <SparkIcon size={17} />
            01 / ENGINEER’S FIELD JOURNAL
          </div>

          <p className="hero-name">{profile.name}</p>
          <h1 id="hero-title">
            Turning complex problems into <em>dependable systems.</em>
          </h1>
          <p className="hero-role">{profile.role}</p>
          <p className="hero-introduction">{profile.introduction}</p>

          <div className="hero-actions">
            <a className="button button-primary" href="#builds">
              Explore selected work <ArrowUpRightIcon />
            </a>
            <a className="button button-secondary" href={profile.resumeUrl} target="_blank" rel="noreferrer">
              View résumé <DownloadIcon />
            </a>
          </div>

          <dl className="hero-facts">
            <div>
              <dt>Current focus</dt>
              <dd>{profile.focus}</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>
                <MapPinIcon size={17} /> {profile.location}
              </dd>
            </div>
            <div>
              <dt>Degree</dt>
              <dd>{profile.education}</dd>
            </div>
          </dl>
        </div>
      </div>

      <dl className="impact-strip" aria-label="Selected impact">
        {impactStats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.value}</dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
