import { useEffect, useId, useRef, useState } from 'react';
import '../book-carousel.css';

const coverDesigns = [
  { title: 'AlphaEngine', subtitle: 'Markets, data & execution', color: '#007c59', ink: '#fff8dc' },
  { title: 'BrainHack', subtitle: 'TIL-AI · Novice Champions', color: '#f4d875', ink: '#183e31' },
  { title: 'Delta1', subtitle: 'Notes on systematic trading', color: '#4b9c80', ink: '#fffbed' },
  { title: 'RE:DECIDE', subtitle: 'A closer look at the game', color: '#b6e6b9', ink: '#173e2f' },
  { title: 'FraudCrew', subtitle: 'AI with a human in the loop', color: '#225b43', ink: '#f7edbc' },
];
const mod = (value, length) => ((value % length) + length) % length;
const assetUrl = src => `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;

function Book({ project, media, index }) {
  const design = coverDesigns[index % coverDesigns.length];
  return (
    <span className="book-object" style={{ '--cover': design.color, '--cover-ink': design.ink }}>
      <span className="book-back" aria-hidden="true"><span>IAN WANGSA</span><span>{design.title}</span><small>PROJECT NOTES / {String(index + 1).padStart(2, '0')}</small></span>
      <span className="book-spine" aria-hidden="true"><b>{design.title}</b><small>IW</small></span>
      <span className="book-pages book-pages-side" aria-hidden="true" />
      <span className="book-pages book-pages-top" aria-hidden="true" />
      <span className="book-pages book-pages-bottom" aria-hidden="true" />
      <span className="book-front" aria-hidden="true">
        <span className="book-cover-edition">IAN WANGSA <span>VOL. {String(index + 1).padStart(2, '0')}</span></span>
        <span className="book-cover-title">{design.title}</span>
        <span className="book-cover-subtitle">{design.subtitle}</span>
        {media?.src ? <span className="book-cover-image"><img alt="" draggable="false" src={assetUrl(media.src)} /></span> : null}
        <span className="book-cover-footer">{project.category}<span>→</span></span>
      </span>
    </span>
  );
}

export default function BookCarousel({ projects, media, renderDetails, active = true }) {
  const count = projects.length;
  const step = 360 / count;
  const [rotation, setRotation] = useState(0);
  const [opened, setOpened] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [returning, setReturning] = useState(false);
  const [radius, setRadius] = useState(340);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const angleRef = useRef(0);
  const animationRef = useRef(null);
  const gestureRef = useRef(null);
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const detailRef = useRef(null);
  const bookRefs = useRef([]);
  const returnFocusRef = useRef(false);
  const lastOpenedRef = useRef(0);
  const uniqueId = useId();
  const current = mod(Math.round(-rotation / step), count);

  function updateAngle(angle) { angleRef.current = angle; setRotation(angle); }
  function stopAnimation() { cancelAnimationFrame(animationRef.current); animationRef.current = null; }
  function rotateTo(target, focusBook = false) {
    stopAnimation();
    const from = angleRef.current;
    if (reducedMotion) {
      updateAngle(target);
      if (focusBook) bookRefs.current[mod(Math.round(-target / step), count)]?.focus({ preventScroll: true });
      return;
    }
    const start = performance.now();
    const duration = Math.min(900, 480 + Math.abs(target - from) * 1.2);
    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      updateAngle(from + (target - from) * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) animationRef.current = requestAnimationFrame(frame);
      else {
        animationRef.current = null;
        if (focusBook) bookRefs.current[mod(Math.round(-target / step), count)]?.focus({ preventScroll: true });
      }
    }
    animationRef.current = requestAnimationFrame(frame);
  }
  function browse(direction, focusBook = false) {
    const target = Math.round(angleRef.current / step) * step - direction * step;
    rotateTo(target, focusBook);
  }
  function choose(index, focusBook = false) {
    const present = mod(Math.round(-angleRef.current / step), count);
    let distance = index - present;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    rotateTo(Math.round(angleRef.current / step) * step - distance * step, focusBook);
  }
  function openBook(index) {
    stopAnimation();
    gestureRef.current = null;
    setDragging(false);
    lastOpenedRef.current = index;
    setReturning(false);
    setOpened(index);
  }
  function closeBook() {
    returnFocusRef.current = true;
    setReturning(!reducedMotion);
    setOpened(null);
  }

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { stopAnimation(); setReducedMotion(query.matches); };
    const pause = () => { if (document.hidden) stopAnimation(); };
    query.addEventListener('change', sync);
    document.addEventListener('visibilitychange', pause);
    return () => { stopAnimation(); query.removeEventListener('change', sync); document.removeEventListener('visibilitychange', pause); };
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setRadius(Math.max(172, Math.min(360, entry.contentRect.width * .34))));
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (opened !== null) detailRef.current?.focus({ preventScroll: true });
    else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      bookRefs.current[lastOpenedRef.current]?.focus({ preventScroll: true });
    }
  }, [opened]);

  useEffect(() => {
    if (!active) {
      stopAnimation();
      gestureRef.current = null;
      setDragging(false);
    }
  }, [active]);

  useEffect(() => {
    if (!returning) return undefined;
    const timeout = window.setTimeout(() => setReturning(false), 700);
    return () => window.clearTimeout(timeout);
  }, [returning]);

  function onPointerDown(event) {
    if (opened !== null || !event.isPrimary || event.button !== 0) return;
    stopAnimation();
    setReturning(false);
    // A browser can target the scene plane for a cover behind it in 3D.
    // Resolve the painted cover at this point before capturing the gesture.
    const hitBook = event.target.closest('[data-book-index]') || document.elementsFromPoint(event.clientX, event.clientY)
      .filter(element => sceneRef.current.contains(element))
      .map(element => element.closest('[data-book-index]')).find(Boolean);
    gestureRef.current = {
      pointer: event.pointerId, x: event.clientX, y: event.clientY,
      lastX: event.clientX, time: performance.now(), velocity: 0,
      startAngle: angleRef.current, moved: false,
      book: hitBook?.dataset.bookIndex,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event) {
    const gesture = gestureRef.current;
    if (!gesture || opened !== null) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      gestureRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    if (!gesture.moved && Math.abs(dx) < 7) return;
    gesture.moved = true;
    setDragging(true);
    const now = performance.now();
    const multiplier = radius < 230 ? .38 : .25;
    gesture.velocity = (event.clientX - gesture.lastX) / Math.max(8, now - gesture.time) * multiplier;
    gesture.lastX = event.clientX;
    gesture.time = now;
    updateAngle(gesture.startAngle + dx * multiplier);
  }
  function onPointerUp(event) {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    setDragging(false);
    if (!gesture) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!gesture.moved) {
      if (gesture.book !== undefined) openBook(Number(gesture.book));
      return;
    }
    const velocity = performance.now() - gesture.time < 100 ? Math.max(-.8, Math.min(.8, gesture.velocity)) : 0;
    const destination = Math.round((angleRef.current + (reducedMotion ? 0 : velocity * 170)) / step) * step;
    rotateTo(destination);
  }
  function onPointerCancel() {
    if (!gestureRef.current) return;
    gestureRef.current = null;
    setDragging(false);
    rotateTo(Math.round(angleRef.current / step) * step);
  }
  function onKeys(event) {
    if (event.target.closest('dialog')) return;
    if (opened !== null) {
      if (event.key === 'Escape') { event.preventDefault(); closeBook(); }
      return;
    }
    if (event.target.closest('a, select, input, textarea, summary')) return;
    const inScene = sceneRef.current?.contains(event.target);
    if (!inScene) return;
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') browse(event.key === 'ArrowRight' ? 1 : -1, event.target !== sceneRef.current);
      else choose(event.key === 'Home' ? 0 : count - 1, event.target !== sceneRef.current);
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target === sceneRef.current) {
      event.preventDefault(); openBook(current);
    }
  }

  return (
    <section className="book-stage" data-open={opened !== null} data-dragging={dragging} data-returning={returning} onKeyDown={onKeys} ref={stageRef} aria-label="Featured project library">
      <div className="book-stage-header">
        <span className="book-library-label">THE PROJECT LIBRARY <span>{String(count).padStart(2, '0')} VOLUMES</span></span>
        {opened !== null ? <button className="book-close" onClick={closeBook} type="button">← Back to the books <span aria-hidden="true">Esc</span></button> : <span className="book-drag-hint">Drag to rotate · Click a book to open</span>}
      </div>
      <div className="book-theatre">
        <div aria-label="Project books. Drag to rotate, or use left and right arrow keys. Press Enter to open the front book." aria-roledescription="carousel" className="book-scene" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} ref={sceneRef} role="region" tabIndex={opened === null ? 0 : -1}>
          {projects.map((project, index) => {
            const theta = (index * step + rotation) * Math.PI / 180;
            const x = Math.sin(theta) * radius;
            const z = Math.cos(theta) * radius - radius;
            const y = (Math.cos(theta) - 1) * 26;
            const selected = opened === index;
            return (
              <div className="book-orbit-item" data-selected={selected} data-return-book={index === lastOpenedRef.current} key={project.title}
                style={{ '--orbit-x': `${x.toFixed(3)}px`, '--orbit-y': `${y.toFixed(3)}px`, '--orbit-z': `${z.toFixed(3)}px`, '--book-order': index }}>
                <button aria-label={`Open ${project.title} project details`} aria-hidden={opened !== null ? true : undefined}
                  aria-expanded={selected} aria-controls={`${uniqueId}-details`} className="book-click" data-book-index={index} disabled={opened !== null}
                  onClick={event => { if (event.detail === 0 && opened === null) openBook(index); }}
                  ref={element => { bookRefs.current[index] = element; }} tabIndex={opened === null && current === index ? 0 : -1} type="button">
                  <Book project={project} media={media[project.title]} index={index} />
                </button>
              </div>
            );
          })}
        </div>
        <div aria-label={opened !== null ? `${projects[opened].title} project details` : 'Project details'} className="book-details" hidden={opened === null} id={`${uniqueId}-details`} ref={detailRef} tabIndex={-1}>{opened !== null ? renderDetails(projects[opened]) : null}</div>
      </div>
      {opened === null ? <div className="book-browse-controls">
        <button aria-label="Rotate to previous book" className="book-arrow" onClick={() => browse(-1)} type="button">←</button>
        <div className="book-current"><span>{String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span><button onClick={() => openBook(current)} type="button">{projects[current].title} <span aria-hidden="true">↗</span></button></div>
        <button aria-label="Rotate to next book" className="book-arrow" onClick={() => browse(1)} type="button">→</button>
      </div> : null}
      {opened === null ? <div className="book-index" aria-label="Choose a project book">
        {projects.map((project, index) => <button aria-label={`Bring ${project.title} to the front`} aria-current={current === index ? 'true' : undefined} key={project.title} onClick={() => choose(index)} type="button"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="book-index-title">{coverDesigns[index].title}</span></button>)}
      </div> : null}
      <span className="book-screenreader-status" role="status">{opened === null && !dragging ? `Front book: ${projects[current].title}. ${current + 1} of ${count}.` : ''}</span>
    </section>
  );
}
