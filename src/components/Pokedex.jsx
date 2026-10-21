import { profile } from '../data/portfolio.js';
import { ArrowUpRightIcon, LinkedInIcon, SparkIcon } from './Icons.jsx';
import SectionKicker from './SectionKicker.jsx';

const disciplines = [
  {
    number: '01',
    title: 'Applied intelligence',
    copy: 'Evidence-grounded agents and ML systems designed around the decisions people actually need to make.',
    signal: 'AI / ML',
  },
  {
    number: '02',
    title: 'Quantitative systems',
    copy: 'Research and market-data infrastructure where latency, costs, validation, and failure modes are explicit.',
    signal: 'DATA / RISK',
  },
  {
    number: '03',
    title: 'Product engineering',
    copy: 'Full-stack workflows that connect a clear interface to secure services, durable data, and reliable operations.',
    signal: 'SHIP / SCALE',
  },
];

const operatingLoop = [
  { value: '01', label: 'Frame the operator problem' },
  { value: '02', label: 'Make failure modes explicit' },
  { value: '03', label: 'Prototype with evidence' },
  { value: '04', label: 'Ship, observe, improve' },
];

export default function Pokedex() {
  return (
    <section className="pokedex-section section-shell" id="about" aria-labelledby="pokedex-title" data-reveal>
      <SectionKicker number="02" label="How I work" />

      <div className="about-grid">
        <article className="about-statement">
          <div className="eyebrow"><SparkIcon size={16} /> Computer Science · NUS</div>
          <h2 id="pokedex-title">Technical depth.<br /><em>Operator empathy.</em></h2>
          <p>{profile.summary}</p>
          <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon size={18} /> Read the full profile <ArrowUpRightIcon size={16} />
          </a>
        </article>

        <div className="discipline-list">
          {disciplines.map((discipline) => (
            <article className="discipline-card" key={discipline.title}>
              <div className="discipline-meta">
                <span>{discipline.number}</span>
                <small>{discipline.signal}</small>
              </div>
              <h3>{discipline.title}</h3>
              <p>{discipline.copy}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="proof-line" aria-label="Ian's engineering process">
        {operatingLoop.map((step) => (
          <div key={step.label}>
            <strong>{step.value}</strong>
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
