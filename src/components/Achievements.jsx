import { achievementGroups, certifications } from '../data/portfolio.js';
import { certificateFiles } from '../data/media.js';
import { ArrowUpRightIcon } from './Icons.jsx';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';

function CertificateLink({ item, certificateFiles }) {
  const certificateKeys = item.certificateKeys ?? [item.certificateKey];
  const certificates = certificateKeys.map((key) => certificateFiles[key]).filter((certificate) => certificate?.src);

  if (certificates.length === 0) return null;

  return (
    <div className="achievement-certificate-links">
      {certificates.map((certificate) => (
        <a
          className="achievement-certificate-link"
          key={certificate.src}
          href={`${import.meta.env.BASE_URL}${certificate.src}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${certificate.title ?? item.title} certificate (opens in a new tab)`}
        >
          {certificates.length > 1
            ? certificate.year ?? certificate.title?.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? 'View certificate'
            : 'View certificate'}
          <ArrowUpRightIcon size={16} />
        </a>
      ))}
    </div>
  );
}

function AchievementList({ items, certificateFiles }) {
  return (
    <ul className="achievement-list">
      {items.map((item) => (
        <li key={`${item.title}-${item.year ?? item.issuer}`}>
          <div className="achievement-list-heading">
            <h4>{item.title}</h4>
            {item.year && <span className="achievement-year">{item.year}</span>}
          </div>
          <p>{item.issuer}{item.detail && <> · <strong>{item.detail}</strong></>}</p>
          <CertificateLink item={item} certificateFiles={certificateFiles} />
        </li>
      ))}
    </ul>
  );
}

export default function Achievements() {
  const [technical, ...communityGroups] = achievementGroups;

  return (
    <section
      className="content-section section-shell achievements-section"
      id="achievements"
      aria-labelledby="achievements-title"
    >
      <div className="section-heading" data-reveal>
        <div>
          <SectionKicker label="Awards & credentials" />
          <h2 id="achievements-title">Milestones along <em>the way.</em></h2>
        </div>
        <div className="section-intro">
          <p>Competition results, continued learning, and recognition from school, sport, and service.</p>
        </div>
      </div>

      <section className="technical-award-record" aria-labelledby="technical-awards-title">
        <div className="achievement-section-heading">
          <h3 id="technical-awards-title">{technical.title}</h3>
          <p>{technical.description}</p>
        </div>
        <div className="competition-awards">
        {technical.items.map((item) => (
          <article className="competition-award" key={item.title}>
            <div className="competition-award-top">
              <span className="archive-index">Achievement</span>
              <span className="achievement-year">{item.year}</span>
            </div>
            <p className="competition-result">{item.detail}</p>
            <h4>{item.title}</h4>
            <p className="competition-issuer">{item.issuer}</p>
            <CertificateLink item={item} certificateFiles={certificateFiles} />
          </article>
        ))}
        </div>
      </section>

      <div className="achievement-records">
        {communityGroups.map((group, index) => (
          <section
            aria-labelledby={`award-group-${index}`}
            className={`achievement-group${index === 0 || group.items.length >= 8 ? ' achievement-group-wide' : ''}`}
            key={group.title}
          >
            <div className="achievement-group-heading">
              <h3 id={`award-group-${index}`}>{group.title}</h3>
            </div>
            <p className="achievement-group-description">{group.description}</p>
            <AchievementList items={group.items} certificateFiles={certificateFiles} />
          </section>
        ))}
        <section className="learning-record" aria-labelledby="learning-record-title">
          <div className="achievement-group-heading">
            <span className="archive-index">Continued learning</span>
            <h3 id="learning-record-title">Credentials & certificates</h3>
          </div>
          <AchievementList items={certifications} certificateFiles={certificateFiles} />
        </section>
      </div>
    </section>
  );
}
