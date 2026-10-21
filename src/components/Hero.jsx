import { profile } from '../data/portfolio.js';
import RollingWords from './RollingWords.jsx';
import {
  ArrowUpRightIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
} from './Icons.jsx';

const imageBase = `${import.meta.env.BASE_URL}images/`;

function tiltPortrait(event) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = event.currentTarget.parentElement.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  event.currentTarget.style.setProperty('--portrait-x', `${-y * 6}deg`);
  event.currentTarget.style.setProperty('--portrait-y', `${x * 7}deg`);
}
function resetPortrait(event) {
  event.currentTarget.style.setProperty('--portrait-x', '0deg');
  event.currentTarget.style.setProperty('--portrait-y', '0deg');
}

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
          <RollingWords />
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
          <span className="portrait-tape" aria-hidden="true" />
          <span className="portrait-paint-dab" aria-hidden="true" />
          <figure className="portrait-frame portrait-interactive" onPointerMove={tiltPortrait} onPointerLeave={resetPortrait}>
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
              <span>A little outside the code</span>
            </figcaption>
          </figure>
        </div>
      </div>

    </section>
  );
}
