import { useRef, useState } from 'react';
import '../hobbies.css';

const imageBase = `${import.meta.env.BASE_URL}images/hobbies/`;
const hobbies = [
  {
    title: 'Gym',
    image: 'gym-nenad-stojkovic.webp',
    alt: 'A gym interior with strength-training equipment',
    width: 1600, height: 1067,
    text: 'Time away from the laptop, getting stronger and clearing my head.',
    credit: true,
  },
  {
    title: 'Travel',
    image: 'travel-alpine.webp',
    alt: 'Ian travelling in an alpine landscape',
    width: 1200, height: 1600,
    text: 'Exploring somewhere new, taking photos, and enjoying a change of scenery.',
  },
  {
    title: 'Good food',
    image: 'food-chicken-rice.webp',
    alt: 'A plate of roast chicken rice with chilli',
    width: 1130, height: 1600,
    text: 'Trying new places to eat, with plenty of room for old favourites like chicken rice.',
  },
  {
    title: 'Learning',
    image: 'learning-sap-workshop.webp',
    alt: 'Participants learning together at a SAP S.C.A.L.E workshop',
    width: 1600, height: 1067,
    text: 'Picking up new ideas through workshops, side projects, and conversations.',
    caption: 'At a SAP S.C.A.L.E workshop.',
  },
];

export default function OffDuty() {
  const [selected, setSelected] = useState(1);
  const tabRefs = useRef([]);
  const hobby = hobbies[selected];
  function navigate(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % hobbies.length
      : event.key === 'ArrowLeft' ? (index + hobbies.length - 1) % hobbies.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? hobbies.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }
  return (
    <section className="hobbies-section" id="off-duty" aria-label="Beyond the code">
      <div className="hobby-tabs" role="tablist" aria-label="Hobbies">
        {hobbies.map((item, index) => (
          <button aria-controls={`hobby-${index}-panel`} aria-selected={selected === index}
            id={`hobby-${index}-tab`} key={item.title} onClick={() => setSelected(index)}
            onKeyDown={event => navigate(event, index)} ref={element => { tabRefs.current[index] = element; }}
            role="tab" tabIndex={selected === index ? 0 : -1} type="button">{item.title}</button>
        ))}
      </div>
      {hobbies.map((item, index) => (
        <div aria-labelledby={`hobby-${index}-tab`} hidden={selected !== index}
          id={`hobby-${index}-panel`} key={item.title} role="tabpanel" tabIndex={0}>
          {selected === index ? (
            <article className="hobby-postcard" key={hobby.title}>
              <figure>
                <img alt={hobby.alt} decoding="async" height={hobby.height} loading="lazy" src={`${imageBase}${hobby.image}`} width={hobby.width} />
                <figcaption>{hobby.caption || (hobby.credit ? 'A little time away from the screen.' : hobby.title === 'Travel' ? 'Somewhere in the Alps.' : 'Always room for good food.')}</figcaption>
              </figure>
              <div className="hobby-postcard-copy">
                <p className="hobby-number">{String(selected + 1).padStart(2, '0')} / 04</p>
                <h3>{hobby.title}</h3>
                <p>{hobby.text}</p>
                {hobby.credit ? (
                  <p className="hobby-photo-credit">
                    Illustrative gym photo by{' '}
                    <a href="https://commons.wikimedia.org/wiki/File:Design_and_equipment_in_modern_gym.jpg" rel="noreferrer" target="_blank">Nenad Stojković (Shixart1985) / Wikimedia Commons</a>
                    {' '}· <a href="https://creativecommons.org/licenses/by/2.0/" rel="noreferrer" target="_blank">CC BY 2.0</a>. Resized and converted to WebP.
                  </p>
                ) : null}
              </div>
            </article>
          ) : null}
        </div>
      ))}
    </section>
  );
}
