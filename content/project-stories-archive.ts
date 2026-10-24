import type { ProjectStory } from "./project-stories";

export const archiveProjectStories = {
  Obital: {
    summary:
      "A study workspace that turns course documents into searchable material, guided explanations and practice, while keeping an encrypted copy of the student's documents on their own device.",
    audience:
      "Students revising from lecture PDFs and slides who want their notes, questions, practice and progress in one place.",
    problem:
      "Studying often means switching between documents, a chatbot, flashcards and a progress tracker. Obital connects those activities around the student's own course material, with local document access as a starting point.",
    contribution:
      "Built the React and TypeScript study workspace, browser retrieval, encrypted document vault, FastAPI study endpoints and AI-assisted learning flows for the NUS Orbital Apollo 11 project.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "One place to study",
            detail:
              "Brings document reading, tutoring, quizzes, flashcards and progress into a shared workspace. A student can move from understanding a topic to practising it without manually carrying the same material between separate study tools.",
          },
          {
            label: "Search by meaning",
            detail:
              "Splits PDFs and slides into smaller passages and makes them searchable by meaning, not just an exact phrase. Retrieved passages give the tutoring workflow relevant course context when a student asks a question.",
          },
          {
            label: "Keep documents close",
            detail:
              "Provides an encrypted local document vault and optional account-scoped Supabase synchronisation. Students can keep a local study collection while choosing whether to connect the workspace to an account for cloud synchronisation.",
          },
          {
            label: "Turn revision into practice",
            detail:
              "Combines bounded lesson and quiz generation with flashcards, TypeScript grading, experience points, study streaks and leaderboards. The workflow connects reading and explanation to an activity the student can attempt and receive feedback on.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Responsive browser retrieval",
            detail:
              "Runs MiniLM text embeddings inside Web Workers, which move computational work away from the interface thread. This keeps the search pipeline in the browser while avoiding a design where document processing blocks normal interaction.",
          },
          {
            label: "Encryption with separate responsibilities",
            detail:
              "Uses Argon2id to derive an encryption key and AES-GCM to encrypt vault contents. Key derivation and document encryption have distinct jobs; together they underpin the local vault rather than relying only on a sign-in screen.",
          },
          {
            label: "Typed study services",
            detail:
              "Connects the React, Vite and Tailwind interface to FastAPI endpoints for documents, chat and study progress. Pydantic validates the API data, SQLAlchemy handles database access, and Zustand manages the interface's shared state.",
          },
          {
            label: "Grounded, streamed tutoring",
            detail:
              "Connects DeepSeek to retrieved course passages through tool calling and server-sent events, which deliver an answer as it is generated. The intended flow starts with relevant study material rather than treating a general chatbot response as course-specific evidence.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "A connected learning workflow",
            detail:
              "The implementation joins browser-side document processing, encrypted storage, backend services and interactive learning features. FastAPI and Pytest checks run in continuous integration to support repeatable verification as the study workflow changes.",
          },
          {
            label: "Clear offline boundaries",
            detail:
              "Offline-first describes the local workspace and browser retrieval. DeepSeek tutoring and optional Supabase sync use connected services. Keeping that distinction explicit makes the product's availability and data flow easier for both students and engineers to understand.",
          },
        ],
      },
    ],
  },
  "NUSSIF Portfolio & Risk Tools": {
    summary:
      "A collection of research and portfolio tools that helps a student investment fund see account performance, compare strategies and inspect the risks behind a return number.",
    audience:
      "Student portfolio managers, competition participants and fund developers who need understandable performance reports alongside reproducible analysis and dependable data collection.",
    problem:
      "A portfolio's headline return does not explain its exposures, drawdowns or reliability. The tools bring account snapshots, benchmarks and scenario analysis together so reviewers can ask more useful questions about performance.",
    contribution:
      "Built portfolio collectors, reporting and research interfaces. Contributed to the fund's EC2 recovery and trade automation, and supported the stress-testing dashboard; those shared systems are distinguished from the tools I built directly.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Track portfolio value over time",
            detail:
              "Collects net asset value from Interactive Brokers paper accounts and records timestamped snapshots. Streamlit views turn those observations into a reviewable portfolio history, giving participants a common starting point for discussing account performance.",
          },
          {
            label: "Compare performance in context",
            detail:
              "Provides React and Streamlit competition leaderboards with SPY and QQQ benchmarks. Sharpe, Sortino and Calmar ratios add views of return relative to volatility, downside variation and drawdown, rather than ranking portfolios on total return alone.",
          },
          {
            label: "Explore downside risk",
            detail:
              "Calculates historical and 50,000-path Monte Carlo value at risk and expected shortfall. These estimate a loss threshold and the average loss beyond it, while exposure and drawdown measures add context for a portfolio review.",
          },
          {
            label: "Inspect difficult market scenarios",
            detail:
              "Supported a stress dashboard spanning 19 historical crises and eight macro factors. Option sensitivities, known as Greeks, sit alongside payoff bounds and loss estimates, helping reviewers examine how different positions could respond under stressed assumptions.",
          },
          {
            label: "Bring research into one workspace",
            detail:
              "Built a shared interface for Bitcoin breakout cycles, sector rotation from institutional 13F holdings disclosures, and congressional trading. Each module addresses a distinct research question while using common transport, storage and presentation infrastructure.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Repeatable account collection",
            detail:
              "Uses Python and ib_insync to collect paper-account data, with SQLite write-ahead logging for snapshots. Systemd services and timers schedule the jobs, making portfolio reports depend on a repeatable collection process rather than occasional manual exports.",
          },
          {
            label: "Transparent analytics pipeline",
            detail:
              "Implements risk calculations in Python and NumPy and presents them through Streamlit and React. Keeping the numerical work separate from presentation makes the assumptions and outputs easier to inspect without embedding the analysis inside a chart.",
          },
          {
            label: "Recovery without competing workers",
            detail:
              "Contributed to Terraform autoscaling, a Dockerised Interactive Brokers Gateway and DynamoDB conditional leases with fencing tokens. The lease and token design coordinates single-worker failover so a replacement worker can be distinguished from an outdated one.",
          },
          {
            label: "Shared research infrastructure",
            detail:
              "The research platform uses a FastAPI backend, typed Pydantic schemas, a SQLite warehouse and a React trading desk. Separate analysis modules feed a common ingestion pipeline, with automated backend checks and endpoint benchmarks available in the public infrastructure repository.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "From data collection to discussion",
            detail:
              "The combined tools connect account collection, scheduled reporting, benchmark comparisons and risk review. The engineering work covers both what an analyst sees and the background processes needed to keep those views grounded in recorded data.",
          },
          {
            label: "Models and ownership stay explicit",
            detail:
              "Paper-account performance, historical scenarios and simulated losses answer different questions; none establishes future investment returns. Some fund repositories are private, while the public infrastructure code shows the research platform. Shared automation and stress-testing work is described as contribution rather than sole ownership.",
          },
        ],
      },
    ],
  },
  PneuRelief: {
    summary:
      "An in-progress mobile prototype that connects a cast-pressure sensing device to an app, focusing on the practical work of receiving, decoding and presenting sensor information.",
    audience:
      "The NUS MedTech project team developing a connected cast-pressure prototype and evaluating how a mobile interface can work with its sensing hardware.",
    problem:
      "A hardware reading is only useful to an application after the device connects, transmits data and recovers from interruptions. PneuRelief tackles that device-to-phone workflow as part of a cast-pressure monitoring prototype.",
    contribution:
      "Develop the React Native, Expo and TypeScript mobile interface, including Bluetooth notifications, sensor decoding, device commands, Android permissions and reconnection, against the project's FastAPI-backed stack.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Connect a sensor to a phone",
            detail:
              "Provides the mobile side of a connection to the pressure-sensing device using Bluetooth Low Energy, or BLE. The app creates a bridge between a physical prototype and the software that consumes its readings.",
          },
          {
            label: "Receive device updates",
            detail:
              "Subscribes to BLE notifications so sensor updates can arrive from the connected device. This is the transport needed to bring changing device readings into the application, rather than asking a user to transfer sensor output manually.",
          },
          {
            label: "Turn payloads into readings",
            detail:
              "Decodes incoming Base64 notification data and parses comma-separated sensor values in TypeScript. That conversion separates the device's transmitted representation from the values the rest of the mobile application needs to use.",
          },
          {
            label: "Handle interaction in both directions",
            detail:
              "Supports commands sent from the app to the device as well as readings received from it. Android Bluetooth permissions and reconnection handling are part of the interaction, because a useful device flow includes access and recovery.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Mobile application layer",
            detail:
              "Uses React Native and Expo with TypeScript for the interface and device-facing application code. The mobile work sits alongside a FastAPI backend, connecting frontend development to the project's wider software and hardware integration needs.",
          },
          {
            label: "BLE service integration",
            detail:
              "Uses react-native-ble-plx to work with the device's GATT notifications. GATT defines the Bluetooth services and characteristics that an app reads, writes or subscribes to; this layer connects those device capabilities to application behaviour.",
          },
          {
            label: "Connection lifecycle work",
            detail:
              "Handles the permission and reconnection paths around the main data flow. These are separate engineering concerns from decoding a successful notification, and matter when development moves from a single connected demonstration to repeated device interaction.",
          },
          {
            label: "App and backend coordination",
            detail:
              "Develops against a FastAPI, Supabase and SQLite stack while keeping sensor decoding in the TypeScript mobile layer. The frontend and backend repositories are private, so this case study describes the implementation scope without publishing their source.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "Integration is the core work",
            detail:
              "The current development scope covers device transport, payload conversion, mobile interaction and backend integration. It illustrates the work between a sensor and an interface: receiving data correctly is a prerequisite for making that data useful in a product.",
          },
          {
            label: "Prototype scope",
            detail:
              "The current work is a MedTech prototype focused on device connectivity and mobile integration. Clinical evaluation is a separate stage; this project entry describes the engineering implementation and its ongoing development.",
          },
        ],
      },
    ],
  },
  SignMeUp: {
    summary:
      "A team hackathon prototype exploring more accessible everyday interaction through personalised gestures, a conversational wellness assistant and voice-first navigation.",
    audience:
      "People who could benefit from alternative ways to interact with technology, including seniors, and caregivers who need visibility into a navigation journey.",
    problem:
      "A single text-heavy interface does not suit every user or situation. SignMeUp explores gesture, conversation and voice as complementary interaction methods for independent-living scenarios.",
    contribution:
      "The Merge Hackathon team combined sign interpretation, Aurora assistance and PathGuardian navigation in a React and TypeScript prototype. This case study describes the team system without assigning every module to one person.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Recognise personalised gestures",
            detail:
              "Lets a user train the interpreter on their own signs. The prototype explores a personalised interaction vocabulary, giving the recognition workflow examples from the person using it rather than assuming one fixed set of gestures fits everyone.",
          },
          {
            label: "Keep gesture interaction on-device",
            detail:
              "Runs the sign-recognition module entirely in the browser. Gesture processing stays on the user's device for this module, separating that local interaction path from the connected conversational services used elsewhere in the suite.",
          },
          {
            label: "Explore conversational assistance",
            detail:
              "Aurora combines Gemini conversation with real-time emotion, hydration-event and fall-detection features. The team prototype brings these signals into a wellness-assistance concept, exploring how conversation and observed events could support a more approachable interaction.",
          },
          {
            label: "Navigate with voice and caregiver context",
            detail:
              "PathGuardian provides a voice-first navigation flow designed around seniors, accompanied by a caregiver live map and route-deviation alerts. It pairs the traveller's guidance with a separate view for someone helping them follow the journey.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Recognise movement over time",
            detail:
              "Uses MediaPipe with an LSTM recognition pipeline. MediaPipe supplies movement information, while the long short-term memory model handles sequences, making the recognition task about a gesture's progression rather than only one still frame.",
          },
          {
            label: "Train around the individual",
            detail:
              "The interpreter supports user-provided training examples for personal signs. This makes customisation part of the workflow itself, connecting what a person demonstrates to what the model is expected to recognise during later interaction.",
          },
          {
            label: "Compose distinct assistance modules",
            detail:
              "The React and TypeScript prototype brings three modules together while giving each a clear purpose: gestures for interaction, Aurora for conversational wellness assistance, and PathGuardian for navigation. Their different responsibilities are visible in the product design.",
          },
          {
            label: "Connect traveller and caregiver views",
            detail:
              "The navigation concept combines voice guidance, a live map and deviation notifications. These features address different needs: the traveller receives directions, while the caregiver can review route progress and be alerted when it changes.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "A multimodal team prototype",
            detail:
              "The hackathon build demonstrates how gesture recognition, language-model conversation and navigation can sit in one accessibility suite. Its value is the exploration of several interaction needs together, with the team repository available for implementation review.",
          },
          {
            label: "Personalised recognition prototype",
            detail:
              "The interpreter focuses on personalised gesture recognition, a narrower task than full sign-language translation. Aurora and PathGuardian explore wellness and navigation interactions within a hackathon prototype; evaluation in real accessibility and care settings would be a separate phase.",
          },
        ],
      },
    ],
  },
  "Nexus Academic Coach": {
    summary:
      "A student productivity app that connects planning, focused study and reflection, with an AI coach that can discuss study progress and help break work into manageable tasks.",
    audience:
      "Students balancing several subjects who want a practical way to decide what to work on, stay focused and understand how their study habits change.",
    problem:
      "A to-do list records intentions, while a timer records effort. Nexus brings both into a progress-oriented workspace so students can connect what they planned, what they studied and what to do next.",
    contribution:
      "Built the Next.js and TypeScript application, task and focus workflows, habit and progress features, authentication integration, and FastAPI coaching service using LangChain and OpenAI.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Plan work in manageable steps",
            detail:
              "Supports task creation, editing, completion and deletion, with priority filters and a coach-assisted task-breakdown workflow. Students can turn a broad piece of academic work into a list they can organise and act on.",
          },
          {
            label: "Start a focused study session",
            detail:
              "Provides 25-, 50- and 90-minute Pomodoro presets with subject tracking and session history. Recording the subject as well as the duration gives each focus session context for later reflection, rather than only adding minutes to a total.",
          },
          {
            label: "Make consistency visible",
            detail:
              "Uses habit calendars, streaks, levels and experience points to show repeated study actions over time. An XP shop adds a reward loop, connecting completed activity to visible progress within the app.",
          },
          {
            label: "Ask about study progress",
            detail:
              "The academic coach answers productivity questions and drafts personalised study plans. Weekly activity, subject breakdowns and longer-term trends give the student and coaching workflow a shared view of progress to discuss.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "A shared application foundation",
            detail:
              "Uses Next.js 14 and TypeScript for the interface, with Zustand managing state persisted locally. This connects the task, timer and progress views through application state instead of treating them as unrelated screens.",
          },
          {
            label: "Multiple ways to sign in",
            detail:
              "Integrates Supabase Auth for Google, GitHub and email sign-in. Authentication is handled through a dedicated service, while the application implements the student-facing planning, focus and coaching experiences built around it.",
          },
          {
            label: "A separate coaching backend",
            detail:
              "Connects the frontend to FastAPI, LangChain and OpenAI's gpt-4o-mini for coaching and study-plan generation. The Python service handles the AI integration while the TypeScript application handles the interaction and presentation.",
          },
          {
            label: "Charts that explain activity",
            detail:
              "Uses Chart.js to present weekly activity, subject distribution and longer-term study trends. Session records and progress views give students several ways to inspect their habits, rather than relying only on a single gamified score.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "A complete study loop",
            detail:
              "The implemented workflow links a student's tasks to focus sessions, rewards and progress review. It demonstrates product work across everyday interactions and backend AI integration, with a clear reason for each feature to sit in the same application.",
          },
          {
            label: "Measure activity, support judgement",
            detail:
              "Minutes, streaks and XP describe recorded study activity; they do not by themselves establish learning quality. The coach and charts are tools for planning and reflection, with generated plans remaining suggestions for the student to evaluate.",
          },
        ],
      },
    ],
  },
  DealMachine: {
    summary:
      "A set of investment-banking workflow tools that connects research, transaction-document drafting and deal tracking, with Slack as a familiar place to request work and route drafts for review.",
    audience:
      "Investment-banking and deal teams that move between market information, client documents and pipeline updates while coordinating work with colleagues.",
    problem:
      "Research, drafting and deal status can become separate streams of work. DealMachine brings them into a connected workflow so a team can move from information gathering to a reviewable document and a visible next step.",
    contribution:
      "Built the document-generation service and deal dashboard; the broader project also includes Supersearch, a Python and Claude research analyst in Slack. Together, these tools formed the BugleRock Rockathon 2026 workflow.",
    sections: [
      {
        title: "What it does",
        points: [
          {
            label: "Request research from Slack",
            detail:
              "Supersearch offers a Slack interface to live news, financial information, statistical forecasts and document drafts. It brings the request into a communication tool a deal team can already use, rather than making research a separate destination.",
          },
          {
            label: "Prepare transaction documents",
            detail:
              "Supports drafting workflows for engagement letters, deal teasers, information memoranda and non-disclosure agreements. These document types serve different stages of a transaction, from introducing an opportunity to setting the terms for sharing confidential information.",
          },
          {
            label: "Route drafts for review",
            detail:
              "Connects document work to Slack approval routing. A generated draft can enter a review step within the team workflow, making the handoff to a person part of the product rather than ending at text generation.",
          },
          {
            label: "See the deal pipeline",
            detail:
              "Provides a Kanban pipeline and analytics dashboard so deal status is visible alongside research and drafting work. CRM and Slack integration hooks create connection points for customer records and team communication within the deal-operations interface.",
          },
        ],
      },
      {
        title: "How it works",
        points: [
          {
            label: "Research service in Python",
            detail:
              "Supersearch combines Python and Claude to work with news, financial data, forecasts and drafting requests. The service is distinct from the dashboard, separating information-processing work from the interface used to review deal progress.",
          },
          {
            label: "Typed document workflow",
            detail:
              "Uses Node.js, TypeScript and React for the document-generation service and interface. This part of the system turns drafting into an application workflow, with document preparation and review routing connected instead of exposing only a standalone model response.",
          },
          {
            label: "Operational views with Vite and Chart.js",
            detail:
              "Builds the deal dashboard with Vite and Chart.js, combining the Kanban view with analytics. The board supports a view of individual opportunities, while charts provide another way to inspect the overall pipeline.",
          },
          {
            label: "Integration at workflow handoffs",
            detail:
              "Slack connects research requests and document approvals, while the dashboard exposes CRM and Slack hooks. These are deliberate handoff points between tools; the case study distinguishes implemented workflows from hooks intended for further integration.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "A broader workflow than a chatbot",
            detail:
              "The Rockathon project spans information gathering, document preparation, review routing and pipeline visibility. It demonstrates how AI services can fit around an existing business process, with conventional application features carrying the coordination work between generated outputs.",
          },
          {
            label: "Drafting keeps a review step",
            detail:
              "The project brings draft generation and deal coordination into a Rockathon workflow. Human review is built into the document handoff, making research and drafting reviewable within a familiar team process rather than ending the interaction at generated text.",
          },
        ],
      },
    ],
  },
  "Coca-Cola Indonesia growth strategy": {
    summary:
      "A five-year growth case study that turns a US$10 million budget into a staged experiment: test Coke Zero and Ades in Greater Jakarta, measure paid repeat, then decide whether to expand.",
    audience:
      "Strategy, marketing and commercial reviewers assessing how a proposed launch could test customer demand before committing a larger investment.",
    problem:
      "Initial interest or free sampling does not prove that customers will keep buying. The case asks how to test a growth opportunity while separating evidence of repeat demand from promotion-driven trial.",
    contribution:
      "Developed the Work Simulation Program case study, including market framing, a proposed target segment and channel pilot, repeat-purchase measures, staged funding decisions and an illustrative financial scenario model.",
    sections: [
      {
        title: "What it proposes",
        points: [
          {
            label: "Start with a focused market",
            detail:
              "Recommends a US$1.4 million Greater Jakarta pilot with working adults aged 21–35 as the proposed test segment. A defined geography and audience make the initial question narrower than a broad national launch recommendation.",
          },
          {
            label: "Connect products to everyday occasions",
            detail:
              "Positions Coke Zero around meals and Ades around water on the go, with workplace and transit occasions informing the channel proposal. This makes the demand hypothesis about a customer's situation, not only a product or demographic.",
          },
          {
            label: "Test several routes to purchase",
            detail:
              "Proposes matched retail test cells, selected warung trials and stock-checked quick-commerce placements. Warungs are small local shops; comparing these channels makes access and availability part of the experiment rather than assuming every customer shops the same way.",
          },
          {
            label: "Release investment in stages",
            detail:
              "Keeps the remaining US$8.6 million conditional on measured paid repeat and portfolio contribution. The proposal connects expansion funding to evidence, giving decision-makers a defined reason to continue, adjust or stop after the initial pilot.",
          },
        ],
      },
      {
        title: "How the case is evaluated",
        points: [
          {
            label: "Separate evidence from assumptions",
            detail:
              "Structures the proposal with the CALP framework and grounds the demand case in Indonesia's Ministry of Health SKI 2023 survey. The analysis distinguishes that source evidence from proposed segments, channel choices and other assumptions that still need testing.",
          },
          {
            label: "Measure paid repeat clearly",
            detail:
              "Defines an eligible paid-repeat measure over 60 days, separating free initial sampling and incentivised repeat from the intended purchase behaviour. This prevents a successful giveaway from automatically being interpreted as evidence of sustained customer demand.",
          },
          {
            label: "Use a comparison group",
            detail:
              "Includes a holdout comparison alongside matched retail test cells. The proposed design asks what changed relative to a comparison, rather than treating all observed purchases during a campaign as purchases caused by that campaign.",
          },
          {
            label: "Make budget tradeoffs visible",
            detail:
              "Allocates the illustrative US$10 million across retail trial, media, repeat purchase, partnerships, measurement and reserve. The scenario model connects the recommendation to resource choices so reviewers can inspect how the plan changes under different assumptions.",
          },
        ],
      },
      {
        title: "Results & perspective",
        points: [
          {
            label: "A decision-oriented recommendation",
            detail:
              "The final case links a customer hypothesis, channel experiment, repeat-purchase definition and investment gates in one five-year proposal. Its practical output is a plan for learning what deserves further funding, supported by an illustrative scenario model.",
          },
          {
            label: "Proposal, not realised performance",
            detail:
              "This is a five-year strategy case study, with proposed pilot activities and illustrative financial scenarios. The deliverable is an evidence-linked recommendation and decision framework; business results would depend on executing and evaluating the proposed programme.",
          },
        ],
      },
    ],
  },
} satisfies Record<string, ProjectStory>;
