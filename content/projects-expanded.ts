import type { Project } from "@/components/BookCarousel";

// Separate books for the additional project implementations.
export const expandedProjects: readonly (Project & { group: string; repository: string })[] = [
  {
    "title": "ML Trainee: Credit Risk",
    "category": "NUS Fintech Society · Machine learning",
    "group": "AI",
    "description": "A reproducible credit-risk study that connects exploratory analysis, supervised classification and unsupervised segmentation across six public datasets.",
    "outcome": "Turns credit data into reviewable experiments, with model selection and decision thresholds kept separate from the test set.",
    "highlights": [
      "Data investigation: Audited missing values, repayment-code conventions and class imbalance, then examined repayment behaviour, utilisation and demographic associations in the Taiwan credit-card dataset.",
      "Reusable pipelines: Built Python and scikit-learn preprocessing and training pipelines across six public credit datasets, with imputation, scaling and categorical encoding fitted inside cross-validation.",
      "Evaluation design: Used stratified training, validation and test partitions; selected models and cost-sensitive decision thresholds on validation data before evaluating the selected model on the held-out test set.",
      "Model comparison: Compared linear models, tree ensembles, support-vector machines and neural networks using ROC AUC, precision-recall AUC, KS, calibration and Brier scores.",
      "Unsupervised analysis: Compared k-means segments with mixture models, hierarchical clustering and anomaly detection; inspected whether label-free groups recover patterns seen in the exploratory analysis.",
      "Reproducible reporting: Added seeded command-line pipelines, rendered notebooks, an analysis deck, a methodology document and tests for dataset contracts and metric calculations."
    ],
    "tags": [
      "Python",
      "scikit-learn",
      "pandas",
      "Jupyter",
      "Machine Learning"
    ],
    "repository": "https://github.com/Manutd1234/ML_Trainee_Week_6_Task",
    "repositoryLabel": "Research repository (private)",
    "repositoryVisibility": "private"
  },
  {
    "title": "CrossFlow AI",
    "category": "Batam–Singapore Hackathon 2026",
    "group": "AI",
    "description": "A cross-border journey planner combining vehicle-aware road routing, published ferry schedules and source-labelled traffic observations for the Singapore–Batam corridor.",
    "highlights": [
      "Road-routing engine: Built vehicle-aware A* search over a 115,320-node OpenStreetMap graph, with balanced, fastest, shortest, easy-road and local-shortcut objectives.",
      "Multimodal planning: Joined Singapore road access, published ferry terminal pairs and Batam road access while preserving local time zones and the source of each journey leg.",
      "Traffic provenance: Distinguished fresh provider speed measurements, camera estimates, published timetables and modelled forecasts; expired or missing observations remain unavailable.",
      "Directed CCTV integration: Connected backend YOLO detection and temporal analysis to three reviewed road views, applying fresh eligible observations only to their exact directed road edges.",
      "Dispatch continuity: Saved issued routes in shared Supabase storage so drivers retrieve the operator’s chosen geometry and directions without silently replanning the journey.",
      "Forecast evaluation: Added chronological model evaluation and prospective forecasts, retaining a persistence baseline while candidate forests remain provisional."
    ],
    "tags": [
      "React",
      "TypeScript",
      "FastAPI",
      "A*",
      "Supabase",
      "YOLO"
    ],
    "repository": "https://github.com/Manutd1234/CrossFlow_AI",
    "repositoryVisibility": "public",
    "live": "https://cross-flow-ai.vercel.app/"
  },
  {
    "title": "IBKR Scenario Stress Test",
    "category": "NUSSIF · Portfolio risk",
    "group": "Quant",
    "description": "An interactive portfolio stress-testing workspace combining historical crises, macro what-if shocks, options sensitivities and an IBKR paper-account bridge.",
    "outcome": "Makes scenario assumptions, position-level impacts and liquidity pressure inspectable before a portfolio decision.",
    "highlights": [
      "Scenario analysis: Contributed a portfolio stress workspace with a library of historical crises, forward-looking scenarios and controls for equity, rates, volatility, commodities and foreign-exchange shocks.",
      "Position-level risk: Connects sector, region, currency and long/short exposures to scenario impacts, with multi-currency valuation and portfolio-level loss breakdowns.",
      "Options modelling: Implements delta, gamma, vega and theta approximations with explicit payoff bounds, alongside VaR and expected-shortfall views.",
      "IBKR integration: Uses a Python TWS bridge for paper-account positions and account state, with saved snapshots for offline development and a Node.js API feeding the React interface.",
      "Trading workflow: Includes a paper-trading studio with pre-trade limit checks, missing-price rejection, borrowing checks and cross-currency handling.",
      "Verification: Added automated coverage for stress calculations, option-risk bounds, data integrity, order validation, API responses and WebSocket behaviour."
    ],
    "tags": [
      "React",
      "Node.js",
      "Python",
      "IBKR",
      "Risk Analytics"
    ],
    "repository": "https://github.com/NUSSIF-Developer/Stress-Scenario-Ian",
    "repositoryLabel": "Project repository (private)",
    "repositoryVisibility": "private"
  },
  {
    "title": "EC2 Recovery & Trade Automation",
    "category": "NUSSIF · Trading infrastructure",
    "group": "Quant",
    "description": "An AWS recovery design and trading workbench combining single-worker failover, a C++ pre-trade engine, Python research and a React operations dashboard.",
    "outcome": "Connects infrastructure recovery with explicit risk checks, order identity and operational visibility.",
    "highlights": [
      "Recovery infrastructure: Contributed Terraform and Packer infrastructure for replacing a trading node, restoring its services and coordinating startup through systemd and health checks.",
      "Single-worker coordination: Uses DynamoDB conditional leases and increasing fencing tokens so trading services run only while the instance holds leadership, with explicit step-down and handover logic.",
      "Order lifecycle: Added a C++20 engine for pre-trade VaR/ES and exposure limits, order state, idempotent client order IDs, a kill switch and a journal.",
      "Application architecture: Connects the engine to a FastAPI gateway, PostgreSQL history, an IBKR bridge and a React/TypeScript dashboard through a binary socket protocol and REST/WebSocket interfaces.",
      "Research tooling: Provides rule-based, statistical, ML and deep-learning backtests, with walk-forward evaluation and native C++ research kernels checked against NumPy implementations.",
      "Operational checks: Tests lease takeover, partition handling, duplicate orders and engine/API agreement; the dashboard explains pre-trade decisions and exposes infrastructure readiness."
    ],
    "tags": [
      "C++20",
      "Python",
      "FastAPI",
      "React",
      "AWS",
      "Terraform"
    ],
    "repository": "https://github.com/NUSSIF-Developer/Automatic-EC2-Replacement-Trade-Automation-",
    "repositoryLabel": "Project repository (private)",
    "repositoryVisibility": "private"
  },
  {
    "title": "Portfolio Manager Competition",
    "category": "NUSSIF · Portfolio analytics",
    "group": "Quant",
    "description": "A read-only IBKR paper-portfolio reporting platform with account-scoped performance, holdings, concentration and historical/Monte Carlo risk analytics.",
    "outcome": "Gives portfolio managers a consistent view of performance and downside exposure from repeatable account snapshots.",
    "highlights": [
      "Account collection: Built Python collectors for IBKR paper-account NAV and positions, with timestamped SQLite WAL snapshots and scheduled collection services.",
      "Risk engine: Calculates historical and Monte Carlo VaR/ES across multiple confidence levels and holding periods, together with volatility, gross/net exposure and concentration measures.",
      "Currency-aware analysis: Converts holdings into account base currency and includes cash and foreign-exchange exposures so portfolio weights reconcile with NAV.",
      "Manager workspace: Provides account-specific overview, weights, volatility, risk, correlation and PnL views in a React/Streamlit dashboard.",
      "Consistent snapshots: Filters by account before choosing the latest data and aligns risk metrics with the matching weights timestamp; missing results remain unavailable instead of becoming fabricated zeros.",
      "Regression coverage: Tests account isolation, cash-only portfolios, incomplete performance histories, correlation overlap, persisted warning notes and risk calculations."
    ],
    "tags": [
      "Python",
      "IBKR",
      "NumPy",
      "Streamlit",
      "React",
      "SQLite"
    ],
    "repository": "https://github.com/NUSSIF-Developer/pm_competition",
    "repositoryLabel": "Project repository (private)",
    "repositoryVisibility": "private"
  },
  {
    "title": "Internal Trading Competition",
    "category": "NUSSIF · Competition analytics",
    "group": "Quant",
    "description": "A paper-trading competition terminal with automated account collection, a participant leaderboard, market benchmarks and portfolio performance drill-downs.",
    "outcome": "Makes competition results easier to compare through return, risk and drawdown context rather than a ranking alone.",
    "highlights": [
      "Automated ingestion: Built an ib_insync collector that records paper-account NAV and positions in SQLite WAL, with scheduled systemd jobs.",
      "Performance terminal: Created a React interface hosted in Streamlit with competition rankings, portfolio-manager tear sheets and drawdown charts.",
      "Benchmark context: Compares performance with SPY and QQQ using a market-data adapter and a Yahoo Finance fallback.",
      "Risk-adjusted metrics: Reports Sharpe, Sortino and Calmar ratios alongside volatility and drawdown, with unavailable values kept explicit.",
      "Cross-sectional views: Adds return distributions, quartiles and dispersion measures to compare the field of participating portfolios.",
      "Offline verification: Includes an IBKR mock mode and tests for the broker adapter, market-data integration, dashboard metrics and SQLite persistence."
    ],
    "tags": [
      "Python",
      "React",
      "Streamlit",
      "IBKR",
      "SQLite"
    ],
    "repository": "https://github.com/NUSSIF-Developer/internal_competition",
    "repositoryLabel": "Project repository (private)",
    "repositoryVisibility": "private"
  },
  {
    "title": "FormForward",
    "category": "Gemma 4 Good Hackathon",
    "group": "AI",
    "description": "A running-form analysis prototype combining Garmin activity data, MediaPipe pose estimates, research extraction and local Gemma coaching.",
    "highlights": [
      "Wearable ingestion: Parsed CSV, GPX and Garmin FIT activities into metric timelines for cadence, ground contact time, vertical oscillation, heart rate and pace.",
      "Event detection: Analysed one-minute windows for cadence drops, vertical bounce, ground-contact drift and stride changes, retaining timestamps and supporting signals.",
      "Computer vision: Used MediaPipe’s 33-landmark pose model to calculate biomechanical angles and display an annotated skeleton over running video.",
      "Research pipeline: Combined PDF text extraction and web-source ingestion with wearable and vision summaries through a unified analysis endpoint.",
      "Local inference: Routed structured coaching prompts through a Node.js gateway to Ollama or a repository-local Hugging Face model, with provider health checks and fallback handling.",
      "Reviewable output: Presented correction cues, drills and next-run focus points alongside their source metrics, using cautious proxy-based wording rather than diagnostic claims."
    ],
    "tags": [
      "JavaScript",
      "Node.js",
      "MediaPipe",
      "Gemma",
      "Ollama",
      "Python"
    ],
    "repository": "https://github.com/Manutd1234/FormForward",
    "repositoryVisibility": "public"
  },
  {
    "title": "RiskSignal · SAP Group 4",
    "category": "SAP S.C.A.L.E. 2026 · Group 4",
    "group": "AI",
    "description": "An explainable financial-crime triage engine separating case risk from review urgency, integrated with the team’s SAP Fiori-style dashboard.",
    "highlights": [
      "Scoring engine: Built a Python engine combining counterparty, jurisdiction, structural, exposure, behavioural and data-integrity factors into a bounded risk score.",
      "Operational priority: Kept risk severity separate from queue urgency by combining SLA urgency, risk, regulatory exposure and alert age in a dedicated queue score.",
      "Explainability: Returned factor contributions, reason codes and confidence so a reviewer can understand both the risk score and position in the queue.",
      "Triage controls: Routed records into auto-clear, data-chase, standard-review or escalation queues based on risk, evidence completeness and explicit eligibility rules.",
      "Team integration: Integrated the scoring output with Marcus’s Fiori-style frontend and build-time case-data pipeline, which assembles and scores the 500-case demonstration dataset.",
      "Runtime consistency: Exposed a TypeScript scoring counterpart for the web API, with Python-generated fixtures intended to catch scoring drift."
    ],
    "tags": [
      "Python",
      "pandas",
      "TypeScript",
      "Next.js",
      "Explainable scoring",
      "SAP Fiori"
    ],
    "repository": "https://github.com/Manutd1234/SAP_Group-4",
    "repositoryLabel": "Team source code",
    "repositoryVisibility": "public"
  },
  {
    "title": "Panic at the Classroom",
    "category": "Hack&Roll 2026 · Desktop computer vision",
    "group": "AI",
    "description": "A playful Electron hackathon prototype that recognises registered faces through a webcam and switches to one of five interactive mock productivity screens.",
    "outcome": "Connects webcam face descriptors, threshold-based matching and Electron IPC to five interactive screen modes.",
    "highlights": [
      "Local vision pipeline: Loaded TinyFaceDetector, facial-landmark and recognition models from bundled assets and compared live webcam descriptors against registered examples.",
      "Explicit matching threshold: Used Euclidean descriptor distance with a 0.4 threshold to trigger the interface change, rather than treating every detected face as a match.",
      "Desktop integration: Bridged the React renderer and Electron main process through a context-isolated preload API; a match activates a fullscreen, always-on-top window.",
      "Five interactive modes: Built mock Excel, VS Code, Outlook, Notion and Canvas interfaces with charts, selectable cells, expandable content and simulated activity.",
      "Manual control: Added a global Command/Ctrl+Shift+P shortcut, Escape exit and a system-tray menu for dashboard access and monitoring controls.",
      "Camera lifecycle: Requested webcam access only for registration or monitoring and stopped media tracks when that workflow ends. Registered descriptors are held in application state."
    ],
    "tags": [
      "Electron",
      "React",
      "TypeScript",
      "face-api.js",
      "Recharts"
    ],
    "repository": "https://github.com/Manutd1234/panic-at-the-classroom",
    "repositoryLabel": "Source code",
    "repositoryVisibility": "public",
    "repositories": [
      {
        "label": "Original team repository",
        "url": "https://github.com/Ducksss/panic-at-the-classroom",
        "visibility": "public"
      }
    ]
  },
  {
    "title": "Help4Good",
    "category": "Hack4Good 2026",
    "group": "AI",
    "description": "A team-built conversational support prototype for caregivers and care recipients, using retrieval and conversation memory to help navigate difficult communication.",
    "highlights": [
      "Caregiving workflow: The team designed separate support needs for caregivers and care recipients, focusing on communication and emotional reflection.",
      "Retrieval pipeline: Used local Sentence-Transformer embeddings and persistent ChromaDB collections to retrieve relevant reference material and past interactions.",
      "Conversation context: Combined recent turns with semantically retrieved memories before sending the prompt through the Google GenAI SDK.",
      "Accessible interface: Built a Streamlit chat workspace with history access and downloadable conversations, plus a lightweight terminal interface.",
      "Memory controls: Exposed clearing of recent and persisted conversation memory instead of treating retained history as invisible application state.",
      "Prototype scope: Used supportive-response prompts and distress-resource guidance while positioning the system as a communication aid rather than a clinical service."
    ],
    "tags": [
      "Python",
      "Streamlit",
      "ChromaDB",
      "RAG",
      "Sentence Transformers",
      "Gemma"
    ],
    "repository": "https://github.com/Manutd1234/help4good",
    "repositoryLabel": "Team source code",
    "repositoryVisibility": "public"
  }
];
