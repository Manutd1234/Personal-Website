import { linkedinDetails, linkedinSnapshot, profile } from '../data/portfolio.js';
import { ArrowUpRightIcon, LinkedInIcon, SparkIcon } from './Icons.jsx';

const dexSections = [
  ['experience', 'Experience', linkedinSnapshot.experienceCount ?? linkedinDetails.experience.length],
  ['projects', 'Projects', linkedinSnapshot.projectCount],
  ['education', 'Education', linkedinDetails.education.length],
  ['volunteering', 'Volunteering', linkedinSnapshot.volunteerCount],
  ['certifications', 'Badges', linkedinSnapshot.certificationCount],
  ['courses', 'Courses', linkedinSnapshot.courseCount],
  ['awards', 'Honors', linkedinSnapshot.awardCount],
  ['languages', 'Languages', linkedinSnapshot.languageCount],
];

function EntryCard({ entry, type }) {
  const title = entry.title || entry.school;
  const subtitle = entry.organisation || entry.credential || entry.issuer || entry.school || entry.level;
  const meta = entry.dates || entry.code || entry.level;

  return (
    <article className={`dex-entry dex-entry-${type}`}>
      <div className="dex-entry-topline">
        <span className="dex-entry-icon" aria-hidden="true">
          {type === 'projects' ? '⚙' : type === 'education' ? '⌂' : type === 'certifications' ? '★' : '◆'}
        </span>
        <span>{meta}</span>
      </div>
      <h3>{title}</h3>
      <p className="dex-entry-subtitle">{subtitle}</p>
      {entry.note && <p className="dex-entry-note">{entry.note}</p>}
      {entry.id && <p className="dex-entry-id">ID · {entry.id}</p>}
    </article>
  );
}

export default function Pokedex() {
  return (
    <section className="pokedex-section section-shell" id="pokedex" aria-labelledby="pokedex-title">
      <div className="pokedex-card">
        <div className="pokedex-topline">
          <p className="eyebrow"><SparkIcon size={16} /> 02 / TRAINER DATABASE</p>
          <span className="dex-status"><i aria-hidden="true" /> PROFILE SYNCED</span>
        </div>

        <div className="pokedex-heading">
          <div>
            <h2 id="pokedex-title">Pokédex: {profile.shortName}</h2>
            <p>Everything visible from Ian&apos;s LinkedIn profile, sorted into a field-ready trainer log.</p>
          </div>
          <a className="dex-link" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon size={18} /> Open LinkedIn <ArrowUpRightIcon size={16} />
          </a>
        </div>

        <div className="dex-about">
          <div>
            <span className="dex-about-label">TRAINER BIO</span>
            <p>{linkedinSnapshot.about}</p>
          </div>
          <div className="dex-skill-strip">
            <span className="dex-about-label">TOP MOVES</span>
            <ul>
              {linkedinSnapshot.topSkills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        </div>

        <div className="dex-stat-row" aria-label="LinkedIn profile counts">
          {dexSections.map(([, label, count]) => (
            <div key={label} className="dex-stat">
              <strong>{count}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="dex-grid">
          {Object.entries(linkedinDetails).map(([type, entries]) => (
            <section className="dex-section" key={type} aria-labelledby={`dex-${type}`}>
              <div className="dex-section-title">
                <h3 id={`dex-${type}`}>{dexSections.find(([key]) => key === type)?.[1] || type}</h3>
                <span>{entries.length} shown</span>
              </div>
              <div className="dex-entries">
                {entries.map((entry) => <EntryCard entry={entry} key={`${type}-${entry.title || entry.school}`} type={type} />)}
              </div>
            </section>
          ))}
        </div>

        <p className="dex-footnote">
          The profile contains additional entries beyond the expanded cards above: {linkedinSnapshot.skillCount} skills,{' '}
          {linkedinSnapshot.certificationCount} certifications, {linkedinSnapshot.courseCount} courses,{' '}
          {linkedinSnapshot.awardCount} honors, {linkedinSnapshot.volunteerCount} volunteer roles, and{' '}
          {linkedinSnapshot.languageCount} languages. Counts are public profile metadata; private analytics are omitted.
        </p>
      </div>
    </section>
  );
}
