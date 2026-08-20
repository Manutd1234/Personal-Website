export const profile = {
  name: 'Ian Abiel Wangsa',
  shortName: 'Ian Wangsa',
  role: 'NUS computer science student building applied AI, quantitative systems, and secure software.',
  introduction:
    'I build practical software that helps people make better decisions. My work sits at the intersection of ' +
    'cybersecurity, AI, and finance, with a bias toward collaborative teams and solutions that create real impact.',
  location: 'Singapore',
  education: 'Computer Science @ NUS · Economics & Statistics minor',
  focus: 'AI · Cybersecurity · Finance',
  availability: 'Open to meaningful collaborations',
  email: 'ianwangsa2@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/',
  github: 'https://github.com/Manutd1234',
  resumeUrl: `${import.meta.env.BASE_URL}Ian_Abiel_Wangsa_Resume.pdf`,
};

// Public profile index captured from LinkedIn on 21 August 2026. Counts keep the portfolio honest
// without copying private analytics or turning the site into a raw social-feed mirror.
export const linkedinSnapshot = {
  url: profile.linkedin,
  headline: 'NUS CS | Ex-Accenture | AI, Finance, Cybersecurity',
  about:
    "Hi! I'm Ian. I am an NUS Computer Science student with a passion for building innovative solutions that actually make a difference. I view technology as a tool to enhance human life and improve the way we make decisions. My academic and personal focus is currently centered on Cybersecurity, AI, and Finance.\n\nI am fascinated by the rapid evolution of these fields and am dedicated to gaining a deep, well-rounded understanding of the industry. I approach my work with diligence and a collaborative spirit, believing that diverse perspectives are the key to unlocking true innovation.\n\nIf you are interested in discussing the future of tech, security, or AI, let’s connect!",
  topSkills: ['JavaScript', 'Java', 'SQL', 'Amazon Web Services (AWS)'],
  followerCount: 1227,
  projectCount: 14,
  skillCount: 61,
  certificationCount: 11,
  courseCount: 8,
  awardCount: 15,
  volunteerCount: 7,
  languageCount: 4,
};

export const linkedinDetails = {
  experience: [
    {
      title: 'Software Engineer',
      organisation: 'CTES Consulting',
      dates: 'Jul 2026 — Present',
      note: 'Team lead for an AI sourcing pipeline that turns a client job description into an Excel shortlist with source documents in minutes; also contributed role-scoped portals across frontend, backend, and database layers.',
    },
    {
      title: 'Product Engineer',
      organisation: 'Stealth Startup',
      dates: 'Jul 2026 — Present',
      note: 'Built browser-driven E2E regression pipelines, SQL-backed product analytics, and full-stack features across onboarding, messaging, notifications, and mobile sign-in.',
    },
    {
      title: 'Quant Trainee',
      organisation: 'D+A Strategies',
      dates: 'Mar 2026 — Present',
      note: 'Training in quantitative finance, algorithmic strategy design, backtesting, financial modelling, and data-driven analysis of market inefficiencies.',
    },
    {
      title: 'Admin & Finance Executive',
      organisation: "NUS Students' Sports Club · RunNUS",
      dates: 'Jan 2026 — Present',
      note: 'Oversees budgets, logistics, and data consolidation for a 1,000+ participant charity run.',
    },
    {
      title: 'Team Sport Series Executive',
      organisation: "NUS Students' Sports Club · SunNUS",
      dates: 'Jan 2026 — Jun 2026',
      note: "Organised games, venues, logistics, and participant communications for NUS's largest beach sporting event with 300+ participants.",
    },
    {
      title: 'Software Engineer',
      organisation: 'NUS Game Development Group · Pandamonium',
      dates: 'Jan 2026 — Present',
      note: 'Leads C# development for an interactive murder mystery game, including game-state management, custom rendering, and scalable software design.',
    },
  ],
  education: [
    {
      school: 'National University of Singapore',
      credential: 'Bachelor of Computer Science · Minor in Economics and Statistics',
      dates: 'Aug 2025 — Aug 2029',
      note: 'First Class Honours. Activities include Project BHID, SunNUS, RunNUS, NUSSU VENtures, NUS Games Development Group, Rotaract, and NUS VCF.',
    },
    {
      school: 'Eunoia Junior College',
      credential: "GCE 'A' Level · AAAA/B",
      dates: 'Feb 2021 — Nov 2022',
      note: "Softball VIA Committee Member. Dean's List, Edusave Merit, Edusave Good Progress, Edusave Academic Achievement, and SSSC Colours awards.",
    },
  ],
  projects: [
    {
      title: 'CS2 Post-Match Decision Coach',
      organisation: 'Garena AI Build Challenge 2026 · Pandamonium',
      dates: 'Jul 2026 — Aug 2026',
      note: 'Evidence-grounded coaching from native .dem telemetry. The system detects first-contact moments, evaluates reset/reposition/re-engage decisions with LightGBM, and keeps LLM advice inside strict evidence boundaries.',
    },
    {
      title: 'Agentic Fraud Investigation Crew',
      organisation: 'NTT DATA × Microsoft Hack the Future 2026 · OneBrainCell',
      dates: 'Jun 2026 — Jul 2026',
      note: 'Microsoft-native multi-agent AML workflow covering alert triage, KYC and transaction enrichment, explainable adjudication, SAR drafting, and human approval through Teams and Power Automate.',
    },
  ],
  volunteering: [
    {
      title: 'Programmes Head',
      organisation: "NUS Students' Community Service Club",
      dates: 'Aug 2025 — Present',
      note: 'Leads a year-long volunteering initiative, designing curriculum and facilitating activities at Bishan Home for intellectually disabled elderly residents.',
    },
    {
      title: 'Student Volunteer',
      organisation: 'Rotaract Club of NUS · Project CUP',
      dates: 'Aug 2025 — Nov 2025',
      note: 'Facilitated community activities with primary-school children to provide social support and boost morale.',
    },
  ],
  certifications: [
    { title: 'AI Fluency: Frameworks & Foundations', issuer: 'Anthropic', dates: 'May 2026', id: 'neargg4ymdy4' },
    { title: 'Claude 101', issuer: 'Anthropic', dates: 'May 2026', id: 'm5fbsw34pigo' },
  ],
  courses: [
    { title: 'Calculus For Computing', code: 'MA1521', school: 'National University of Singapore' },
    { title: 'Data Structures & Algorithms', code: 'CS2040S', school: 'National University of Singapore' },
  ],
  awards: [
    { title: 'Edusave Merit Award', issuer: 'South West Community Development Council', dates: 'Jan 2023' },
    { title: 'Edusave Certificate of Academic Achievement', issuer: 'Ministry of Education', dates: 'Dec 2022' },
  ],
  languages: [
    { title: 'Chinese', level: 'Native or bilingual proficiency' },
    { title: 'English', level: 'Native or bilingual proficiency' },
  ],
};

export const impactStats = [
  { value: '1st', label: 'BrainHack TIL-AI 2026' },
  { value: String(linkedinSnapshot.projectCount), label: 'LinkedIn projects' },
  { value: String(linkedinSnapshot.skillCount), label: 'Skills across the stack' },
  { value: '4.50', label: 'NUS GPA / 5.00' },
];

export const projects = [
  {
    number: '01',
    title: 'AlphaEngine',
    category: 'Quant infrastructure',
    description:
      'A real-time quantitative execution workspace for cross-venue order books, pre-trade risk, ' +
      'strategy research, and live operator telemetry.',
    outcome:
      'Reconstructs stateful L2 books, validates sequence gaps, and aligns Binance and Hyperliquid feeds ' +
      'on a unified 100 ms analysis grid.',
    tags: ['Python', 'WebSockets', 'FastAPI', 'PostgreSQL', 'Docker'],
    repository: 'https://github.com/Manutd1234/Developer_Analyst_Infra',
    live: 'https://alphaengine-workspace.vercel.app',
    accent: 'cobalt',
    featured: true,
  },
  {
    number: '02',
    title: 'BrainHack TIL-AI',
    category: 'Multimodal AI · 1st place',
    description:
      'Five air-gapped AI microservices spanning speech, vision, retrieval, adversarial noise, and ' +
      'autonomous navigation for the DSTA TIL-AI finals.',
    outcome:
      'Combined fine-tuned NVIDIA Parakeet ASR, YOLOv26 detection, BM25-first RAG, and a PPO agent with ' +
      'robust fallback pathfinding.',
    tags: ['PyTorch', 'FastAPI', 'YOLOv26', 'Parakeet', 'Docker'],
    repository: 'https://github.com/Manutd1234/BrainHack_V2',
    accent: 'gold',
  },
  {
    number: '03',
    title: 'Delta1 Research',
    category: 'Systematic trading',
    description:
      'A cost-aware strategy research environment for testing predictive signals, execution assumptions, ' +
      'and portfolio behavior without hiding adverse results.',
    outcome:
      'Uses walk-forward validation, realistic fees and market impact, and reproducible research artifacts ' +
      'to separate promising signals from backtest noise.',
    tags: ['Python', 'Pandas', 'NumPy', 'SciPy', 'Statsmodels'],
    repository: 'https://github.com/Manutd1234/Delta1_Trading_Strategy',
    accent: 'alpine',
  },
  {
    number: '04',
    title: 'CS2 Decision Coach',
    category: 'Evidence-grounded AI · Garena AI Build Challenge',
    description:
      'A coaching platform that turns Counter-Strike 2 match telemetry into moment-specific tactical ' +
      'adjustments without relying on hindsight.',
    outcome:
      'Parses native .dem files, detects first-contact decisions, and combines bounded evidence with player ' +
      'intent to produce grounded coaching through LightGBM and LLMs.',
    tags: ['Next.js', 'FastAPI', 'AWPy', 'LightGBM', 'Pydantic'],
    repository: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/',
    repositoryLabel: 'LinkedIn project',
    accent: 'cobalt',
  },
  {
    number: '05',
    title: 'Agentic Fraud Investigation Crew',
    category: 'AML automation · Microsoft Hack the Future',
    description:
      'A Microsoft-native multi-agent system for triage, evidence enrichment, adjudication, and SAR drafting ' +
      'in high-volume financial-crime workflows.',
    outcome:
      'Keeps consequential decisions human-controlled with explainable evidence packs, conservative thresholds, ' +
      'and Teams plus Power Automate approval workflows.',
    tags: ['Azure AI', 'RAG', 'Cosmos DB', 'Power Automate', 'Power BI'],
    repository: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/',
    repositoryLabel: 'LinkedIn project',
    accent: 'gold',
  },
];

export const experience = [
  {
    company: 'Caerus Global Management',
    role: 'Quantitative Summer Analyst · Apprenticeship',
    location: 'Singapore',
    dates: 'Aug 2026 — Present',
    summary:
      'Building asynchronous market-data and backtesting infrastructure for high-frequency cross-venue ' +
      'research across Binance and Hyperliquid.',
    highlights: [
      'Engineered microprice, order-flow imbalance, and basis features on sequence-validated order books.',
      'Measured a 0.7–0.8 second lead-lag signal and tested its decay after fees, latency, and market impact.',
    ],
  },
  {
    company: 'CTES Consulting',
    role: 'Software Engineer · Off-Cycle Intern',
    location: 'Singapore',
    dates: 'Jul 2026 — Present',
    summary:
      'Developing full-stack profiling, authenticated data extraction, and document-generation systems ' +
      'deployed on AWS behind Cloudflare.',
    highlights: [
      'Built React, TypeScript, Node.js, and PostgreSQL product workflows.',
      'Reduced profile-processing turnaround from one–two days to a few hours.',
    ],
  },
  {
    company: 'Accenture',
    role: 'Application Engineer · Summer Intern',
    location: 'Singapore',
    dates: 'Apr 2026 — Jul 2026',
    summary:
      'Created agentic AI tools for root-cause analysis and test generation across enterprise codebases, ' +
      'logs, SharePoint, and Azure DevOps.',
    highlights: [
      'Combined BM25, vector retrieval, and agent workflows in a developer-facing RCA system.',
      'Cut multi-day incident and testing workflows to under 30 minutes.',
    ],
  },
  {
    company: 'D+A Strategies',
    role: 'Quant Trainee · Apprenticeship',
    location: 'Remote',
    dates: 'Mar 2026 — Present',
    summary:
      'Designing, backtesting, and stress-testing systematic strategies across unstructured financial ' +
      'time-series data.',
    highlights: [
      'Built vectorized research pipelines for statistical-arbitrage experiments.',
      'Evaluated alternative pricing patterns with reproducible Python environments.',
    ],
  },
  {
    company: 'Republic of Singapore Air Force & Singapore Army',
    role: 'Air Force Signals Commander & Specialist Cadet',
    location: 'Singapore',
    dates: 'Mar 2023 — Jan 2025',
    summary:
      'Led communications, readiness, and unit initiatives during National Service, including joint ' +
      'SAF–RAAF operations in Exercise Wallaby.',
    highlights: [
      'Served as Comms Store IC, Gym Innovation IC, and National Education IC.',
      'Helped 160 SQN earn the NE CDF Award in two consecutive years.',
    ],
  },
];

export const education = [
  {
    school: 'National University of Singapore',
    credential: 'B.Sc. Computer Science · Minor in Economics & Statistics',
    dates: 'Aug 2025 — Aug 2029',
    detail:
      'First Class Honours · GPA 4.50/5.00 · Programming Methodology · Data Structures & Algorithms · ' +
      'Calculus for Computing · Community Service Club · NUS Sports Club · NUS Games Development Group',
  },
  {
    school: 'Eunoia Junior College',
    credential: 'GCE A-Levels · Science Stream',
    dates: 'Jan 2021 — Nov 2022',
    detail:
      'Dean’s List 2021 & 2022 · Edusave Merit and Academic Achievement Awards · National Colours Award',
  },
];

export const leadership = [
  {
    title: 'NUS Games Development Group',
    role: 'Software Engineer · Pandamonium',
    dates: 'Jan 2026 — Present',
    description:
      'Leading technical development for a 2D murder mystery in Unity, including procedural board ' +
      'rendering and centralized narrative state.',
  },
  {
    title: 'RunNUS & SunNUS',
    role: 'Executive Member · NUS Sports Club',
    dates: 'Jan 2026 — Present',
    description:
      'Managing logistics, vendors, budgets, safety, and cross-functional operations for events including ' +
      'a charity run with more than 1,000 participants.',
  },
  {
    title: 'NUSSU VENtures',
    role: 'Operations Executive',
    dates: 'Jan 2026 — Present',
    description:
      'Coordinating campus venues, resources, and stakeholder communication across student initiatives.',
  },
  {
    title: 'Project BHID',
    role: 'Programmes Head',
    dates: 'Aug 2025 — Aug 2026',
    description:
      'Designed inclusive learning activities for people with intellectual disabilities and trained ' +
      'student volunteers in empathetic facilitation.',
  },
  {
    title: 'Youth Corps Singapore & Rotaract Club',
    role: 'Volunteer Educator',
    dates: 'Aug 2025 — Jan 2026',
    description:
      'Taught primary-school learners Scratch, logic, and introductory AI concepts through hands-on lessons.',
  },
  {
    title: 'BrainHack TIL-AI · Pandamonium',
    role: 'Champion · DSTA and AngelHack',
    dates: 'Jun 2026 — Jul 2026',
    description:
      'Learned and shipped five Dockerised multimodal AI services with a five-person team under an air-gapped ' +
      'competition deadline.',
  },
];

export const skillGroups = [
  {
    label: 'Languages',
    items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'C#', 'HTML', 'CSS'],
  },
  {
    label: 'Product & backend',
    items: ['React', 'Next.js', 'FastAPI', 'Node.js', 'Spring Boot', 'Flask', 'PostgreSQL'],
  },
  {
    label: 'AI & data',
    items: [
      'PyTorch',
      'TensorFlow',
      'Scikit-learn',
      'Pandas',
      'LightGBM',
      'RAG',
      'Agentic AI',
      'ChromaDB',
      'MediaPipe',
    ],
  },
  {
    label: 'Infrastructure',
    items: ['Docker', 'AWS', 'Cloudflare', 'Linux', 'Azure DevOps', 'Playwright', 'Git'],
  },
];

export const credentials = [
  'AWS Certified Cloud Practitioner (CLF-C02)',
  'Databricks AI/BI',
  'GitHub Foundations',
  'Docker Foundations',
  'Anthropic AI Fluency: Frameworks & Foundations',
  'Anthropic Claude 101',
  'Cisco Content Networking Specialist',
  'DataCamp Machine Learning Fundamentals in Python',
];
