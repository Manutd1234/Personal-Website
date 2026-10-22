// Trophy Room records. Titles, issuers, results and certificates come from
// achievementGroups in portfolio.ts; rarity and XP are a game layer on top.
// Build strategies summarise each project's own README, and stacks and source
// links reuse the project records, so nothing here adds unrecorded results.
import { achievementGroups, projectArchive, projects } from "./portfolio";

export type TrophyTier = "gold" | "silver" | "finalist" | "honor";
export type TrophyIcon =
  | "trophy"
  | "medal"
  | "award"
  | "sparkles"
  | "scholar"
  | "landmark"
  | "scroll"
  | "badge";

type AwardRecord = {
  title: string;
  issuer: string;
  detail?: string;
  year?: string;
  certificateKey?: string;
  certificateKeys?: readonly string[];
};

type TrophyDetails = {
  name?: string;
  placement: string;
  place?: 1 | 2 | 3;
  tier: TrophyTier;
  icon: TrophyIcon;
  stars: 3 | 4 | 5;
  xp: number;
  project?: string;
  built?: string;
  record?: string;
  strategy?: readonly [string, string];
  notes?: readonly string[];
};

export type Trophy = Omit<TrophyDetails, "name" | "project" | "record"> & {
  id: string;
  kind: "competition" | "national";
  name: string;
  title: string;
  issuer: string;
  year?: string;
  record: string;
  certificateKeys: readonly string[];
  stack: readonly string[];
  source?: { url: string; label?: string };
};

const competitionDetails: Readonly<Record<string, TrophyDetails>> = {
  "BrainHack TIL-AI 2026": {
    placement: "Novice Champion",
    place: 1,
    tier: "gold",
    icon: "trophy",
    stars: 5,
    xp: 500,
    project: "BrainHack TIL-AI",
    built: "Pandamonium (Multimodal AI)",
    strategy: [
      "Ran speech, vision, retrieval, adversarial-noise and exploration models as five standalone Docker services for an air-gapped finals, where every scored task weighed inference speed alongside accuracy.",
      "Paired NVIDIA Parakeet speech recognition and a YOLOv11 detector with BM25-first retrieval and a MaskablePPO explorer that falls back to BFS/A* search.",
    ],
  },
  "Hack the Future AI Hackathon 2026": {
    placement: "1st Place Champion",
    place: 1,
    tier: "gold",
    icon: "trophy",
    stars: 5,
    xp: 500,
    project: "Agentic Fraud Investigation Crew",
    built: "Agentic Fraud Investigation Crew",
    strategy: [
      "Chained four agents (triage, enrichment, adjudication and SAR drafting) to clear the 85–95% false-positive backlog, handing analysts a finished investigation instead of a raw alert.",
      "Kept a human at the decision point: the SAR agent drafts but never files, and every escalation waits for approval through Teams and Power Automate.",
    ],
  },
  "SunnyHacks 2026": {
    placement: "2nd Place",
    place: 2,
    tier: "silver",
    icon: "medal",
    stars: 4,
    xp: 400,
    notes: ["Placed 2nd at SunnyHacks in February 2026."],
  },
  "BügleRock Rockathon 2026": {
    placement: "Top 5 Finalist",
    tier: "finalist",
    icon: "award",
    stars: 3,
    xp: 300,
    project: "DealMachine",
    built: "DealMachine (Investment-banking AI)",
    strategy: [
      "Split the platform into three Slack-connected modules: a Claude research analyst in Python, a Node.js and React document generator, and a Chart.js deal-pipeline dashboard.",
      "Drafted engagement letters, teasers and information memoranda with Claude, then routed each draft through a Slack approval workflow.",
    ],
  },
  "SignMeUp · The Merge Hackathon 2026": {
    name: "The Merge Hackathon 2026",
    placement: "Honorary Recognition",
    tier: "honor",
    icon: "sparkles",
    stars: 3,
    xp: 250,
    project: "SignMeUp",
    built: "SignMeUp (Accessibility suite)",
    strategy: [
      "Combined three assistive tools: a Gemini-powered wellness assistant, voice-first navigation with caregiver deviation alerts, and sign-language recognition.",
      "Ran sign recognition entirely in the browser with MediaPipe and an LSTM, so users can train their own signs without sending video to the cloud.",
    ],
  },
};

const nationalDetails: Readonly<Record<string, TrophyDetails>> = {
  "Edusave Scholarships for Independent Schools (Yearly Award)": {
    name: "Edusave Scholarship for Independent Schools",
    placement: "Scholarship · AY2020",
    tier: "honor",
    icon: "scholar",
    stars: 4,
    xp: 350,
    record: "Award letter · 5 Apr 2021",
    notes: [
      "Awarded by the Ministry of Education for academic year 2020 at the School of Science and Technology, Singapore.",
      "Award letter issued on 5 April 2021.",
    ],
  },
  "CCC–CDC Education Merit Award": {
    placement: "Merit Award",
    tier: "honor",
    icon: "landmark",
    stars: 3,
    xp: 200,
    notes: ["Presented by CCC–CDC in 2022."],
  },
  "Edusave Certificate of Academic Achievement": {
    placement: "Awarded 3×",
    tier: "honor",
    icon: "scroll",
    stars: 4,
    xp: 300,
    notes: [
      "Awarded by the Ministry of Education in three separate years: 2019, 2021 and 2022.",
    ],
  },
  "Edusave Good Progress Award": {
    placement: "Awarded 3×",
    tier: "honor",
    icon: "badge",
    stars: 3,
    xp: 250,
    notes: ["Awarded by the Ministry of Education in 2017, 2019 and 2021."],
  },
};

const builds = [...projects, ...projectArchive];
const slug = (title: string) =>
  title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function toTrophies(
  groupTitle: string,
  kind: Trophy["kind"],
  details: Readonly<Record<string, TrophyDetails>>,
): Trophy[] {
  const group = achievementGroups.find((item) => item.title === groupTitle);
  if (!group) throw new Error(`Trophy Room: missing group "${groupTitle}"`);
  return (group.items as readonly AwardRecord[]).map((record) => {
    const extra = details[record.title];
    if (!extra) throw new Error(`Trophy Room: no details for "${record.title}"`);
    const { name, project: projectTitle, ...rest } = extra;
    const project = projectTitle
      ? builds.find((build) => build.title === projectTitle)
      : undefined;
    if (projectTitle && !project)
      throw new Error(`Trophy Room: no project titled "${projectTitle}"`);
    const certificateKeys =
      record.certificateKeys ??
      (record.certificateKey ? [record.certificateKey] : []);
    return {
      ...rest,
      id: slug(record.title),
      kind,
      name: name ?? record.title,
      title: record.title,
      issuer: record.issuer,
      year: record.year,
      certificateKeys,
      record:
        rest.record ??
        (certificateKeys.length > 1
          ? `${certificateKeys.length} certificates on file`
          : "Certificate on file"),
      stack: project?.tags ?? [],
      source: project
        ? { url: project.repository, label: project.repositoryLabel }
        : undefined,
    };
  });
}

// Competitions lead; within each kind, trophies run from most to least XP.
export const trophies: readonly Trophy[] = [
  ...toTrophies("Technical competitions", "competition", competitionDetails),
  ...toTrophies("Government awards & scholarships", "national", nationalDetails),
].sort(
  (a, b) =>
    Number(a.kind === "national") - Number(b.kind === "national") ||
    b.xp - a.xp,
);

const totalXp = trophies.reduce((sum, trophy) => sum + trophy.xp, 0);
const ranks = [
  [3000, "Grandmaster"],
  [2000, "Master"],
  [1000, "Diamond"],
  [0, "Contender"],
] as const;

// Every listed trophy is earned, so the room always reads as fully unlocked.
export const trophyStats = {
  unlocked: trophies.length,
  total: trophies.length,
  xp: totalXp,
  rank: ranks.find(([minimum]) => totalXp >= minimum)![1],
};
