import { credentials, linkedinSnapshot, skillGroups } from '../data/portfolio.js';
import { SparkIcon } from './Icons.jsx';

export default function Toolkit() {
  return (
    <section className="content-section section-shell toolkit-section" id="toolkit" aria-labelledby="toolkit-title">
      <div className="toolkit-intro" data-reveal>
        <div className="section-kicker"><span>05</span><p>Skill inventory</p></div>
        <h2 id="toolkit-title">Equip the right <em>loadout.</em></h2>
        <p>
          From model and data layer to product surface, I choose tools that make the system easier to test, explain,
          and operate in the real world.
        </p>

        <div className="award-ticket">
          <SparkIcon size={24} />
          <div>
            <span>Rare achievement unlocked</span>
            <strong>BrainHack TIL-AI 2026 · 1st Place</strong>
          </div>
        </div>
      </div>

      <div className="toolkit-board" data-reveal>
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
          <h3>Achievement badges</h3>
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
          <h3>Profile completion</h3>
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
