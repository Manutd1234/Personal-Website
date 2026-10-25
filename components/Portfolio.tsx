"use client";
import { MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import SkillsPanel from "./SkillsPanel";
import WorkPanel from "./WorkPanel";
import ProjectsPanel from "./ProjectsPanel";
import ProfilePanel from "./ProfilePanel";
import ContactPanel from "./ContactPanel";
import OffDutyPanel from "./OffDutyPanel";
import { warmAwardLogos } from "./TrophyRoom";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    hash: "profile",
  },
  {
    id: "projects",
    label: "Projects",
    hash: "builds",
  },
  {
    id: "experience",
    label: "Experience",
    hash: "experience",
  },
  {
    id: "skills",
    label: "Skills",
    hash: "toolkit",
  },
  {
    id: "awards",
    label: "Awards",
    hash: "achievements",
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
export default function Portfolio() {
  const [active, setActive] = useState<TabId>("profile");
  const [dark, setDark] = useState(false);
  const [projectRequest, setProjectRequest] = useState<{
    title: string;
    id: number;
  }>();
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef<TabId>(active);
  const focusSectionRef = useRef(false);
  const scrollFrameRef = useRef(0);
  activeRef.current = active;

  const keepSectionFocus = useCallback((next: TabId) => {
    if (next === activeRef.current) return;
    const focused = document.activeElement;
    focusSectionRef.current = Boolean(
      document.getElementById(`${activeRef.current}-panel`)?.contains(focused) ||
      (focused instanceof Element && focused.closest(".classic-nav")),
    );
  }, []);

  useLayoutEffect(() => {
    if (!focusSectionRef.current) return;
    focusSectionRef.current = false;
    navRefs.current[tabs.findIndex((tab) => tab.id === active)]?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    const sync = () => {
      cancelAnimationFrame(scrollFrameRef.current);
      const hash = window.location.hash.slice(1).toLowerCase();
      if (["main", "contact"].includes(hash)) return;
      const next = hash === "life-in-pictures" ? "profile" : aliases[hash] ?? "profile";
      if (next === "awards") warmAwardLogos();
      keepSectionFocus(next);
      setActive(next);
      if (hash === "life-in-pictures") {
        // History can return here while Profile is hidden. Reveal it before
        // positioning the anchor, rather than relying on native hash scrolling.
        scrollFrameRef.current = requestAnimationFrame(() =>
          document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: "instant" }),
        );
      } else if (aliases[hash]) {
        scrollFrameRef.current = requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    setDark(document.documentElement.classList.contains("dark"));
    return () => {
      cancelAnimationFrame(scrollFrameRef.current);
      window.removeEventListener("hashchange", sync);
    };
  }, [keepSectionFocus]);
  function navigate(id: TabId, history: "push" | "replace" = "push") {
    cancelAnimationFrame(scrollFrameRef.current);
    if (id === "awards") warmAwardLogos();
    keepSectionFocus(id);
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
              <span className="classic-wordmark-text">Ian Wangsa</span>
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
                    onPointerEnter={tab.id === "awards" ? warmAwardLogos : undefined}
                    onFocus={tab.id === "awards" ? warmAwardLogos : undefined}
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
                <>
                  <ProfilePanel openProjects={openProjects} />
                  <section
                    id="life-in-pictures"
                    className="classic-contact classic-offduty"
                    aria-labelledby="offduty-title"
                  >
                    <header className="border-t border-zinc-200 pt-10 pb-6 dark:border-zinc-800">
                      <p className="font-mono text-xs tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                        Beyond the code
                      </p>
                      <h2 id="offduty-title" className="classic-contact-title">
                        Off the <em>clock.</em>
                      </h2>
                    </header>
                    <OffDutyPanel />
                  </section>
                </>
              ) : (
                <>
                  {tab.id === "projects" ? (
                    <h1 className="sr-only">Project library</h1>
                  ) : (
                    <header className="classic-section-header">
                      <h1>
                        {tab.id === "experience" ? (
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
                    </header>
                  )}
                  {tab.id === "projects" ? (
                    <ProjectsPanel
                      active={active === "projects"}
                      requestedProject={projectRequest}
                    />
                  ) : tab.id === "experience" ? (
                    <WorkPanel active={active === "experience"} />
                  ) : tab.id === "skills" ? (
                    <SkillsPanel active={active === "skills"} />
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
            <ContactPanel />
          </section>
        </main>
        <footer className="classic-shell classic-footer">
          <p>© 2026 Ian Abiel Wangsa</p>
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
