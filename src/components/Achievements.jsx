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

function AchievementGroup({ title, description, items }) {
  return (
    <details className="achievement-disclosure">
      <summary>
        <span className="achievement-disclosure-copy">
          <span className="achievement-disclosure-title" role="heading" aria-level="3">{title}</span>
        </span>
        <span className="achievement-disclosure-count">{items.length} records</span>
      </summary>
      {description ? <p className="achievement-disclosure-description">{description}</p> : null}
      <AchievementList items={items} certificateFiles={certificateFiles} />
    </details>
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
          <SectionKicker label="Recognition" />
          <h2 id="achievements-title">Awards &amp; certificates</h2>
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
        {communityGroups.map((group) => <AchievementGroup key={group.title} {...group} />)}
        <AchievementGroup title="Credentials & certificates" items={certifications} />
      </div>
    </section>
  );
}
