import { ArrowUpRightIcon } from './Icons.jsx';

const navigation = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#builds' },
  { label: 'Experience', href: '#experience' },
  { label: 'Toolkit', href: '#toolkit' },
];

export default function SiteHeader() {
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
          <ul className="nav-list">
            {navigation.map((item, index) => (
              <li key={item.href}>
                <a href={item.href}><span aria-hidden="true">0{index + 1}</span>{item.label}</a>
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
