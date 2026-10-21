import { useEffect, useRef, useState } from 'react';

import '../rolling-words.css';

const roles = [
  'a software builder',
  'an AI enthusiast',
  'a quant researcher',
  'a curious learner',
];

const fullIntroduction = 'I’m a software builder, an AI enthusiast, a quant researcher, and a curious learner.';

export default function RollingWords() {
  const rootRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState({ role: 0, length: 0, deleting: false });
  const running = !reducedMotion && visible;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    updatePreference();
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    const bounds = element.getBoundingClientRect();
    let inViewport = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const updateVisibility = () => {
      setVisible(inViewport && document.visibilityState === 'visible' && !element.closest('[hidden], [aria-hidden="true"], [inert]'));
    };
    const observer = new MutationObserver(updateVisibility);
    // The profile stays mounted while another main tab is selected.
    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['hidden', 'aria-hidden', 'inert'] });
    }
    const intersection = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      updateVisibility();
    });
    intersection.observe(element);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => {
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const fullRole = roles[typed.role];
    const delay = typed.deleting
      ? (typed.length ? 35 : 350)
      : (typed.length === fullRole.length ? 1800 : 75);
    const timer = window.setTimeout(() => {
      setTyped((current) => {
        if (!current.deleting) {
          return current.length < roles[current.role].length
            ? { ...current, length: current.length + 1 }
            : { ...current, deleting: true };
        }
        return current.length
          ? { ...current, length: current.length - 1 }
          : { role: (current.role + 1) % roles.length, length: 0, deleting: false };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [running, typed]);

  return (
    <div className="rolling-words" data-running={running} ref={rootRef}>
      <p className="rolling-words-accessible">{fullIntroduction}</p>
      {reducedMotion ? (
        <p aria-hidden="true" className="rolling-words-static">{fullIntroduction}</p>
      ) : (
        <p aria-hidden="true" className="rolling-words-line">
          <span className="rolling-words-prefix">I’m</span>
          <span className="rolling-words-window">
            <span className="rolling-words-sizing">
              {roles.map((role) => <span key={role}>{role}</span>)}
            </span>
            <span className="rolling-words-word">
              {roles[typed.role].slice(0, typed.length)}<span className="rolling-words-cursor" />
            </span>
          </span>
        </p>
      )}
    </div>
  );
}
