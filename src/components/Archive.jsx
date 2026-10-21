import { useRef, useState } from 'react';

import { earlierEducation, earlierExperience, education, experience, leadership } from '../data/portfolio.js';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';

const tabs = [
  { id: 'work', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'community', label: 'Leadership & service' },
];

function ExperiencePanel() {
  return (
    <>
      <ol className="timeline-list">
        {experience.map((item) => (
          <li key={`${item.company}-${item.dates}`}>
            <div className="timeline-marker" aria-hidden="true" />
            <article>
              <div className="timeline-heading">
                <div>
                  <h3>{item.company}</h3>
                  <p>{item.role}</p>
                </div>
                <div className="timeline-meta">
                  <time>{item.dates}</time>
                  <span>{item.location}</span>
                </div>
              </div>
              <p className="timeline-summary">{item.summary}</p>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
      <details className="career-details">
        <summary>Earlier work · Teaching & operations</summary>
        <div className="earlier-work-grid">
          {earlierExperience.map((item) => (
            <article key={item.company}>
              <h3>{item.company}</h3>
              <p className="career-role">{item.role}</p>
              <p className="career-date">{item.dates}</p>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </details>
    </>
  );
}

function EducationCards({ items, startIndex = 0 }) {
  return (
    <div className="education-grid">
      {items.map((item, index) => (
        <article key={item.school}>
          <span className="archive-index">EDU / {String(startIndex + index + 1).padStart(2, '0')}</span>
          <h3>{item.school}</h3>
          <p className="education-credential">{item.credential}</p>
          <time>{item.dates}</time>
          <ul className="career-bullets">
            {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
          </ul>
        </article>
      ))}
    </div>
  );
}

function EducationPanel() {
  return (
    <>
      <EducationCards items={education} />
      <details className="career-details">
        <summary>Earlier education · SST & Bukit Timah Primary</summary>
        <EducationCards items={earlierEducation} startIndex={education.length} />
      </details>
    </>
  );
}

function LeadershipPanel() {
  return (
    <div className="leadership-grid">
      {leadership.map((item, index) => (
        <article key={item.title}>
          <span className="archive-index">LOG / {String(index + 1).padStart(2, '0')}</span>
          <h3>{item.title}</h3>
          <p className="leadership-role">{item.role}</p>
          <time>{item.dates}</time>
          <p>{item.description}</p>
          {item.highlights?.length > 0 && (
            <ul className="career-bullets">
              {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

export default function Archive() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const tabRefs = useRef([]);

  function handleTabKeyDown(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;

    setActiveTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="content-section section-shell archive-section career-workspace" id="experience" aria-labelledby="archive-title">
      <div className="section-heading archive-heading" data-reveal>
        <div>
          <SectionKicker number="04" label="Experience & education" />
          <h2 id="archive-title">The work behind the <em>work.</em></h2>
        </div>
        <div className="section-intro"><p>
          Work, study, and the communities I contribute to — from engineering and quantitative research to
          National Service, student events, and volunteering.
        </p></div>
      </div>

      <div className="archive-card" data-reveal>
        <div className="archive-tabs" role="tablist" aria-label="Portfolio archive sections">
          {tabs.map((tab, index) => (
            <button
              aria-controls={`${tab.id}-panel`}
              aria-selected={activeTab === tab.id}
              id={`${tab.id}-tab`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={activeTab === tab.id ? 0 : -1}
              type="button"
            >
              <span aria-hidden="true">0{index + 1}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div
          aria-labelledby="work-tab"
          className="archive-panel"
          hidden={activeTab !== 'work'}
          id="work-panel"
          role="tabpanel"
          tabIndex="0"
        >
          <ExperiencePanel />
        </div>
        <div
          aria-labelledby="education-tab"
          className="archive-panel"
          hidden={activeTab !== 'education'}
          id="education-panel"
          role="tabpanel"
          tabIndex="0"
        >
          <EducationPanel />
        </div>
        <div
          aria-labelledby="community-tab"
          className="archive-panel"
          hidden={activeTab !== 'community'}
          id="community-panel"
          role="tabpanel"
          tabIndex="0"
        >
          <LeadershipPanel />
        </div>
      </div>
    </section>
  );
}
