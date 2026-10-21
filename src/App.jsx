import { useEffect, useState } from 'react';

import Archive from './components/Archive.jsx';
import Achievements from './components/Achievements.jsx';
import Contact, { SiteFooter } from './components/Contact.jsx';
import Hero from './components/Hero.jsx';
import OffDuty from './components/OffDuty.jsx';
import Pokedex from './components/Pokedex.jsx';
import ProjectGrid from './components/ProjectGrid.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import Toolkit from './components/Toolkit.jsx';
import TeamGallery from './components/TeamGallery.jsx';

const sectionForHash = (hash) => ({
  '#builds': 'projects', '#experience': 'experience', '#toolkit': 'skills', '#achievements': 'awards',
}[hash] || 'profile');

export default function App() {
  const [activeSection, setActiveSection] = useState(() => sectionForHash(window.location.hash));
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    function syncSection() {
      setCurrentHash(window.location.hash);
      if (['#contact', '#main-content'].includes(window.location.hash)) return;
      setActiveSection(sectionForHash(window.location.hash));
    }
    window.addEventListener('hashchange', syncSection);
    return () => window.removeEventListener('hashchange', syncSection);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const targetId = window.location.hash.slice(1);
      const target = document.getElementById(targetId);
      const disclosure = target?.closest('details');
      if (disclosure) disclosure.open = true;
      if (target && !target.closest('[hidden]')) target.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    });
    return () => cancelAnimationFrame(frame);
  }, [activeSection, currentHash]);

  useEffect(() => {
    const root = document.documentElement;
    let frameId;

    function updateScrollProgress() {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        root.style.setProperty('--scroll-progress', Math.min(Math.max(progress, 0), 1));
        document.body.classList.toggle('has-scrolled', window.scrollY > 24);
      });
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      cancelAnimationFrame(frameId);
      document.body.classList.remove('has-scrolled');
    };
  }, []);

  return (
    <div className="site" data-active-section={activeSection} id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <SiteHeader activeSection={activeSection} />
      <main id="main-content">
        <div role="tabpanel" id="profile-section" aria-labelledby="profile-nav-tab" hidden={activeSection !== 'profile'} tabIndex={0}>
          <Hero />
          <Pokedex />
          <details className="personal-details section-shell">
            <summary>Beyond the code <span>Teams, travel & interests</span></summary>
            <TeamGallery />
            <OffDuty />
          </details>
        </div>
        <div role="tabpanel" id="projects-section" aria-labelledby="projects-nav-tab" hidden={activeSection !== 'projects'} tabIndex={0}><ProjectGrid /></div>
        <div role="tabpanel" id="experience-section" aria-labelledby="experience-nav-tab" hidden={activeSection !== 'experience'} tabIndex={0}><Archive /></div>
        <div role="tabpanel" id="skills-section" aria-labelledby="skills-nav-tab" hidden={activeSection !== 'skills'} tabIndex={0}><Toolkit /></div>
        <div role="tabpanel" id="awards-section" aria-labelledby="awards-nav-tab" hidden={activeSection !== 'awards'} tabIndex={0}><Achievements /></div>
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
