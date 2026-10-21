export const profile = {
  name: 'Ian Abiel Wangsa',
  shortName: 'Ian Wangsa',
  role: 'NUS computer science student building useful software, applied AI, and quantitative systems.',
  introduction: 'I build across the stack, from market-data pipelines and AI research to the interfaces people use every day.',
  summary: 'I study Computer Science at NUS, with a second major in Mathematics and a minor in Economics. My work spans quantitative research at Caerus, product engineering at a startup, automation at CTES, and AI developer tools at Accenture. Outside the code, I organise student events, volunteer, and bring the communication and ownership I learned as a signals commander during National Service.',
  coreSkills: ['Applied AI', 'Quantitative research', 'Product engineering', 'Python', 'TypeScript', 'C++', 'React & Next.js', 'React Native', 'FastAPI & Node.js', 'PyTorch', 'PostgreSQL', 'AWS & Docker'],
  location: 'Singapore',
  education: 'Computer Science @ NUS · Mathematics second major · Economics minor',
  focus: 'Applied AI · Quant systems · Product engineering',
  availability: 'Open to engineering, AI & quant opportunities',
  email: 'ianwangsa2@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/',
  github: 'https://github.com/Manutd1234',
  resumeUrl: `${import.meta.env.BASE_URL}Ian_Abiel_Wangsa_Resume.pdf`,
};

export const impactStats = [
  { value: '1st', label: 'BrainHack TIL-AI · Novice' },
  { value: '0.7–0.8s', label: 'Measured market lead-lag' },
  { value: '<30m', label: 'Incident testing turnaround' },
  { value: '4.50', label: 'NUS GPA / 5.00' },
];

// Titles are shared with the authentic media catalogue.
export const projects = [
  {
    number: '01', title: 'AlphaEngine', category: 'Quant infrastructure',
    description: 'A quantitative research and execution workspace for Binance, Bybit, and Hyperliquid market data, pre-trade risk checks, and operator telemetry.',
    outcome: 'Reconstructs L2 order books with sequence checks and feed recovery, and aligns feeds on a 100 ms analysis grid.',
    tags: ['Python', 'C++', 'FastAPI', 'WebSockets', 'PostgreSQL'],
    repository: 'https://github.com/Manutd1234/Developer_Analyst_Infra',
    live: 'https://alphaengine-workspace.vercel.app', accent: 'cobalt', featured: true,
  },
  {
    number: '02', title: 'BrainHack TIL-AI', category: 'Multimodal AI · Novice Champion',
    description: 'Team Pandamonium’s five Dockerised AI services for the DSTA TIL-AI finals: speech, vision, retrieval, adversarial noise, and autonomous navigation.',
    outcome: 'Combined NVIDIA Parakeet speech recognition, YOLOv11 detection, BM25-first retrieval, and a MaskablePPO navigation agent for an air-gapped evaluation.',
    tags: ['PyTorch', 'FastAPI', 'YOLOv11', 'NeMo', 'Docker'],
    repository: 'https://github.com/Manutd1234/BrainHack_V2', accent: 'gold',
  },
  {
    number: '03', title: 'Delta1 Research', category: 'Systematic trading',
    description: 'A strategy research environment for testing predictive signals, execution assumptions, and portfolio behaviour.',
    outcome: 'Uses walk-forward validation, execution costs, and reproducible research artifacts to evaluate signals.',
    tags: ['Python', 'pandas', 'NumPy', 'SciPy', 'statsmodels'],
    repository: 'https://github.com/Manutd1234/Delta1_Trading_Strategy', accent: 'alpine',
  },
  {
    number: '04', title: 'CS2 Decision Coach', category: 'Garena AI Build Challenge',
    description: 'A Counter-Strike 2 coaching platform that turns native match telemetry into moment-specific tactical feedback.',
    outcome: 'Parses .dem files, detects first-contact decisions, and grounds LightGBM and LLM coaching in match evidence.',
    tags: ['Next.js', 'FastAPI', 'AWPy', 'LightGBM', 'Pydantic'],
    repository: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/', repositoryLabel: 'LinkedIn project', accent: 'cobalt',
  },
  {
    number: '05', title: 'Agentic Fraud Investigation Crew', category: 'Microsoft Hack the Future · 1st place',
    description: 'A Microsoft-native multi-agent workflow for financial-crime alert triage, evidence enrichment, adjudication, and suspicious activity report drafting.',
    outcome: 'Produces explainable evidence packs and keeps consequential decisions with a human reviewer through Teams and Power Automate approval workflows.',
    tags: ['Azure AI', 'RAG', 'Cosmos DB', 'Power Automate', 'Power BI'],
    repository: 'https://www.linkedin.com/in/ian-abiel-wangsa-70625a290/', repositoryLabel: 'LinkedIn project', accent: 'gold',
  },
];

export const projectArchive = [
  {
    title: 'BitAI', category: 'NUS Orbital · Apollo 11', group: 'AI',
    description: 'An offline-first study platform with an encrypted document vault, grounded AI tutoring, quizzes, flashcards, XP, study streaks, and optional cloud sync.',
    tags: ['React', 'TypeScript', 'FastAPI', 'DeepSeek', 'Supabase'],
  },
  {
    title: 'NUSSIF Portfolio & Risk Tools', category: 'Portfolio analytics', group: 'Quant',
    description: 'IBKR NAV collectors, competition leaderboards, automated portfolio reports, and dashboards for historical and Monte Carlo VaR/ES.',
    tags: ['Python', 'IBKR', 'React', 'Streamlit', 'SQLite'],
  },
  {
    title: 'PneuRelief', category: 'NUS MedTech', group: 'Product',
    description: 'A cast-pressure monitoring app with BLE device connections, sensor notifications, and a mobile interface backed by FastAPI.',
    tags: ['React Native', 'Expo', 'BLE', 'FastAPI', 'TypeScript'],
  },
  {
    title: 'SignMeUp', category: 'The Merge Hackathon 2026', group: 'AI',
    description: 'An accessibility suite combining on-device gesture recognition, wellness assistance, and voice-first navigation for independent living.',
    tags: ['React', 'TypeScript', 'MediaPipe', 'Gemini'],
  },
  {
    title: 'Nexus Academic Coach', category: 'Student productivity', group: 'AI',
    description: 'An AI productivity platform combining academic guidance, task breakdowns, Pomodoro sessions, habit tracking, and progress analytics.',
    tags: ['Next.js', 'LangChain', 'FastAPI', 'React'],
    repository: 'https://github.com/Manutd1234/Nexus-AI-Helper',
  },
  {
    title: 'DealMachine', category: 'BugleRock Rockathon 2026', group: 'AI',
    description: 'Investment-banking workflow tools for market research, information memorandum and NDA drafting, and a live deal dashboard.',
    tags: ['Python', 'React', 'PostgreSQL', 'Claude', 'Chart.js'],
    repository: 'https://github.com/Manutd1234/Rockathon-2026-',
  },
  {
    title: 'Coca-Cola Indonesia growth strategy', category: 'Work Simulation Program', group: 'Strategy',
    description: 'A five-year case study proposing a Greater Jakarta launch for Coke Zero and Ades, with a US$10 million budget, staged investment, and an illustrative scenario model.',
    tags: ['Market research', 'Financial modelling', 'Growth strategy'],
    repository: `${import.meta.env.BASE_URL}Coca-Cola_Indonesia_Growth_Strategy.pdf`,
    repositoryLabel: 'Read case study',
  },
];

export const experience = [
  {
    company: 'Caerus Global Management', role: 'Quantitative Summer Analyst · Apprenticeship',
    location: 'Singapore', dates: 'Aug — Sep 2026',
    summary: 'Built market-data infrastructure and execution-aware backtests for cross-venue quantitative research.',
    highlights: [
      'Reconstructed Binance and Hyperliquid L2 books on a 100 ms grid with sequence checks and feed recovery.',
      'Measured a 0.7–0.8 second market lead-lag and tested signal decay after fees, latency, and market impact.',
    ],
  },
  {
    company: 'Stealth Startup', role: 'Product Engineer Intern', location: 'Singapore', dates: 'Jul 2026 — Present',
    summary: 'Build product features, automated QA, and analytics across web and React Native mobile applications.',
    highlights: [
      'Validated 23 authentication, onboarding, and authorization flows with Playwright and SQL assertions.',
      'Built SQL/Grafana product dashboards and shipped fixes across sign-in, messaging, calendar sync, and iOS.',
    ],
  },
  {
    company: 'CTES Consulting', role: 'Software Engineer Intern', location: 'Singapore', dates: 'Jul 2026 — Present',
    summary: 'Build recruitment portals and sourcing automation across frontend, backend, data, and AWS infrastructure.',
    highlights: [
      'Implemented React/TypeScript portals, Express APIs, PostgreSQL migrations, and Cognito access controls.',
      'Reduced candidate profiling from 1–2 days to hours with Python document parsing and BM25 ranking.',
    ],
  },
  {
    company: 'Accenture', role: 'Application Engineer Intern · Technology, Health & Public Services',
    location: 'Singapore', dates: 'Apr — Jul 2026',
    summary: 'Developed AI tools for root-cause analysis and test generation alongside enterprise application support.',
    highlights: [
      'Built hybrid BGE/BM25 retrieval over code and logs, with Git and Azure DevOps workflows.',
      'Cut incident testing from days to under 30 minutes with agent-assisted test generation.',
    ],
  },
  {
    company: 'D+A Strategies', role: 'Quant Trainee · Apprenticeship', location: 'Remote', dates: 'Mar 2026 — Present',
    summary: 'Research and backtest systematic strategies using Python, Backtrader, and financial time-series data.',
    highlights: [
      'Implemented ARIMA, Bollinger-band, and EMA-pullback strategies with pandas/NumPy feature pipelines.',
      'Evaluated Sharpe ratios, drawdowns, buy-and-hold benchmarks, and ATR-based stops.',
    ],
  },
  {
    company: 'Republic of Singapore Air Force & Singapore Army',
    role: 'Air Force Signals Commander & Army Specialist Cadet · National Service',
    location: 'Singapore', dates: 'Mar 2023 — Jan 2025',
    summary: 'Led communications, equipment readiness, and unit initiatives, including Exercise Wallaby in Australia.',
    highlights: [
      'Served as Comms Store IC, Gym Innovation IC, and National Education IC.',
      'Contributed to consecutive unit NE CDF Awards and received an Outstanding Performance and Conduct letter.',
    ],
  },
];

export const earlierExperience = [
  { company: 'Success.Nat Tuition Centre', role: 'Part-time Teaching Assistant', dates: 'Feb — Jul 2025', summary: 'Taught Mathematics and Science to Secondary 1–4 students preparing for examinations.' },
  { company: 'Amazon Warehouse', role: 'Warehouse Packer', dates: '2023', summary: 'Packed orders in a fast-paced warehouse, developing accuracy, teamwork, and efficiency.' },
];

export const education = [
  {
    school: 'National University of Singapore', credential: 'Bachelor of Computing in Computer Science',
    dates: 'Aug 2025 — Aug 2029 · Expected',
    bullets: [
      'Second major in Mathematics; minor in Economics.',
      'Current GPA: 4.50 / 5.00.',
      'Coursework: Programming Methodology I & II, Data Structures & Algorithms, Linear Algebra, Discrete Structures, and Calculus.',
    ],
  },
  {
    school: 'Eunoia Junior College', credential: 'GCE A-Levels · Science Stream', dates: 'Jan 2021 — Nov 2022',
    bullets: [
      'H2 Mathematics, Physics, Chemistry, and Economics.',
      'Dean’s List in 2021 and 2022; MOE Independent Schools Scholarship in 2021.',
      'Softball: National School Games first runner-up in 2022 and SSSC National Colours Award.',
    ],
  },
];

export const earlierEducation = [
  {
    school: 'School of Science and Technology, Singapore', credential: 'GCE O-Levels · Science Stream', dates: 'Jan 2017 — Nov 2020',
    bullets: [
      'Top GCE O-Level Performer, 2020.',
      'Football CCA; represented the school at the National School Games three times.',
      'Team Best Business Pitch Award and second place in the Active Elderly Award competition.',
      'Community service with Willing Hearts in 2018 and MINDS in 2019.',
    ],
  },
  {
    school: 'Bukit Timah Primary School', credential: 'PSLE', dates: 'Jan 2011 — Nov 2016',
    bullets: [
      'Mathematics Olympiad team, 2015–2016; Football CCA, 2013–2016.',
      'NMOS Bronze and KooBits Maths Challenge Top Brain of School, 2015.',
      'SwimSafer Gold, 2013; Grade 3 Piano with Merit.',
    ],
  },
];

export const leadership = [
  {
    title: 'NUS Student Investment Fund', role: 'Quantitative Developer Analyst', dates: 'Aug 2026 — Present',
    description: 'Build portfolio analytics and infrastructure for student investment research.',
    highlights: ['IBKR NAV collectors, risk dashboards, Monte Carlo VaR/ES, and automated portfolio reports.', 'Competition leaderboards, market benchmarks, and single-worker EC2 failover tooling.'],
  },
  {
    title: 'NUS MedTech · PneuRelief', role: 'Software Engineer', dates: 'Aug 2026 — Present',
    description: 'Develop a mobile cast-pressure monitoring system with React Native/Expo and FastAPI.',
    highlights: ['Implement BLE sensor notifications, device commands, permissions, and reconnection flows.'],
  },
  {
    title: 'Google Developer Group @ NUS Computing', role: 'Software Engineer', dates: 'Aug 2026 — Present',
    description: 'Build volunteer workflows and software for non-profit partner Caring For Life.',
    highlights: ['Contribute React/TypeScript interfaces, FastAPI APIs, Firebase authentication, and PostgreSQL persistence.'],
  },
  {
    title: 'NUS Fintech Society', role: 'Machine Learning Trainee', dates: 'Aug 2026 — Present',
    description: 'Research financial machine learning through reproducible modelling and evaluation.',
    highlights: ['Trained credit-risk models across six datasets with stratified splits and cross-validation.', 'Achieved 0.952 held-out ROC-AUC on HMEQ with validation-only model and threshold selection.'],
  },
  {
    title: 'NUS Games Development Group', role: 'Software Engineer · Project Pandamonium', dates: 'Jan 2026 — Present',
    description: 'Build a 2D murder mystery game in Unity and C#.',
    highlights: ['Develop procedural board rendering and central state updates that synchronise gameplay and visuals.'],
  },
  {
    title: 'NUSSU VENtures', role: 'Operations Executive', dates: 'Nov 2025 — Oct 2026',
    description: 'Coordinate student events, campus venues, resources, and stakeholder communication.',
  },
  {
    title: 'RunNUS · NUS Sports Club', role: 'Admin & Finance Executive', dates: 'Jan — Sep 2026',
    description: 'Managed budgets, financial tracking, and vendor procurement for a campus run engaging 1,000+ runners.',
  },
  {
    title: 'SunNUS · NUS Sports Club', role: 'Team Sports Series Executive', dates: 'Jan — Jun 2026',
    description: 'Coordinated tournament fixtures, venue setup, and logistics for a beach sports event with 400+ participants.',
  },
  {
    title: 'Project BHID · NUS Community Service Club', role: 'Programmes Head', dates: 'Aug 2025 — Aug 2026',
    description: 'Led programme design for elderly beneficiaries with intellectual disabilities and trained student volunteers.',
  },
  {
    title: 'Youth Corps Singapore & NUS Rotaract Club', role: 'Volunteer Educator', dates: 'Aug 2025 — Jan 2026',
    description: 'Taught Scratch programming, computational thinking, and introductory AI concepts to primary-school learners.',
    highlights: ['Programming for Kids service-learning workshops, 5–9 January 2026.'],
  },
  {
    title: 'Project CUP · NUS Rotaract Club', role: 'Student Volunteer', dates: 'Aug — Nov 2025',
    description: 'Facilitated games and community activities with children.',
  },
];

export const skillGroups = [
  { label: 'Programming languages', items: ['Python', 'C++20', 'Java', 'Go', 'TypeScript', 'JavaScript', 'SQL', 'C#', 'Bash', 'HTML / CSS'] },
  { label: 'Web & mobile', items: ['React', 'Next.js', 'React Native', 'Expo', 'Tailwind CSS', 'Zustand', 'TanStack Query', 'Unity'] },
  { label: 'Backend & APIs', items: ['Node.js / Express', 'FastAPI', 'Flask', 'Spring Boot', 'PEGA', 'REST', 'WebSockets', 'SSE', 'Pydantic', 'SQLAlchemy', 'pybind11'] },
  { label: 'AI & machine learning', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'LightGBM', 'XGBoost', 'Transformers', 'NeMo', 'YOLO', 'MediaPipe', 'Stable-Baselines3', 'RAG / BM25', 'Fine-tuning', 'Quantized inference'] },
  { label: 'Data & quantitative research', items: ['NumPy', 'pandas', 'SciPy', 'statsmodels', 'Backtrader', 'Monte Carlo', 'VaR / ES', 'Option Greeks', 'Walk-forward validation', 'Jupyter'] },
  { label: 'Databases & storage', items: ['PostgreSQL', 'Supabase', 'SQLite', 'Redis', 'Parquet', 'Neo4j', 'ChromaDB'] },
  { label: 'Cloud & delivery', items: ['AWS', 'Docker Compose', 'Terraform', 'Linux', 'GitHub Actions', 'Azure DevOps', 'OIDC', 'Cloudflare', 'Firebase', 'Power Automate', 'CI / CD'] },
  { label: 'Testing & engineering tools', items: ['Playwright', 'Pytest', 'Vitest', 'Git', 'CMake', 'Streamlit', 'Grafana', 'MCP', 'BLE'] },
];

export const spokenLanguages = [
  { title: 'English', level: 'Fluent' },
  { title: 'Chinese', level: 'Fluent' },
  { title: 'Bahasa Indonesia', level: 'Intermediate' },
  { title: 'Hokkien', level: 'Limited proficiency' },
];

export const achievementGroups = [
  {
    title: 'Technical competitions', description: 'Building under pressure, with a team.',
    items: [
      { title: 'BrainHack TIL-AI 2026', issuer: 'DSTA Singapore · Team Pandamonium', detail: 'Novice Champion', year: '2026', certificateKey: 'brainHackChampion' },
      { title: 'Hack the Future AI Hackathon 2026', issuer: 'NTT DATA × Microsoft', detail: '1st place', year: '2026', certificateKey: 'hackFutureFirstPlace' },
      { title: 'BügleRock Rockathon 2026', issuer: 'BügleRock', detail: 'Top 5 Finalist Team', year: '25–27 Mar 2026', certificateKey: 'rockathonTop5' },
      { title: 'SunnyHacks 2026', issuer: 'SunnyHacks', detail: '2nd Place', year: 'Feb 2026', certificateKey: 'sunnyHacksSecondPlace' },
      { title: 'SignMeUp · The Merge Hackathon 2026', issuer: 'The Merge Hackathon', detail: 'Honorary Recognition', year: '2026', certificateKey: 'signMeUpHonoraryRecognition' },
    ],
  },
  {
    title: 'Academic & sporting awards', description: 'Milestones from the classroom and the field.',
    items: [
      { title: 'Dean’s List (Academic)', issuer: 'Eunoia Junior College', year: '2021, 2022', certificateKeys: ['deanList2021', 'deanList2022'] },
      { title: 'MOE Independent Schools Scholarship', issuer: 'Ministry of Education', year: '2021' },
      { title: 'CCC–CDC Education Merit Award', issuer: 'Community award', year: '2022', certificateKey: 'edusaveMerit2022' },
      { title: 'Edusave Certificate of Academic Achievement', issuer: 'Ministry of Education', year: '2019, 2021, 2022', certificateKeys: ['edusaveAcademic2019', 'edusaveAcademic2021', 'edusaveAcademic2022'] },
      { title: 'Edusave Good Progress Award', issuer: 'Ministry of Education', year: '2017, 2019, 2021', certificateKeys: ['edusaveProgress2017', 'edusaveProgress2019', 'edusaveProgress2021'] },
      { title: 'National School Games · Softball', issuer: 'Eunoia Junior College', detail: '1st runner-up', year: '2022' },
      { title: 'National Colours Award', issuer: 'Singapore Schools Sports Council', detail: 'Softball', year: '2022' },
      { title: 'Top GCE O-Level Performer', issuer: 'School of Science and Technology, Singapore', year: '2020', certificateKey: 'sstTopPerformer2020' },
      { title: 'Best Business Pitch Award', issuer: 'School of Science and Technology, Singapore', detail: 'Team innovation project' },
      { title: 'Active Elderly Award', issuer: 'School of Science and Technology, Singapore', detail: '2nd place · Team innovation project' },
      { title: 'Sports Day · Athletics', issuer: 'School of Science and Technology, Singapore', detail: '1st, 4×100 m relay (2017, 2018); 3rd, 100 m (2018)', year: '2017–2018' },
      { title: 'National Mathematical Olympiad of Singapore', issuer: 'NMOS', detail: 'Bronze', year: '2015', certificateKey: 'nmosBronze2015' },
      { title: 'KooBits Maths Challenge', issuer: 'Bukit Timah Primary School', detail: 'Top Brain of School · Season 1', year: '2015', certificateKey: 'koobits2015' },
      { title: 'School athletics', issuer: 'Bukit Timah Primary School', detail: '1st, 4×100 m relay (2015); 3rd, 2×100 m relay (2014)', year: '2014–2015' },
      { title: 'SwimSafer', issuer: 'Swimming proficiency', detail: 'Gold', year: '2013' },
      { title: 'Grade 3 Piano', issuer: 'Music achievement', detail: 'Passed with Merit' },
    ],
  },
  {
    title: 'Service & leadership', description: 'Recognition for contributing to a wider team.',
    items: [
      { title: 'Certificate of Appreciation · Project BHID', issuer: 'NUS Students’ Community Service Club', detail: 'Programmes Head · AY2025/26', year: '2026', certificateKey: 'bhid' },
      { title: 'NE CDF Award', issuer: '160 SQN · Unit award', detail: 'Contributed as National Education IC', year: '2023/24, 2024/25' },
      { title: 'Outstanding Performance and Conduct', issuer: 'Republic of Singapore Air Force', detail: 'Letter of recognition' },
    ],
  },
];

export const certifications = [
  { title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', detail: 'CLF-C02' },
  { title: 'AI/BI for Data Analysts', issuer: 'Databricks Academy', year: 'Jan 2026', certificateKey: 'databricksAiBi' },
  { title: 'GitHub Foundations', issuer: 'GitHub' },
  { title: 'Docker Foundations', issuer: 'Docker' },
  { title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', certificateKey: 'aiFluency' },
  { title: 'Claude 101', issuer: 'Anthropic', certificateKey: 'claude101' },
  { title: 'Cisco Networking Certificate', issuer: 'Cisco', detail: 'Networking course completed during National Service' },
];

// Compatibility exports use the same career data, without stale social profile counts.
export const credentials = certifications.map((item) => item.title);
export const linkedinSnapshot = { url: profile.linkedin, headline: profile.role, about: profile.summary };
export const linkedinDetails = {
  experience, education, projects: projectArchive,
  volunteering: leadership.filter((item) => /Volunteer|Programmes Head/.test(item.role)),
  certifications, awards: achievementGroups.flatMap((group) => group.items), languages: spokenLanguages,
};
