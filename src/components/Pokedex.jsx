import { profile } from '../data/portfolio.js';
import { ArrowUpRightIcon, LinkedInIcon, SparkIcon } from './Icons.jsx';
import PixelSprite from './PixelSprites.jsx';

const disciplines = [
  {
    number: '01',
    title: 'Applied intelligence',
    copy: 'Evidence-grounded agents and ML systems designed around the decisions people actually need to make.',
    signal: 'AI / ML',
    sprite: 'circuit',
  },
  {
    number: '02',
    title: 'Quantitative systems',
    copy: 'Research and market-data infrastructure where latency, costs, validation, and failure modes are explicit.',
    signal: 'DATA / RISK',
    sprite: 'signal',
  },
  {
    number: '03',
    title: 'Product engineering',
    copy: 'Full-stack workflows that connect a clear interface to secure services, durable data, and reliable operations.',
    signal: 'SHIP / SCALE',
    sprite: 'stack',
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
      <div className="section-kicker">
        <span>02</span>
        <p>Player stats</p>
      </div>

      <div className="about-grid">
        <article className="about-statement">
          <div className="eyebrow"><SparkIcon size={16} /> Player profile loaded</div>
          <h2 id="pokedex-title">Choose your <em>build path.</em></h2>
          <p>{profile.summary}</p>
          <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon size={18} /> Read the full profile <ArrowUpRightIcon size={16} />
          </a>
        </article>

        <div className="discipline-list">
          {disciplines.map((discipline) => (
            <article className="discipline-card" key={discipline.title}>
              <div className="discipline-sprite">
                <PixelSprite type={discipline.sprite} />
                <span aria-hidden="true" />
              </div>
              <div className="discipline-meta">
                <span>{discipline.number}</span>
                <small>{discipline.signal}</small>
              </div>
              <div className="discipline-copy">
                <h3>{discipline.title}</h3>
                <p>{discipline.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="proof-line" aria-label="Ian's engineering process">
        <p className="proof-title">SYSTEM BUILD LOOP</p>
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
