import { credentials, linkedinSnapshot, skillGroups } from '../data/portfolio.js';
import { SparkIcon } from './Icons.jsx';

export default function Toolkit() {
  return (
    <section className="content-section section-shell toolkit-section" aria-labelledby="toolkit-title">
      <div className="toolkit-intro">
        <p className="eyebrow">04 / TOOLKIT & SIGNALS</p>
        <h2 id="toolkit-title">Tools are choices, not personality traits.</h2>
        <p>
          I pick the smallest stack that can carry the operational load, then make its assumptions visible and
          testable.
        </p>

        <div className="award-ticket">
          <SparkIcon size={24} />
          <div>
            <span>SELECTED SIGNAL</span>
            <strong>BrainHack TIL-AI 2026 · 1st Place</strong>
          </div>
        </div>
      </div>

      <div className="toolkit-board">
        <div className="skill-groups">
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="credential-block">
          <h3>Credentials</h3>
          <ol>
            {credentials.map((credential, index) => (
              <li key={credential}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {credential}
              </li>
            ))}
          </ol>
        </div>

        <div className="credential-block">
          <h3>LinkedIn profile map</h3>
          <ol>
            <li><span>01</span>{linkedinSnapshot.projectCount} projects</li>
            <li><span>02</span>{linkedinSnapshot.certificationCount} certifications</li>
            <li><span>03</span>{linkedinSnapshot.courseCount} courses</li>
            <li><span>04</span>{linkedinSnapshot.awardCount} honors &amp; awards</li>
            <li><span>05</span>{linkedinSnapshot.volunteerCount} volunteer roles</li>
            <li><span>06</span>{linkedinSnapshot.languageCount} languages</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
