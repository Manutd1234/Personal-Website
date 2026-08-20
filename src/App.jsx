import Archive from './components/Archive.jsx';
import Contact, { SiteFooter } from './components/Contact.jsx';
import Hero from './components/Hero.jsx';
import OffDuty from './components/OffDuty.jsx';
import ProjectGrid from './components/ProjectGrid.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import Toolkit from './components/Toolkit.jsx';

export default function App() {
  return (
    <div className="site" id="top">
      <div className="paper-grain" aria-hidden="true" />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <ProjectGrid />
        <Archive />
        <Toolkit />
        <OffDuty />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
