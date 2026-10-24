import type { ProjectStory } from "./project-stories";

// Expanded case studies grounded in portfolio.ts, build-notes.ts, media.ts
// and the technical résumé. Demonstrations and team contributions stay explicit.
export const featuredProjectStories = {
  AlphaEngine: {
    summary:
      "A workspace that connects live crypto-market data, trading research and pre-trade checks, so an operator can inspect what the system knows before an order moves through the execution workflow.",
    audience:
      "Quantitative researchers, trading-system developers and operators reviewing market data, risk checks and execution records.",
    problem:
      "Different exchanges send updates at different times, and an interrupted feed can leave a misleading picture of the market. Research and execution need consistent data, visible checks and traceable records.",
    contribution:
      "I built across the data pipeline, Python/C++ risk integration, typed APIs and operator interface, connecting research inputs to pre-trade checks, stored order records and notifications.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Compare market depth across exchanges",
            detail:
              "Brings Binance, Bybit and Hyperliquid order-book feeds into one research workflow. An order book shows buyers and sellers waiting at different prices, giving researchers more context than a last-traded price alone.",
          },
          {
            label: "Check orders before execution",
            detail:
              "Passes proposed orders through 17 pre-trade risk gates exposed by the gateway. This creates an explicit checkpoint between a trading idea and the execution workflow, rather than leaving risk review disconnected from the application.",
          },
          {
            label: "Give the operator a shared view",
            detail:
              "A Next.js, React and TypeScript workspace brings research, risk and execution status together. The operator can inspect the workflow through a usable interface while the backend maintains structured requests, responses and order records.",
          },
          {
            label: "Keep activity visible away from the dashboard",
            detail:
              "Telegram Bot API updates report orders, positions and profit or loss. These notifications extend the operator view beyond the web application, making ongoing activity visible without requiring the dashboard to remain open.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Rebuild the book and detect missing updates",
            detail:
              "Asynchronous Python WebSockets receive full snapshots and incremental changes. Sequence checks detect gaps, and feed recovery restores continuity before the data is used; receiving a message is treated separately from knowing the book is consistent.",
          },
          {
            label: "Create a common research timeline",
            detail:
              "Venue feeds are aligned on a 100 ms analysis grid and written to compressed Parquet, a column-oriented data format. aiohttp and orjson support ingestion, while the stored output gives experiments a reusable market-data foundation.",
          },
          {
            label: "Make the interface contract explicit",
            detail:
              "FastAPI and Pydantic define and validate the risk gateway’s request and response structures. The TypeScript frontend consumes those contracts, helping the operator interface and backend agree on the shape of an order and its result.",
          },
          {
            label: "Connect Python research with a C++ core",
            detail:
              "pybind11 exposes the C++ risk implementation to Python. Shared regression fixtures compare the two implementations directly, so changing languages does not silently change the numerical answer used by the surrounding workflow.",
          },
          {
            label: "Package services and retain execution records",
            detail:
              "Docker packages the services, and Supabase PostgreSQL stores order logs with row-level security. This connects application access controls and durable records to the same workflow used for research and pre-trade checks.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "Verified numerical agreement",
            detail:
              "The Python and C++ risk implementations agreed bit for bit across 20 shared regression scenarios. This is a concrete integration check: it tests numerical consistency across those cases, rather than assuming equivalent code produces equivalent results.",
          },
          {
            label: "A development workspace with paper execution",
            detail:
              "The saved development dashboard demonstrates the integrated research, risk and execution workflow using paper execution gates. Its evidence is the connected system and tested risk logic; profitability and readiness for real capital would require separate evaluation.",
          },
          {
            label: "Reliability at the boundaries",
            detail:
              "The engineering emphasis is on what happens between components: missing feed updates, inconsistent numerical implementations and mismatched API contracts. These checks make the project useful to discuss as a systems build, beyond its trading domain.",
          },
        ],
      },
    ],
  },
  "BrainHack TIL-AI": {
    summary:
      "Team Pandamonium’s competition system combined speech, vision, information retrieval, adversarial noise and autonomous navigation, packaging five AI capabilities into services that could run in the finals without internet access.",
    audience:
      "Competition evaluators and teammates integrating five AI tasks and an autonomous arena under offline constraints.",
    problem:
      "A strong model alone was not enough: five different tasks had to run as usable services in an air-gapped environment, with task-specific constraints and no dependence on online APIs.",
    contribution:
      "I worked with Team Pandamonium on the finals build spanning five Dockerised FastAPI services. The implementation combined model adaptation, inference pipelines, retrieval and navigation; the competition result belongs to the team.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Turn speech into usable text",
            detail:
              "The speech-recognition service transcribes the competition audio using an adapted NVIDIA Parakeet model. Phrase correction and task-specific decoding help translate model output into text suited to the evaluation, rather than relying on an unchanged general-purpose transcription model.",
          },
          {
            label: "Find objects in visual scenes",
            detail:
              "The vision service detects aircraft, vehicles and vessels. Tuned confidence thresholds determine when a candidate detection is accepted, making the trade-off between missed targets and uncertain detections an explicit part of the pipeline.",
          },
          {
            label: "Answer questions from local information",
            detail:
              "A retrieval-first question-answering service finds relevant material before generating an answer. Keeping search available locally allows the system to use its information source even when internet access and external model services are unavailable.",
          },
          {
            label: "Generate constrained adversarial noise",
            detail:
              "A competition service produces image perturbations intended to fool opposing detectors. The changes must remain within the evaluation’s image-quality budgets, turning this task into constrained optimisation rather than unrestricted image modification.",
          },
          {
            label: "Navigate while respecting valid actions",
            detail:
              "The autonomous agent chooses movement actions through a learned policy, with invalid actions excluded and conventional pathfinding available as a fallback. This combines learned behaviour with explicit rules about which actions the environment permits.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Adapt the speech inference pipeline",
            detail:
              "NVIDIA Parakeet TDT was fine-tuned with a custom decoder, FP16 inference, sorted batching and phrase correction. These are separate pipeline decisions: adapting the model, controlling how text is decoded, and organising inference work within the available compute.",
          },
          {
            label: "Pair object detection with a surrogate attack model",
            detail:
              "YOLOv11 handles target detection. A YOLO surrogate guides projected gradient descent for the noise task, while SSIM and RMSE budgets constrain visual similarity and pixel error; the attack therefore has measurable limits.",
          },
          {
            label: "Retrieve first, add model complexity selectively",
            detail:
              "BM25 ranks passages by keyword relevance before optional neural reranking and quantized language-model generation. Quantization reduces the numerical precision used by a model; the BM25-first design keeps the initial retrieval step independent of neural generation.",
          },
          {
            label: "Combine learned navigation with explicit pathfinding",
            detail:
              "MaskablePPO learns a navigation policy with valid-action masking and reward shaping. BFS/A* provides fallback pathing using conventional graph search, giving the system a second navigation mechanism alongside the reinforcement-learning policy.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "Novice Champions as a team",
            detail:
              "Team Pandamonium finished as TIL-AI Novice Champions. The portfolio includes the live six-team arena capture and team photographs; the result reflects a combined competition build across the five tasks, not an isolated model benchmark.",
          },
          {
            label: "Five services ready for an offline evaluation",
            detail:
              "The finals system packaged all five capabilities as Dockerised FastAPI services for the air-gapped environment. The public finals repository provides implementation evidence for a build whose deployment constraints were part of the task from the start.",
          },
          {
            label: "Practical AI includes constraints and fallback behaviour",
            detail:
              "The build combines model training with thresholds, action masks, resource-conscious inference and fallback algorithms. Those decisions are useful engineering lessons: an AI feature also needs an execution environment, bounded behaviour and a way to integrate with the rest of a system.",
          },
        ],
      },
    ],
  },
  "Delta1 Research": {
    summary:
      "A research study testing whether trend and carry signals can form a systematic futures strategy after trading costs, risk controls and out-of-sample checks, with the assumptions exposed alongside the results.",
    audience:
      "NUS Investment Society research reviewers and quantitative practitioners evaluating a strategy’s evidence, reproducibility and model-selection risk.",
    problem:
      "A compelling backtest can depend on favourable assumptions or choosing the best result after many attempts. The research needed comparable experiments, realistic modelled trading costs and validation beyond the period used to develop the strategy.",
    contribution:
      "I built the long/short research workflow across 59 global futures, combined trend and carry signals, modelled portfolio risk and execution costs, and evaluated alternatives with reproducible research artifacts.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Test one framework across a broad futures universe",
            detail:
              "The strategy takes long and short positions across 59 global futures using a common research panel. Applying a shared framework makes experiments comparable, rather than changing the underlying dataset whenever a different strategy variant is tested.",
          },
          {
            label: "Allocate exposure with an explicit risk budget",
            detail:
              "Position sizes respond to volatility, with a 7% annual portfolio-risk target. This separates the decision to take a directional view from how much risk to allocate; the target is a modelling choice, not a guarantee about realised losses.",
          },
          {
            label: "Account for the cost of implementing the idea",
            detail:
              "The backtest includes spreads, slippage, fees, market impact and contract-roll costs. These assumptions recognise that entering, exiting and renewing futures positions consumes returns, so the headline result is reported after modelled trading costs.",
          },
          {
            label: "Make the research reviewable",
            detail:
              "Reproducible artifacts include cumulative net-performance comparisons against trend-following and long-only benchmarks. The comparison lets a reviewer ask what the combined approach adds, rather than considering a return chart without a reference strategy.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Combine trend and carry information",
            detail:
              "The signal blends 12-month trend with basis-momentum carry. Trend follows the direction of past price movement; carry draws information from futures pricing relationships. Combining them tests two different sources of information within the same portfolio framework.",
          },
          {
            label: "Translate signals into risk-scaled positions",
            detail:
              "Volatility-based sizing adjusts exposure before portfolio evaluation, rather than giving every contract the same notional weight. The Python research stack uses pandas, NumPy, SciPy and statsmodels to organise data, numerical calculations and statistical analysis.",
          },
          {
            label: "Evaluate through time rather than randomly mixing dates",
            detail:
              "A 20-fold anchored walk-forward procedure evaluates successive out-of-sample periods while retaining an expanding historical foundation. This preserves the ordering of time and tests the strategy on sessions outside the development portion of each fold.",
          },
          {
            label: "Check the risk of selecting a lucky winner",
            detail:
              "Thirteen replicated strategy paths use the same panel. Combinatorially symmetric cross-validation, or CSCV, assesses the risk that the best selected path benefited from the selection process, adding a check beyond simply reporting its highest Sharpe ratio.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "Historical performance after modelled costs",
            detail:
              "The 1990–2014 backtest reported a 1.59 Sharpe ratio, 13.2% compound annual growth and −11.8% maximum drawdown. Sharpe measures return relative to variability; drawdown describes the largest peak-to-trough decline. These are historical research results, not live trading returns.",
          },
          {
            label: "Separate out-of-sample evidence",
            detail:
              "The walk-forward evaluation covered 5,218 out-of-sample sessions and reported a 1.42 Sharpe ratio. Keeping this result separate from the full historical backtest makes the validation evidence easier to assess without implying that future performance is assured.",
          },
          {
            label: "Keep an uncomfortable diagnostic visible",
            detail:
              "The selected path had the highest Sharpe among the 13 alternatives, but the CSCV estimate of overfitting probability was 0.42. Reporting that alongside performance makes selection risk part of the conclusion instead of hiding it behind a strong headline.",
          },
        ],
      },
    ],
  },
  "CS2 Decision Coach": {
    summary:
      "A Counter-Strike 2 replay coach that helps a player revisit specific decisions, inspect the surrounding match evidence and explain their intent, with safeguards against advice based on information revealed later.",
    audience:
      "CS2 players who want to review their matches and connect tactical feedback to the decisions they actually made.",
    problem:
      "A replay contains too much information to review indiscriminately, while generic coaching can judge a decision using what happened afterwards. Useful feedback needs a specific moment, visible evidence and a clear boundary on what the coach may infer.",
    contribution:
      "I built the native replay-analysis pipeline, decision-selection flow, evidence validation and Next.js coaching interface, connecting match telemetry to feedback a player can inspect and question.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Start from an actual replay and chosen player",
            detail:
              "Players upload a native CS2 .dem replay or explore bundled examples, then choose the player to review. The application connects upload, analysis and results so the coaching remains tied to an identifiable match and player.",
          },
          {
            label: "Surface a manageable set of decisions",
            detail:
              "The pipeline detects first-damage contacts and selects up to ten diverse moments for the chosen player. This creates a focused review session instead of asking the player to search manually through an entire match for useful situations.",
          },
          {
            label: "Keep the advice beside the replay context",
            detail:
              "The radar, player selector, round controls and timeline markers sit alongside coaching panels. A player can connect a comment to its location and moment in the match, making feedback easier to investigate than a detached block of text.",
          },
          {
            label: "Let the player explain their thinking",
            detail:
              "Intent coaching lets a player describe one specific decision and receive advice linked to that moment. This adds the player’s reasoning to the review while keeping the discussion anchored to the available replay evidence.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Convert replay telemetry into structured records",
            detail:
              "AWPy parses native .dem files, while FastAPI and Pydantic expose upload, sample, analysis and result flows. Stable player and decision identifiers keep the selected moment consistent as data moves between parsing, analysis and the interface.",
          },
          {
            label: "Use a model as a signal, not a verdict",
            detail:
              "LightGBM replay-value estimates support the timeline and analysis. The design does not treat a model score as proof that a decision was good; it remains supporting information around a concrete situation the player can inspect.",
          },
          {
            label: "Limit hindsight before asking for advice",
            detail:
              "The coaching prompt receives only the bounded contact and immediate-reaction window. Later kills, deaths, round outcomes and match results are excluded, reducing the opportunity to justify advice using information unavailable at the decision point.",
          },
          {
            label: "Validate the evidence behind generated claims",
            detail:
              "The language model must select evidence identifiers owned by the parser. The backend checks those references and renders factual prose, rejecting unsupported claims; the model cannot simply invent a match event and present it as observed fact.",
          },
          {
            label: "Make analysis and provider state visible",
            detail:
              "The interface provides progress and recovery for completed analyses. If the coaching provider is unavailable, the backend fails closed rather than returning unsupported advice, keeping a failed generation distinct from a successful evidence-backed response.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "A reviewable end-to-end coaching build",
            detail:
              "The public repository and saved RE:DECIDE dashboard show the replay pipeline connected to a Next.js/TypeScript viewer. The project brings together data ingestion, model-assisted analysis, evidence validation and the interaction needed to review a specific decision.",
          },
          {
            label: "Distinguish a saved example from live analysis",
            detail:
              "Bundled Mirage and Inferno replays demonstrate the viewer with saved analysis. Live intent coaching requires a backend analysis, so browsing the examples should not be confused with generating new coaching for an arbitrary uploaded match.",
          },
          {
            label: "Trust depends on inspectable evidence",
            detail:
              "The core design choice is to constrain what the coach can claim and make its context visible. This offers a concrete example of applied AI engineering: useful output depends on data boundaries and validation as well as the model itself.",
          },
        ],
      },
    ],
  },
  "Agentic Fraud Investigation Crew": {
    summary:
      "A team-built investigation workflow that organises financial-crime alerts, assembles supporting evidence and drafts reports, while keeping consequential decisions with a human reviewer. My contribution connected synthetic evaluation data, explainable scoring and the dashboard.",
    audience:
      "Financial-crime operations reviewers and hackathon evaluators exploring how AI assistance could support alert review without removing human approval.",
    problem:
      "An alert backlog requires prioritisation, evidence gathering and documentation before a reviewer can decide what to do. Automating parts of that workflow still needs understandable reasons and a visible human decision point.",
    contribution:
      "I generated the synthetic, PII-free alert backlog, wrote the five-rule scoring engine and integrated it into the operations dashboard. The four-agent architecture, evidence workflow and approval integration were team work.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Prioritise a sample alert backlog",
            detail:
              "The demonstration gives each synthetic alert a score from 0 to 100, helping reviewers inspect a prioritised backlog. Scores include plain-language reasons, so the interface exposes why an alert is elevated instead of showing an unexplained number.",
          },
          {
            label: "Move from an alert to an evidence pack",
            detail:
              "The team’s agents support triage, evidence enrichment, adjudication and suspicious activity report drafting. Each stage addresses a different part of investigation work, connecting the initial alert to supporting material and a draft that a reviewer can assess.",
          },
          {
            label: "Keep the consequential decision with a person",
            detail:
              "Escalations pass through human review using Teams and Power Automate approval workflows. The crew can organise evidence and draft content, while final approval remains an explicit step rather than an assumed consequence of an AI-generated recommendation.",
          },
          {
            label: "Show the workflow in an operations view",
            detail:
              "The dashboard connects the sample backlog, prioritisation and before/after scoreboard used in the demonstration. It gives evaluators a shared view of the workflow and approval queue, instead of requiring them to inspect separate agent outputs.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Create evaluation data without personal information",
            detail:
              "I generated a synthetic, PII-free sample backlog to exercise the crew and scoreboard. This gives the demonstration a controlled set of alerts without using real individuals’ financial records or implying access to a production investigation dataset.",
          },
          {
            label: "Make prioritisation rules traceable",
            detail:
              "I wrote a five-rule scoring engine that produces the 0–100 score and its explanatory reasons. A reviewer can trace the result to the rules that triggered, making the scoring behaviour inspectable rather than relying on a free-form model judgement.",
          },
          {
            label: "Connect scoring logic to the interface",
            detail:
              "I wired the scoring engine into the dashboard so the same sample alerts support backlog review, prioritisation and the before/after views. This joins the demonstration’s data and scoring behaviour to the interface used to explain the workflow.",
          },
          {
            label: "Coordinate specialised agents in a Microsoft workflow",
            detail:
              "The team connected four agents in a Microsoft-native stack spanning Azure AI, retrieval-augmented generation, Cosmos DB, Power Automate and Power BI. Retrieval-augmented generation supplies relevant material to a model; the resulting evidence still passes through review and approval.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "First place as a team",
            detail:
              "The build placed first at Microsoft Hack the Future. My individual contribution was the synthetic data, scoring logic and dashboard integration; the overall investigation architecture and human-approval workflow reflect the team’s combined implementation.",
          },
          {
            label: "A synthetic demonstration, not a production result",
            detail:
              "The operations dashboard and before/after scoreboard use synthetic evaluation data. They demonstrate workflow behaviour and presentation, but do not establish real-world fraud-detection accuracy, an operational time saving or deployment in a regulated production environment.",
          },
          {
            label: "Be clear about what a reviewer can inspect",
            detail:
              "The public repository is the team starter; the separate full implementation remains private. The portfolio’s saved dashboard provides additional demonstration evidence, with that access boundary made explicit instead of presenting the starter as the complete winning system.",
          },
        ],
      },
    ],
  },
} satisfies Record<string, ProjectStory>;
