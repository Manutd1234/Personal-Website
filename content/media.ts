// Real photographs, saved application screenshots and original research output.
// Certificate previews omit verification identifiers where present.
export const projectMedia = {
  AlphaEngine: {
    src: "images/portfolio/alphaengine-dashboard.webp",
    alt: "AlphaEngine command centre showing research, risk and execution status.",
    kind: "Dashboard",
    caption: "Saved development dashboard with paper execution gates.",
  },
  "BrainHack TIL-AI": {
    src: "images/portfolio/brainhack-six-team-arena.webp",
    alt: "The live TIL-AI six-team robot arena and leaderboard at step 106 of 200, with Team Pandamonium in second place during the match.",
    kind: "Competition photo",
    caption:
      "Multimodal AI — live six-team arena; Team Pandamonium finished Novice Champions.",
  },
  "Delta1 Research": {
    src: "images/portfolio/delta1-net-performance.webp",
    alt: "Delta1 research chart comparing cumulative net performance with trend-following and long-only benchmarks.",
    kind: "Research output",
    caption:
      "Original research output: growth of $1 after costs, 1990–2015. Historical backtest.",
  },
  "CS2 Decision Coach": {
    src: "images/portfolio/cs2-redecide-dashboard.webp",
    alt: "RE:DECIDE replay dashboard with Mirage radar, selected player, round controls and match timeline.",
    kind: "Dashboard",
    caption: "Actual RE:DECIDE interface from the saved project demo.",
  },
  "Agentic Fraud Investigation Crew": {
    src: "images/portfolio/fraudcrew-dashboard.webp",
    alt: "FraudCrew Operations dashboard with alert evaluation and a human approval queue.",
    kind: "Dashboard",
    caption: "Actual project demo using synthetic evaluation data.",
  },
  Obital: {
    src: "images/portfolio/obital-dashboard.webp",
    alt: "Saved Obital progress dashboard with a points graph, study streak and recent quiz scores.",
    kind: "Dashboard",
    caption:
      "Saved Obital development dashboard: points progression, study streak and recent quiz scores.",
  },
  "NUSSIF Portfolio & Risk Tools": {
    src: "images/portfolio/nussif-sector-heatmap.webp",
    alt: "Original NUSSIF research heatmap showing 2026 second-quarter sector exposure across investment funds.",
    kind: "Research output",
    caption:
      "Original 13F research output: sector exposure by fund for 2026 Q2.",
  },
  PneuRelief: {
    src: "images/portfolio/pneurelief-architecture.svg",
    alt: "PneuRelief architecture linking BLE pressure-sensor notifications to a React Native and Expo app with a FastAPI backend.",
    kind: "Architecture diagram",
    caption:
      "PneuRelief implementation: BLE sensor notifications, a React Native/Expo app and a FastAPI backend.",
  },
  SignMeUp: {
    src: "images/portfolio/signmeup-gesture-demo.webp",
    alt: "Actual SignMeUp assistive-interpreter demo showing camera landmark tracking and a live hello prediction.",
    kind: "Application demo",
    caption:
      "Actual SignMeUp demo frame with live gesture landmarks and word prediction.",
  },
  "Nexus Academic Coach": {
    src: "images/portfolio/nexus-dashboard.webp",
    alt: "Nexus dashboard showing the focus timer, task list, study-plan panel and weekly progress graph.",
    kind: "Dashboard",
    caption:
      "Saved Nexus dashboard for focus sessions, tasks and weekly study progress.",
  },
  DealMachine: {
    src: "images/portfolio/dealmachine-pipeline.webp",
    alt: "The Deal Machine hackathon prototype showing its deal pipeline, sample deal cards and integration navigation.",
    kind: "Prototype dashboard",
    caption:
      "Saved Rockathon prototype dashboard with the sample pipeline entries defined in the project HTML.",
  },
  "Coca-Cola Indonesia growth strategy": {
    src: "images/portfolio/coca-cola-indonesia-case-study.webp",
    alt: "A page from the Coca-Cola Indonesia strategy case study presenting a sourced chart of reported sweet-drink consumption frequency.",
    kind: "Case-study page",
    caption:
      "Page 4 of the saved strategy case study: the audience evidence chart, including its source and assumptions.",
  },
};

export const teamMoments = [
  {
    src: "images/portfolio/brainhack-champion-team.webp",
    alt: "Team Pandamonium on the BrainHack stage holding the TIL-AI Novice Champion sign.",
    title: "A shared win at BrainHack",
    caption: "Team Pandamonium — TIL-AI Novice Champions, 2026.",
  },
  {
    src: "images/portfolio/brainhack-at-work.webp",
    alt: "Team Pandamonium around their laptops at the BrainHack competition table.",
    title: "Behind the competition",
    caption: "Working together at the BrainHack finals.",
  },
  {
    src: "images/portfolio/hack-the-future-event.webp",
    alt: "OneBrainCell team table sign and Ian Wangsa participant badge at Hack the Future 2026.",
    title: "Hack the Future, in person",
    caption: "The OneBrainCell table at the NTT DATA × Microsoft AI hackathon.",
  },
  {
    src: "images/portfolio/hack-the-future-ntt-data.webp",
    alt: "NTT DATA reception photographed during the Hack the Future event.",
    title: "At NTT DATA",
    caption: "On site for Hack the Future AI Hackathon 2026.",
  },
];

export const certificateFiles = {
  ejcSoftballTeam: {
    src: "images/awards/ejc-softball-team-original.webp",
    title: "Eunoia softball team",
    kind: "Team photo" as const,
  },
  brainHackMedal: {
    src: "images/portfolio/brainhack-champion-medal.webp",
    title: "BrainHack 2026 — TIL-AI Novice Champion medal on its black ribbon",
    kind: "Medal photo" as const,
  },
  ipptGoldBadge: {
    src: "images/awards/ippt-gold-cloth-patch.webp",
    title: "IPPT Gold No.4 cloth patch — representative product photo",
    kind: "Representative patch" as const,
    representative: true,
    caption:
      "Representative Army No.4 cloth patch. Product photo by G Military.",
    source: {
      label: "Patch photo — G Military",
      url: "https://g-military.com/products/ippt-gold-no-4-badge",
    },
  },
  marksmanshipBadge: {
    src: "images/awards/marksmanship-cloth-patch.webp",
    title: "Marksmanship No.4 cloth patch — representative product photo",
    kind: "Representative patch" as const,
    representative: true,
    caption:
      "Representative Army No.4 cloth patch. Product photo by G Military.",
    source: {
      label: "Patch photo — G Military",
      url: "https://g-military.com/products/marksmanship-army-no-4-badge",
    },
  },
  nsAwardsExcerpt: {
    src: "certificates/ns-ippt-marksmanship-excerpt.webp",
    title:
      "National Service transcript — IPPT Gold and Marksmanship award excerpt",
    kind: "Transcript excerpt" as const,
    caption:
      "Original achievements section, cropped to omit personal identifiers and unrelated service details.",
  },
  nsPerformanceConduct: {
    src: "certificates/ns-performance-conduct-excerpt.webp",
    title: "National Service transcript — Outstanding performance and conduct",
    kind: "Transcript excerpt" as const,
    caption:
      "Original transcript excerpt. Personal and document identification numbers have been removed.",
  },
  cdfNationalEducationPhoto: {
    src: "images/awards/160-sqn-ne-award-presentation.webp",
    title:
      "160 SQN — CDF National Education Excellence unit award presentation",
    kind: "Award photo" as const,
    caption:
      "Unit award presentation photographed in the RSAF’s post dated 4 November 2024. This is unit recognition.",
    source: {
      label: "RSAF — official account",
      url: "https://www.instagram.com/thersaf/",
    },
  },
  esisScholarship2020: {
    src: "certificates/esis-scholarship-2020-letter.webp",
    title: "Edusave Scholarships for Independent Schools — AY2020 award letter",
    kind: "Award letter" as const,
  },
  coloursAward2022: {
    src: "certificates/colours-award-softball-2022.webp",
    title: "Singapore Schools Sports Council — Colours Award, Softball, 2022",
  },
  sstBusinessPitch2018: {
    src: "certificates/sst-best-business-pitch-2018-trophy.webp",
    title:
      "SST Changemakers Innofest 2018 — Best Business Pitch Award trophy photo",
    kind: "Trophy photo" as const,
  },
  sstActiveElderly2018: {
    src: "certificates/sst-active-elderly-2018-trophy.webp",
    title:
      "SST Changemakers Innofest 2018 — Active Elderly Award, 2nd place trophy photo",
    kind: "Trophy photo" as const,
  },
  hackFutureFirstPlace: {
    src: "certificates/hack-the-future-first-place.webp",
    title: "Hack the Future AI Hackathon 2026 — 1st Place",
  },
  brainHackChampion: {
    src: "certificates/brainhack-til-ai-champion.webp",
    title: "BrainHack TIL-AI 2026 — Novice Champion",
  },
  databricksAiBi: {
    src: "certificates/databricks-ai-bi.webp",
    title: "Databricks Academy — AI/BI for Data Analysts",
  },
  datacampOptimizingJava: {
    src: "certificates/datacamp-optimizing-java-completion-record.webp",
    title: "DataCamp — Optimizing Code in Java",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. The linked record provides verification.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/course/63e91bedf6cc981f084b817e894ed83ac08752b0",
    },
  },
  datacampDocker: {
    src: "certificates/datacamp-docker-completion-record.webp",
    title: "DataCamp — Introduction to Docker",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. The linked record provides verification.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/course/67146a65795262e93dc2b89db7af6a9914d3a7f2",
    },
  },
  datacampAwsCloudPractitioner: {
    src: "certificates/datacamp-aws-cloud-practitioner-completion-record.webp",
    title: "DataCamp — AWS Cloud Practitioner (CLF-C02)",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. This records completion of DataCamp’s learning track; it does not certify an AWS exam result.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/track/9a001955e97c506ce022e859b621878fa59d6d7b",
    },
  },
  datacampGithubFoundations: {
    src: "certificates/datacamp-github-foundations-completion-record.webp",
    title: "DataCamp — GitHub Foundations",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. The linked record provides verification.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/track/4fc4e0aa33d0c27dd316663b8a832775a5de63ef",
    },
  },
  datacampJavaFundamentals: {
    src: "certificates/datacamp-java-fundamentals-completion-record.webp",
    title: "DataCamp — Java Fundamentals",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. The linked record provides verification.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/track/294bf9b2ec760c7eecaaa7713d17496a6c385c9a",
    },
  },
  datacampSqlFundamentals: {
    src: "certificates/datacamp-sql-fundamentals-completion-record.webp",
    title: "DataCamp — SQL Fundamentals",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. The linked record provides verification.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/track/752d0cf782a0bbc62ff7e18a812a42538403581a",
    },
  },
  datacampMachineLearning: {
    src: "certificates/datacamp-machine-learning-completion-record.webp",
    title: "DataCamp — Machine Learning Fundamentals",
    kind: "Completion record" as const,
    caption:
      "Screenshot of DataCamp’s public completion record naming Ian Wangsa. LinkedIn records the completed track as Machine Learning Fundamentals in Python; DataCamp currently displays Machine Learning Fundamentals.",
    source: {
      label: "DataCamp — verified completion record",
      url: "https://www.datacamp.com/completed/statement-of-accomplishment/track/df7659f509b6102dd8bdaa75ce00a63c5814baf3",
    },
  },
  claude101: {
    src: "certificates/anthropic-claude-101.webp",
    title: "Anthropic — Claude 101",
  },
  aiFluency: {
    src: "certificates/anthropic-ai-fluency.webp",
    title: "Anthropic — AI Fluency: Framework & Foundations",
  },
  deanList2022: {
    src: "certificates/deans-list-2022.webp",
    title: "Eunoia Junior College — Dean’s List (Academic), 2022",
  },
  deanList2021: {
    src: "certificates/deans-list-2021.webp",
    title: "Eunoia Junior College — Dean’s List (Academic), 2021",
  },
  edusaveAcademic2022: {
    src: "certificates/edusave-academic-achievement-2022.webp",
    title: "Edusave Certificate of Academic Achievement 2022",
  },
  edusaveAcademic2021: {
    src: "certificates/edusave-academic-achievement-2021.webp",
    title: "Edusave Certificate of Academic Achievement 2021",
  },
  edusaveAcademic2019: {
    src: "certificates/edusave-academic-achievement-2019.webp",
    title: "Edusave Certificate of Academic Achievement 2019",
  },
  sstTopPerformer2020: {
    src: "certificates/sst-top-o-level-performer-2020.webp",
    title: "SST — Top GCE O-Level Performer for 2020",
  },
  edusaveMerit2022: {
    src: "certificates/ccc-cdc-education-merit-2022.webp",
    title: "CCC–CDC Education Merit Award 2022",
  },
  edusaveProgress2021: {
    src: "certificates/edusave-good-progress-2021.webp",
    title: "Edusave Good Progress Award 2021",
  },
  edusaveProgress2019: {
    src: "certificates/edusave-good-progress-2019.webp",
    title: "Edusave Good Progress Award 2019",
  },
  edusaveProgress2017: {
    src: "certificates/edusave-good-progress-2017.webp",
    title: "Edusave Good Progress Award 2017",
  },
  nmosBronze2015: {
    src: "certificates/nmos-bronze-2015.webp",
    title: "National Mathematical Olympiad of Singapore 2015 — Bronze",
  },
  koobits2015: {
    src: "certificates/koobits-top-brain-2015.webp",
    title: "KooBits Maths Challenge 2015 — Top Brain of School (Season 1)",
  },
  bhid: {
    src: "certificates/bhid-programmes-head-2025-26.webp",
    title: "Project BHID — Programmes Head, AY2025/26",
  },
  rockathonTop5: {
    src: "certificates/rockathon-top-5-finalist-2026.webp",
    title: "BügleRock Rockathon 2026 — Top 5 Finalist Team",
  },
  sunnyHacksSecondPlace: {
    src: "certificates/sunnyhacks-second-place-2026.webp",
    title: "SunnyHacks February 2026 — 2nd Place",
  },
  signMeUpHonoraryRecognition: {
    src: "certificates/signmeup-the-merge-recognition-2026.webp",
    title: "SignMeUp — The Merge Hackathon 2026, Honorary Recognition",
  },
};
