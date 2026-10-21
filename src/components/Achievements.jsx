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
          <SectionKicker number="06" label="Awards & credentials" />
          <h2 id="achievements-title">Milestones along <em>the way.</em></h2>
        </div>
        <div className="section-intro">
          <p>Competition results, continued learning, and recognition from school, sport, and service.</p>
        </div>
      </div>

      <div className="competition-awards" aria-label={technical.title} data-reveal>
        {technical.items.map((item, index) => (
          <article className="competition-award" key={item.title}>
            <div className="competition-award-top">
              <span className="archive-index">Team achievement / {String(index + 1).padStart(2, '0')}</span>
              <span className="achievement-year">{item.year}</span>
            </div>
            <p className="competition-result">{item.detail}</p>
            <h3>{item.title}</h3>
            <p className="competition-issuer">{item.issuer}</p>
            <CertificateLink item={item} certificateFiles={certificateFiles} />
          </article>
        ))}
      </div>

      <div className="achievement-records" data-reveal>
        <div className="learning-record">
          <div className="achievement-group-heading">
            <span className="archive-index">Continued learning</span>
            <h3>Credentials & certificates</h3>
          </div>
          <AchievementList items={certifications} certificateFiles={certificateFiles} />
        </div>
        <div className="community-records">
          {communityGroups.map((group) => (
            <details className="achievement-details" key={group.title} open={group.title === 'Service & leadership'}>
              <summary>
                <h3>{group.title}</h3>
                <span className="achievement-details-count">{group.items.length} records</span>
              </summary>
              <p className="achievement-group-description">{group.description}</p>
              <AchievementList items={group.items} certificateFiles={certificateFiles} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
