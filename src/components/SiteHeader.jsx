const navigation = [
  { label: 'Profile', href: '#profile' },
  { label: 'Index', href: '#pokedex' },
  { label: 'Projects', href: '#builds' },
  { label: 'Timeline', href: '#experience' },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#top" aria-label="Ian Wangsa, back to top">
          <span aria-hidden="true">IW</span>
          <span className="wordmark-text">IAN WANGSA</span>
        </a>

        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map((item, index) => (
              <li key={item.href}>
                <a href={item.href}>
                  <span aria-hidden="true">0{index + 1}</span> {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="header-cta" href="#contact">
          Contact
        </a>
      </div>
    </header>
  );
}
