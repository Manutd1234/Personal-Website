import { useRef, useState } from 'react';

import * as careerData from '../data/portfolio.js';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';
import '../experience-dynamic.css';

const { earlierEducation = [], education = [], experience = [], leadership = [] } = careerData;
const volunteerRecords = Array.isArray(careerData.volunteering)
  ? careerData.volunteering
  : leadership.filter((item) => /Volunteer|Programmes Head/i.test(item.role));
const volunteerTitles = new Set(volunteerRecords.map((item) => item.title));
const leadershipRecords = leadership.filter((item) => !volunteerTitles.has(item.title));
const educationRecords = [...education, ...earlierEducation];

const tabs = [
  { id: 'work', label: 'Experience', count: experience.length },
  { id: 'education', label: 'Education', count: educationRecords.length },
  { id: 'community', label: 'Leadership & CCAs', count: leadershipRecords.length },
  { id: 'volunteering', label: 'Volunteering', count: volunteerRecords.length },
];

function RecordHighlights({ items, title }) {
  if (!items?.length) return null;

  return (
    <details className="career-record-details">
      <summary aria-label={`Contributions at ${title}`}>
        Contributions <span aria-hidden="true">{items.length}</span>
      </summary>
      <ul className="career-bullets">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </details>
  );
}

function ExperiencePanel() {
  const [selectedRole, setSelectedRole] = useState(0);
  const roleRefs = useRef([]);
  const item = experience[selectedRole];

  function handleRoleKeyDown(event, index) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? experience.length - 1
        : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + experience.length) % experience.length;
    setSelectedRole(nextIndex);
    roleRefs.current[nextIndex]?.focus({ preventScroll: true });
  }

  if (!item) return null;

  return (
    <div className="career-role-browser">
      <div className="career-role-rail">
        <div className="career-role-rail-heading">
          <span>Different teams, different lessons.</span>
          <p>Explore a role</p>
        </div>
        <div className="career-role-list" role="tablist" aria-label="Work experience roles" aria-orientation="vertical">
          {experience.map((role, index) => (
            <button
              aria-controls="career-role-story"
              aria-selected={selectedRole === index}
              className="career-role-choice"
              id={`career-role-${index}-tab`}
              key={`${role.company}-${role.dates}`}
              onClick={() => setSelectedRole(index)}
              onKeyDown={(event) => handleRoleKeyDown(event, index)}
              ref={(element) => { roleRefs.current[index] = element; }}
              role="tab"
              tabIndex={selectedRole === index ? 0 : -1}
              type="button"
            >
              <span className="career-role-choice-company">{role.company}</span>
              <span className="career-role-choice-title">{role.role}</span>
              <span className="career-role-choice-date">{role.dates}</span>
              <span aria-hidden="true" className="career-role-choice-arrow">↗</span>
            </button>
          ))}
        </div>
        <div className="career-role-picker">
          <label htmlFor="career-role-select">Choose a role</label>
          <select
            aria-controls="career-role-story"
            id="career-role-select"
            onChange={(event) => setSelectedRole(Number(event.target.value))}
            value={selectedRole}
          >
            {experience.map((role, index) => (
              <option key={`${role.company}-${role.dates}`} value={index}>{role.company} · {role.dates}</option>
            ))}
          </select>
        </div>
      </div>
      <div
        aria-labelledby={`career-role-${selectedRole}-tab`}
        className="career-role-story"
        id="career-role-story"
        role="tabpanel"
        tabIndex={0}
      >
        <article className="career-role-story-copy" key={`${item.company}-${item.dates}`}>
          <div className="career-role-story-meta">
            <span>{item.location}</span>
            <time>{item.dates}</time>
          </div>
          <p className="career-role-story-eyebrow">{item.role}</p>
          <h3>{item.company}</h3>
          <p className="career-role-story-summary">{item.summary}</p>
          {item.highlights?.length > 0 && (
            <div className="career-role-contributions">
              <h4>What I worked on</h4>
              <ul className="career-bullets">
                {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

function EducationCards({ items }) {
  return (
    <div className="education-grid career-education-cards">
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
    <div className="leadership-grid career-community-cards">
      {items.map((item) => (
        <article key={item.title}>
          <h3>{item.title}</h3>
          <p className="leadership-role">{item.role}</p>
          <time>{item.dates}</time>
          <p>{item.description}</p>
          <RecordHighlights items={item.highlights} title={item.title} />
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
    <section className="content-section section-shell archive-section career-workspace career-dynamic" id="experience" aria-labelledby="archive-title">
      <div className="section-heading archive-heading" data-reveal>
        <div>
          <SectionKicker label="Experience & education" />
          <h2 id="archive-title">Where I’ve been <em>building.</em></h2>
        </div>
        <div className="section-intro"><p>
          I’ve learned something different in each role — in software teams, quantitative research, National Service,
          and the communities I spend time with.
        </p></div>
      </div>

      <div className="archive-card" data-record-view={activeTab} data-reveal>
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
