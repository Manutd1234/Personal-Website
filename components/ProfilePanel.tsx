"use client";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, Mail, RotateCw } from "lucide-react";
import { useState, type PointerEvent } from "react";
import { Github, Linkedin } from "./BrandIcons";
import { profile } from "@/content/portfolio";
import { asset } from "@/content/paths";
import OffDutyPanel from "./OffDutyPanel";
const roles = [
  "a software builder",
  "an AI enthusiast",
  "a quant researcher",
  "a curious learner",
];
export default function ProfilePanel({
  openProjects,
}: {
  openProjects: () => void;
}) {
  const [role, setRole] = useState(0);
  const reduced = useReducedMotion();
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
            <div className="classic-role">
              <span>I’m</span>
              <button
                onClick={() => setRole((i) => (i + 1) % roles.length)}
                aria-label={`Change role. Currently ${roles[role]}`}
                className="classic-role-flip"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.em
                    key={role}
                    initial={{ y: reduced ? 0 : "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: reduced ? 0 : "-110%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    aria-hidden="true"
                  >
                    {roles[role]}
                  </motion.em>
                </AnimatePresence>
                <RotateCw aria-hidden="true" size={14} />
              </button>
              <span className="sr-only" aria-live="polite">
                {roles[role]}
              </span>
            </div>
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
      <details className="classic-hobbies">
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
