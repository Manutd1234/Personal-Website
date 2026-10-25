import type { ProjectStory } from "./project-stories";

export const expandedProjectStories = {
  "ML Trainee: Credit Risk": {
    "summary": "A reproducible credit-risk study connecting exploratory analysis, classification and unsupervised segmentation across six public datasets.",
    "audience": "ML trainees and analysts who want to understand credit-risk signals, compare models fairly and communicate what the results can support.",
    "problem": "A strong score can hide weak evaluation or an unclear target. The study asks which repayment signals matter, whether a model improves on a simple baseline, and whether similar structure appears without using the outcome label.",
    "contribution": "Built the exploratory analysis, reusable Python training and clustering pipelines, rendered notebooks and presentation materials for the NUS Fintech Society ML Trainee task and its follow-up.",
    "sections": [
      {
        "title": "From data to a testable question",
        "points": [
          {
            "label": "Audit the data first",
            "detail": "Checked missing values, unusual repayment codes, class imbalance and feature definitions before modelling. The exploratory analysis compares repayment behaviour and credit utilisation with demographic associations, keeping observed patterns separate from explanations of causality."
          },
          {
            "label": "Turn observations into features",
            "detail": "Used the exploratory findings to construct repayment and utilisation features, then compared their effect on simple and more flexible models. This connects the initial investigation with experiments that can be repeated and challenged."
          }
        ]
      },
      {
        "title": "Compare models without moving the goalposts",
        "points": [
          {
            "label": "Separate fitting, selection and evaluation",
            "detail": "Used stratified training, validation and test partitions. Preprocessing is fitted inside cross-validation, while model choice and the cost-sensitive decision threshold come from validation data before the selected model is evaluated on the held-out test set."
          },
          {
            "label": "Measure more than ranking",
            "detail": "Compared linear models, tree ensembles, support-vector machines and neural networks using ranking, precision-recall and calibration metrics. Cost curves make the tradeoff between missed adverse outcomes and unnecessary rejections explicit."
          }
        ]
      },
      {
        "title": "What the experiments add",
        "points": [
          {
            "label": "Look for structure without the label",
            "detail": "Compared k-means segments with mixture models, hierarchical clustering and anomaly detection. Outcome labels return only for interpretation, helping distinguish useful group descriptions from evidence of reliable prediction."
          },
          {
            "label": "Keep the conclusions bounded",
            "detail": "Seeded pipelines, tests and rendered notebooks make the analysis reviewable. The datasets lack timestamps, so this is random-holdout research rather than an out-of-time lending test; approval labels also describe an underwriter’s decision rather than later repayment."
          }
        ]
      }
    ]
  },
  "CrossFlow AI": {
    "summary": "A road-and-ferry planning platform for the Singapore–Batam corridor, with explicit data provenance and a shared dispatch workflow.",
    "audience": "Travellers and logistics operators planning road access, a ferry crossing and the onward journey in Singapore and Batam.",
    "problem": "A cross-border trip crosses several systems: vehicle restrictions, road conditions, ferry timetables and time zones. Showing all of these as equally live would hide uncertainty and make the plan harder to trust.",
    "contribution": "Built the routing and traffic integration, connected the operator and driver workflows, and made data freshness and source limitations part of the application contracts.",
    "sections": [
      {
        "title": "From route request to dispatch",
        "points": [
          {
            "label": "Choose a route for the vehicle",
            "detail": "The Batam planner runs A* over a committed OpenStreetMap graph. Vehicle access rules and the chosen objective influence search costs, while missing physical road tags use declared conservative fallbacks."
          },
          {
            "label": "Connect the ferry crossing",
            "detail": "The journey solver combines road access on both sides with published terminal pairs and departure snapshots. Singapore and Batam timestamps are normalized for calculations and displayed in their local zones."
          },
          {
            "label": "Keep the issued journey stable",
            "detail": "Operator dispatches are stored in Supabase. A driver loads the saved route geometry, navigation instructions and routing audit, so retrieving a dispatch does not silently replace the operator’s plan."
          }
        ]
      },
      {
        "title": "Evidence before estimates",
        "points": [
          {
            "label": "Apply camera evidence narrowly",
            "detail": "A backend collector converts registered camera frames into numeric estimates. Freshness, quality and exact directed-edge mappings gate whether an estimate can affect a route; expired evidence withdraws automatically."
          },
          {
            "label": "Keep source types visible",
            "detail": "Provider-measured speeds, camera occupancy estimates, published schedules and modelled outlooks carry different labels and timestamps. Missing observations do not become zero congestion."
          },
          {
            "label": "Evaluate forecasts chronologically",
            "detail": "Candidate forests are compared with persistence using time-ordered splits. The application retains the baseline until release checks pass, and source-specific research benchmarks remain separate from Batam field-validation claims."
          }
        ]
      }
    ]
  },
  "IBKR Scenario Stress Test": {
    "summary": "A NUSSIF portfolio-risk workspace for exploring historical crises, macro shocks and options behaviour using IBKR paper-account data.",
    "audience": "Student portfolio managers and fund developers who need to inspect potential losses, position-level exposures and liquidity pressure under explicit scenario assumptions.",
    "problem": "A portfolio’s recent return does not show how its positions could interact in a crisis. Reviewers need to see the assumed shocks, the positions driving a loss and the effect on liquidity rather than relying on a single aggregate risk figure.",
    "contribution": "Contributed to the shared NUSSIF stress-testing dashboard, scenario and risk workspaces, and IBKR paper-account integration, connecting quantitative calculations with an interactive interface.",
    "sections": [
      {
        "title": "Explore a scenario",
        "points": [
          {
            "label": "Start with explicit assumptions",
            "detail": "The workspace combines historical crisis scenarios with forward-looking cases and what-if controls for equities, rates, volatility, commodities and foreign exchange. Reviewers can inspect the assumptions before interpreting a portfolio result."
          },
          {
            "label": "Follow the impact into positions",
            "detail": "Sector, region, currency and long/short exposures feed position-level loss estimates. Base-currency valuation and portfolio breakdowns help explain which holdings contribute to the result and how stressed margin requirements affect available liquidity."
          }
        ]
      },
      {
        "title": "Connect the model to the interface",
        "points": [
          {
            "label": "Bound the options approximation",
            "detail": "The options module combines delta, gamma, vega and theta effects with explicit payoff bounds. VaR and expected-shortfall views add context, while the displayed results remain estimates under the chosen model and shock assumptions."
          },
          {
            "label": "Bridge paper accounts and offline development",
            "detail": "A Python TWS bridge supplies paper-account positions and account state to the Node.js backend and React interface. Saved snapshots support development when the broker connection is unavailable, keeping the data source distinct from a live connection."
          }
        ]
      },
      {
        "title": "Make the workflow inspectable",
        "points": [
          {
            "label": "Check the paper-trading path",
            "detail": "The paper-trading studio includes pre-trade limits, borrowing checks, missing-price rejection and currency handling. These controls connect risk inspection with a deliberate simulated order workflow."
          },
          {
            "label": "Test behaviour at the boundaries",
            "detail": "Automated checks cover scenario calculations, option payoff bounds, data integrity, order validation, API responses and WebSocket behaviour. The project is a tool for examining model assumptions and paper portfolios, not a forecast of realised losses or returns."
          }
        ]
      }
    ]
  },
  "EC2 Recovery & Trade Automation": {
    "summary": "A NUSSIF infrastructure and trading workbench that connects lease-based EC2 recovery, explicit pre-trade risk checks and an operator-facing research dashboard.",
    "audience": "Fund developers and operators who need to understand which node may trade, why an order is accepted or rejected, and what remains ready or unverified in the deployment.",
    "problem": "Replacing an instance is only part of recovering a trading service. An outdated worker must stop acting, order retries must not create duplicates, and operators need clear evidence that the replacement and its dependencies are ready.",
    "contribution": "Contributed to the shared fund’s EC2 recovery and trade-automation stack, connecting infrastructure coordination, C++ order handling, Python research and a React operations interface.",
    "sections": [
      {
        "title": "Recover with explicit ownership",
        "points": [
          {
            "label": "Rebuild the trading node",
            "detail": "Terraform and Packer describe the replacement infrastructure, while startup scripts, systemd services and health checks coordinate application recovery. The readiness dashboard exposes dependencies and configuration that still require attention."
          },
          {
            "label": "Give one worker authority to act",
            "detail": "DynamoDB conditional leases and increasing fencing tokens coordinate leadership. A worker steps down when it cannot retain its lease, and order admission checks leadership so an old instance cannot simply continue as if it still owns the service."
          }
        ]
      },
      {
        "title": "Explain the order path",
        "points": [
          {
            "label": "Check risk before routing",
            "detail": "The C++20 engine evaluates pre-trade VaR/ES and exposure limits, tracks working orders and maintains an order journal. Required client order IDs, duplicate detection and a kill switch make the order lifecycle explicit."
          },
          {
            "label": "Connect decisions to the operator",
            "detail": "A FastAPI gateway connects the engine, PostgreSQL history and IBKR bridge to a React/TypeScript dashboard. The interface presents the engine’s verdict and before/after risk so the operator can understand a rejection or reconsider the size before confirming."
          }
        ]
      },
      {
        "title": "Verify the system in layers",
        "points": [
          {
            "label": "Compare implementations and failure cases",
            "detail": "Research tooling includes rule-based, statistical, ML and deep-learning backtests with walk-forward evaluation. Tests compare native C++ kernels with NumPy implementations and exercise lease takeover, partition handling, duplicate orders and engine/API agreement."
          },
          {
            "label": "Keep deployment claims precise",
            "detail": "The controlled AWS failure test and real-gateway execution validation remain pending. The bridge is tested with a fake broker, and synthetic research data checks the pipeline rather than demonstrating strategy performance; those limits are part of the operational handover."
          }
        ]
      }
    ]
  },
  "Portfolio Manager Competition": {
    "summary": "A read-only reporting platform for NUSSIF’s portfolio-manager paper-trading competition, joining account snapshots with performance and downside-risk analysis.",
    "audience": "Student portfolio managers and competition reviewers who need consistent account-specific views of holdings, performance, exposure and risk assumptions.",
    "problem": "A headline return cannot show whether a portfolio is concentrated or exposed to a large downside. Reports also become misleading if holdings, metrics and account selection refer to different snapshots.",
    "contribution": "Built the paper-account collectors, risk-reporting workflow and manager-facing interface, connecting IBKR snapshots with Python analytics and React/Streamlit views.",
    "sections": [
      {
        "title": "Collect a consistent portfolio history",
        "points": [
          {
            "label": "Separate collection from analysis",
            "detail": "Python collectors read paper-account NAV and positions through IBKR and store timestamped snapshots in SQLite WAL. Scheduled services separate frequent account collection from the more expensive risk-analysis run."
          },
          {
            "label": "Keep each manager’s data aligned",
            "detail": "The workspace filters by account before selecting the latest dataset and aligns risk measures with the corresponding holdings timestamp. Missing values and coverage warnings stay visible rather than becoming invented zeros."
          }
        ]
      },
      {
        "title": "Explain risk in the account’s currency",
        "points": [
          {
            "label": "Model the whole portfolio",
            "detail": "Holdings are converted to the account’s base currency, including cash and foreign-exchange exposures. Weights, concentration and gross/net exposures explain how the portfolio is assembled before the loss estimates are considered."
          },
          {
            "label": "Compare complementary loss measures",
            "detail": "The engine computes historical and Monte Carlo VaR and expected shortfall across confidence levels and holding periods. Volatility, correlations and drawdown views provide additional context for interpreting these model estimates."
          }
        ]
      },
      {
        "title": "Support a reviewable manager workflow",
        "points": [
          {
            "label": "Bring the detail into one workspace",
            "detail": "Account-specific overview, holdings, volatility, risk, correlation and PnL views let a manager move from a headline result to its supporting detail. The interface is read-only and does not close positions or submit orders."
          },
          {
            "label": "Test the cases that can mislead",
            "detail": "Regression checks cover account isolation, cash-only portfolios, incomplete histories, correlation overlap and warning persistence. Model returns and observed NAV returns remain distinct, so estimated risk or model beta is not presented as realised competition performance."
          }
        ]
      }
    ]
  },
  "Internal Trading Competition": {
    "summary": "A paper-trading competition terminal that combines automated IBKR account collection, participant rankings and market-relative performance analysis.",
    "audience": "NUSSIF competition participants and organisers who need a common scoreboard, portfolio drill-downs and context for comparing simulated trading results.",
    "problem": "A ranking by total return hides how participants reached that result. A useful competition view needs consistent snapshots, benchmark context and measures of volatility and drawdown alongside the leaderboard.",
    "contribution": "Built the collection pipeline, benchmark reporting and React/Streamlit competition interface for reviewing simulated portfolio performance.",
    "sections": [
      {
        "title": "Build a repeatable scoreboard",
        "points": [
          {
            "label": "Collect accounts on a schedule",
            "detail": "An ib_insync collector reads paper-account NAV and positions into SQLite WAL. Systemd jobs make collection repeatable, while saved snapshots provide a shared history for rankings and portfolio review."
          },
          {
            "label": "Keep the interface connected to the same data",
            "detail": "A React terminal hosted in Streamlit presents competition rankings and individual portfolio-manager tear sheets. Participants can move from the field-wide view to holdings and drawdown detail."
          }
        ]
      },
      {
        "title": "Put returns in context",
        "points": [
          {
            "label": "Compare with market benchmarks",
            "detail": "SPY and QQQ provide common reference series through a market-data adapter with a Yahoo Finance fallback. Benchmark comparisons help distinguish a portfolio’s path from the broader market movement over the same period."
          },
          {
            "label": "Show the route to the result",
            "detail": "Sharpe, Sortino and Calmar ratios sit beside volatility and drawdown. Return distributions, quartiles and dispersion show how the field differs, with unavailable metrics kept explicit when the data cannot support them."
          }
        ]
      },
      {
        "title": "Make development and interpretation reliable",
        "points": [
          {
            "label": "Exercise the pipeline without a broker",
            "detail": "An IBKR mock mode supports local development without TWS. Automated checks cover the broker adapter, benchmark integration, dashboard calculations and database persistence."
          },
          {
            "label": "Keep simulated results in scope",
            "detail": "The terminal reports paper portfolios, not real-money trading performance. Its purpose is a consistent comparison and review workflow; the leaderboard and risk-adjusted statistics do not establish that a strategy will work outside the competition."
          }
        ]
      }
    ]
  },
  "FormForward": {
    "summary": "A running-analysis prototype that connects wearable time series, video landmarks and selected research to a structured local-AI coaching workflow.",
    "audience": "Runners who have activity exports or running video and want to understand the signals behind a technique suggestion.",
    "problem": "A cadence number or pose overlay is difficult to act on by itself. The application brings the evidence together and turns detected changes into specific, reviewable feedback.",
    "contribution": "Developed the ingestion and analysis workflow, video pose overlays, research pipeline and local model gateway used to generate structured coaching cards.",
    "sections": [
      {
        "title": "Collect and explain the signals",
        "points": [
          {
            "label": "Normalize different activity exports",
            "detail": "CSV, GPX and FIT input is converted into a common metric representation. One-minute windows make changes in cadence, vertical movement and ground contact easier to locate on the timeline."
          },
          {
            "label": "Inspect video with landmarks",
            "detail": "MediaPipe detects 33 body landmarks. The application calculates joint and body angles and draws a skeleton overlay so the runner can inspect the visual evidence behind the analysis."
          },
          {
            "label": "Ground the prompt in selected evidence",
            "detail": "The analysis endpoint combines wearable summaries, vision results and extracted PDF or web text. The model receives structured context instead of an open-ended request to guess what happened."
          }
        ]
      },
      {
        "title": "Local coaching with clear limits",
        "points": [
          {
            "label": "Separate application and model runtime",
            "detail": "A Node.js gateway calls Ollama or a local Hugging Face model path. Provider checks and fallback handling keep model availability explicit while the frontend presents the analysis."
          },
          {
            "label": "Make the response actionable",
            "detail": "Coaching cards contain correction cues, drills and a next-run focus alongside the underlying findings, giving the runner a concrete result to review."
          },
          {
            "label": "Treat measurements as proxies",
            "detail": "Wearable signals and video landmarks support a prototype interpretation of form. The prompt uses cautious wording and excludes injury diagnosis; the project does not claim clinical validation."
          }
        ]
      }
    ]
  },
  "RiskSignal · SAP Group 4": {
    "summary": "A financial-crime triage prototype that explains how risky a case is, how urgently it needs attention and which evidence supports the result.",
    "audience": "Case-review teams who need to prioritize an alert backlog without losing the explanation behind each score.",
    "problem": "Risk severity and operational urgency answer different questions. A single opaque score can hide missing evidence or make it difficult to explain why one case should be reviewed before another.",
    "contribution": "Built the Python scoring and triage engine, reason codes, evidence-confidence logic and pre-filtering. The team integrated this backend with Marcus’s Fiori-style dashboard and build-time case-data pipeline.",
    "sections": [
      {
        "title": "Two scores, two decisions",
        "points": [
          {
            "label": "Assess the case risk",
            "detail": "The risk engine combines six active factor groups into a bounded score. Factor-level contributions and reason codes for flagged conditions make the score reviewable."
          },
          {
            "label": "Rank operational work",
            "detail": "A separate queue score combines SLA urgency, risk, regulatory exposure and alert age. The interface can explain both why a case is risky and why it appears at a particular review position."
          },
          {
            "label": "Route incomplete evidence correctly",
            "detail": "Evidence confidence and explicit eligibility checks determine whether a record belongs in data chase, standard review, escalation or the prototype’s auto-clear queue."
          }
        ]
      },
      {
        "title": "An inspectable team integration",
        "points": [
          {
            "label": "Score data once for the demo",
            "detail": "The team pipeline joins case, alert, transaction and entity inputs, invokes the Python engine and emits a scored JSON artifact for the dashboard."
          },
          {
            "label": "Keep scoring implementations aligned",
            "detail": "The web API includes a TypeScript counterpart. Python-generated fixture outputs support parity checks so changes to weights or edge-case handling can be detected."
          },
          {
            "label": "Distinguish implementation from future work",
            "detail": "The demonstrated path is deterministic scoring plus an explainable case dashboard. Exploratory ML and RAG are separate research components, and case-status changes remain session-local prototype behaviour."
          }
        ]
      }
    ]
  },
  "Panic at the Classroom": {
    "audience": "Hackathon visitors exploring computer vision and playful desktop interactions.",
    "problem": "A webcam prediction has to cross several boundaries before it can change a desktop interface: camera lifecycle, model inference, recognition thresholds, application state and operating-system window control.",
    "contribution": "In this Hack&Roll team build, we connected local face recognition to an Electron desktop shell and five interactive React interfaces, turning webcam events into a complete desktop interaction.",
    "sections": [
      {
        "title": "What it does",
        "points": [
          {
            "label": "Register and recognise faces",
            "detail": "Users capture face examples, choose a mock productivity interface and enable monitoring. Live webcam descriptors are compared with the registered examples before the selected screen is activated."
          },
          {
            "label": "Switch into an interactive scene",
            "detail": "Five modes recreate spreadsheet, code-editor, email, notes and course-dashboard interactions. They are mock interfaces with clickable elements and simulated activity, built for the playful hackathon premise."
          },
          {
            "label": "Keep a manual route available",
            "detail": "A global keyboard shortcut and system-tray menu provide direct access alongside the camera-triggered path. Escape returns from the fullscreen view."
          }
        ]
      },
      {
        "title": "How it works",
        "points": [
          {
            "label": "Separate detection from recognition",
            "detail": "TinyFaceDetector first locates faces, then the landmark and recognition models produce descriptors. A Euclidean-distance threshold of 0.4 compares those descriptors with registered examples."
          },
          {
            "label": "Cross the renderer–desktop boundary",
            "detail": "React manages registration, monitoring and the selected interface. A contextBridge preload API sends a small set of IPC events to the Electron main process, which controls fullscreen and always-on-top state."
          },
          {
            "label": "Manage the camera as a resource",
            "detail": "The camera is requested for registration or monitoring and its media tracks are stopped when the workflow ends. Model assets are bundled locally, and face examples remain in application state."
          }
        ]
      },
      {
        "title": "Results & perspective",
        "points": [
          {
            "label": "A complete interaction prototype",
            "detail": "The source connects face registration, local matching, desktop window control and five interactive screens in one Electron application. The project demonstrates an end-to-end computer-vision interaction rather than a standalone model."
          },
          {
            "label": "A bounded interaction experiment",
            "detail": "The recognition threshold and asynchronous frame loop are explicit in the code. The project demonstrates a playful desktop workflow; recognition accuracy and end-to-end latency have not been benchmarked."
          }
        ]
      }
    ],
    "summary": "A team-built desktop experiment connecting local face recognition to an operating-system-level interface switch, with a manual hotkey and system-tray controls."
  },
  "Help4Good": {
    "summary": "A team-built conversation prototype focused on the relationship between a caregiver and care recipient, with retrieval and memory to maintain context.",
    "audience": "Caregivers and care recipients exploring a space to reflect on difficult conversations and articulate their needs.",
    "problem": "Care tasks can become a checklist while frustration, dignity and communication receive less attention. The team explored how conversational software could help someone pause, reflect and choose their words.",
    "contribution": "Worked with the Hack4Good team on a conversational support prototype. The shared implementation combines a Streamlit interface, hosted Gemma responses, local retrieval and persistent conversation memory.",
    "sections": [
      {
        "title": "Context across a conversation",
        "points": [
          {
            "label": "Retrieve relevant background",
            "detail": "A local Sentence-Transformer embedding model indexes reference material in ChromaDB. A new message retrieves matching context before the response is generated."
          },
          {
            "label": "Recall prior interactions",
            "detail": "A separate persistent collection stores conversation pairs. Retrieved past exchanges are combined with recent turns so the model can respond with continuity."
          },
          {
            "label": "Make history manageable",
            "detail": "The Streamlit interface exposes conversation history and downloads, while the underlying memory controller can clear recent turns and the persistent chat collection."
          }
        ]
      },
      {
        "title": "A prototype with a defined role",
        "points": [
          {
            "label": "Support both sides of care",
            "detail": "The product framing covers a caregiver working through frustration and a care recipient finding words for feelings or preferences they may struggle to share."
          },
          {
            "label": "Separate local retrieval from hosted generation",
            "detail": "Embeddings and vector storage run locally. The Google GenAI SDK sends the prepared conversational context to the model, so local storage does not imply fully on-device inference."
          },
          {
            "label": "Keep clinical claims out of scope",
            "detail": "The prototype’s prompts encourage reflection and include distress-resource guidance. It is a communication aid, with no demonstrated clinical effectiveness or validated emergency-response capability."
          }
        ]
      }
    ]
  }
} satisfies Readonly<Record<string, ProjectStory>>;
