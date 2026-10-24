import { assetBase } from "@/content/paths";

export const profile = {
  name: "Ian Abiel Wangsa",
  shortName: "Ian Wangsa",
  role: "NUS computer science student building useful software, applied AI, and quantitative systems.",
  introduction:
    "I build across the stack, from market-data pipelines and AI research to the interfaces people use every day.",
  summary:
    "I study Computer Science at NUS, with a second major in Mathematics and a minor in Economics. My work spans quantitative research at Caerus, product engineering at a startup, automation at CTES, and AI developer tools at Accenture. Outside the code, I organise student events, volunteer, and bring the communication and ownership I learned as a signals commander during National Service.",
  coreSkills: [
    "Applied AI",
    "Quantitative research",
    "Product engineering",
    "Python",
    "TypeScript",
    "C++",
    "React & Next.js",
    "React Native",
    "FastAPI & Node.js",
    "PyTorch",
    "PostgreSQL",
    "AWS & Docker",
  ],
  location: "Singapore",
  education:
    "Computer Science @ NUS · Mathematics second major · Economics minor",
  focus: "Applied AI · Quant systems · Product engineering",
  availability: "Open to engineering, AI & quant opportunities",
  email: "ianwangsa2@gmail.com",
  linkedin: "https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/",
  github: "https://github.com/Manutd1234",
  resumeUrl: `${assetBase}/Ian_Abiel_Wangsa_Resume.pdf`,
};

export const impactStats = [
  { value: "1st", label: "BrainHack TIL-AI · Novice" },
  { value: "0.7–0.8s", label: "Measured market lead-lag" },
  { value: "<30m", label: "Incident testing turnaround" },
  { value: "4.50", label: "NUS GPA / 5.00" },
];

// Titles are shared with the authentic media catalogue.
export const projects = [
  {
    number: "01",
    title: "AlphaEngine",
    category: "Quant infrastructure",
    description:
      "A quantitative research and execution workspace for Binance, Bybit, and Hyperliquid market data, pre-trade risk checks, and operator telemetry.",
    outcome:
      "Reconstructs L2 order books with sequence checks and feed recovery, and aligns feeds on a 100 ms analysis grid.",
    highlights: [
      "Market-data ingestion: Streamed Binance, Bybit and Hyperliquid L2 feeds through asynchronous Python WebSockets, using aiohttp/orjson and compressed Parquet for research-ready storage.",
      "Order-book reconstruction: Reconciled snapshots and incremental deltas, checked sequence continuity and recovered interrupted feeds before aligning venue data on a 100 ms analysis grid.",
      "Risk gateway: Built FastAPI/Pydantic endpoints with 17 pre-trade risk gates, exposing typed request and response contracts to a Next.js, React and TypeScript operator workspace.",
      "Python/C++ parity: Bound the C++ risk core through pybind11 and checked bit-for-bit agreement against the Python implementation across 20 shared regression scenarios.",
      "Deployment and records: Packaged services with Docker and used Supabase PostgreSQL, row-level security and order logs to connect research, pre-trade checks and execution records.",
      "Operator telemetry: Integrated the Telegram Bot API for order, position and P&L updates, keeping the state of the execution workflow visible outside the dashboard.",
    ],
    tags: ["Python", "C++", "FastAPI", "WebSockets", "PostgreSQL"],
    repository: "https://github.com/Manutd1234/AlphaEngine",
    repositoryVisibility: "public",
    live: "https://alphaengine-workspace.vercel.app",
    accent: "cobalt",
    featured: true,
  },
  {
    number: "02",
    title: "BrainHack TIL-AI",
    category: "Multimodal AI · Novice Champion",
    description:
      "Team Pandamonium’s five Dockerised AI services for the DSTA TIL-AI finals: speech, vision, retrieval, adversarial noise, and autonomous navigation.",
    outcome:
      "Combined NVIDIA Parakeet speech recognition, YOLOv11 detection, BM25-first retrieval, and a MaskablePPO navigation agent for an air-gapped evaluation.",
    highlights: [
      "Service architecture: Team Pandamonium packaged speech, vision, retrieval, adversarial noise and autonomous navigation as five Dockerised FastAPI services for the air-gapped TIL-AI finals.",
      "Speech recognition: Fine-tuned NVIDIA Parakeet TDT with a custom decoder, FP16 inference, sorted batching and phrase correction to adapt the ASR pipeline to the competition task.",
      "Computer vision: Tuned YOLOv11 detection for aircraft, vehicles and vessels, including confidence thresholds for the target object classes.",
      "Adversarial robustness: Used a YOLO surrogate and projected gradient descent to generate adversarial perturbations while staying within the evaluation's SSIM and RMSE budgets.",
      "Retrieval and generation: Built a BM25-first question-answering pipeline with optional neural reranking and quantized LLM generation, keeping retrieval available without a network dependency.",
      "Autonomous navigation: Trained MaskablePPO with valid-action masking and reward shaping, with BFS/A* pathing as a fallback. The team finished as Novice Champions.",
    ],
    tags: ["PyTorch", "FastAPI", "YOLOv11", "NeMo", "Docker"],
    repository: "https://github.com/Manutd1234/BrainHack_V2",
    repositoryLabel: "Finals source code",
    repositoryVisibility: "public",
    accent: "gold",
  },
  {
    number: "03",
    title: "Delta1 Research",
    category: "Systematic trading",
    description:
      "A long/short trend and carry strategy across 59 global futures, built for an NUS Investment Society quant research case.",
    outcome:
      "Uses walk-forward validation, execution costs, and reproducible research artifacts to evaluate signals.",
    highlights: [
      "Research universe: Built a long/short systematic strategy across 59 global futures for an NUS Investment Society quantitative research case, using a common panel for comparable experiments.",
      "Signal construction: Blended 12-month trend with basis-momentum carry, sized positions by volatility and targeted 7% annual portfolio risk.",
      "Execution assumptions: Included spread, slippage, fees, market impact and contract-roll costs in the backtest so the reported results reflect the modelled cost of trading.",
      "Historical result: The 1990–2014 backtest produced a 1.59 Sharpe ratio, 13.2% CAGR and −11.8% maximum drawdown after modelled costs. These are research results, not live trading returns.",
      "Out-of-sample validation: Ran a 20-fold anchored walk-forward evaluation covering 5,218 out-of-sample sessions, with a reported Sharpe ratio of 1.42.",
      "Model-selection risk: Compared 13 replicated paths on the same panel. The selected path had the highest Sharpe, while a 0.42 CSCV overfitting probability made selection risk explicit.",
    ],
    tags: ["Python", "pandas", "NumPy", "SciPy", "statsmodels"],
    repository: "https://github.com/Manutd1234/Delta1_Trading_Strategy",
    repositoryVisibility: "public",
    accent: "alpine",
  },
  {
    number: "04",
    title: "CS2 Decision Coach",
    category: "Garena AI Build Challenge",
    description:
      "A Counter-Strike 2 coaching platform that turns native match telemetry into moment-specific tactical feedback.",
    outcome:
      "Parses .dem files, detects first-contact decisions, and grounds LightGBM and LLM coaching in match evidence.",
    highlights: [
      "Replay pipeline: Parsed native CS2 .dem files with AWPy and exposed upload, sample, analysis and result flows through a FastAPI/Pydantic gateway, preserving stable player and decision identifiers.",
      "Decision selection: Detected first-damage contacts and selected up to ten diverse moments for the chosen player. LightGBM replay-value signals support the timeline without treating a model estimate as proof of a good decision.",
      "Evidence boundaries: Restricted coaching to the bounded contact and immediate reaction window, excluding later kills, deaths, round outcomes and match results from the prompt.",
      "Grounded responses: Required the LLM to select parser-owned evidence IDs; the backend validates those references and renders factual prose, rejecting unsupported claims and failing closed when the provider is unavailable.",
      "Replay interface: Built the Next.js/TypeScript radar, player selector, round controls, timeline markers and coaching panels, with progress and result recovery for completed analyses.",
      "Intent coaching: Let players explain one specific decision and receive advice tied to that moment. Bundled Mirage and Inferno replays demonstrate the viewer with saved analysis; live intent requires a backend analysis.",
    ],
    tags: ["Next.js", "FastAPI", "AWPy", "LightGBM", "Pydantic"],
    repository:
      "https://github.com/Manutd1234/ReDecide-Garena-AI-Build-Challenge",
    repositoryVisibility: "public",
    accent: "cobalt",
  },
  {
    number: "05",
    title: "Agentic Fraud Investigation Crew",
    category: "Microsoft Hack the Future · 1st place",
    description:
      "A Microsoft-native multi-agent workflow for financial-crime alert triage, evidence enrichment, adjudication, and suspicious activity report drafting.",
    outcome:
      "Produces explainable evidence packs and keeps consequential decisions with a human reviewer through Teams and Power Automate approval workflows.",
    highlights: [
      "Team architecture: Connected four agents for alert triage, evidence enrichment, adjudication and suspicious activity report drafting in a Microsoft-native workflow.",
      "Evaluation data: Generated the synthetic, PII-free sample alert backlog used to exercise the crew and its before/after operations scoreboard.",
      "Risk-scoring contribution: Wrote a five-rule engine that assigns each alert a score from 0 to 100, with plain-language reasons so reviewers can trace the score back to the triggering rules.",
      "Operations interface: Wired the scoring engine into the dashboard, connecting the sample backlog, prioritisation and before/after views used to demonstrate the workflow.",
      "Evidence and approval: The team assembled explainable evidence packs and routed escalations to a human reviewer through Teams and Power Automate; automated drafting does not replace final approval.",
      "Team result: The Microsoft Hack the Future build placed first. The public repository is the team starter; the separate full team implementation remains private.",
    ],
    tags: ["Azure AI", "RAG", "Cosmos DB", "Power Automate", "Power BI"],
    repository: "https://github.com/sudharsank/oneBrainCell-FraudCrew",
    repositoryLabel: "Public team starter",
    repositoryVisibility: "public",
    accent: "gold",
    repositories: [
      {
        label: "Full team build (private)",
        url: "https://github.com/Asdao/oneBrainCell-FraudCrew",
        visibility: "private",
      },
    ],
  },
];

export const projectArchive = [
  {
    title: "Obital",
    category: "NUS Orbital · Apollo 11",
    group: "AI",
    description:
      "An offline-first study platform with an encrypted document vault, grounded AI tutoring, quizzes, flashcards, XP, study streaks, and optional cloud sync.",
    highlights: [
      "Offline-first interface: Built a React, Vite and TypeScript study workspace with Tailwind CSS and Zustand, bringing document study, tutoring, quizzes, flashcards and progress into one product.",
      "Browser retrieval: Split PDFs and slides into chunks and embedded them with MiniLM inside Web Workers, keeping semantic search in the browser without blocking the interface.",
      "Encrypted workspace: Used Argon2id key derivation and AES-GCM encryption for the document vault, with local storage and optional account-scoped Supabase synchronisation.",
      "Study API: Implemented FastAPI/Pydantic routes for documents, chat and study progress, with SQLAlchemy-backed data access.",
      "Grounded tutoring: Integrated DeepSeek through SSE streaming and tool calling, using retrieved material for tutoring and bounded lesson and quiz generation.",
      "Progress and verification: Added TypeScript grading, XP, streaks and leaderboards, alongside FastAPI/Pytest checks in CI for the study workflow.",
    ],
    tags: ["React", "TypeScript", "FastAPI", "DeepSeek", "Supabase"],
    repository: "https://github.com/Manutd1234/Obital-26",
    repositoryVisibility: "public",
  },
  {
    title: "NUSSIF Portfolio & Risk Tools",
    category: "Portfolio analytics",
    group: "Quant",
    description:
      "IBKR NAV collectors, competition leaderboards, automated portfolio reports, and dashboards for historical and Monte Carlo VaR/ES.",
    highlights: [
      "Portfolio ingestion: Added Python/ib_insync collectors for IBKR paper-account NAV, storing timestamped snapshots in SQLite and presenting portfolio state through Streamlit.",
      "Risk analytics: Computed historical and 50,000-path Monte Carlo VaR/ES in Python/NumPy, alongside exposure and drawdown measures for portfolio review.",
      "Competition reporting: Built React/Streamlit leaderboard views comparing portfolios with SPY and QQQ and reporting Sharpe, Sortino and Calmar ratios.",
      "Scheduled collection: Used SQLite WAL snapshots and systemd services and timers to run repeatable collection jobs and support automated portfolio reports.",
      "Infrastructure contribution: Contributed to EC2 recovery and trade automation using Terraform autoscaling, a Docker IB Gateway and DynamoDB conditional leases with fencing tokens for single-worker failover.",
      "Stress-testing contribution: Supported a React, Node.js and Python/IBKR dashboard covering 19 historical crises, eight macro factors, option Greeks, payoff bounds and VaR/ES.",
      "Research workspace: Built a FastAPI/React platform for BTC breakout cycles, 13F sector rotation and congressional trading, bringing separate research workflows into a shared interface.",
    ],
    tags: ["Python", "IBKR", "React", "Streamlit", "SQLite"],
    repository: "https://github.com/Manutd1234/Infrastructure_Projects",
    repositoryLabel: "Public infrastructure",
    repositoryVisibility: "public",
    repositories: [
      {
        label: "Paper-account risk controls",
        url: "https://github.com/NUSSIF-Developer/pm-risk-cut",
        visibility: "public",
      },
      {
        label: "Portfolio tools (private)",
        url: "https://github.com/NUSSIF-Developer/pm_competition",
        visibility: "private",
      },
      {
        label: "Competition leaderboard (private)",
        url: "https://github.com/NUSSIF-Developer/internal_competition",
        visibility: "private",
      },
      {
        label: "Stress scenarios (private)",
        url: "https://github.com/NUSSIF-Developer/Stress-Scenario-Ian",
        visibility: "private",
      },
      {
        label: "EC2 and trade automation (private)",
        url: "https://github.com/NUSSIF-Developer/Automatic-EC2-Replacement-Trade-Automation-",
        visibility: "private",
      },
    ],
  },
  {
    title: "PneuRelief",
    category: "NUS MedTech",
    group: "Product",
    description:
      "A cast-pressure monitoring app with BLE device connections, sensor notifications, and a mobile interface backed by FastAPI.",
    highlights: [
      "Mobile application: Develop the React Native/Expo and TypeScript interface for a cast-pressure monitoring prototype, connecting device readings with a FastAPI-backed application.",
      "Sensor transport: Implement BLE GATT notifications with react-native-ble-plx so the mobile app can receive updates from the connected pressure-sensing device.",
      "Data decoding: Decode Base64 notification payloads and parse CSV sensor values in TypeScript before handing readings to the application.",
      "Device interaction: Handle commands sent to the device and the Android permission flow required for Bluetooth access.",
      "Connection lifecycle: Handle BLE reconnection in the mobile app and develop against the FastAPI, Supabase and SQLite stack. Frontend and backend repositories remain private.",
    ],
    tags: ["React Native", "Expo", "BLE", "FastAPI", "TypeScript"],
    repository: "https://github.com/PneuReliefApp/frontend",
    repositoryLabel: "Frontend (private)",
    repositoryVisibility: "private",
    repositories: [
      {
        label: "Backend (private)",
        url: "https://github.com/PneuReliefApp/backend",
        visibility: "private",
      },
    ],
  },
  {
    title: "SignMeUp",
    category: "The Merge Hackathon 2026",
    group: "AI",
    description:
      "An accessibility suite combining on-device gesture recognition, wellness assistance, and voice-first navigation for independent living.",
    highlights: [
      "Accessibility suite: The team combined three modules—sign interpretation, Aurora assistance and PathGuardian navigation—in a React/TypeScript prototype for The Merge Hackathon.",
      "Gesture recognition: Used MediaPipe and an LSTM recognition pipeline, allowing each user to train the interpreter on their own signs.",
      "Browser execution: Ran the sign-recognition module entirely in the browser, keeping the gesture interaction on the user's device.",
      "Aurora assistant: Connected Gemini conversation with real-time emotion, hydration-event and fall-detection features in the team's wellness-assistance prototype.",
      "Voice navigation: PathGuardian provides a voice-first navigation flow designed around seniors, with a caregiver live map and route-deviation alerts.",
    ],
    tags: ["React", "TypeScript", "MediaPipe", "Gemini"],
    repository: "https://github.com/Asdao/Signmeup",
    repositoryLabel: "Team source code",
    repositoryVisibility: "public",
  },
  {
    title: "Nexus Academic Coach",
    category: "Student productivity",
    group: "AI",
    description:
      "An AI productivity platform combining academic guidance, task breakdowns, Pomodoro sessions, habit tracking, and progress analytics.",
    highlights: [
      "Application foundation: Built the Next.js 14 and TypeScript interface with Supabase Auth for Google, GitHub and email sign-in, and Zustand state persisted locally.",
      "Academic coach: Connected FastAPI, LangChain and OpenAI gpt-4o-mini to answer study-progress questions and draft personalised study plans.",
      "Task planning: Added task creation, editing, completion and deletion with priority filters, alongside the coach's task-breakdown workflow.",
      "Focus sessions: Built 25-, 50- and 90-minute Pomodoro sessions with subject tracking, session history and XP rewards.",
      "Habits and motivation: Added habit calendars, streak tracking, levels and an XP shop to connect everyday study actions with visible progress.",
      "Progress analytics: Used Chart.js for weekly activity, subject breakdowns and longer-term study trends, giving the coach and the student a shared view of progress.",
    ],
    tags: ["Next.js", "LangChain", "FastAPI", "React"],
    repository: "https://github.com/Manutd1234/Nexus-AI-Helper",
    repositoryVisibility: "public",
  },
  {
    title: "DealMachine",
    category: "BugleRock Rockathon 2026",
    group: "AI",
    description:
      "Investment-banking workflow tools for market research, information memorandum and NDA drafting, and a live deal dashboard.",
    highlights: [
      "Workflow design: Brought market research, transaction-document drafting and deal-pipeline tracking together as investment-banking workflow tools for BugleRock Rockathon.",
      "Slack research analyst: Supersearch uses Python and Claude to work with live news, financial data, statistical forecasts and document drafts from a Slack interface.",
      "Document generation: Built a Node.js, TypeScript and React service for engagement letters, teasers, information memoranda and NDA drafting workflows.",
      "Review routing: Connected document work to Slack approval routing so generated drafts can move through a review step.",
      "Deal operations: Built a Vite/Chart.js dashboard with a Kanban pipeline, analytics and CRM/Slack integration hooks to make deal status visible alongside the research and drafting tools.",
    ],
    tags: ["Python", "React", "PostgreSQL", "Claude", "Chart.js"],
    repository: "https://github.com/Manutd1234/Rockathon-2026-",
    repositoryVisibility: "public",
  },
  {
    title: "Coca-Cola Indonesia growth strategy",
    category: "Work Simulation Program",
    group: "Strategy",
    description:
      "A five-year case study proposing a Greater Jakarta launch for Coke Zero and Ades, with a US$10 million budget, staged investment, and an illustrative scenario model.",
    highlights: [
      "Problem framing: Structured a five-year growth proposal with the CALP framework, grounding the demand case in Indonesia's Ministry of Health SKI 2023 survey and distinguishing evidence from assumptions.",
      "Initial market: Recommended a US$1.4m Greater Jakarta pilot around Coke Zero with meals and Ades for water on the go, with working adults aged 21–35 as a proposed test segment.",
      "Channel experiment: Proposed matched retail test cells, selected warung trials and stock-checked quick-commerce placements around workplace and transit occasions.",
      "Repeat measurement: Defined a 60-day eligible paid-repeat measure with a holdout comparison, separating free initial sampling and incentivised repeat from the desired purchase behaviour.",
      "Investment gates: Tied the remaining US$8.6m to measured paid repeat and portfolio contribution before wider expansion, making the release of funding conditional on evidence.",
      "Scenario model: Allocated the illustrative US$10m budget across retail trial, media, repeat purchase, partnerships, measurement and reserve. The financial model supports a case-study recommendation rather than reporting realised business results.",
    ],
    tags: ["Market research", "Financial modelling", "Growth strategy"],
    repository: `${assetBase}/Coca-Cola_Indonesia_Growth_Strategy.pdf`,
    repositoryLabel: "Read case study",
    repositoryVisibility: "public",
    repositories: [
      {
        label: "Case-study PDF on GitHub",
        url: "https://github.com/Manutd1234/Personal-Website/blob/main/public/Coca-Cola_Indonesia_Growth_Strategy.pdf",
        visibility: "public",
      },
    ],
  },
];

export const experience = [
  {
    company: "Caerus Global Management",
    role: "Quantitative Summer Analyst · Apprenticeship",
    location: "Singapore",
    dates: "Aug — Sep 2026",
    summary:
      "Built market-data infrastructure and execution-aware backtests for cross-venue quantitative research.",
    highlights: [
      "Reconstructed Binance and Hyperliquid L2 books on a 100 ms grid with sequence checks and feed recovery.",
      "Measured a 0.7–0.8 second market lead-lag and tested signal decay after fees, latency, and market impact.",
    ],
  },
  {
    company: "Stealth Startup",
    role: "Product Engineer Intern",
    location: "Singapore",
    dates: "Jul 2026 — Present",
    summary:
      "Build product features, automated QA, and analytics across web and React Native mobile applications.",
    highlights: [
      "Validated 23 authentication, onboarding, and authorization flows with Playwright and SQL assertions.",
      "Built SQL/Grafana product dashboards and shipped fixes across sign-in, messaging, calendar sync, and iOS.",
    ],
  },
  {
    company: "CTES Consulting",
    role: "Software Engineer Intern",
    location: "Singapore",
    dates: "Jul 2026 — Present",
    summary:
      "Build recruitment portals and sourcing automation across frontend, backend, data, and AWS infrastructure.",
    highlights: [
      "Implemented React/TypeScript portals, Express APIs, PostgreSQL migrations, and Cognito access controls.",
      "Reduced candidate profiling from 1–2 days to hours with Python document parsing and BM25 ranking.",
    ],
  },
  {
    company: "Accenture",
    role: "Application Engineer Intern · Technology, Health & Public Services",
    location: "Singapore",
    dates: "Apr — Jul 2026",
    summary:
      "Developed AI tools for root-cause analysis and test generation alongside enterprise application support.",
    highlights: [
      "Built hybrid BGE/BM25 retrieval over code and logs, with Git and Azure DevOps workflows.",
      "Cut incident testing from days to under 30 minutes with agent-assisted test generation.",
    ],
  },
  {
    company: "D+A Strategies",
    role: "Quant Trainee · Apprenticeship",
    location: "Remote",
    dates: "Mar 2026 — Present",
    summary:
      "Research and backtest systematic strategies using Python, Backtrader, and financial time-series data.",
    highlights: [
      "Implemented ARIMA, Bollinger-band, and EMA-pullback strategies with pandas/NumPy feature pipelines.",
      "Evaluated Sharpe ratios, drawdowns, buy-and-hold benchmarks, and ATR-based stops.",
    ],
  },
  {
    company: "Republic of Singapore Air Force",
    role: "Air Force Signals Commander · 3rd Sergeant, National Service",
    location: "Singapore",
    dates: "Nov 2023 — Jan 2025",
    summary:
      "Led communications, equipment readiness, and unit initiatives, including joint SAF–RAAF communications during Exercise Wallaby in Australia.",
    highlights: [
      "Served as Comms Store IC, Gym Innovation IC, and National Education IC.",
      "Contributed to consecutive unit CDF National Education Excellence Awards; received Outstanding grades for both performance and conduct.",
    ],
  },
  {
    company: "Singapore Army",
    role: "Specialist Cadet · National Service",
    location: "Singapore",
    dates: "Mar — Nov 2023",
    summary:
      "Completed military leadership and signals training through Basic Military Training, Specialist Cadet School, and the Signal Institute.",
    highlights: [
      "Led a section of seven during specialist cadet training.",
      "Trained in wireless communications, tactical networking, and leadership; promoted to Specialist on 17 November 2023.",
    ],
  },
];

export const earlierExperience = [
  {
    company: "NUS Rotaract Club",
    role: "Student Educator",
    dates: "Aug 2025 — Jan 2026",
    summary:
      "Taught primary-school learners programming and computational thinking through educational activities.",
  },
  {
    company: "Success.Nat Tuition Centre",
    role: "Private Tutor / Teaching Assistant · Part-time",
    dates: "Feb — Jul 2025",
    summary:
      "Taught Mathematics and Science to Secondary 1–4 students preparing for examinations.",
  },
  {
    company: "Amazon Warehouse",
    role: "Warehouse Associate",
    dates: "Dec 2022 — Feb 2023",
    summary:
      "Picked, packed, and checked customer orders in a fast-paced warehouse, developing accuracy, teamwork, and efficiency.",
  },
];

export const education = [
  {
    school: "National University of Singapore",
    credential: "Bachelor of Computing in Computer Science",
    dates: "Aug 2025 — Aug 2029 · Expected",
    bullets: [
      "Second major in Mathematics; minor in Economics. Current GPA: 4.50 / 5.00.",
      "Programming and software coursework: Programming Methodology I (CS1101S), Programming Methodology II (CS2030S), Data Structures & Algorithms (CS2040S), Software Engineering (CS2103T), and Computer Organization (CS2100).",
      "Mathematics coursework: Discrete Structures (CS1231S), Calculus for Computing (MA1521), Linear Algebra for Computing (MA1522), and Probability & Statistics (ST2334).",
      "Other coursework: Introduction to Economic Analysis (EC1101E) and Design and Make (EG1311). Coursework includes current and past modules.",
      "Programme participation: SAP S.C.A.L.E 2026 (one of 12 teams), WorldQuant 2026, and Discover GIC 2026.",
      "Industry insight events: Goldman Sachs Quant Strats Insight Day 2026; Bank of America Quant Strats & Data Group Insight Day; Susquehanna First Year Discovery Event.",
      "Work Simulation Program, NYC × TalentGeist, AY2026/27.",
    ],
  },
  {
    school: "Eunoia Junior College",
    credential: "GCE A-Levels · Science Stream",
    dates: "Feb 2021 — Nov 2022",
    bullets: [
      "Grade: AAAA/B. H2 Mathematics, Physics, Chemistry, and Economics; H1 Chinese, General Paper, and Project Work.",
      "Dean’s List (Academic), 2021 and 2022.",
      "Softball team, 2021–2022: National School Games A Division first runner-up in 2022; SSSC Colours Award, 23 September 2022.",
      "VIA Ambassador and Softball VIA committee member; organised an online activity for elderly residents at Tembusu Home for the Aged.",
      "Participated in EuRun (2021, 2022), Eunoia Spartan Race (2022), and the Environment Literacy Programme – EJ Earthlings (2022).",
    ],
  },
];

export const earlierEducation = [
  {
    school: "School of Science and Technology, Singapore",
    credential: "GCE O-Levels · Science Stream",
    dates: "Jan 2017 — Nov 2020",
    bullets: [
      "Top GCE O-Level Performer, 2020; 2020 Edusave Scholarships for Independent Schools (Yearly Award), awarded in April 2021.",
      "Class Vice-Chairperson, 2020; SConnect leadership modules, 2017 and 2018.",
      "Football CCA, 2017–2020; represented the school in National School Games competitions.",
      "Represented SST in the Singapore and Asian Schools Math Olympiad, 2018 and 2019; participated in the Australian National Chemistry Quiz, 2019.",
      "SST Changemakers Innofest 2018: Best Business Pitch Award and second place in the Active Elderly Award (Individual Strand).",
      "Community service: West Coast Park beach cleanup (2017), Dwen An Social Welfare Foundation during the Taiwan Global Citizenship Programme (2017), #SST-ACTvocates (2018), Willing Hearts (2018–2019), and MINDS (2019).",
    ],
  },
  {
    school: "Bukit Timah Primary School",
    credential: "PSLE",
    dates: "Jan 2011 — Nov 2016",
    bullets: [
      "Mathematics Olympiad team, 2015–2016; Football CCA, 2013–2016.",
      "National Mathematical Olympiad of Singapore Bronze and KooBits Maths Challenge Top Brain of School (Season 1), 2015.",
      "School athletics: first in the 4×100 m relay (2015); third in the 2×100 m relay (2014).",
      "SwimSafer Gold, 2013; Grade 3 Piano with Merit.",
    ],
  },
];

export const leadership = [
  {
    title: "NUS Student Investment Fund",
    role: "Quantitative Developer Analyst",
    dates: "Aug 2026 — Present",
    description:
      "Build portfolio analytics and infrastructure for student investment research.",
    highlights: [
      "Added ib_insync NAV collectors and Streamlit dashboards for IBKR paper portfolios, with systemd-scheduled snapshots.",
      "Computed historical and 50,000-path Monte Carlo VaR/ES, exposure and drawdown in Python/NumPy.",
      "Supported competition leaderboards with SPY/QQQ benchmarks and Sharpe, Sortino and Calmar ratios.",
      "Contributed single-worker EC2 failover with Terraform, IB Gateway and DynamoDB leases with fencing tokens.",
      "Contributed stress dashboards for 19 crises and eight macro factors, with Greeks, payoff bounds and VaR/ES.",
    ],
  },
  {
    title: "NUS MedTech · PneuRelief",
    role: "Software Engineer",
    dates: "Aug 2026 — Present",
    description:
      "Develop a mobile cast-pressure monitoring system with React Native/Expo, FastAPI and Supabase/SQLite.",
    highlights: [
      "Implement BLE GATT notifications and Base64/CSV sensor decoding in TypeScript with react-native-ble-plx.",
      "Manage device commands, Android permissions and BLE reconnection in React Native/TypeScript.",
    ],
  },
  {
    title: "Google Developer Group @ NUS Computing",
    role: "Software Engineer",
    dates: "Aug 2026 — Present",
    description:
      "Build volunteer workflows and software for non-profit partner Caring For Life.",
    highlights: [
      "Build the volunteer workflows in React/TypeScript/Vite with TanStack Query.",
      "Contribute FastAPI/Pydantic APIs with Firebase Auth and SQLModel/PostgreSQL persistence.",
      "Validate typed REST clients with Pytest and Vitest regression tests across frontend and backend.",
    ],
  },
  {
    title: "NUS Fintech Society",
    role: "Machine Learning Trainee",
    dates: "Aug 2026 — Present",
    description:
      "Research financial machine learning through reproducible modelling and evaluation.",
    highlights: [
      "Trained scikit-learn credit-risk models on six datasets with logistic regression, ensembles, SVMs and MLPs.",
      "Built Pipeline/ColumnTransformer preprocessing with stratified 60/20/20 splits and cross-validation.",
      "Achieved 0.952 held-out HMEQ ROC-AUC with gradient boosting, validation-only model and threshold selection, and calibration checks.",
      "Built k-means, PCA, GMM and Isolation Forest pipelines as reproducible Jupyter experiments.",
    ],
  },
  {
    title: "NUS Games Development Group",
    role: "Software Engineer · Project Pandamonium",
    dates: "Jan 2026 — Present",
    description: "Build a 2D murder mystery game in Unity and C#.",
    highlights: [
      "Built procedural 2D board rendering in Unity/C#.",
      "Centralised Unity/C# state updates so board rendering and gameplay stay in sync.",
    ],
  },
  {
    title: "NUSSU VENtures",
    role: "Operations Executive / Operations Coordinator Officer",
    dates: "Nov 2025 — Oct 2026",
    description:
      "Coordinate student events, campus venues, resources, and stakeholder communication.",
  },
  {
    title: "RunNUS · NUS Sports Club",
    role: "Admin & Finance Executive",
    dates: "Jan — Sep 2026",
    description:
      "Managed budgets, financial tracking, and vendor procurement for a campus run engaging 1,000+ runners.",
  },
  {
    title: "SunNUS · NUS Sports Club",
    role: "Team Sports Series Executive",
    dates: "Jan — Jun 2026",
    description:
      "Coordinated tournament fixtures, venue setup, and logistics for a beach sports event with 400+ participants.",
  },
  {
    title: "NUS Varsity Christian Fellowship",
    role: "Member",
    dates: "AY2025/26",
    description: "Member of the NUS Varsity Christian Fellowship community.",
  },
  {
    title: "Eunoia Junior College · Softball",
    role: "Team Member",
    dates: "2021 — 2022",
    description:
      "Represented EJC in National School Games A Division softball, earning team silver in 2022 and the SSSC Colours Award.",
  },
  {
    title: "School of Science and Technology · Class leadership",
    role: "Class Vice-Chairperson",
    dates: "2020",
    description:
      "Served as Class Vice-Chairperson; completed SConnect leadership development modules in 2017 and 2018.",
  },
  {
    title: "School of Science and Technology · Football",
    role: "Team Member",
    dates: "2017 — 2020",
    description:
      "Represented the school at National School Games football competitions and participated in house sporting events.",
  },
  {
    title: "School of Science and Technology · Mathematics Society",
    role: "Olympiad Participant",
    dates: "2018 — 2019",
    description:
      "Represented SST in the Singapore and Asian Schools Math Olympiad in 2018 and 2019.",
  },
  {
    title: "Bukit Timah Primary School · Mathematics Olympiad",
    role: "Team Member",
    dates: "2015 — 2016",
    description:
      "Trained with the school mathematics olympiad team; received NMOS Bronze in 2015.",
  },
  {
    title: "Bukit Timah Primary School · Football",
    role: "Team Member",
    dates: "2013 — 2016",
    description:
      "Participated in the school Football CCA and inter-school games.",
  },
];

export const volunteering = [
  {
    title: "Project BHID · NUS Community Service Club",
    role: "Programmes Head",
    dates: "Aug 2025 — Aug 2026",
    description:
      "Led programme design for elderly beneficiaries with intellectual disabilities and trained student volunteers.",
    highlights: [
      "Recognised with a Certificate of Appreciation for contributions as Programmes Head in AY2025/26.",
    ],
  },
  {
    title: "Project CUP · NUS Rotaract Club",
    role: "Student Volunteer",
    dates: "Aug — Nov 2025",
    description:
      "Facilitated games and community activities with primary-school children.",
  },
  {
    title: "Programming for Kids · Youth Corps Singapore",
    role: "Volunteer Educator",
    dates: "5 — 9 Jan 2026",
    description:
      "Taught Scratch programming to Primary 1–6 learners, with computational thinking and introductory machine-learning activities.",
  },
  {
    title: "EJC Softball VIA · Tembusu Home for the Aged",
    role: "VIA Ambassador / Committee Member",
    dates: "Mar 2021 — May 2022",
    description:
      "Helped combat elderly isolation through Zoom activities and prepared gift packs during COVID-19 restrictions.",
    highlights: [
      "Part of the Softball VIA – Sathya Sai Social Service initiative.",
    ],
  },
  {
    title: "Promote Literacy for Children in CARE SG",
    role: "Participant",
    dates: "2022",
    description:
      "Read with children and supported games and literacy activities through the EJC service project.",
  },
  {
    title: "MINDS · Secondary 3 Service Learning",
    role: "Volunteer",
    dates: "Sep 2019",
    description:
      "Facilitated games and activities for MINDS beneficiaries through the SST service-learning programme.",
    highlights: ["26 hours recorded in the school CCA certificate."],
  },
  {
    title: "Willing Hearts",
    role: "Volunteer",
    dates: "Jan 2018 — Jan 2019",
    description:
      "Helped prepare and pack food at the soup kitchen for community beneficiaries.",
    highlights: [
      "The SST record documents regular volunteering and an additional PforSST service activity in 2018.",
    ],
  },
  {
    title: "#SST-ACTvocates",
    role: "Service-learning Participant",
    dates: "2018",
    description:
      "Participated in the Secondary 2 school service-learning project.",
    highlights: ["16 hours recorded in the school CCA certificate."],
  },
  {
    title: "Dwen An Social Welfare Foundation · Taiwan",
    role: "Student Volunteer",
    dates: "Nov 2017",
    description:
      "Participated in a five-day overseas service and cultural exchange through SST’s Global Citizenship Programme.",
  },
  {
    title: "West Coast Park beach cleanup",
    role: "Volunteer",
    dates: "2017",
    description:
      "Contributed to a school beach cleanup with the National Environment Agency and National Parks Board.",
    highlights: ["12 hours recorded in the school CCA certificate."],
  },
];

// Technical résumé and the complete LinkedIn Skills listing, reconciled October 2026.
export const skillGroups = [
  {
    label: "Programming languages",
    items: [
      "Python",
      "C++20",
      "Java",
      "Go",
      "TypeScript",
      "JavaScript",
      "SQL",
      "C#",
      "Bash",
      "HTML / CSS",
    ],
  },
  {
    label: "Web & mobile",
    items: [
      "React",
      "Next.js",
      "React Native",
      "Expo",
      "Tailwind CSS",
      "Zustand",
      "TanStack Query",
      "Unity",
      "Vite",
    ],
  },
  {
    label: "Backend & APIs",
    items: [
      "Node.js / Express",
      "FastAPI",
      "Flask",
      "Spring Boot",
      "PEGA",
      "REST",
      "WebSockets",
      "SSE",
      "Pydantic",
      "SQLAlchemy",
      "SQLModel",
      "pybind11",
      "Cryptography",
    ],
  },
  {
    label: "AI & machine learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "LightGBM",
      "XGBoost",
      "Transformers",
      "NeMo",
      "YOLO",
      "MediaPipe",
      "Stable-Baselines3",
      "RAG / BM25",
      "Fine-tuning",
      "Quantized inference",
      "Embeddings",
      "Local LLMs",
      "Large Language Models (LLM)",
      "Agentic AI Development",
      "Machine Learning",
      "Speech recognition",
      "Reinforcement Learning",
      "Natural Language Processing (NLP)",
      "Computer Vision",
      "OpenCV",
      "LangChain",
      "Gemma 4",
    ],
  },
  {
    label: "Data & quantitative research",
    items: [
      "NumPy",
      "pandas",
      "SciPy",
      "statsmodels",
      "Backtrader",
      "Monte Carlo",
      "VaR / ES",
      "Option Greeks",
      "Walk-forward validation",
      "Jupyter",
      "GARCH",
      "Hidden Markov models",
      "Kalman filters",
      "ETL Pipelines",
      "Quantitative Research",
      "Quantitative Analytics",
      "Data Analysis",
      "Financial Markets",
      "Binance",
      "Bybit",
    ],
  },
  {
    label: "Databases & storage",
    items: [
      "PostgreSQL",
      "Supabase",
      "SQLite",
      "Redis",
      "Parquet",
      "Neo4j",
      "ChromaDB",
    ],
  },
  {
    label: "Cloud & delivery",
    items: [
      "AWS",
      "AWS EC2",
      "AWS ECR",
      "AWS S3",
      "AWS Cognito",
      "AWS RDS",
      "AWS DynamoDB",
      "AWS CloudFront",
      "Docker",
      "Docker Compose",
      "Terraform",
      "Linux",
      "GitHub Actions",
      "Azure DevOps",
      "OIDC",
      "Cloudflare",
      "Firebase",
      "Power Automate",
      "CI / CD",
      "Cloud Computing",
      "Vercel",
      "Cisco Networking",
      "IP Networking",
    ],
  },
  {
    label: "Testing & engineering tools",
    items: [
      "Playwright",
      "Pytest",
      "Vitest",
      "Git",
      "CMake",
      "Streamlit",
      "Grafana",
      "MCP",
      "BLE",
      "Production Engineering",
      "Software Testing Life Cycle (STLC)",
    ],
  },
  {
    label: "Business & collaboration",
    items: [
      "Project Management",
      "Leadership",
      "SAP Products",
      "Microsoft Products",
      "Slack",
    ],
  },
];

export const spokenLanguages = [
  { title: "English", level: "Fluent" },
  { title: "Chinese", level: "Fluent" },
  { title: "Bahasa Indonesia", level: "Fluent" },
  { title: "Hokkien", level: "Limited proficiency" },
];

export type AchievementRecord = {
  title: string;
  issuer: string;
  detail?: string;
  year?: string;
  certificateKey?: string;
  certificateKeys?: readonly string[];
};
export const achievementGroups: readonly {
  title: string;
  description: string;
  items: readonly AchievementRecord[];
}[] = [
  {
    title: "Technical competitions",
    description: "Building under pressure, with a team.",
    items: [
      {
        title: "BrainHack TIL-AI 2026",
        issuer: "DSTA Singapore · Team Pandamonium",
        detail: "Novice Champion",
        year: "2026",
        certificateKey: "brainHackChampion",
        certificateKeys: ["brainHackMedal", "brainHackChampion"],
      },
      {
        title: "Hack the Future AI Hackathon 2026",
        issuer: "NTT DATA × Microsoft",
        detail: "1st place",
        year: "2026",
        certificateKey: "hackFutureFirstPlace",
      },
      {
        title: "BügleRock Rockathon 2026",
        issuer: "BügleRock",
        detail: "Top 5 Finalist Team",
        year: "25–27 Mar 2026",
        certificateKey: "rockathonTop5",
      },
      {
        title: "SunnyHacks 2026",
        issuer: "SunnyHacks",
        detail: "2nd Place",
        year: "Feb 2026",
        certificateKey: "sunnyHacksSecondPlace",
      },
      {
        title: "SignMeUp · The Merge Hackathon 2026",
        issuer: "The Merge Hackathon",
        detail: "Honorary Recognition",
        year: "2026",
        certificateKey: "signMeUpHonoraryRecognition",
      },
    ],
  },
  {
    title: "Government awards & scholarships",
    description:
      "Recognition from the Ministry of Education and the community.",
    items: [
      {
        title: "Edusave Scholarships for Independent Schools (Yearly Award)",
        issuer:
          "Ministry of Education · School of Science and Technology, Singapore",
        detail: "Academic year 2020; letter issued 5 April 2021",
        year: "2020",
        certificateKey: "esisScholarship2020",
      },
      {
        title: "CCC–CDC Education Merit Award",
        issuer: "CCC–CDC",
        year: "2022",
        certificateKey: "edusaveMerit2022",
      },
      {
        title: "Edusave Certificate of Academic Achievement",
        issuer: "Ministry of Education",
        year: "2019, 2021, 2022",
        certificateKeys: [
          "edusaveAcademic2019",
          "edusaveAcademic2021",
          "edusaveAcademic2022",
        ],
      },
      {
        title: "Edusave Good Progress Award",
        issuer: "Ministry of Education",
        year: "2017, 2019, 2021",
        certificateKeys: [
          "edusaveProgress2017",
          "edusaveProgress2019",
          "edusaveProgress2021",
        ],
      },
    ],
  },
  {
    title: "Academic & sporting awards",
    description: "Milestones from primary school through junior college.",
    items: [
      {
        title: "Dean’s List (Academic)",
        issuer: "Eunoia Junior College",
        year: "2021, 2022",
        certificateKeys: ["deanList2021", "deanList2022"],
      },
      {
        title: "National School Games A Division · Softball",
        issuer: "Eunoia Junior College",
        detail: "1st runner-up · Team silver",
        year: "2022",
        certificateKeys: ["ejcSoftballTeam", "coloursAward2022"],
      },
      {
        title: "SSSC Colours Award · Softball",
        issuer: "Singapore Schools Sports Council",
        detail: "Sporting excellence in softball",
        year: "23 Sep 2022",
        certificateKey: "coloursAward2022",
      },
      {
        title: "Top GCE O-Level Performer",
        issuer: "School of Science and Technology, Singapore",
        year: "2020",
        certificateKey: "sstTopPerformer2020",
      },
      {
        title: "Innofest · Best Business Pitch Award",
        issuer: "SST Changemakers Innofest",
        detail: "Active Elderly · Individual Strand",
        year: "2018",
        certificateKey: "sstBusinessPitch2018",
      },
      {
        title: "Innofest · Active Elderly Award",
        issuer: "SST Changemakers Innofest",
        detail: "2nd place · Individual Strand",
        year: "2018",
        certificateKey: "sstActiveElderly2018",
      },
      {
        title: "Sports Day - Athletics · SST",
        issuer: "School of Science and Technology, Singapore",
        detail: "1st, 4×100 m relay (2017, 2018); 3rd, 100 m (2018)",
        year: "2017–2018",
      },
      {
        title: "National Mathematical Olympiad of Singapore",
        issuer: "NUS High School of Math & Science",
        detail: "Bronze",
        year: "2015",
        certificateKey: "nmosBronze2015",
      },
      {
        title: "KooBits Maths Challenge",
        issuer: "Bukit Timah Primary School",
        detail: "Top Brain of School · Season 1",
        year: "2015",
        certificateKey: "koobits2015",
      },
      {
        title: "Sports Day - Athletics",
        issuer: "Bukit Timah Primary School",
        detail: "1st, 4×100 m relay (2015); 3rd, 2×100 m relay (2014)",
        year: "2014–2015",
      },
      {
        title: "SwimSafer Gold",
        issuer: "Swimming proficiency",
        detail: "Gold",
        year: "2013",
      },
      {
        title: "Piano Grade 3 · Merit",
        issuer: "Music achievement",
        detail: "Passed with Merit",
      },
    ],
  },
  {
    title: "Service & leadership",
    description: "Recognition for service and contributions to a wider team.",
    items: [
      {
        title: "Certificate of Appreciation · Project BHID",
        issuer: "NUS Students’ Community Service Club",
        detail: "Programmes Head · AY2025/26",
        year: "2026",
        certificateKey: "bhid",
      },
      {
        title:
          "Chief of Defence Force (CDF) National Education Excellence Award",
        issuer: "160 SQN · Unit award",
        detail: "Contributed as National Education IC",
        year: "2023/24, 2024/25",
        certificateKey: "cdfNationalEducationPhoto",
      },
      {
        title: "National Service · Outstanding Performance & Conduct",
        issuer: "Singapore Armed Forces",
        detail:
          "Outstanding grades for both overall performance and overall conduct",
        year: "Jan 2025",
        certificateKey: "nsPerformanceConduct",
      },
      {
        title: "IPPT Gold Award",
        issuer: "Singapore Armed Forces",
        detail: "Award recorded in National Service transcript",
        year: "National Service",
        certificateKeys: ["ipptGoldBadge", "nsAwardsExcerpt"],
      },
      {
        title: "Marksmanship Award",
        issuer: "Singapore Armed Forces",
        detail: "Award recorded in National Service transcript",
        year: "National Service",
        certificateKeys: ["marksmanshipBadge", "nsAwardsExcerpt"],
      },
    ],
  },
];

export const certifications = [
  {
    title: "AI Fluency: Frameworks & Foundations",
    issuer: "Anthropic",
    year: "May 2026",
    certificateKey: "aiFluency",
  },
  {
    title: "Claude 101",
    issuer: "Anthropic",
    year: "May 2026",
    certificateKey: "claude101",
  },
  {
    title: "Optimizing Code in Java",
    issuer: "DataCamp",
    year: "Mar 2026",
    certificateKey: "datacampOptimizingJava",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/course/63e91bedf6cc981f084b817e894ed83ac08752b0",
  },
  {
    title: "AI/BI for Data Analysts",
    issuer: "Databricks Academy",
    year: "Jan 2026",
    certificateKey: "databricksAiBi",
  },
  {
    title: "Introduction to Docker",
    issuer: "DataCamp",
    year: "Jan 2026",
    certificateKey: "datacampDocker",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/course/67146a65795262e93dc2b89db7af6a9914d3a7f2",
  },
  {
    title: "AWS Cloud Practitioner (CLF-C02)",
    issuer: "DataCamp",
    detail: "Course",
    year: "Jan 2026",
    certificateKey: "datacampAwsCloudPractitioner",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/track/9a001955e97c506ce022e859b621878fa59d6d7b",
  },
  {
    title: "GitHub Foundations",
    issuer: "DataCamp",
    year: "Jan 2026",
    certificateKey: "datacampGithubFoundations",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/track/4fc4e0aa33d0c27dd316663b8a832775a5de63ef",
  },
  {
    title: "Java Fundamentals",
    issuer: "DataCamp",
    year: "Jan 2026",
    certificateKey: "datacampJavaFundamentals",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/track/294bf9b2ec760c7eecaaa7713d17496a6c385c9a",
  },
  {
    title: "SQL Fundamentals",
    issuer: "DataCamp",
    year: "Jan 2026",
    certificateKey: "datacampSqlFundamentals",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/track/752d0cf782a0bbc62ff7e18a812a42538403581a",
  },
  {
    title: "Machine Learning Fundamentals in Python",
    issuer: "DataCamp",
    year: "Jan 2026",
    certificateKey: "datacampMachineLearning",
    verificationUrl:
      "https://www.datacamp.com/completed/statement-of-accomplishment/track/df7659f509b6102dd8bdaa75ce00a63c5814baf3",
  },
  {
    title: "Cisco Content Networking Specialist Certification",
    issuer: "Cisco",
    detail: "Issued Nov 2023 · Expired Jan 2025",
    year: "2023–2025",
  },
];

// Compatibility exports use the same career data, without stale social profile counts.
export const credentials = certifications.map((item) => item.title);
export const linkedinSnapshot = {
  url: profile.linkedin,
  headline: profile.role,
  about: profile.summary,
};
export const linkedinDetails = {
  experience,
  education,
  projects: projectArchive,
  volunteering,
  certifications,
  awards: achievementGroups.flatMap((group) => group.items),
  languages: spokenLanguages,
};
