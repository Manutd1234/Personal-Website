import { teamMoments } from '../data/media.js';
import { MediaFigure } from './ProjectGrid.jsx';
import '../project-media.css';

export default function TeamGallery() {
  const moments = teamMoments.filter((moment) => moment.src);
  if (!moments.length) return null;

  return (
    <section aria-labelledby="team-gallery-title" className="content-section section-shell team-section" id="teams">
      <div className="portfolio-team-heading" data-reveal>
        <div>
          <p className="portfolio-section-eyebrow">Along the way</p>
          <h2 id="team-gallery-title">Good work takes <em>good people.</em></h2>
        </div>
        <p>Competition days, shared challenges, and the teams behind the work.</p>
      </div>
      <div className={`portfolio-team-grid${moments.length % 2 === 0 ? ' portfolio-team-grid-even' : ''}`}>
        {moments.map((moment) => (
          <article className="portfolio-team-moment" key={`${moment.title}-${moment.src}`}>
            <MediaFigure className="portfolio-team-image" media={{ ...moment, kind: 'photo' }} title={moment.title} />
            <h3>{moment.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
