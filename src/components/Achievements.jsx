import { useId, useRef, useState } from 'react';
import { achievementGroups, certifications } from '../data/portfolio.js';
import { certificateFiles } from '../data/media.js';
import { ArrowUpRightIcon } from './Icons.jsx';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';
import '../awards-dynamic.css';

const technical = achievementGroups.find((group) => group.title === 'Technical competitions');
const government = achievementGroups.find((group) => group.title === 'Government awards & scholarships');
const school = achievementGroups.find((group) => group.title === 'Academic & sporting awards');
const service = achievementGroups.find((group) => group.title === 'Service & leadership');
const isSport = (item) => /Softball|Colours Award|Sports Day|School athletics|SwimSafer/i.test(item.title);
const categories = [
  { id: 'competitions', label: 'Competitions', ...technical },
  { id: 'academic', label: 'Academic', title: 'Academic & creative awards', description: school.description, items: school.items.filter((item) => !isSport(item)) },
  { id: 'government', label: 'Government', ...government },
  { id: 'sport', label: 'Sport', title: 'Sporting awards', description: 'Team results, athletics, and swimming milestones.', items: school.items.filter(isSport) },
  { id: 'service', label: 'Service', ...service },
  { id: 'certificates', label: 'Certificates', title: 'Credentials & certificates', description: 'Courses and credentials, with their original issuers and dates.', items: certifications },
];

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
    <ul className="award-record-grid">
      {items.map((item) => (
        <li className="award-record" key={`${item.title}-${item.year ?? item.issuer}`}>
          <div className="award-record-heading">
            {item.year && <span className="award-record-date">{item.year}</span>}
            <h4>{item.title}</h4>
          </div>
          <p className="award-record-issuer">{item.issuer}</p>
          {item.detail ? <p className="award-record-detail">{item.detail}</p> : null}
          <CertificateLink item={item} certificateFiles={certificateFiles} />
        </li>
      ))}
    </ul>
  );
}

function CompetitionAwards({ items }) {
  return (
    <div className="award-win-grid">
      {items.map((item, index) => (
        <article className="award-win-card" data-accent={index % 3} key={item.title}>
          <span className="award-record-date">{item.year}</span>
          <p className="award-win-result">{item.detail}</p>
          <h4>{item.title}</h4>
          <p className="award-record-issuer">{item.issuer}</p>
          <CertificateLink item={item} certificateFiles={certificateFiles} />
        </article>
      ))}
    </div>
  );
}

export default function Achievements() {
  const [activeCategory, setActiveCategory] = useState('competitions');
  const tabRefs = useRef([]);
  const browserId = useId();

  function navigateCategories(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % categories.length
      : event.key === 'ArrowLeft' ? (index + categories.length - 1) % categories.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActiveCategory(categories[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      className="content-section section-shell achievements-section award-browser"
      id="achievements"
      aria-labelledby="achievements-title"
    >
      <div className="section-heading" data-reveal>
        <div>
          <SectionKicker label="Recognition" />
          <h2 id="achievements-title">Awards &amp; <em>certificates.</em></h2>
        </div>
        <div className="section-intro">
          <p>Team wins, school milestones, service, and continued learning.</p>
        </div>
      </div>

      <div aria-label="Award categories" className="award-categories" role="tablist">
        {categories.map((category, index) => (
          <button aria-controls={`${browserId}-${category.id}-panel`} aria-selected={activeCategory === category.id} className="award-category-tab" id={`${browserId}-${category.id}-tab`} key={category.id} onClick={() => setActiveCategory(category.id)} onKeyDown={(event) => navigateCategories(event, index)} ref={(element) => { tabRefs.current[index] = element; }} role="tab" tabIndex={activeCategory === category.id ? 0 : -1} type="button">
            {category.label}<span>{category.items.length}</span>
          </button>
        ))}
      </div>
      <div className="award-category-panels">
        {categories.map((category) => (
          <section aria-labelledby={`${browserId}-${category.id}-tab`} className="award-category-panel" data-category={category.id} hidden={activeCategory !== category.id} id={`${browserId}-${category.id}-panel`} key={category.id} role="tabpanel" tabIndex={0}>
            <header className="award-category-heading">
              <h3>{category.title}</h3>
              {category.description ? <p>{category.description}</p> : null}
            </header>
            {category.id === 'competitions' ? <CompetitionAwards items={category.items} /> : <AchievementList items={category.items} certificateFiles={certificateFiles} />}
          </section>
        ))}
      </div>
    </section>
  );
}
