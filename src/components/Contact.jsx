import { profile } from '../data/portfolio.js';
import { ArrowUpRightIcon, DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from './Icons.jsx';

export default function Contact() {
  return (
    <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title">
      <div className="contact-card">
        <div>
          <p className="eyebrow">07 / OPEN CHANNEL</p>
          <h2 id="contact-title">Have a difficult system to make simpler?</h2>
          <p>
            I’m always glad to compare notes on quantitative engineering, applied AI, product infrastructure,
            or ambitious student projects.
          </p>
        </div>

        <div className="contact-actions">
          <a className="contact-primary" href={`mailto:${profile.email}`}>
            <span>
              <MailIcon size={22} /> Email Ian
            </span>
            <small>{profile.email}</small>
            <ArrowUpRightIcon />
          </a>
          <div className="contact-secondary-grid">
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <LinkedInIcon size={21} /> LinkedIn <ArrowUpRightIcon size={17} />
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              <GitHubIcon size={21} /> GitHub <ArrowUpRightIcon size={17} />
            </a>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
              <DownloadIcon size={21} /> Résumé PDF <ArrowUpRightIcon size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer section-shell">
      <p>© {new Date().getFullYear()} Ian Abiel Wangsa</p>
      <p>Designed as an engineer’s field journal · Singapore</p>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
