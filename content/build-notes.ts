// Implementation notes grounded in portfolio.ts and the authentic media catalogue.
// Team builds retain team attribution; saved demos and backtests are identified.
export const buildNotes: Readonly<
  Record<
    string,
    {
      hook: string;
      question: string;
      decision: string;
      proof: string;
      lessons: readonly string[];
      focus: readonly string[];
    }
  >
> = {
  AlphaEngine: {
    hook: "From market feeds to a research and execution workspace.",
    question:
      "How do you align market data across venues while accounting for feed gaps and execution risk?",
    decision:
      "AlphaEngine reconstructs L2 order books with sequence checks and feed recovery, then aligns the feeds on a 100 ms grid. A FastAPI workspace combines pre-trade risk checks and operator telemetry with Binance, Bybit, and Hyperliquid data.",
    proof:
      "Saved development dashboard showing research, risk and execution status, with paper execution gates.",
    lessons: [
      "Sequence validation and feed recovery are part of the market-data pipeline.",
      "Research, risk and execution status are visible in the operator workspace.",
    ],
    focus: ["Market-data engineering", "Risk controls", "Python / C++"],
  },
  "BrainHack TIL-AI": {
    hook: "Five AI services, one air-gapped finals build.",
    question:
      "How can five AI services work together in an air-gapped evaluation?",
    decision:
      "Team Pandamonium’s finals build packages speech, vision, retrieval, adversarial noise and autonomous navigation as five Dockerised services. It combines NVIDIA Parakeet, YOLOv11, BM25-first retrieval and a MaskablePPO navigation agent for an air-gapped evaluation.",
    proof:
      "Live six-team arena capture; Team Pandamonium finished as Novice Champions.",
    lessons: [
      "Containerised services separate the five evaluation tasks.",
      "The navigation component uses MaskablePPO; retrieval starts with BM25.",
    ],
    focus: ["Multimodal AI", "Containerised services", "Team integration"],
  },
  "Delta1 Research": {
    hook: "Testing a trading idea beyond its headline backtest.",
    question:
      "How does a predictive signal behave once validation, execution costs and portfolio assumptions are included?",
    decision:
      "The research workflow evaluates predictive signals with walk-forward validation and execution costs, alongside explicit assumptions about execution and portfolio behaviour. It also keeps reproducible research artifacts, including a cumulative net-performance comparison against trend-following and long-only benchmarks.",
    proof: "Historical backtest output: growth of $1 after costs, 1990–2015.",
    lessons: [
      "Signal evaluation includes walk-forward validation and execution costs.",
      "The saved performance comparison includes trend-following and long-only benchmarks.",
    ],
    focus: [
      "Quantitative research",
      "Backtest validation",
      "Reproducible analysis",
    ],
  },
  "CS2 Decision Coach": {
    hook: "Turning match evidence into moment-specific coaching.",
    question:
      "How can a coaching system tie its advice to a specific in-game decision?",
    decision:
      "RE:DECIDE parses native .dem telemetry and detects first-contact decisions before generating coaching grounded in match evidence. The build combines AWPy, LightGBM and LLM coaching with a Next.js interface showing the radar, selected player, round controls and match timeline.",
    proof:
      "Saved RE:DECIDE replay dashboard with Mirage radar, player selection, round controls and match timeline.",
    lessons: [
      "Coaching is anchored to native match telemetry and first-contact decisions.",
      "Player, round and timeline context remain visible in the replay dashboard.",
    ],
    focus: [
      "Telemetry pipelines",
      "Evidence-grounded coaching",
      "Full-stack development",
    ],
  },
  "Agentic Fraud Investigation Crew": {
    hook: "An investigation workflow with a human at the decision point.",
    question:
      "How can an AI investigation workflow assemble evidence while leaving approval with a person?",
    decision:
      "The team workflow connects alert triage, evidence enrichment, adjudication and suspicious activity report drafting in a Microsoft-native stack. It produces explainable evidence packs and routes consequential decisions through a human reviewer using Teams and Power Automate approval workflows.",
    proof:
      "Operations dashboard with a human approval queue, demonstrated using synthetic evaluation data.",
    lessons: [
      "Human approval remains explicit in the investigation workflow.",
      "The saved demonstration uses synthetic evaluation data.",
    ],
    focus: ["Agent workflows", "Evidence retrieval", "Human review"],
  },
};
