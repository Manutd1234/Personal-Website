import { profile } from '../data/portfolio.js';
import { ArrowUpRightIcon } from './Icons.jsx';
import SectionKicker from './SectionKicker.jsx';

export default function Pokedex() {
  return (
    <section className="pokedex-section section-shell" id="about" aria-labelledby="pokedex-title">
      <div className="about-editorial">
        <div><SectionKicker label="A little context" /><h2 id="pokedex-title">About me</h2></div>
        <div className="about-prose">
          <p>I study Computer Science at NUS, with a second major in Mathematics and a minor in Economics.
            I like projects where I can work through the whole problem, from the data and backend to the part someone actually uses.</p>
          <p>So far, that has included quantitative research at Caerus, product work at a startup,
            recruitment tools at CTES, and AI developer tools at Accenture. Before university, I served as a signals commander in the RSAF.</p>
          <p>Outside work, you’ll find me at the gym, travelling, finding good food, or learning something new.</p>
          <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">More on LinkedIn <ArrowUpRightIcon size={15} /></a>
        </div>
      </div>
    </section>
  );
}
