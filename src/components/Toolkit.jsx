import { skillGroups, spokenLanguages } from '../data/portfolio.js';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';

export default function Toolkit() {
  return (
    <section className="content-section section-shell toolkit-section career-toolkit" id="toolkit" aria-labelledby="toolkit-title">
      <div className="toolkit-intro" data-reveal>
        <SectionKicker number="05" label="Toolkit" />
        <h2 id="toolkit-title">What I build <em>with.</em></h2>
        <p>
          The languages, frameworks, and engineering tools I use across work, research, coursework, and team projects.
        </p>

        <a className="toolkit-credentials-link" href="#achievements">Awards & credentials <span aria-hidden="true">↗</span></a>
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

        <div className="spoken-language-block">
          <div>
            <span className="archive-index">Communication</span>
            <h3>Spoken languages</h3>
          </div>
          <dl>
            {spokenLanguages.map((language) => (
              <div key={language.title}>
                <dt>{language.title}</dt>
                <dd>{language.level}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
