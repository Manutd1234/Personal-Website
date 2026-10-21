import { profile } from '../data/portfolio.js';
import { ArrowUpRightIcon } from './Icons.jsx';

export default function Contact() {
  return (
    <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title">
      <div className="contact-note">
        <div><h2 id="contact-title">Let’s talk.</h2><p>For opportunities, projects, or a conversation.</p></div>
        <a href={`mailto:${profile.email}`}>{profile.email} <ArrowUpRightIcon size={20} /></a>
      </div>
    </section>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer section-shell">
      <p>© {new Date().getFullYear()} Ian Abiel Wangsa</p>
      <div><a href={profile.github} target="_blank" rel="noreferrer">GitHub</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href="#top">Back to top ↑</a></div>
    </footer>
  );
}
