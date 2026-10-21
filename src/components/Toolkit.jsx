import { useId, useRef, useState } from 'react';

import { skillGroups, spokenLanguages } from '../data/portfolio.js';
import SectionKicker from './SectionKicker.jsx';
import '../credentials.css';
import '../skills-dynamic.css';

const allSkills = 'all';

function matchingItems(group, query) {
  if (!query || group.label.toLocaleLowerCase().includes(query)) return group.items;
  return group.items.filter((item) => item.toLocaleLowerCase().includes(query));
}

export default function Toolkit() {
  const [category, setCategory] = useState(skillGroups[0].label);
  const [search, setSearch] = useState('');
  const searchId = useId();
  const resultsId = useId();
  const searchRef = useRef(null);
  const query = search.trim().toLocaleLowerCase();
  const groups = skillGroups.map((group, index) => ({
    ...group,
    index,
    matches: matchingItems(group, query),
  }));
  const totalMatches = groups.reduce((total, group) => total + group.matches.length, 0);
  const visibleGroups = groups.filter((group) => (category === allSkills || group.label === category) && group.matches.length);
  const visibleCount = visibleGroups.reduce((total, group) => total + group.matches.length, 0);
  const filters = [
    { value: allSkills, label: 'All', count: totalMatches },
    ...groups.map((group) => ({ value: group.label, label: group.label, count: group.matches.length })),
  ];

  function resetFilters() {
    setCategory(allSkills);
    setSearch('');
  }

  return (
    <section className="content-section section-shell toolkit-section career-toolkit skills-browser" id="toolkit" aria-labelledby="toolkit-title">
      <div className="toolkit-intro skills-intro" data-reveal>
        <SectionKicker number="05" label="Toolkit" />
        <h2 id="toolkit-title">Skills & <em>languages.</em></h2>
        <p>
          My projects span apps, applied AI and quantitative research. Here’s the toolkit I use across work, coursework and team builds.
        </p>

        <a className="toolkit-credentials-link" href="#achievements">Awards & credentials <span aria-hidden="true">↗</span></a>
      </div>

      <div className="skills-workspace">
        <div className="skills-search">
          <label htmlFor={searchId}>Find a skill</label>
          <div className="skills-search-field">
            <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
            </svg>
            <input
              aria-controls={resultsId}
              autoComplete="off"
              id={searchId}
              onChange={(event) => { setSearch(event.target.value); setCategory(allSkills); }}
              placeholder="Python, React, AWS…"
              ref={searchRef}
              type="search"
              value={search}
            />
            {search && <button aria-label="Clear skill search" onClick={() => setSearch('')} type="button">×</button>}
          </div>
        </div>

        <div aria-label="Filter skills by category" className="skills-filters" role="group">
          {filters.map((filter) => (
            <button
              aria-controls={resultsId}
              aria-pressed={category === filter.value}
              key={filter.value}
              onClick={() => setCategory(filter.value)}
              type="button"
            >
              {filter.label} <span>{filter.count}</span>
            </button>
          ))}
        </div>
        <label className="skills-mobile-filter">
          <span>Browse a category</span>
          <select aria-controls={resultsId} onChange={(event) => setCategory(event.target.value)} value={category}>
            {filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label} ({filter.count})</option>)}
          </select>
        </label>

        <div className="skills-result-bar">
          <p aria-live="polite" role="status">
            <strong>{visibleCount}</strong> {visibleCount === 1 ? 'skill' : 'skills'}
            {category === allSkills ? ` across ${visibleGroups.length} ${visibleGroups.length === 1 ? 'category' : 'categories'}` : ' in this category'}
          </p>
          <button disabled={category === allSkills && !search} onClick={resetFilters} type="button">Reset filters <span aria-hidden="true">↗</span></button>
        </div>

        <div className="skills-results" data-single={visibleGroups.length === 1} id={resultsId} key={`${category}:${query}`}>
          {visibleGroups.map((group, index) => (
            <article className="skills-category-card" data-tone={group.index % 4} key={group.label} style={{ '--skills-order': index }}>
              <div className="skills-category-heading">
                <span aria-hidden="true" className="skills-category-number">{String(group.index + 1).padStart(2, '0')}</span>
                <h3>{group.label}</h3>
                <span className="skills-category-count">{group.matches.length}</span>
              </div>
              <ul aria-label={group.label}>
                {group.matches.map((item, itemIndex) => <li key={item} style={{ '--skill-order': itemIndex }}>{item}</li>)}
              </ul>
            </article>
          ))}
          {!visibleGroups.length && (
            <div className="skills-empty">
              <h3>No matching skills here.</h3>
              <p>Try another term{category !== allSkills ? ' or look across all categories' : ''}.</p>
              <div>
                {category !== allSkills && totalMatches > 0 && <button onClick={() => { setCategory(allSkills); searchRef.current?.focus(); }} type="button">Search all categories</button>}
                <button onClick={() => { resetFilters(); searchRef.current?.focus(); }} type="button">Reset filters</button>
              </div>
            </div>
          )}
        </div>

        <div className="skills-communication">
          <div className="skills-communication-intro">
            <span>Beyond programming</span>
            <h3>Spoken languages</h3>
          </div>
          <dl>
            {spokenLanguages.map((language, index) => (
              <div key={language.title} style={{ '--language-order': index }}>
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
