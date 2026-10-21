import { useRef, useState } from 'react';

import * as careerData from '../data/portfolio.js';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';

const { earlierEducation = [], earlierExperience = [], education = [], experience = [], leadership = [] } = careerData;
const volunteerRecords = Array.isArray(careerData.volunteering)
  ? careerData.volunteering
  : leadership.filter((item) => /Volunteer|Programmes Head/i.test(item.role));
const volunteerTitles = new Set(volunteerRecords.map((item) => item.title));
const leadershipRecords = leadership.filter((item) => !volunteerTitles.has(item.title));
const educationRecords = [...education, ...earlierEducation];

const tabs = [
  { id: 'work', label: 'Experience', count: experience.length + earlierExperience.length },
  { id: 'education', label: 'Education', count: educationRecords.length },
  { id: 'community', label: 'Leadership & CCAs', count: leadershipRecords.length },
  { id: 'volunteering', label: 'Volunteering', count: volunteerRecords.length },
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
      <section className="career-history-group" aria-labelledby="earlier-work-title">
        <h3 id="earlier-work-title">Earlier experience</h3>
        <div className="earlier-work-grid">
          {earlierExperience.map((item) => (
            <article key={item.company}>
              <h4>{item.company}</h4>
              <p className="career-role">{item.role}</p>
              <p className="career-date">{item.dates}</p>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function EducationCards({ items }) {
  return (
    <div className="education-grid">
      {items.map((item) => (
        <article key={item.school}>
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
  return <EducationCards items={educationRecords} />;
}

function CommunityPanel({ items }) {
  return (
    <div className="leadership-grid">
      {items.map((item) => (
        <article key={item.title}>
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
          <SectionKicker label="Experience & education" />
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
              aria-label={`${tab.label}, ${tab.count} records`}
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
              {tab.label}
              <span aria-hidden="true" className="career-tab-count">{tab.count}</span>
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
          <CommunityPanel items={leadershipRecords} />
        </div>
        <div
          aria-labelledby="volunteering-tab"
          className="archive-panel"
          hidden={activeTab !== 'volunteering'}
          id="volunteering-panel"
          role="tabpanel"
          tabIndex="0"
        >
          <CommunityPanel items={volunteerRecords} />
        </div>
      </div>
    </section>
  );
}
