# Visual Landing Portal & Executive Command Deck

A modern, high-impact visual landing portal for EnergyMind featuring a photorealistic, twilight-lit smart skyscraper hero, real-time facility efficiency scoring, live power vs. solar generation highlights, and 1-click launchpad navigation into the deep SCADA console modules.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 interactive clarification:
> - **Portal Location**: Full-screen welcome portal before entering the SCADA console, with quick toggle access to jump back and forth between the Landing Portal and the SCADA Console.
> - **Visual Imagery**: A photorealistic architectural modern glass skyscraper with ambient twilight cyan and sapphire illumination, matching the dark slate/navy theme (`#1e293b` / `#0f172a`).
> - **Core Highlights on Landing**: 
>   1. Live Facility Efficiency Score (0-100) & Active AI Optimization Status.
>   2. Real-time Building Load vs. Solar Generation breakdown with clean metrics.
>   3. Direct 1-click launchpad cards to all 5 core modules (Load Curve, 3D/2D Spatial Heatmap, Multi-Agent Swarm, What-If Simulator, Intelligence Hub).

---

## 1. Overview & Core Concept

- **What It Does**: Introduces a high-aesthetic, cinematic executive landing portal for EnergyMind. It greets facility executives, engineers, and judges with a real photorealistic smart building hero visual, high-level operational pulse (Efficiency Score, Net Grid Draw, Clean Energy Offset, Active AI Arbitrations), and quick-action navigation cards to directly open any deep SCADA module.
- **Target Audience / Persona**: Building owners, corporate sustainability officers, VP of Facilities, and demonstration evaluators who require both a breathtaking high-level overview and instant drill-down capability into low-level equipment loops.
- **Key Value**: Replaces the immediate jump into dense telemetry charts with an inspiring, authoritative entrance experience that highlights the building's autonomous AI capabilities while preserving 100% of the existing SCADA functionality.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Time Arrival (Landing View)**:
   - User lands on the cinematic **EnergyMind Executive Portal**.
   - Left side: Compelling typography ("Autonomous Building Co-Pilot"), facility status kicker ("Apex Tower Metropark · 38,500 m²"), live efficiency dial (e.g. 94.2% Optimal), and primary CTA button: `"Launch SCADA Console"` or direct module cards.
   - Right side: Framed photorealistic modern skyscraper image with subtle dark-navy gradient overlay and live metric glass badge overlays (e.g. `442 kW Solar Peak`, `18.4 kW Waste Prevented`).
2. **1-Click Launchpad Navigation**:
   - The lower section of the landing page presents 5 distinct, highly polished launchpad cards corresponding to:
     - **24h Telemetry Load Curve** (Real-time load baselines, peak threshold alerts)
     - **3D/2D Spatial Heatmap** (Micro-zone thermal drift, VAV damper positions)
     - **Multi-Agent Swarm** (Gemini-powered causal root-cause investigations)
     - **Intelligence Hub** (Dynamic thermal balancing & authorized advisories)
     - **What-If Scenario Simulator** (Digital twin pre-testing of setpoints & tariffs)
   - Clicking any card immediately transitions the user into that specific view in the SCADA console with that tab active.
3. **Effortless Return to Landing Portal**:
   - The top header brand mark ("EnergyMind") and a dedicated "Portal Home" button in the navigation bar allow the user to effortlessly return to the visual landing portal at any point.

### Visual Identity & Theme

- **Aesthetic Direction**: High-end industrial glassmorphism, cinematic architectural aesthetics, clean unboxed typography, and high-contrast telemetry accents.
- **Color Palette**:
  - Dominant Neutral Canvas (60%): `#0b0f19` deep obsidian navy, with `#1e293b` container backing.
  - Structural Surfaces (30%): Hairline slate borders (`border-slate-800`), glass cards with subtle backdrop blur.
  - Accent Budget (10%): Electric Cyan (`#06b6d4`), Warm Amber (`#f59e0b`), and Emerald (`#10b981`) for live telemetry indicators.
- **Typography & Hierarchy**:
  - Display Font: `Plus Jakarta Sans` / System Sans-Serif, bold and tracking-tight.
  - Numbers & Metrics: `font-mono tabular-nums` for rock-solid tabular data presentation.
  - Zero-Pill Discipline: Unboxed text metadata separated by subtle dots (`·`) instead of bubbly candy pill tags.
- **Imagery**:
  - Generated via `generate_image` tool with a dedicated photorealistic modern commercial skyscraper at twilight with glowing interior smart glass and architectural facade lighting.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Landing Portal as Active State in App.tsx vs. Standalone Route**
  - *Chosen Approach*: Managed via view state (`viewMode: 'portal' | 'console'`) in `App.tsx` with dedicated navigation links in both directions.
  - *Why*: Enables seamless instant switching without client-side routing reload friction, preserving live simulation tick timers (`currentTimeIndex`) and in-memory anomaly resolution state.
  - *Alternative Considered*: Separate URL route via react-router. (Rejected to preserve lightweight zero-reload state across the dev/prod serverless deployment).
- **Decision 2: Image Generation Protocol**
  - *Chosen Approach*: Execute a targeted `generate_image` batch call for the hero architectural skyscraper image, with an immediate resilient styled CSS/SVG fallback container in case of network or asset latency.
  - *Why*: Complies with Zero-Broken-Image Policy and ensures 100% visual integrity under any sandbox environment.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx State Engine                            │
│  viewMode: 'portal' | 'console'    activeTab: ActiveTab                │
│  telemetry: TelemetryPoint24h[]    anomalies: AnomalyEvent[]           │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
            [viewMode === 'portal']          [viewMode === 'console']
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       LandingPortal.tsx              │  │  Header.tsx (Quick Telemetry)│
│  - Photorealistic Skyscraper Hero    │  ├──────────────────────────────┤
│  - Live Efficiency Pulse & Stats     │  │  Navigation.tsx (Tabs + Home)│
│  - Load vs Solar Ratio Visualizer    │  ├──────────────────────────────┤
│  - 5 Direct Launchpad Cards          │  │  Tab Views (Load Curve,      │
│  - "Enter SCADA Console" Primary CTA │  │  Spatial Heatmap, Multi-     │
└──────────────────────────────────────┘  │  Agent, Intelligence Hub,    │
                                          │  What-If, Pipeline Monitor)  │
                                          └──────────────────────────────┘
```

### Component & State Mapping

- `LandingPortal.tsx`:
  - Props: `currentPoint: TelemetryPoint24h`, `anomalies: AnomalyEvent[]`, `onLaunchConsole: (targetTab?: ActiveTab) => void`
  - Computed Metrics:
    - Facility Efficiency Score: Deterministic score calculated from `currentPoint` total load vs baseline ($100 - \Delta_{\text{excess}}\%$).
    - Solar Offset Ratio: `Math.round((solarGenKw / totalLoadKw) * 100)%`.
    - Active Optimization Count: Count of unresolved vs resolved anomalies.
- `App.tsx`:
  - `viewMode`: Defaults to `'portal'` on fresh visit, easily switched to `'console'` by clicking any launchpad card or CTA.
  - When in `'console'` mode, clicking "Portal Home" or the logo in the Header switches `viewMode` back to `'portal'`.
