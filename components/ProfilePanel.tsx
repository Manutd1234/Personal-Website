"use client";
import { useMotionPreference } from "./useMotionPreference";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowDownToLine, ArrowUpRight, Mail } from "lucide-react";
import { type PointerEvent } from "react";
import { Github, Linkedin } from "./BrandIcons";
import { profile } from "@/content/portfolio";
import { asset } from "@/content/paths";
import RoleIntro from "./RoleIntro";
import BuildJourney from "./BuildJourney";

export default function ProfilePanel({
  openProjects,
}: {
  openProjects: (projectTitle?: string) => void;
}) {
  const reduced = useMotionPreference();
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
              <button
                className="classic-primary"
                onClick={() => openProjects()}
              >
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
              <a href="#life-in-pictures" className="classic-photo-shortcut">
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
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </section>
      <section className="classic-about" aria-labelledby="about-title">
        <div>
          <h2 id="about-title">About me</h2>
        </div>
        <div className="classic-about-copy">
          <p>
            I study Computer Science at NUS, with a second major in Mathematics
            and a minor in Economics. I enjoy following a problem all the way
            from raw data to something people can use.
          </p>
        </div>
      </section>
      <BuildJourney openProjects={openProjects} />
    </>
  );
}
