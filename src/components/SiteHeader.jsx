import { useRef } from 'react';
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
  function handleKeyDown(event, index) {
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
          <ul className="nav-list" role="tablist" aria-label="Portfolio sections">
            {navigation.map((item, index) => (
              <li key={item.href} role="presentation">
                <a href={item.href} role="tab" id={`${item.id}-nav-tab`} aria-controls={`${item.id}-section`}
                  aria-selected={activeSection === item.id} tabIndex={activeSection === item.id ? 0 : -1}
                  ref={element => { navRefs.current[index] = element; }} onKeyDown={event => handleKeyDown(event, index)}>{item.label}</a>
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
