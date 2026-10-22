"use client";
import { useMotionPreference } from "./useMotionPreference";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowDownToLine, ArrowUpRight, Mail } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Github, Linkedin } from "./BrandIcons";
import { profile, projects } from "@/content/portfolio";
import { projectMedia } from "@/content/media";
import { buildNotes as projectNotes } from "@/content/build-notes";
import { asset } from "@/content/paths";
import OffDutyPanel from "./OffDutyPanel";
import RoleIntro from "./RoleIntro";

const workbenchNotes = [
  {
    title: "AlphaEngine",
    label: "AlphaEngine",
    decision: "Recover the feed. Check the sequence.",
  },
  {
    title: "BrainHack TIL-AI",
    label: "BrainHack",
    decision: "Package the services for an air-gapped evaluation.",
  },
  {
    title: "CS2 Decision Coach",
    label: "RE:DECIDE",
    decision: "Ground the coaching in match evidence.",
  },
] as const;
const buildNotes = workbenchNotes.flatMap((note) => {
  const project = projects.find((item) => item.title === note.title);
  return project ? [{ ...note, project, media: projectMedia[note.title] }] : [];
});

const noteSteps = ["Problem", "Build", "Proof"] as const;

function Workbench({ openProjects }: { openProjects: () => void }) {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(1);
  const prefix = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useMotionPreference();

  function selectWithKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    kind: "project" | "step",
  ) {
    const count = kind === "project" ? buildNotes.length : noteSteps.length;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % count
        : event.key === "ArrowLeft"
          ? (index + count - 1) % count
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    if (kind === "project") setActive(next);
    else setStep(next);
    (kind === "project" ? tabRefs : stepRefs).current[next]?.focus({
      preventScroll: true,
    });
  }

  return (
    <section className="builder-workbench" aria-labelledby={`${prefix}-title`}>
      <header className="builder-workbench-heading">
        <div>
          <p className="classic-kicker">How I build</p>
          <h2 id={`${prefix}-title`}>At the workbench.</h2>
        </div>
        <p>
          Pick a project. Follow the decisions.
          <br />
          Then look under the hood.
        </p>
      </header>
      <div className="builder-notebook">
        <div
          className="builder-note-tabs"
          role="tablist"
          aria-label="Project build notes"
        >
          {buildNotes.map((note, index) => (
            <button
              key={note.title}
              type="button"
              role="tab"
              id={`${prefix}-tab-${index}`}
              aria-controls={`${prefix}-note-${index}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => selectWithKeys(event, index, "project")}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
            >
              <span className="builder-note-tab-number" aria-hidden="true">
                0{index + 1}
              </span>
              {note.label}
            </button>
          ))}
          <span className="builder-tab-aside" aria-hidden="true">
            a peek behind the build ↙
          </span>
        </div>
        <div className="builder-note-stage">
          {buildNotes.map((note, index) => {
            const detail = projectNotes[note.title];
            const texts = [detail.question, detail.decision, detail.proof];
            return (
              <motion.div
                key={note.title}
                id={`${prefix}-note-${index}`}
                role="tabpanel"
                aria-labelledby={`${prefix}-tab-${index}`}
                aria-hidden={active !== index}
                inert={active !== index}
                tabIndex={active === index ? 0 : -1}
                className={`builder-note ${active === index ? "is-active" : ""}`}
                initial={false}
                animate={{
                  opacity: active === index ? 1 : 0,
                  y: active === index || reduced ? 0 : 6,
                }}
                transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
              >
                <figure className="builder-note-media">
                  <div className="builder-preview-bar">
                    <span aria-hidden="true">● ● ●</span>
                    <span>{note.media.kind}</span>
                  </div>
                  <a
                    href={asset(note.media.src)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${note.label} ${note.media.kind.toLowerCase()} in a new tab`}
                  >
                    <img
                      src={asset(note.media.src)}
                      alt={note.media.alt}
                      width={960}
                      height={600}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="builder-image-open">
                      <ArrowUpRight size={15} /> View full image
                    </span>
                  </a>
                  <figcaption>{note.media.caption}</figcaption>
                </figure>
                <div className="builder-note-copy">
                  <p className="builder-note-category">
                    {note.project.category}
                  </p>
                  <h3>{detail.hook}</h3>
                  <div
                    className="builder-step-tabs"
                    role="tablist"
                    aria-label={`${note.label} walkthrough`}
                  >
                    {noteSteps.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        role="tab"
                        id={`${prefix}-${index}-step-${i}`}
                        aria-controls={`${prefix}-${index}-text-${i}`}
                        aria-selected={step === i}
                        tabIndex={step === i ? 0 : -1}
                        onClick={() => setStep(i)}
                        onKeyDown={(event) => selectWithKeys(event, i, "step")}
                        ref={
                          active === index
                            ? (element) => {
                                stepRefs.current[i] = element;
                              }
                            : undefined
                        }
                      >
                        <span aria-hidden="true">0{i + 1}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="builder-step-stage">
                    {texts.map((text, i) => (
                      <motion.p
                        key={i}
                        id={`${prefix}-${index}-text-${i}`}
                        role="tabpanel"
                        aria-labelledby={`${prefix}-${index}-step-${i}`}
                        aria-hidden={step !== i}
                        inert={step !== i}
                        tabIndex={step === i ? 0 : -1}
                        className={`builder-step-text ${step === i ? "is-active" : ""}`}
                        initial={false}
                        animate={{
                          opacity: step === i ? 1 : 0,
                          y: step === i || reduced ? 0 : 4,
                        }}
                        transition={{ duration: reduced ? 0 : 0.18 }}
                      >
                        {text}
                      </motion.p>
                    ))}
                  </div>
                  <ul
                    className="builder-note-tags"
                    aria-label={`${note.label} technologies`}
                  >
                    {note.project.tags.slice(0, 3).map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <div className="builder-note-actions">
                    <a
                      href={note.project.repository}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github size={14} /> Explore the code
                      <span className="sr-only">
                        {" "}
                        for {note.title}, opens in a new tab
                      </span>
                    </a>
                    <button type="button" onClick={openProjects}>
                      Open the bookshelf{" "}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function ProfilePanel({
  openProjects,
}: {
  openProjects: () => void;
}) {
  const reduced = useMotionPreference();
  const hobbiesRef = useRef<HTMLDetailsElement>(null);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 180, damping: 24 }),
    rotateY = useSpring(y, { stiffness: 180, damping: 24 });
  function tilt(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(-((event.clientY - box.top) / box.height - 0.5) * 5);
    y.set(((event.clientX - box.left) / box.width - 0.5) * 5);
  }
  return (
    <>
      <section className="classic-hero" aria-labelledby="hero-title">
        <div className="classic-hero-grid">
          <div className="classic-hero-copy">
            <p className="classic-status">
              <span aria-hidden="true" />
              {profile.availability}
            </p>
            <p className="classic-location">
              Computer Science at NUS · Singapore
            </p>
            <h1 id="hero-title">
              Ian Abiel
              <br />
              <em>Wangsa.</em>
            </h1>
            <RoleIntro />
            <p className="classic-intro">{profile.introduction}</p>
            <div className="classic-actions">
              <button className="classic-primary" onClick={openProjects}>
                View projects <ArrowUpRight size={19} />
              </button>
              <a
                className="classic-secondary"
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Résumé <ArrowDownToLine size={19} />
              </a>
            </div>
            <div className="classic-socials">
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Github size={19} />
                GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <Linkedin size={19} />
                LinkedIn
              </a>
              <a href={`mailto:${profile.email}`}>
                <Mail size={19} />
                Email
              </a>
              <a
                href="#life-in-pictures"
                className="classic-photo-shortcut"
                onClick={() => {
                  if (hobbiesRef.current) hobbiesRef.current.open = true;
                }}
              >
                Life in pictures <ArrowDown size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="classic-portrait-wrap">
            <span className="classic-tape" aria-hidden="true" />
            <span className="classic-paint" aria-hidden="true" />
            <motion.figure
              onPointerMove={tilt}
              onPointerLeave={() => {
                x.set(0);
                y.set(0);
              }}
              style={{ rotateX, rotateY }}
              className="classic-portrait"
            >
              <div className="classic-portrait-image">
                <img
                  src={asset("images/ian-westminster-960.webp")}
                  srcSet={`${asset("images/ian-westminster-960.webp")} 960w, ${asset("images/ian-westminster-1600.webp")} 1600w`}
                  sizes="(min-width:1200px) 350px,(min-width:700px) 35vw,80vw"
                  width={960}
                  height={1200}
                  fetchPriority="high"
                  alt="Ian in front of Westminster Abbey in London"
                />
              </div>
              <figcaption>
                <span>London, United Kingdom</span>
                <span>A little outside the code</span>
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </section>
      <section className="classic-about" aria-labelledby="about-title">
        <div>
          <p className="classic-kicker">A little context</p>
          <h2 id="about-title">About me</h2>
        </div>
        <div className="classic-about-copy">
          <p>
            I study Computer Science at NUS, with a second major in Mathematics
            and a minor in Economics. I like projects where I can work through
            the whole problem, from the data and backend to the part someone
            actually uses.
          </p>
          <p>
            So far, that has included quantitative research at Caerus, product
            work at a startup, recruitment tools at CTES, and AI developer tools
            at Accenture. Before university, I served as a signals commander in
            the RSAF.
          </p>
          <p>
            Outside work, you’ll find me at the gym, travelling, finding good
            food, or learning something new.
          </p>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            More on LinkedIn <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
      <Workbench openProjects={openProjects} />
      <details
        className="classic-hobbies"
        id="life-in-pictures"
        ref={hobbiesRef}
        open
      >
        <summary>
          <span className="classic-disclosure-icon" aria-hidden="true">
            +
          </span>
          Beyond the code
          <span className="classic-disclosure-note">
            Gym, travel, good food & learning
          </span>
        </summary>
        <div className="pt-6">
          <OffDutyPanel />
        </div>
      </details>
    </>
  );
}
