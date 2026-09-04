import { ArrowUpRightIcon } from './Icons.jsx';

const navigation = [
  { label: 'Player', href: '#about' },
  { label: 'Quests', href: '#builds' },
  { label: 'History', href: '#experience' },
  { label: 'Inventory', href: '#toolkit' },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#top" aria-label="Ian Wangsa, back to top">
          <span className="wordmark-mark" aria-hidden="true">IW</span>
          <span className="wordmark-text">
            Ian Wangsa
            <small>System builder · LV. 21</small>
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
          Connect <ArrowUpRightIcon size={16} />
        </a>
      </div>
    </header>
  );
}
