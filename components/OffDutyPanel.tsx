"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Dumbbell,
  MapPin,
  RotateCw,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { asset } from "@/content/paths";

const places = [
  {
    src: "images/hobbies/travel-alpine.webp",
    alt: "Ian travelling in an alpine landscape",
    name: "Somewhere in the Alps",
    note: "A change of scenery, and a camera roll to prove it.",
  },
  {
    src: "images/ian-westminster-960.webp",
    alt: "Ian standing in front of Westminster Abbey",
    name: "Westminster, London",
    note: "Taking the long way round, whenever there’s time.",
  },
];
const lessons = [
  {
    question: "What makes a useful AI tool?",
    answer:
      "Ground the answer in evidence. In RE:DECIDE, coaching starts with native match telemetry.",
  },
  {
    question: "What happens after the happy path?",
    answer:
      "Recovery matters. AlphaEngine reconstructs feeds with sequence checks and feed recovery.",
  },
  {
    question: "What keeps learning interesting?",
    answer:
      "A real problem, people to learn with, and a prototype you can put in their hands.",
  },
];
const frame =
  "flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50";
const iconBox =
  "flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-300";
export default function OffDutyPanel() {
  const [place, setPlace] = useState(0);
  const [gymMode, setGymMode] = useState<"Recharge" | "Refocus">("Recharge");
  const [foodMode, setFoodMode] = useState<"Old favourite" | "New places">(
    "Old favourite",
  );
  const [lesson, setLesson] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
      <article className={frame}>
        <div className="flex items-center gap-3">
          <span className={iconBox}>
            <Dumbbell className="size-4" />
          </span>
          <h2 className="text-sm font-semibold">Gym</h2>
          <span className="ml-auto font-mono text-[9px] text-zinc-400">
            01 / RESET
          </span>
        </div>
        <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-lg">
          <img
            src={asset("images/hobbies/gym-nenad-stojkovic.webp")}
            width={1600}
            height={1067}
            alt="Strength-training equipment in a gym"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span className="absolute right-2 bottom-2 rounded bg-black/50 px-2 py-1 font-mono text-[8px] text-white">
            Illustrative photo
          </span>
        </div>
        <p className="mt-4 min-h-14 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Time away from the laptop, getting stronger and clearing my head.
        </p>
        <div
          className="mt-4 flex items-center gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800"
          aria-label="Gym mindset"
        >
          {(["Recharge", "Refocus"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={gymMode === mode}
              onClick={() => setGymMode(mode)}
              className={`min-h-10 flex-1 rounded-md text-xs ${gymMode === mode ? "bg-white text-emerald-700 shadow-xs dark:bg-zinc-800 dark:text-emerald-300" : "text-zinc-500"}`}
            >
              {mode}
            </button>
          ))}
        </div>
        <p
          className="mt-3 min-h-10 text-xs leading-5 text-zinc-500"
          aria-live="polite"
        >
          {gymMode === "Recharge"
            ? "A break from the screen. A fresh start after."
            : "One thing at a time. The next rep, then the next problem."}
        </p>
        <p className="mt-auto pt-3 text-[9px] leading-4 text-zinc-400">
          Photo:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Design_and_equipment_in_modern_gym.jpg"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Nenad Stojković / Wikimedia
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/2.0/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            CC BY 2.0
          </a>{" "}
          · resized.
        </p>
      </article>
      <article className={frame}>
        <div className="flex items-center gap-3">
          <span className={iconBox}>
            <MapPin className="size-4" />
          </span>
          <h2 className="text-sm font-semibold">Travel</h2>
          <span className="ml-auto font-mono text-[9px] text-zinc-400">
            02 / WANDER
          </span>
        </div>
        <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <AnimatePresence initial={false}>
            <motion.img
              key={place}
              src={asset(places[place].src)}
              width={1200}
              height={1600}
              alt={places[place].alt}
              loading="lazy"
              initial={{ opacity: 0, scale: reduced ? 1 : 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 h-full w-full object-cover object-[center_55%]"
            />
          </AnimatePresence>
        </div>
        <p className="mt-4 min-h-14 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Exploring somewhere new, taking photos, and enjoying a change of
          scenery.
        </p>
        <button
          className="mt-4 flex min-h-12 items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 text-xs hover:border-emerald-400 dark:border-zinc-800"
          onClick={() => setPlace((i) => (i + 1) % places.length)}
          aria-label="Show next travel photo"
        >
          <span aria-live="polite">{places[place].name}</span>
          <ArrowRight className="size-3.5" />
        </button>
        <p
          className="mt-3 min-h-10 text-xs leading-5 text-zinc-500"
          aria-live="polite"
        >
          {places[place].note}
        </p>
        <p className="mt-auto pt-3 font-mono text-[9px] text-zinc-400">
          FROM MY CAMERA ROLL · {String(place + 1).padStart(2, "0")} / 02
        </p>
      </article>
      <article className={frame}>
        <div className="flex items-center gap-3">
          <span className={iconBox}>
            <Utensils className="size-4" />
          </span>
          <h2 className="text-sm font-semibold">Good food</h2>
          <span className="ml-auto font-mono text-[9px] text-zinc-400">
            03 / REFUEL
          </span>
        </div>
        <div className="mt-4 aspect-[16/10] overflow-hidden rounded-lg">
          <img
            src={asset("images/hobbies/food-chicken-rice.webp")}
            width={1130}
            height={1600}
            alt="A plate of roast chicken rice with chilli"
            loading="lazy"
            className="h-full w-full object-cover object-[center_57%] transition-transform duration-300 hover:scale-105"
          />
        </div>
        <p className="mt-4 min-h-14 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Trying new places to eat, with plenty of room for old favourites like
          chicken rice.
        </p>
        <div
          className="mt-4 flex items-center gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800"
          aria-label="Food mood"
        >
          {(["Old favourite", "New places"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFoodMode(mode)}
              aria-pressed={foodMode === mode}
              className={`min-h-10 flex-1 rounded-md text-xs ${foodMode === mode ? "bg-white text-emerald-700 shadow-xs dark:bg-zinc-800 dark:text-emerald-300" : "text-zinc-500"}`}
            >
              {mode}
            </button>
          ))}
        </div>
        <p
          className="mt-3 min-h-10 text-xs leading-5 text-zinc-500"
          aria-live="polite"
        >
          {foodMode === "Old favourite"
            ? "Some meals don’t need reinventing. Chicken rice is one of them."
            : "The next good find is a pretty good reason to head out."}
        </p>
        <p className="mt-auto pt-3 font-mono text-[9px] text-zinc-400">
          ALWAYS ROOM FOR GOOD FOOD
        </p>
      </article>
      <article className={frame}>
        <div className="flex items-center gap-3">
          <span className={iconBox}>
            <BookOpen className="size-4" />
          </span>
          <h2 className="text-sm font-semibold">Learning</h2>
          <span className="ml-auto font-mono text-[9px] text-zinc-400">
            04 / REPEAT
          </span>
        </div>
        <div className="mt-4 aspect-[16/10] overflow-hidden rounded-lg">
          <img
            src={asset("images/hobbies/learning-sap-workshop.webp")}
            width={1600}
            height={1067}
            alt="Participants at a SAP S.C.A.L.E workshop"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <p className="mt-4 min-h-14 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Picking up new ideas through workshops, side projects, and
          conversations.
        </p>
        <button
          onClick={() => setFlipped((value) => !value)}
          className="relative mt-4 min-h-28 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-left text-xs leading-5 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
          aria-label={
            flipped ? "Show learning question" : "Reveal learning note"
          }
        >
          <span className="mb-1 block font-mono text-[8px] uppercase tracking-wider opacity-60">
            {flipped ? "A note from building" : "A question to keep"} · tap to
            flip
          </span>
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={`${lesson}-${flipped}`}
              initial={{ opacity: 0, y: reduced ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="block"
              transition={{ duration: 0.12 }}
            >
              {flipped ? lessons[lesson].answer : lessons[lesson].question}
            </motion.span>
          </AnimatePresence>
        </button>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-mono text-[9px] text-zinc-400">
            SAP S.C.A.L.E WORKSHOP
          </span>
          <button
            onClick={() => {
              setLesson((i) => (i + 1) % lessons.length);
              setFlipped(false);
            }}
            className="flex min-h-10 items-center gap-1.5 text-[10px] text-zinc-500 hover:text-emerald-700"
          >
            Next note <RotateCw className="size-3" />
          </button>
        </div>
      </article>
    </div>
  );
}
