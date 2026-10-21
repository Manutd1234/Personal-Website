import { useEffect } from 'react';

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

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    const revealTargets = [...document.querySelectorAll('[data-reveal]')];
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

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
    } else {
      revealTargets.forEach((target) => target.classList.add('reveal-ready'));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      revealTargets.forEach((target) => observer.observe(target));
      window.addEventListener('scroll', updateScrollProgress, { passive: true });
      updateScrollProgress();

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', updateScrollProgress);
        cancelAnimationFrame(frameId);
        document.body.classList.remove('has-scrolled');
      };
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
    <div className="site" id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <Pokedex />
        <ProjectGrid />
        <TeamGallery />
        <Archive />
        <Toolkit />
        <Achievements />
        <OffDuty />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
