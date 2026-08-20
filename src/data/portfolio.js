export const profile = {
  name: 'Ian Abiel Wangsa',
  shortName: 'Ian Wangsa',
  role: 'Software engineer building quantitative systems and applied AI.',
  introduction:
    'I turn noisy data and complex workflows into dependable software—from real-time market systems and ' +
    'agentic developer tools to products that help teams make better decisions.',
  location: 'Singapore',
  education: 'Computer Science @ NUS',
  focus: 'Quant systems · AI · Full-stack',
  availability: 'Open to meaningful collaborations',
  email: 'ianwangsa2@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/',
  github: 'https://github.com/Manutd1234',
  resumeUrl: `${import.meta.env.BASE_URL}Ian_Abiel_Wangsa_Resume.pdf`,
};

export const impactStats = [
  { value: '1st', label: 'BrainHack TIL-AI 2026' },
  { value: '95%+', label: 'Workflow efficiency gain' },
  { value: '100 ms', label: 'Cross-venue analysis grid' },
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
      'Combined fine-tuned ASR, YOLOv11 detection, BM25-first RAG, and a MaskablePPO agent with robust ' +
      'fallback pathfinding.',
    tags: ['PyTorch', 'FastAPI', 'YOLOv11', 'NeMo', 'Docker'],
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
      'GPA 4.50/5.00 · Programming Methodology · Data Structures & Algorithms · Linear Algebra · ' +
      'Discrete Structures · Calculus',
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
    items: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'ChromaDB', 'MediaPipe'],
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
  'Anthropic AI Fluency',
  'Anthropic Claude 101',
  'Cisco Content Networking Specialist',
  'DataCamp Machine Learning Fundamentals in Python',
];
