"use client";
import { MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import SkillsPanel from "./SkillsPanel";
import WorkPanel from "./WorkPanel";
import ProjectsPanel from "./ProjectsPanel";
import ProfilePanel from "./ProfilePanel";
import ContactPanel from "./ContactPanel";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    hash: "profile",
    title: "A little context",
  },
  {
    id: "projects",
    label: "Projects",
    hash: "builds",
    title: "Selected projects",
  },
  {
    id: "experience",
    label: "Experience",
    hash: "experience",
    title: "Experience & education",
  },
  {
    id: "skills",
    label: "Skills",
    hash: "toolkit",
    title: "Skills & languages",
  },
  {
    id: "awards",
    label: "Awards",
    hash: "achievements",
    title: "Awards & certificates",
  },
] as const;
type TabId = (typeof tabs)[number]["id"];
const aliases: Record<string, TabId> = {
  profile: "profile",
  about: "profile",
  top: "profile",
  builds: "projects",
  projects: "projects",
  teams: "projects",
  experience: "experience",
  work: "experience",
  education: "experience",
  community: "experience",
  leadership: "experience",
  volunteering: "experience",
  toolkit: "skills",
  skills: "skills",
  awards: "awards",
  achievements: "awards",
  certificates: "awards",
  competitions: "awards",
  academic: "awards",
  government: "awards",
  sport: "awards",
  service: "awards",
};
const sectionNumber = {
  projects: "02",
  experience: "03",
  skills: "04",
  awards: "05",
};
export default function Portfolio() {
  const [active, setActive] = useState<TabId>("profile");
  const [dark, setDark] = useState(false);
  const [projectRequest, setProjectRequest] = useState<{
    title: string;
    id: number;
  }>();
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (["main", "contact"].includes(hash)) return;
      setActive(aliases[hash] ?? "profile");
      if (aliases[hash])
        requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
    };
    sync();
    window.addEventListener("hashchange", sync);
    setDark(document.documentElement.classList.contains("dark"));
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  function navigate(id: TabId, history: "push" | "replace" = "push") {
    setActive(id);
    const hash = `#${tabs.find((tab) => tab.id === id)!.hash}`;
    if (window.location.hash !== hash) {
      if (history === "replace") window.history.replaceState(null, "", hash);
      else window.history.pushState(null, "", hash);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openProjects(projectTitle?: string) {
    if (projectTitle) {
      setProjectRequest((previous) => ({
        title: projectTitle,
        id: (previous?.id ?? 0) + 1,
      }));
    }
    navigate("projects");
  }
  function navKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    navigate(tabs[next].id, "replace");
    navRefs.current[next]?.focus({ preventScroll: true });
  }
  function theme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ian-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 350, damping: 34 }}
    >
      <div className="classic-site" id="top">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-emerald-700 focus:px-4 focus:py-3 focus:text-white"
          href="#main"
        >
          Skip to content
        </a>
        <header className="classic-header">
          <div className="classic-shell classic-header-inner">
            <a
              className="classic-wordmark"
              href="#profile"
              onClick={(event) => {
                event.preventDefault();
                navigate("profile");
              }}
              aria-label="Ian Wangsa, back to top"
            >
              <span>IW</span>
              <span className="classic-wordmark-text">
                Ian Wangsa<small>Software engineer</small>
              </span>
            </a>
            <nav aria-label="Primary navigation">
              <div
                className="classic-nav"
                role="tablist"
                aria-label="Portfolio sections"
              >
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`${tab.id}-tab`}
                    aria-controls={`${tab.id}-panel`}
                    aria-selected={active === tab.id}
                    tabIndex={active === tab.id ? 0 : -1}
                    ref={(el) => {
                      navRefs.current[index] = el;
                    }}
                    onKeyDown={(e) => navKeys(e, index)}
                    onClick={() => navigate(tab.id)}
                    className={active === tab.id ? "is-active" : ""}
                  >
                    {active === tab.id ? (
                      <motion.span
                        className="classic-nav-pill"
                        layoutId="main-tab-pill"
                      />
                    ) : null}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
            <div className="classic-header-actions">
              <button
                onClick={theme}
                className="classic-theme"
                aria-label={
                  dark ? "Switch to light theme" : "Switch to dark theme"
                }
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <a className="classic-header-contact" href="#contact">
                Let’s talk <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </header>
        <main id="main" className="classic-shell" tabIndex={-1}>
          {tabs.map((tab) => (
            <motion.section
              initial={false}
              animate={{
                opacity: active === tab.id ? 1 : 0,
                y: active === tab.id ? 0 : 6,
              }}
              transition={{ duration: 0.2 }}
              key={tab.id}
              id={`${tab.id}-panel`}
              role="tabpanel"
              aria-labelledby={`${tab.id}-tab`}
              hidden={active !== tab.id}
              tabIndex={0}
            >
              {tab.id === "profile" ? (
                <ProfilePanel openProjects={openProjects} />
              ) : (
                <>
                  <header className="classic-section-header">
                    <p className="classic-kicker">
                      {sectionNumber[tab.id]} — {tab.title}
                    </p>
                    <h1>
                      {tab.id === "projects" ? (
                        <>
                          Selected <em>projects.</em>
                        </>
                      ) : tab.id === "experience" ? (
                        <>
                          Where I’ve been <em>building.</em>
                        </>
                      ) : tab.id === "skills" ? (
                        <>
                          Skills &amp; <em>languages.</em>
                        </>
                      ) : (
                        <>
                          Awards &amp; <em>certificates.</em>
                        </>
                      )}
                    </h1>
                    <p className="classic-section-note">
                      {tab.id === "projects"
                        ? "Research tools, competition builds, and things I’ve worked on."
                        : tab.id === "experience"
                          ? "Work, study, and the communities I contribute to."
                          : tab.id === "skills"
                            ? "A hands-on toolkit, with a few things to try."
                            : "Team wins, school milestones, service, and continued learning."}
                    </p>
                  </header>
                  {tab.id === "projects" ? (
                    <ProjectsPanel
                      active={active === "projects"}
                      requestedProject={projectRequest}
                    />
                  ) : tab.id === "experience" ? (
                    <WorkPanel />
                  ) : tab.id === "skills" ? (
                    <SkillsPanel />
                  ) : (
                    <WorkPanel awardsOnly />
                  )}
                </>
              )}
            </motion.section>
          ))}
          <section
            id="contact"
            className="classic-contact"
            aria-labelledby="contact-title"
          >
            <header className="border-t border-zinc-200 pt-10 pb-6 dark:border-zinc-800">
              <p className="font-mono text-xs tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                06 — SAY HI
              </p>
              <h2 id="contact-title" className="classic-contact-title">
                Let’s talk.
              </h2>
            </header>
            <ContactPanel />
          </section>
        </main>
        <footer className="classic-shell classic-footer">
          <p>
            © 2026 Ian Abiel Wangsa{" "}
            <span>· built with next.js &amp; caffeine</span>
          </p>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion:reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            Back to top ↑
          </button>
        </footer>
      </div>
    </MotionConfig>
  );
}
