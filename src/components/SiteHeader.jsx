import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRightIcon } from './Icons.jsx';

const navigation = [
  { id: 'profile', label: 'Profile', href: '#profile' },
  { id: 'projects', label: 'Projects', href: '#builds' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'skills', label: 'Skills', href: '#toolkit' },
  { id: 'awards', label: 'Awards', href: '#achievements' },
];

export default function SiteHeader({ activeSection }) {
  const navRefs = useRef([]);
  const listRef = useRef(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    const updateIndicator = () => {
      const selected = navRefs.current[navigation.findIndex(item => item.id === activeSection)];
      if (!selected) return;
      list.style.setProperty('--nav-x', `${selected.offsetLeft}px`);
      list.style.setProperty('--nav-y', `${selected.offsetTop}px`);
      list.style.setProperty('--nav-width', `${selected.offsetWidth}px`);
      list.style.setProperty('--nav-height', `${selected.offsetHeight}px`);
      list.dataset.positioned = 'true';
    };
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeSection]);
  function navigate(event, href) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (window.location.hash !== href) {
      window.history.pushState(null, '', href);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function handleKeyDown(event, index) {
    if (event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? navigation.length - 1 :
      (index + (event.key === 'ArrowRight' ? 1 : -1) + navigation.length) % navigation.length;
    navRefs.current[next]?.focus();
    navRefs.current[next]?.click();
  }
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#top" aria-label="Ian Wangsa, back to top">
          <span className="wordmark-mark" aria-hidden="true">IW</span>
          <span className="wordmark-text">
            Ian Wangsa
            <small>Software engineer</small>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          <ul className="nav-list" ref={listRef} role="tablist" aria-label="Portfolio sections">
            {navigation.map((item, index) => (
              <li key={item.href} role="presentation">
                <a href={item.href} role="tab" id={`${item.id}-nav-tab`} aria-controls={`${item.id}-section`}
                  aria-selected={activeSection === item.id} tabIndex={activeSection === item.id ? 0 : -1}
                  ref={element => { navRefs.current[index] = element; }} onClick={event => navigate(event, item.href)} onKeyDown={event => handleKeyDown(event, index)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="header-cta" href="#contact">
          Let&apos;s talk <ArrowUpRightIcon size={16} />
        </a>
      </div>
    </header>
  );
}
