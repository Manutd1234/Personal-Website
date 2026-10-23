import {
  earlierEducation,
  education,
  experience,
  leadership,
  volunteering,
} from "@/content/portfolio";

// Field-note presentation for section 03. Canonical facts stay in
// portfolio.ts; this file adds concise highlights to those records.

export type DeckId = "work" | "education" | "community" | "volunteering";
export type CardType =
  "systems" | "education" | "leadership" | "community" | "sport";
export const cardTypes: Readonly<Record<CardType, { label: string }>> = {
  systems: { label: "Systems / Quant" },
  education: { label: "Education" },
  leadership: { label: "Leadership" },
  community: { label: "Community" },
  sport: { label: "Sport" },
};

// Highlights condense real résumé bullets. Real results are marked **like this**.
export type CardMove = { name: string; text: string };

// Official logos, saved locally under public/images/logos from the source noted
// above each entry. A logo drawn for dark backgrounds sets `dark` so its panel
// switches colour. Student groups can use the identified parent organisation's
// official mark. Stealth Startup uses its public LinkedIn listing’s logo.
type Logo = {
  file: string;
  dark?: boolean;
  alt?: string;
  layout?: "wide" | "football";
};
const logos: Readonly<Record<string, Logo>> = {
  // https://caerusgm.com/
  caerus: { file: "images/logos/caerus.webp" },
  // Linked from Ian’s Product Engineer entry: https://www.linkedin.com/company/18583501/
  // Canonical page: https://www.linkedin.com/company/stealth-startup-community/
  // LinkedIn image D4D0BAQGUKsfjHB8RNQ, saved without redrawing or changing pixels.
  "stealth-startup": {
    file: "images/logos/stealth-startup.webp",
    alt: "Stealth Startup LinkedIn logo",
  },
  // https://www.ctes.com.sg/web/site/home
  ctes: { file: "images/logos/ctes.webp" },
  // https://commons.wikimedia.org/wiki/File:Accenture.svg
  accenture: { file: "images/logos/accenture.webp" },
  // https://www.da-strategies.com/
  "d-a-strategies": { file: "images/logos/d-a-strategies.webp", dark: true },
  // https://www.rsaf.gov.sg/about-us/vision-and-mission/
  rsaf: { file: "images/logos/rsaf.webp" },
  // https://en.wikipedia.org/wiki/File:Singapore_Army_logo.svg
  "singapore-army": { file: "images/logos/singapore-army.webp" },
  // https://en.wikipedia.org/wiki/File:NationalUniversityofSingapore.svg
  nus: { file: "images/logos/nus.webp" },
  // Full-resolution official wordmark from https://www.eunoiajc.moe.edu.sg/.
  ejc: { file: "images/logos/ejc.webp", alt: "Eunoia Junior College logo" },
  "ejc-softball": {
    file: "images/logos/ejc-softball.webp",
    alt: "Eunoia Softball logo",
  },
  // Parent union mark from https://nussu.net/ (VENtures is a NUSSU committee).
  "nussu-ventures": {
    file: "images/logos/nussu.webp",
    alt: "NUS Students’ Union (NUSSU) logo",
  },
  // SST Football artwork supplied by Ian.
  "sst-football": {
    file: "images/logos/sst-football.webp",
    alt: "SST Football logo",
    layout: "football",
  },
  // https://www.sst.edu.sg/about-sst/sst-identity/school-symbols/
  sst: { file: "images/logos/sst.webp" },
  // Current official horizontal wordmark: https://www.bukittimahpri.moe.edu.sg/.
  btps: { file: "images/logos/btps.webp", layout: "wide" },
  // https://nussif.com/
  nussif: { file: "images/logos/nussif.webp" },
  // https://linktr.ee/nusmedtech
  pneurelief: { file: "images/logos/pneurelief.webp" },
  // https://gdg.community.dev/gdg-on-campus-national-university-of-singapore-singapore-singapore/
  "gdg-nus": { file: "images/logos/gdg-nus.webp" },
  // https://fintechsociety.comp.nus.edu.sg/
  "nus-fintech": { file: "images/logos/nus-fintech.webp" },
  // https://nusgdg.org/
  "nus-gamedev": { file: "images/logos/nus-gamedev.webp" },
  // https://runnus.nussportsclub.org/
  runnus: { file: "images/logos/runnus.webp", layout: "wide" },
  // https://nusync.nus.edu.sg/NSSC/rsvp_boot?id=379717
  sunnus: { file: "images/logos/sunnus.webp" },
  // https://nusvcf.com/
  "nus-vcf": { file: "images/logos/nus-vcf.webp" },
  // https://nusync.nus.edu.sg/CSC/web_officers
  "nus-csc": { file: "images/logos/nus-csc.webp" },
  // https://nusrotaract.wixsite.com/rotaractclubofnus
  "nus-rotaract": { file: "images/logos/nus-rotaract.webp" },
  // https://youthcorps.nyc.gov.sg/
  "youth-corps": { file: "images/logos/youth-corps.webp" },
  // https://4s.org.sg/
  tembusu: { file: "images/logos/tembusu.webp" },
  // https://care.sg/
  "care-singapore": { file: "images/logos/care-singapore.webp" },
  // https://www.minds.org.sg/
  minds: { file: "images/logos/minds.webp" },
  // https://willinghearts.org.sg/
  "willing-hearts": { file: "images/logos/willing-hearts.webp" },
  // https://www.ido.org.tw/
  "dwen-an": { file: "images/logos/dwen-an.webp" },
  // https://www.nparks.gov.sg/
  nparks: { file: "images/logos/nparks.webp" },
};

type CardDetails = {
  type: CardType;
  title: string;
  logo?: string;
  // Keep the operating company private while using its public LinkedIn listing.
  stealth?: boolean;
  moves: readonly CardMove[];
  location?: string;
  certificates?: readonly string[];
};

export type TradingCardData = {
  id: string;
  number: number;
  type: CardType;
  title: string;
  org: string;
  role: string;
  location: string;
  dates: string;
  logo?: Logo;
  stealth?: boolean;
  moves: readonly CardMove[];
  summary?: string;
  bullets: readonly string[];
  tags: readonly string[];
  note?: string;
  certificates: readonly string[];
};

export type Deck = {
  id: DeckId;
  label: string;
  cards: readonly TradingCardData[];
};

const move = (name: string, text: string): CardMove => ({ name, text });

// Keyed by company, school or organisation name in portfolio.ts.
const details: Readonly<Record<string, CardDetails>> = {
  "Caerus Global Management": {
    type: "systems",
    title: "Quant Summer Analyst",
    logo: "caerus",
    moves: [
      move(
        "L2 Book Reconstruction",
        "Reconstructed Binance & Hyperliquid L2 books on a **100 ms** grid with sequence checks.",
      ),
      move(
        "Lead-Lag Arbitrage",
        "Measured a **0.7–0.8 s** market lead-lag and tested signal decay after fees and latency.",
      ),
    ],
  },
  "Stealth Startup": {
    type: "systems",
    title: "Product Engineer Intern",
    logo: "stealth-startup",
    stealth: true,
    moves: [
      move(
        "Dashboards & Fixes",
        "Built SQL/Grafana product dashboards; shipped fixes across sign-in, messaging, calendar sync and iOS.",
      ),
      move(
        "Flow Validation",
        "Validated **23** auth, onboarding and authorization flows with Playwright and SQL assertions.",
      ),
    ],
  },
  "CTES Consulting": {
    type: "systems",
    title: "Software Engineer Intern",
    logo: "ctes",
    moves: [
      move(
        "Full-Stack Portals",
        "Implemented React/TypeScript portals, Express APIs, PostgreSQL migrations and Cognito access controls.",
      ),
      move(
        "BM25 Talent Ranking",
        "Cut candidate profiling from **1–2 days to hours** with Python document parsing and BM25 ranking.",
      ),
    ],
  },
  Accenture: {
    type: "systems",
    title: "Application Engineer Intern",
    logo: "accenture",
    moves: [
      move(
        "Hybrid Retrieval",
        "Built hybrid BGE/BM25 retrieval over code and logs, with Git and Azure DevOps workflows.",
      ),
      move(
        "Agentic Test Gen",
        "Cut incident testing from days to **under 30 minutes** with agent-assisted test generation.",
      ),
    ],
  },
  "D+A Strategies": {
    type: "systems",
    title: "Quant Trainee",
    logo: "d-a-strategies",
    moves: [
      move(
        "Signal Strategies",
        "Implemented ARIMA, Bollinger-band and EMA-pullback strategies with pandas/NumPy feature pipelines.",
      ),
      move(
        "Risk-Adjusted Review",
        "Evaluated Sharpe ratios, drawdowns and buy-and-hold benchmarks, with ATR-based stops.",
      ),
    ],
  },
  "Republic of Singapore Air Force": {
    type: "leadership",
    title: "Signals Commander",
    logo: "rsaf",
    moves: [
      move(
        "Joint Comms",
        "Led communications and equipment readiness, including joint SAF–RAAF comms on Exercise Wallaby in Australia.",
      ),
      move(
        "Unit Leadership",
        "Comms Store, Gym Innovation and National Education IC; graded **Outstanding** for performance and conduct.",
      ),
    ],
  },
  "Singapore Army": {
    type: "leadership",
    title: "Specialist Cadet",
    logo: "singapore-army",
    moves: [
      move(
        "Section Command",
        "Led a section of **seven** during specialist cadet training.",
      ),
      move(
        "Tactical Networking",
        "Trained in wireless communications and tactical networking; promoted to Specialist on 17 Nov 2023.",
      ),
    ],
  },
  "National University of Singapore": {
    type: "education",
    title: "Computer Science",
    logo: "nus",
    moves: [
      move(
        "CS × Math × Econ",
        "Computer Science with a second major in Mathematics and a minor in Economics; GPA **4.50 / 5.00**.",
      ),
      move(
        "Industry Programmes",
        "SAP S.C.A.L.E 2026 (one of **12** teams), WorldQuant 2026 and Discover GIC 2026.",
      ),
    ],
  },
  "Eunoia Junior College": {
    type: "education",
    title: "A-Levels · Science",
    logo: "ejc",
    certificates: ["deanList2021", "deanList2022"],
    moves: [
      move(
        "H2 Quartet",
        "Grade **AAAA/B** with H2 Mathematics, Physics, Chemistry and Economics.",
      ),
      move(
        "Dean’s List ×2",
        "Named to the Dean’s List (Academic) in both 2021 and 2022.",
      ),
    ],
  },
  "School of Science and Technology, Singapore": {
    type: "education",
    title: "O-Levels · Science",
    logo: "sst",
    certificates: ["sstTopPerformer2020"],
    moves: [
      move(
        "Top Performer",
        "Top GCE O-Level Performer, 2020, with an Edusave Scholarship for Independent Schools.",
      ),
      move(
        "Innofest Pitch",
        "Best Business Pitch Award and 2nd in the Active Elderly Award at SST Changemakers Innofest 2018.",
      ),
    ],
  },
  "Bukit Timah Primary School": {
    type: "education",
    title: "Primary · PSLE",
    logo: "btps",
    certificates: ["nmosBronze2015", "koobits2015"],
    moves: [
      move(
        "Olympiad Bronze",
        "NMOS Bronze and KooBits Maths Challenge Top Brain of School (Season 1), 2015.",
      ),
      move(
        "Relay Victory",
        "**1st** in the 4×100 m relay (2015) and 3rd in the 2×100 m relay (2014).",
      ),
    ],
  },
  "NUS Student Investment Fund": {
    type: "systems",
    title: "Quant Developer Analyst",
    logo: "nussif",
    moves: [
      move(
        "Risk Dashboards",
        "Building IBKR NAV collectors, risk dashboards, Monte Carlo VaR/ES and automated portfolio reports.",
      ),
      move(
        "EC2 Failover",
        "Competition leaderboards, market benchmarks and single-worker EC2 failover tooling.",
      ),
    ],
  },
  "NUS MedTech · PneuRelief": {
    type: "systems",
    title: "Software Engineer",
    logo: "pneurelief",
    moves: [
      move(
        "Pressure Monitor",
        "Developing a mobile cast-pressure monitoring system with React Native/Expo and FastAPI.",
      ),
      move(
        "BLE Reconnect",
        "Implementing BLE sensor notifications, device commands, permissions and reconnection flows.",
      ),
    ],
  },
  "Google Developer Group @ NUS Computing": {
    type: "systems",
    title: "Software Engineer",
    logo: "gdg-nus",
    moves: [
      move(
        "Volunteer Workflows",
        "Building volunteer workflows and software for non-profit partner Caring For Life.",
      ),
      move(
        "Auth & Persistence",
        "Contributing React/TypeScript interfaces, FastAPI APIs, Firebase auth and PostgreSQL persistence.",
      ),
    ],
  },
  "NUS Fintech Society": {
    type: "systems",
    title: "ML Trainee",
    logo: "nus-fintech",
    moves: [
      move(
        "Credit-Risk Models",
        "Trained credit-risk models across **six** datasets with stratified splits and cross-validation.",
      ),
      move(
        "Held-Out Validation",
        "Achieved **0.952** held-out ROC-AUC on HMEQ with validation-only model and threshold selection.",
      ),
    ],
  },
  "NUS Games Development Group": {
    type: "systems",
    title: "Software Engineer",
    logo: "nus-gamedev",
    moves: [
      move(
        "Procedural Board",
        "Developing procedural board rendering for a 2D murder-mystery game in Unity and C#.",
      ),
      move(
        "State Sync",
        "Developing central state updates that synchronise gameplay and visuals.",
      ),
    ],
  },
  "NUSSU VENtures": {
    type: "leadership",
    title: "Operations Executive",
    logo: "nussu-ventures",
    moves: [
      move(
        "Event Coordination",
        "Coordinated student events, campus venues and resources.",
      ),
      move(
        "Stakeholder Comms",
        "Coordinated stakeholder communication across student events.",
      ),
    ],
  },
  "RunNUS · NUS Sports Club": {
    type: "leadership",
    title: "Admin & Finance Executive",
    logo: "runnus",
    moves: [
      move(
        "Budget Control",
        "Managed budgets and financial tracking for a campus run engaging **1,000+** runners.",
      ),
      move("Vendor Procurement", "Managed vendor procurement for RunNUS."),
    ],
  },
  "SunNUS · NUS Sports Club": {
    type: "leadership",
    title: "Team Sports Series Executive",
    logo: "sunnus",
    moves: [
      move(
        "Fixture Planning",
        "Coordinated tournament fixtures for a beach sports event with **400+** participants.",
      ),
      move(
        "Venue Logistics",
        "Coordinated venue setup and logistics for SunNUS.",
      ),
    ],
  },
  "NUS Varsity Christian Fellowship": {
    type: "community",
    title: "Member",
    logo: "nus-vcf",
    moves: [
      move(
        "Fellowship",
        "Member of the NUS Varsity Christian Fellowship community.",
      ),
    ],
  },
  "Eunoia Junior College · Softball": {
    type: "sport",
    title: "Team Member",
    logo: "ejc-softball",
    moves: [
      move(
        "NSG A Division",
        "Represented EJC in National School Games A Division softball; team silver in 2022.",
      ),
      move(
        "Colours Award",
        "SSSC Colours Award for sporting excellence in softball, 23 Sep 2022.",
      ),
    ],
  },
  "School of Science and Technology · Class leadership": {
    type: "leadership",
    title: "Class Vice-Chairperson",
    logo: "sst",
    moves: [
      move("Class Leadership", "Served as Class Vice-Chairperson in 2020."),
      move(
        "SConnect Modules",
        "Completed SConnect leadership development modules in 2017 and 2018.",
      ),
    ],
  },
  "School of Science and Technology · Football": {
    type: "sport",
    title: "Team Member",
    logo: "sst-football",
    moves: [
      move(
        "NSG Football",
        "Represented the school at National School Games football competitions.",
      ),
      move("House Games", "Took part in house sporting events."),
    ],
  },
  "School of Science and Technology · Mathematics Society": {
    type: "education",
    title: "Olympiad Participant",
    logo: "sst",
    moves: [
      move(
        "Olympiad Rounds",
        "Represented SST in the Singapore and Asian Schools Math Olympiad in 2018 and 2019.",
      ),
    ],
  },
  "Bukit Timah Primary School · Mathematics Olympiad": {
    type: "education",
    title: "Team Member",
    logo: "btps",
    certificates: ["nmosBronze2015"],
    moves: [
      move(
        "Olympiad Training",
        "Trained with the school mathematics olympiad team.",
      ),
      move("NMOS Bronze", "Received NMOS **Bronze** in 2015."),
    ],
  },
  "Bukit Timah Primary School · Football": {
    type: "sport",
    title: "Team Member",
    logo: "btps",
    moves: [
      move("Football CCA", "Participated in the school Football CCA."),
      move("Inter-School Games", "Took part in inter-school games."),
    ],
  },
  "Project BHID · NUS Community Service Club": {
    type: "community",
    title: "Programmes Head",
    logo: "nus-csc",
    certificates: ["bhid"],
    moves: [
      move(
        "Programme Design",
        "Led programme design for elderly beneficiaries with intellectual disabilities.",
      ),
      move(
        "Volunteer Training",
        "Trained student volunteers; recognised with a Certificate of Appreciation, AY2025/26.",
      ),
    ],
  },
  "Project CUP · NUS Rotaract Club": {
    type: "community",
    title: "Student Volunteer",
    logo: "nus-rotaract",
    moves: [
      move(
        "Game Facilitation",
        "Facilitated games and community activities with primary-school children.",
      ),
    ],
  },
  "Programming for Kids · Youth Corps Singapore": {
    type: "community",
    title: "Volunteer Educator",
    logo: "youth-corps",
    moves: [
      move(
        "Scratch Class",
        "Taught Scratch programming to Primary 1–6 learners.",
      ),
      move(
        "Intro to ML",
        "Taught through computational-thinking and introductory machine-learning activities.",
      ),
    ],
  },
  "EJC Softball VIA · Tembusu Home for the Aged": {
    type: "community",
    title: "VIA Ambassador",
    logo: "tembusu",
    moves: [
      move(
        "Zoom Connect",
        "Helped combat elderly isolation through Zoom activities during COVID-19 restrictions.",
      ),
      move(
        "Gift Packs",
        "Prepared gift packs with the Softball VIA – Sathya Sai Social Service initiative.",
      ),
    ],
  },
  "Promote Literacy for Children in CARE SG": {
    type: "community",
    title: "Participant",
    logo: "care-singapore",
    moves: [
      move("Story Time", "Read with children through the EJC service project."),
      move("Literacy Games", "Supported games and literacy activities."),
    ],
  },
  "MINDS · Secondary 3 Service Learning": {
    type: "community",
    title: "Volunteer",
    logo: "minds",
    moves: [
      move(
        "Game Facilitation",
        "Facilitated games and activities for MINDS beneficiaries through SST service learning.",
      ),
      move(
        "Service Hours",
        "**26 hours** recorded in the school CCA certificate.",
      ),
    ],
  },
  "Willing Hearts": {
    type: "community",
    title: "Volunteer",
    logo: "willing-hearts",
    moves: [
      move(
        "Soup Kitchen",
        "Helped prepare and pack food at the soup kitchen for community beneficiaries.",
      ),
      move(
        "Regular Service",
        "Volunteered regularly, plus an additional PforSST service activity in 2018.",
      ),
    ],
  },
  "#SST-ACTvocates": {
    type: "community",
    title: "Service-learning Participant",
    logo: "sst",
    moves: [
      move(
        "Service Learning",
        "Took part in the Secondary 2 school service-learning project.",
      ),
      move(
        "Service Hours",
        "**16 hours** recorded in the school CCA certificate.",
      ),
    ],
  },
  "Dwen An Social Welfare Foundation · Taiwan": {
    type: "community",
    title: "Student Volunteer",
    logo: "dwen-an",
    location: "Taiwan",
    moves: [
      move(
        "Overseas Service",
        "Five days of overseas service through SST’s Global Citizenship Programme.",
      ),
      move("Cultural Exchange", "Took part in a cultural exchange in Taiwan."),
    ],
  },
  "West Coast Park beach cleanup": {
    type: "community",
    title: "Volunteer",
    logo: "nparks",
    moves: [
      move(
        "Beach Cleanup",
        "Contributed to a school beach cleanup with NEA and the National Parks Board.",
      ),
      move(
        "Service Hours",
        "**12 hours** recorded in the school CCA certificate.",
      ),
    ],
  },
};

// Notes and tags from the original role browser now sit on the card backs.
const engineeringNotes: Readonly<Record<string, string>> = {
  "Caerus Global Management":
    "Research started with sequence-checked, recoverable market data.",
  "Stealth Startup":
    "Browser-driven QA connected user journeys with SQL checks.",
  "CTES Consulting":
    "Recruitment tooling spanned interfaces, APIs, and candidate-document processing.",
  Accenture:
    "Retrieval and agent-assisted testing supported enterprise application work.",
  "D+A Strategies":
    "Backtests included drawdowns, benchmarks, and ATR-based stops.",
  "Republic of Singapore Air Force":
    "Communications work included equipment readiness and joint SAF–RAAF operations.",
  "Singapore Army":
    "Leadership training was paired with tactical networking and signals work.",
};

const technologyMatchers: readonly { label: string; pattern: RegExp }[] = [
  { label: "Python", pattern: /\bpython\b/i },
  { label: "TypeScript", pattern: /\btypescript\b/i },
  { label: "React Native", pattern: /react native/i },
  { label: "React", pattern: /react\//i },
  { label: "Playwright", pattern: /playwright/i },
  { label: "SQL", pattern: /\bsql\b/i },
  { label: "PostgreSQL", pattern: /postgresql/i },
  { label: "Express", pattern: /express/i },
  { label: "AWS", pattern: /\baws\b/i },
  { label: "Cognito", pattern: /cognito/i },
  { label: "Grafana", pattern: /grafana/i },
  { label: "Azure DevOps", pattern: /azure devops/i },
  { label: "BM25", pattern: /bm25/i },
  { label: "Backtrader", pattern: /backtrader/i },
  { label: "pandas / NumPy", pattern: /pandas\/numpy/i },
  { label: "Market data", pattern: /market-data|l2 books/i },
  { label: "Backtesting", pattern: /backtest/i },
  { label: "Feed recovery", pattern: /feed recovery/i },
  { label: "Communications", pattern: /communications/i },
  { label: "Tactical networking", pattern: /tactical networking/i },
];
const technologiesIn = (text: string) =>
  technologyMatchers
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => label)
    .slice(0, 6);

type SourceRecord = {
  org: string;
  role: string;
  dates: string;
  location?: string;
  summary?: string;
  bullets: readonly string[];
};

const defaultType: Readonly<Record<DeckId, CardType>> = {
  work: "systems",
  education: "education",
  community: "leadership",
  volunteering: "community",
};

// Records added later without card details still deal a plain card.
function fallbackDetails(deck: DeckId, record: SourceRecord): CardDetails {
  const lines = record.bullets.length
    ? record.bullets
    : record.summary
      ? [record.summary]
      : [];
  return {
    type: defaultType[deck],
    title: record.role.split(" · ")[0],
    moves: lines
      .slice(0, 2)
      .map((text, index) => move(index ? "Also" : "Highlight", text)),
  };
}

function buildDeck(
  id: DeckId,
  label: string,
  records: readonly SourceRecord[],
): Deck {
  return {
    id,
    label,
    cards: records.map((record, index) => {
      const card = details[record.org] ?? fallbackDetails(id, record);
      const text = `${record.summary ?? ""} ${record.bullets.join(" ")}`;
      return {
        id: `${id}-${index}`,
        number: index + 1,
        type: card.type,
        title: card.title,
        org: record.org,
        role: record.role,
        location: card.location ?? record.location ?? "Singapore",
        dates: record.dates,
        logo: card.logo ? logos[card.logo] : undefined,
        stealth: card.stealth,
        moves: card.moves,
        summary: record.summary,
        bullets: record.bullets,
        tags: id === "work" ? technologiesIn(text) : [],
        note: engineeringNotes[record.org],
        certificates: card.certificates ?? [],
      };
    }),
  };
}

const archiveRecord = (record: {
  title: string;
  role: string;
  dates: string;
  description: string;
  highlights?: readonly string[];
}): SourceRecord => ({
  org: record.title,
  role: record.role,
  dates: record.dates,
  summary: record.description,
  bullets: record.highlights ?? [],
});

export const decks: readonly Deck[] = [
  buildDeck(
    "work",
    "Experience",
    experience.map((record) => ({
      org: record.company,
      role: record.role,
      dates: record.dates,
      location: record.location,
      summary: record.summary,
      bullets: record.highlights,
    })),
  ),
  buildDeck(
    "education",
    "Education",
    [...education, ...earlierEducation].map((record) => ({
      org: record.school,
      role: record.credential,
      dates: record.dates,
      bullets: record.bullets,
    })),
  ),
  buildDeck("community", "Leadership & CCAs", leadership.map(archiveRecord)),
  buildDeck("volunteering", "Volunteering", volunteering.map(archiveRecord)),
];
