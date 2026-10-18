import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Database,
  Flame,
  Globe,
  Layers,
  Leaf,
  Network,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { AnomalyEvent, TelemetryPoint24h } from '../types';
import { ActiveTab } from './Navigation';
import smartBuildingHeroImg from '../assets/images/smart_building_hero_1792326784715.jpg';

interface LandingPortalProps {
  currentPoint: TelemetryPoint24h;
  anomalies: AnomalyEvent[];
  onLaunchConsole: (targetTab?: ActiveTab) => void;
  onResetDemo?: () => void;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  currentPoint,
  anomalies,
  onLaunchConsole,
  onResetDemo,
}) => {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [resetNotice, setResetNotice] = useState<boolean>(false);
  const unresolvedAnomalies = anomalies.filter((a) => !a.resolved);
  const netGridKw = Math.max(
    0,
    currentPoint.totalLoadKw - currentPoint.solarGenKw - Math.max(0, currentPoint.batteryKw)
  );

  // Automatically guarantee this portal page always loads from the very top
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Smooth slow scroll down to the "How EnergyMind Works" workflow section
  const handleScrollToWorkflow = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const section = document.getElementById('how-it-works');
    if (section) {
      const headerOffset = 70;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleLaunchFromLanding = (targetTab?: ActiveTab) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    onLaunchConsole(targetTab);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onResetDemo) {
      onResetDemo();
    }
    setActiveWorkflowStep(0);
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Facility efficiency score calculation
  const baselineDiff = currentPoint.totalLoadKw - currentPoint.baselineKw;
  const efficiencyScore = Math.max(
    82,
    Math.min(98.5, Math.round((100 - (baselineDiff > 0 ? (baselineDiff / currentPoint.baselineKw) * 40 : 0)) * 10) / 10)
  );

  const solarOffsetPct = currentPoint.totalLoadKw > 0
    ? Math.round((currentPoint.solarGenKw / currentPoint.totalLoadKw) * 100)
    : 0;

  // Simple, understandable visual explanations of how the tools work
  const workflowSteps = [
    {
      id: 0,
      stepNum: '01',
      title: 'Continuous Telemetry Ingestion',
      tagline: 'Physical Sensors → Instant Cloud Telemetry',
      simpleSummary:
        'Instead of waiting for monthly utility bills, EnergyMind continuously ingests power, airflow, chilled water, and zone temperatures from 1,420 field sensors across all 4 floors every 15 minutes.',
      details: [
        'Collects data via BACnet MSTP, Modbus TCP power meters, and MQTT edge gateways.',
        'Zero manual data entry; real-time synchronization with chiller plants and air handlers.',
        'Immediate notification if any sensor goes offline or deviates from expected bounds.',
      ],
      icon: Radio,
      accentColor: 'cyan',
      visualType: 'pipeline',
    },
    {
      id: 1,
      stepNum: '02',
      title: 'Dynamic Baselining & Tariff Arbitrage',
      tagline: 'Historical Learning → Peak Demand Avoidance',
      simpleSummary:
        'EnergyMind learns how your building breathes under varying outdoor weather conditions. It predicts upcoming power spikes and tracks electricity pricing to prevent peak utility surcharges.',
      details: [
        'Compares actual kW consumption against an exponentially weighted baseline model.',
        'Warns facility teams hours before entering Critical Peak tariff periods ($0.65/kWh).',
        'Coordinates rooftop solar PV and battery storage to offset expensive grid electricity.',
      ],
      icon: Activity,
      accentColor: 'emerald',
      visualType: 'baseline',
    },
    {
      id: 2,
      stepNum: '03',
      title: 'Multi-Agent AI Swarm Deliberation',
      tagline: '4 Gemini AI Specialists → Unified Root-Cause Diagnosis',
      simpleSummary:
        'When an energy spike occurs, 4 specialized AI agents investigate simultaneously. Rather than generic alerts, they cross-verify HVAC physics, solar output, weather, and occupancy to reach consensus.',
      details: [
        'AeroSense checks chiller lift & damper strokes; HelioVolt audits solar & batteries.',
        'AtmoPredict accounts for outdoor humidity & solar irradiance heat gain.',
        'Nexus Arbiter calculates a final confidence score and recommends a verified fix.',
      ],
      icon: Bot,
      accentColor: 'rose',
      visualType: 'swarm',
    },
    {
      id: 3,
      stepNum: '04',
      title: 'Pre-Flight Simulation & Safe Actuation',
      tagline: 'Digital Twin Testing → Safe BACnet Execution',
      simpleSummary:
        'Never test changes directly on live equipment. Operators can run virtual What-If stress tests to verify tenant comfort, cost savings, and carbon impact before executing BACnet setpoints.',
      details: [
        'Virtual digital twin simulates temperature changes within ±1.5°C comfort boundaries.',
        'Human-in-the-loop authorization prevents accidental over-cooling or equipment strain.',
        '1-click physical BACnet WriteProperty command dispatch with automated rollback.',
      ],
      icon: Sliders,
      accentColor: 'amber',
      visualType: 'simulation',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Glass Navigation Bar - Cleaned up without redundant launch button */}
      <header className="border-b border-cyan-500/20 bg-[#060912]/85 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 lg:px-12 py-3 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 via-[#0b1b36] to-[#071326] border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:border-cyan-400 transition-all">
              <Zap className="w-5 h-5 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090e] animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-tech">
                  Energy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Mind</span>
                </span>
                <span className="text-[10px] font-subsystem uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Autonomous SCADA
                </span>
                <span className="hidden md:inline-flex text-[10px] font-subsystem uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Apex Tower Metropark
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                38,500 m² Facility • Microgrid, 450 kWp Solar & Chiller Plant
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Telemetry info (No duplicate launch button) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-3 text-xs font-subsystem text-slate-400 border-r border-slate-800 pr-5">
              <span>Time: <strong className="text-white font-num font-semibold">{currentPoint.time}</strong></span>
              <span>·</span>
              <span>Ambient: <strong className="text-cyan-300 font-num">{currentPoint.ambientTempC}°C</strong></span>
              <span>·</span>
              <span>Tariff: <strong className="text-amber-300 font-num font-semibold">${currentPoint.gridTariffRate.toFixed(2)}/kWh</strong></span>
            </div>

            {/* Live Gateway Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-subsystem px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1,420 Nodes Online</span>
            </div>

            {/* Quick smooth scroll to architecture */}
            <button
              onClick={handleScrollToWorkflow}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-800/60 hover:border-cyan-400 text-xs font-subsystem tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:-translate-y-0.5"
            >
              <span>How It Works</span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Balanced Proportions - Zero Scroll Needed to Access Actions */}
      <section className="relative px-4 sm:px-8 lg:px-12 py-5 sm:py-7 lg:py-8 max-w-[1720px] w-full mx-auto overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-6 right-10 w-[450px] h-[350px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
          {/* Left Column: Mission & Core Telemetry Highlights with Clean Proportions */}
          <div className="lg:col-span-6 space-y-4 lg:space-y-4.5">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Badge with Entrance Animation */}
              <div className="animate-hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/90 via-[#0c1e3a] to-blue-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-subsystem uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Autonomous Facility Energy Brain • Multi-Agent Gemini Intelligence</span>
              </div>

              {/* Elevated Main Headline with Balanced Font Sizing and Gradient Glow */}
              <h1 className="animate-hero-title text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold tracking-tight text-white leading-[1.16] font-tech text-balance">
                Autonomous energy intelligence for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 animate-text-grad-glow">zero-waste commercial buildings</span>.
              </h1>

              {/* Refined Descriptive Sub-copy */}
              <p className="animate-hero-desc text-sm sm:text-[15px] text-slate-300 leading-relaxed max-w-xl font-normal">
                EnergyMind unites real-time BACnet thermodynamics, rooftop solar arrays, and predictive Gemini agents to eliminate peak electricity surcharges and safeguard tenant comfort without manual intervention.
              </p>
            </div>

            {/* High-Impact Stat Strip with Modern Typography & Entrance Animation */}
            <div className="animate-hero-stats grid grid-cols-3 gap-2.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#0f172a]/95 to-[#090e1a]/95 border border-cyan-950 hover:border-cyan-500/40 shadow-[0_8px_25px_rgba(0,0,0,0.5)] card-hover-glow transition-all">
              <div>
                <div className="text-[10px] sm:text-[11px] font-subsystem text-slate-400 uppercase tracking-wider font-semibold">
                  Facility Efficiency
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-num text-emerald-400 mt-0.5 flex items-baseline gap-1">
                  {efficiencyScore}<span className="text-base font-subsystem text-emerald-400">%</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-subsystem mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Thermal Optimum
                </div>
              </div>

              <div className="border-l border-slate-800/80 pl-2.5 sm:pl-3.5">
                <div className="text-[10px] sm:text-[11px] font-subsystem text-slate-400 uppercase tracking-wider font-semibold">
                  Solar Offset Ratio
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-num text-amber-300 mt-0.5 flex items-baseline gap-1">
                  {solarOffsetPct}<span className="text-base font-subsystem text-amber-300">%</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-subsystem mt-0.5">
                  {currentPoint.solarGenKw} kW Clean Gen
                </div>
              </div>

              <div className="border-l border-slate-800/80 pl-2.5 sm:pl-3.5">
                <div className="text-[10px] sm:text-[11px] font-subsystem text-slate-400 uppercase tracking-wider font-semibold">
                  Active Anomalies
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-num text-cyan-400 mt-0.5">
                  {unresolvedAnomalies.length}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-subsystem mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Swarm Triaged
                </div>
              </div>
            </div>

            {/* Quick Actions Bar - Immediately Visible Above the Fold */}
            <div className="animate-hero-actions flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => handleLaunchFromLanding()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:-translate-y-0.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>Launch Full SCADA Console</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={handleScrollToWorkflow}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-subsystem font-medium text-xs uppercase tracking-wider border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:-translate-y-0.5"
              >
                <span>How the Platform Works</span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Masterfully Blended Architectural Image with Living Telemetry HUD */}
          <div className="lg:col-span-6 relative">
            {/* Ambient Cyan/Sapphire Glow Rings behind the photo */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#070b14] shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all">
              {/* Seamlessly blended image container with compact height */}
              <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[390px] xl:h-[420px] overflow-hidden">
                <img
                  src={smartBuildingHeroImg}
                  alt="Apex Tower Metropark Smart Skyscraper at Twilight"
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08] transition-transform duration-700 hover:scale-105"
                />

                {/* Ethereal dark vignette gradient blends that melt the image edges seamlessly */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/25 to-[#070b14]/60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/80 via-transparent to-[#070b14]/80 pointer-events-none" />

                {/* Subtle digital scanning grid line */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(6,182,212,0.15)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

                {/* Living Glass Telemetry Overlay 1: Building Health Badge (Top-left) */}
                <div className="absolute top-4 left-4 bg-[#060912]/85 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-lg max-w-[250px] card-hover-glow">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-subsystem uppercase text-cyan-300 font-bold tracking-wider">
                      Apex Digital Twin
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-white font-tech">Apex Tower Metropark</div>
                  <div className="text-[10px] font-subsystem text-slate-400 mt-0.5">
                    38,500 m² • BACnet MSTP Port 47808
                  </div>
                </div>

                {/* Living Glass Telemetry Overlay 2: Solar PV Array (Top-right) */}
                <div className="absolute top-4 right-4 bg-[#060912]/85 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-lg text-right card-hover-glow">
                  <div className="text-[10px] font-subsystem text-amber-300 uppercase font-bold flex items-center justify-end gap-1.5 tracking-wider">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Solar Microgrid</span>
                  </div>
                  <div className="text-xl font-bold font-num text-amber-400 mt-0.5">
                    {currentPoint.solarGenKw} <span className="text-xs font-subsystem">kW</span>
                  </div>
                  <div className="text-[10px] font-subsystem text-slate-400">Rooftop 450 kWp Array</div>
                </div>

                {/* Living Glass Telemetry Overlay 3: Subsystem Breakdown Bar (Bottom) */}
                <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 bg-[#060912]/90 backdrop-blur-lg border border-slate-700/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xl card-hover-glow">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-200 font-tech font-bold flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Instant Power Demand:</span>
                      <strong className="text-white font-num text-sm">
                        {currentPoint.totalLoadKw.toLocaleString()} kW
                      </strong>
                    </span>
                    <span className="text-slate-400 font-subsystem text-xs">
                      Net Grid: <strong className="text-sky-300 font-num">{Math.round(netGridKw)} kW</strong>
                    </span>
                  </div>

                  {/* Multi-segment Subsystem Power Gauge */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      title="Chiller Plant Load"
                      className="bg-sky-500 h-full transition-all duration-300 hover:brightness-125"
                      style={{
                        width: `${Math.min(100, (currentPoint.chillersKw / currentPoint.totalLoadKw) * 100)}%`,
                      }}
                    />
                    <div
                      title="AHU Air Handling Fans"
                      className="bg-cyan-400 h-full transition-all duration-300 hover:brightness-125"
                      style={{
                        width: `${Math.min(100, (currentPoint.ahuFanskW / currentPoint.totalLoadKw) * 100)}%`,
                      }}
                    />
                    <div
                      title="HPC AI Labs"
                      className="bg-violet-500 h-full transition-all duration-300 hover:brightness-125"
                      style={{
                        width: `${Math.min(100, (currentPoint.itLabsKw / currentPoint.totalLoadKw) * 100)}%`,
                      }}
                    />
                    <div
                      title="Plug & Workstation Loads"
                      className="bg-emerald-400 h-full transition-all duration-300 hover:brightness-125"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPoint.plugLoadsKw / currentPoint.totalLoadKw) * 100
                        )}%`,
                      }}
                    />
                    <div
                      title="EV Fleet Rapid Chargers"
                      className="bg-amber-400 h-full transition-all duration-300 hover:brightness-125"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPoint.evFleetKw / currentPoint.totalLoadKw) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Subsystem Legend with the newly requested font */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-subsystem uppercase tracking-wider text-slate-300 mt-2.5 pt-2 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_#38bdf8]" />
                      Chillers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                      AHU Fans
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_6px_#8b5cf6]" />
                      HPC Labs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      Plug Loads
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                      EV Chargers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "How EnergyMind Works" Section: Simple, Visual, Intuitive Explanations */}
      <section id="how-it-works" className="px-4 sm:px-8 lg:px-12 py-16 bg-[#05070d] border-t border-cyan-950/60 relative">
        <div className="max-w-[1720px] mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-subsystem text-cyan-400 uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 inline-block">
              Under the Hood • Architecture & Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-tech tracking-tight">
              How EnergyMind Works in Simple Terms
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No black-box confusion. Here is the direct 4-step pipeline that transforms raw field sensor pulses into verified kilowatt savings and lower carbon emissions.
            </p>
          </div>

          {/* Interactive 4-Step Architecture Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeWorkflowStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveWorkflowStep(step.id)}
                  className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#111c33] to-[#0a1120] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : 'bg-[#080d1a]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0c1426]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-subsystem font-bold text-cyan-400">{step.stepNum}</span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="font-tech font-bold text-sm text-white line-clamp-1">{step.title}</div>
                  <div className="text-[11px] font-subsystem text-slate-400 mt-1 line-clamp-1">{step.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Showcase Card */}
          {(() => {
            const step = workflowSteps[activeWorkflowStep];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0c1324] to-[#070b14] border border-cyan-900/50 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                {/* Left: Clear explanation in plain English */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-subsystem text-cyan-400 uppercase tracking-wider font-semibold">
                      <span>Step {step.stepNum} of 04</span>
                      <span>•</span>
                      <span>{step.tagline}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-tech">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-base text-slate-300 leading-relaxed font-normal">
                    {step.simpleSummary}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {step.details.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => onLaunchConsole()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-subsystem font-bold text-xs uppercase tracking-wider border border-cyan-700/60 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                      <span>See It Live in SCADA Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right: Understandable & Interactive Visual Schematic */}
                <div className="lg:col-span-6">
                  {step.visualType === 'pipeline' && (
                    <div className="bg-[#050811] border border-cyan-950 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-subsystem text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-2 text-cyan-400 font-bold">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span>Telemetry Stream Protocol Matrix</span>
                        </span>
                        <span className="text-emerald-400 font-num">1,420 / 1,420 Nodes OK</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 card-hover-glow">
                          <div className="text-[10px] font-subsystem text-slate-400 uppercase">BACnet MSTP</div>
                          <div className="text-lg font-bold font-tech text-white mt-1">47808 UDP</div>
                          <div className="text-[10px] text-cyan-400 font-num mt-0.5">820 VAVs / AHUs</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 card-hover-glow">
                          <div className="text-[10px] font-subsystem text-slate-400 uppercase">Modbus RTU</div>
                          <div className="text-lg font-bold font-tech text-white mt-1">502 TCP</div>
                          <div className="text-[10px] text-amber-400 font-num mt-0.5">380 Power Meters</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 card-hover-glow">
                          <div className="text-[10px] font-subsystem text-slate-400 uppercase">MQTT Gateway</div>
                          <div className="text-lg font-bold font-tech text-white mt-1">Sparkplug B</div>
                          <div className="text-[10px] text-emerald-400 font-num mt-0.5">220 Environmental</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent border border-cyan-900/40 text-xs text-slate-300 flex items-center justify-between">
                        <span className="font-subsystem text-cyan-300">Edge Ingestion Buffer</span>
                        <span className="font-num text-slate-400">0.02s mean network latency</span>
                      </div>
                    </div>
                  )}

                  {step.visualType === 'baseline' && (
                    <div className="bg-[#050811] border border-emerald-950 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-subsystem text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span>Diurnal Load vs Tariff Band Mapping</span>
                        </span>
                        <span className="text-amber-400 font-subsystem">Active Tariff: Peak</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-subsystem">
                          <span className="text-emerald-400">Off-Peak (22:00 - 06:00)</span>
                          <span className="font-num text-white">$0.12 / kWh (Thermal Pre-cooling)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[35%]" />
                        </div>

                        <div className="flex items-center justify-between text-xs font-subsystem">
                          <span className="text-amber-400">Shoulder (06:00 - 14:00)</span>
                          <span className="font-num text-white">$0.28 / kWh (Solar Absorption)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[65%]" />
                        </div>

                        <div className="flex items-center justify-between text-xs font-subsystem">
                          <span className="text-rose-400">Critical Peak (14:00 - 18:00)</span>
                          <span className="font-num text-white">$0.65 / kWh (Automated Load Shed)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full w-[95%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step.visualType === 'swarm' && (
                    <div className="bg-[#050811] border border-rose-950 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-subsystem text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-2 text-rose-400 font-bold">
                          <Bot className="w-4 h-4 text-rose-400" />
                          <span>Gemini 4-Agent Deliberation Swarm</span>
                        </span>
                        <span className="text-emerald-400 font-subsystem">Consensus: 98.4%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#0e1628] border border-slate-800">
                          <div className="font-tech font-bold text-cyan-300">AeroSense Agent</div>
                          <div className="text-[11px] text-slate-400 font-subsystem mt-0.5">Chillers & VAV Dampers</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0e1628] border border-slate-800">
                          <div className="font-tech font-bold text-amber-300">HelioVolt Agent</div>
                          <div className="text-[11px] text-slate-400 font-subsystem mt-0.5">Solar PV & Battery Inverters</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0e1628] border border-slate-800">
                          <div className="font-tech font-bold text-sky-300">AtmoPredict Agent</div>
                          <div className="text-[11px] text-slate-400 font-subsystem mt-0.5">Weather & Humidity Forecast</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0e1628] border border-slate-800">
                          <div className="font-tech font-bold text-emerald-300">HumanMetrics Agent</div>
                          <div className="text-[11px] text-slate-400 font-subsystem mt-0.5">Occupancy & CO2 Sensors</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs flex items-center justify-between">
                        <span className="font-subsystem text-rose-300">Nexus Chief Arbiter Verdict</span>
                        <span className="font-num text-white">Chiller #2 VFD Delta Alert</span>
                      </div>
                    </div>
                  )}

                  {step.visualType === 'simulation' && (
                    <div className="bg-[#050811] border border-amber-950 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-subsystem text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-2 text-amber-400 font-bold">
                          <Sliders className="w-4 h-4 text-amber-400" />
                          <span>Virtual Pre-Flight Digital Twin</span>
                        </span>
                        <span className="text-emerald-400 font-subsystem">Safe to Execute</span>
                      </div>

                      <div className="space-y-2.5 text-xs font-subsystem">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1628] border border-slate-800">
                          <span className="text-slate-300">Simulated Setpoint Shift:</span>
                          <span className="font-num text-cyan-300">+1.0°C (22.5°C → 23.5°C)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1628] border border-slate-800">
                          <span className="text-slate-300">Predicted Demand Reduction:</span>
                          <span className="font-num text-emerald-400">-78 kW (-$50.70/hr)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1628] border border-slate-800">
                          <span className="text-slate-300">Tenant Comfort Boundary:</span>
                          <span className="font-num text-emerald-400">97.8% Compliance</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Proof & Enterprise Reliability Banner */}
      <section className="px-4 sm:px-8 lg:px-12 py-12 border-t border-slate-800/80 max-w-[1720px] w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-subsystem">
          <div className="p-5 rounded-2xl bg-[#090e1c] border border-slate-800/90 space-y-2 card-hover-glow">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-tech text-sm">
              <Bot className="w-4 h-4" />
              <span>Multi-Agent Consensus</span>
            </div>
            <p className="text-slate-300 font-normal leading-relaxed">
              4 domain agents independently analyze telemetry before the Nexus Arbiter issues physical playbooks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e1c] border border-slate-800/90 space-y-2 card-hover-glow">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-tech text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Deterministic Clamps</span>
            </div>
            <p className="text-slate-300 font-normal leading-relaxed">
              Physical boundary safety clamps guarantee no actuator command exceeds safe operating limits.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e1c] border border-slate-800/90 space-y-2 card-hover-glow">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-tech text-sm">
              <Sliders className="w-4 h-4" />
              <span>Pre-Flight Digital Twin</span>
            </div>
            <p className="text-slate-300 font-normal leading-relaxed">
              Stress-test setpoints and weather extremes without risking equipment downtime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e1c] border border-slate-800/90 space-y-2 card-hover-glow">
            <div className="flex items-center gap-2 text-violet-400 font-bold font-tech text-sm">
              <Cpu className="w-4 h-4" />
              <span>Google Cloud Run Core</span>
            </div>
            <p className="text-slate-300 font-normal leading-relaxed">
              Sub-second cold starts, zero idle compute overhead, and SOC-2 compliant VPC boundaries.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Launch Call To Action */}
      <section className="px-4 sm:px-8 lg:px-12 py-10 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#07090e] border-t border-cyan-500/20">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-white font-tech">
              Ready to inspect live facility operations?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-subsystem">
              Enter the real-time SCADA console with 24h load curves, 3D floor heatmaps, and Gemini agent swarms.
            </p>
          </div>

          <button
            onClick={() => handleLaunchFromLanding()}
            className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <span>Enter Full SCADA Console</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05070d] py-4 px-4 sm:px-8 lg:px-12 text-xs text-slate-500 font-subsystem flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-bold font-tech text-sm">EnergyMind</span>
          <span>•</span>
          <span>Apex Tower Metropark</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SCADA Online (Port 47808)
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          {/* Subtle inconspicuous prototype reset text button */}
          <button
            onClick={handleReset}
            type="button"
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer select-none font-mono"
            title="Reset prototype values & anomalies"
          >
            {resetNotice ? '✓ reset' : 'reset'}
          </button>
          <span className="text-slate-800 hidden sm:inline">•</span>
          <button
            onClick={() => handleLaunchFromLanding()}
            className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
          >
            Launch Console Deck →
          </button>
        </div>
      </footer>
    </div>
  );
};
