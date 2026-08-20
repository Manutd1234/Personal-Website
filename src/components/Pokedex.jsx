import { useRef, useState } from 'react';

import {
  experience as resumeExperience,
  leadership,
  linkedinDetails,
  linkedinSnapshot,
  profile,
  projects as portfolioProjects,
} from '../data/portfolio.js';
import { ArrowUpRightIcon, LinkedInIcon, SparkIcon } from './Icons.jsx';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'community', label: 'Community' },
  { id: 'credentials', label: 'Credentials' },
];

const profileCounts = [
  ['experience', 'Experience', linkedinSnapshot.experienceCount ?? linkedinDetails.experience.length],
  ['projects', 'Projects', linkedinSnapshot.projectCount],
  ['education', 'Education', linkedinDetails.education.length],
  ['volunteering', 'Community roles', linkedinSnapshot.volunteerCount],
  ['certifications', 'Certifications', linkedinSnapshot.certificationCount],
  ['courses', 'Courses', linkedinSnapshot.courseCount],
  ['awards', 'Honours', linkedinSnapshot.awardCount],
  ['languages', 'Languages', linkedinSnapshot.languageCount],
];

const sectionLabels = {
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  community: 'Community',
  credentials: 'Credentials',
};

const resumeOnlyExperience = resumeExperience
  .filter(({ company }) => !linkedinDetails.experience.some(({ organisation }) => organisation === company))
  .map((entry) => ({
    title: entry.role,
    organisation: entry.company,
    dates: entry.dates,
    note: `${entry.summary} ${entry.highlights.join(' ')}`,
    army: entry.company.includes('Air Force'),
  }));

const experienceEntries = [...linkedinDetails.experience, ...resumeOnlyExperience];

const projectEntries = [
  ...linkedinDetails.projects.map((entry) => ({ ...entry, source: 'LinkedIn project' })),
  ...portfolioProjects.map((entry) => ({
    title: entry.title,
    organisation: entry.category,
    dates: 'Portfolio build',
    note: `${entry.description} ${entry.outcome}`,
    source: 'Project index',
  })),
];

const communityEntries = [
  ...linkedinDetails.volunteering,
  ...leadership.map((entry) => ({
    title: entry.role,
    organisation: entry.title,
    dates: entry.dates,
    note: entry.description,
  })),
];

const credentialEntries = [
  ...linkedinDetails.certifications.map((entry) => ({ ...entry, category: 'Certification' })),
  ...linkedinDetails.courses.map((entry) => ({
    ...entry,
    organisation: entry.school,
    dates: entry.code,
    category: 'Course',
  })),
  ...linkedinDetails.awards.map((entry) => ({ ...entry, category: 'Honour' })),
  ...linkedinDetails.languages.map((entry) => ({
    ...entry,
    organisation: entry.level,
    category: 'Language',
  })),
];

function EntryCard({ entry, type }) {
  const title = entry.title || entry.school;
  const subtitle = entry.organisation || entry.credential || entry.issuer || entry.school || entry.level;
  const meta = entry.dates || entry.code || entry.level || entry.category;

  return (
    <article className={`dex-entry dex-entry-${type}${entry.army ? ' army-entry' : ''}`}>
      <div className="dex-entry-topline">
        <span className="dex-entry-icon" aria-hidden="true">
          {type === 'projects' ? '⚙' : type === 'education' ? '⌂' : type === 'credentials' ? '★' : '◆'}
        </span>
        <span>{meta}</span>
      </div>
      <h3>{title}</h3>
      <p className="dex-entry-subtitle">{subtitle}</p>
      {entry.note && <p className="dex-entry-note">{entry.note}</p>}
      {entry.source && <p className="dex-entry-id">Source · {entry.source}</p>}
      {entry.id && <p className="dex-entry-id">ID · {entry.id}</p>}
    </article>
  );
}

function EntrySection({ type, entries }) {
  return (
    <section className="dex-section" aria-labelledby={`dex-${type}`}>
      <div className="dex-section-title">
        <h3 id={`dex-${type}`}>{sectionLabels[type]}</h3>
        <span>{entries.length} shown</span>
      </div>
      <div className="dex-entries">
        {entries.map((entry, index) => (
          <EntryCard entry={entry} key={`${type}-${entry.title || entry.school}-${index}`} type={type} />
        ))}
      </div>
    </section>
  );
}

function OverviewPanel() {
  return (
    <>
      <div className="dex-about">
        <div>
          <span className="dex-about-label">PROFILE BIO</span>
          {linkedinSnapshot.about.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="dex-skill-strip">
          <span className="dex-about-label">CORE SKILLS</span>
          <ul>{linkedinSnapshot.topSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
        </div>
      </div>
      <div className="dex-stat-row" aria-label="LinkedIn profile counts">
        {profileCounts.map(([, label, count]) => (
          <div key={label} className="dex-stat">
            <strong>{count}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Pokedex() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const tabRefs = useRef([]);

  function handleTabKeyDown(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  const panels = {
    overview: <OverviewPanel />,
    projects: <EntrySection type="projects" entries={projectEntries} />,
    experience: <EntrySection type="experience" entries={experienceEntries} />,
    education: <EntrySection type="education" entries={linkedinDetails.education} />,
    community: <EntrySection type="community" entries={communityEntries} />,
    credentials: <EntrySection type="credentials" entries={credentialEntries} />,
  };

  return (
    <section className="pokedex-section section-shell" id="pokedex" aria-labelledby="pokedex-title">
      <div className="pokedex-card">
        <div className="pokedex-topline">
          <p className="eyebrow"><SparkIcon size={16} /> 02 / PROFILE INDEX</p>
          <span className="dex-status"><i aria-hidden="true" /> PROFILE SYNCED</span>
        </div>

        <div className="pokedex-heading">
          <div>
            <h2 id="pokedex-title">Profile file: {profile.shortName}</h2>
            <p>Selected work, study, service, and community notes from Ian&apos;s public LinkedIn profile.</p>
          </div>
          <a className="dex-link" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon size={18} /> Open LinkedIn <ArrowUpRightIcon size={16} />
          </a>
        </div>

        <div className="profile-tabs" role="tablist" aria-label="Profile sections">
          {tabs.map((tab, index) => (
            <button
              aria-controls={`${tab.id}-panel`}
              aria-selected={activeTab === tab.id}
              className="profile-tab"
              id={`${tab.id}-tab`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => { tabRefs.current[index] = element; }}
              role="tab"
              tabIndex={activeTab === tab.id ? 0 : -1}
              type="button"
            >
              <span aria-hidden="true">0{index + 1}</span>{tab.label}
            </button>
          ))}
        </div>

        {tabs.map((tab) => (
          <div
            aria-labelledby={`${tab.id}-tab`}
            className="profile-panel"
            hidden={activeTab !== tab.id}
            id={`${tab.id}-panel`}
            key={tab.id}
            role="tabpanel"
            tabIndex="0"
          >
            {panels[tab.id]}
          </div>
        ))}

        <p className="dex-footnote">
          Public profile metadata includes {linkedinSnapshot.skillCount} skills, {linkedinSnapshot.certificationCount} certifications,
          {' '}{linkedinSnapshot.courseCount} courses, {linkedinSnapshot.awardCount} honours, {linkedinSnapshot.volunteerCount} community roles,
          {' '}and {linkedinSnapshot.languageCount} languages. Private analytics are omitted.
        </p>
      </div>
    </section>
  );
}
