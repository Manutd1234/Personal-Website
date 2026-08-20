const imageBase = `${import.meta.env.BASE_URL}images/`;

const fieldNotes = [
  {
    label: 'Travel',
    text: 'A change of terrain is usually the fastest way to find a different angle on a stubborn problem.',
  },
  {
    label: 'Team sport',
    text: 'Years of competitive softball shaped how I think about preparation, trust, and showing up for a team.',
  },
  {
    label: 'Teaching',
    text: 'Working with young learners and inclusive programmes keeps technical communication grounded in people.',
  },
];

export default function OffDuty() {
  return (
    <section className="content-section section-shell" id="off-duty" aria-labelledby="off-duty-title">
      <div className="off-duty-card">
        <figure className="travel-frame">
          <img
            alt="Ian riding a mountain cable car above an alpine forest"
            decoding="async"
            height="1600"
            loading="lazy"
            src={`${imageBase}ian-alpine-1200.webp`}
            width="1200"
          />
          <figcaption>
            <span>FIELD NOTE 02</span>
            <span>OFF-DUTY / ON THE MOVE</span>
          </figcaption>
        </figure>

        <div className="off-duty-copy">
          <p className="eyebrow">06 / BEYOND THE TERMINAL</p>
          <h2 id="off-duty-title">Curiosity travels well.</h2>
          <p className="off-duty-lead">
            The best engineering work is technical and human. I make space for unfamiliar places, team sport,
            and teaching because each one sharpens a different kind of attention.
          </p>

          <dl className="field-note-list">
            {fieldNotes.map((note, index) => (
              <div key={note.label}>
                <dt>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {note.label}
                </dt>
                <dd>{note.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
