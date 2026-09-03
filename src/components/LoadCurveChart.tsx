import React, { useState, useRef, useMemo } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  Flame,
  Info,
  Layers,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { AnomalyEvent, TelemetryPoint24h } from '../types';

interface LoadCurveChartProps {
  telemetry: TelemetryPoint24h[];
  currentTimeIndex: number;
  onSelectTimeIndex: (index: number) => void;
  anomalies: AnomalyEvent[];
  onInvestigateAnomaly: (anomaly: AnomalyEvent) => void;
}

export const LoadCurveChart: React.FC<LoadCurveChartProps> = ({
  telemetry,
  currentTimeIndex,
  onSelectTimeIndex,
  anomalies,
  onInvestigateAnomaly,
}) => {
  // Layer visibility toggles
  const [showBaseline, setShowBaseline] = useState(true);
  const [showSolar, setShowSolar] = useState(true);
  const [showBattery, setShowBattery] = useState(true);
  const [showSubsystems, setShowSubsystems] = useState(false);
  const [showTariffBands, setShowTariffBands] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = hoverIndex !== null ? hoverIndex : currentTimeIndex;
  const activePoint = telemetry[activeIndex] || telemetry[0];

  // Calculate chart boundaries
  const maxKw = useMemo(() => {
    let max = 0;
    telemetry.forEach((p) => {
      max = Math.max(max, p.totalLoadKw, p.baselineKw, p.predictedKw);
    });
    return Math.ceil((max * 1.15) / 100) * 100; // Round to nearest 100 with headroom
  }, [telemetry]);

  // Dimensions
  const svgWidth = 1000;
  const svgHeight = 420;
  const padding = { top: 30, right: 35, bottom: 45, left: 65 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Scales
  const getX = (index: number) => padding.left + (index / (telemetry.length - 1)) * chartWidth;
  const getY = (kw: number) => padding.top + chartHeight - (kw / maxKw) * chartHeight;

  // Generate SVG Path strings
  const totalLoadPath = useMemo(() => {
    return telemetry
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.totalLoadKw).toFixed(1)}`)
      .join(' ');
  }, [telemetry, maxKw]);

  const totalLoadArea = useMemo(() => {
    const firstX = getX(0).toFixed(1);
    const lastX = getX(telemetry.length - 1).toFixed(1);
    const bottomY = getY(0).toFixed(1);
    return `${totalLoadPath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [totalLoadPath]);

  const baselinePath = useMemo(() => {
    return telemetry
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.baselineKw).toFixed(1)}`)
      .join(' ');
  }, [telemetry, maxKw]);

  const solarPath = useMemo(() => {
    return telemetry
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.solarGenKw).toFixed(1)}`)
      .join(' ');
  }, [telemetry, maxKw]);

  const solarArea = useMemo(() => {
    const firstX = getX(0).toFixed(1);
    const lastX = getX(telemetry.length - 1).toFixed(1);
    const bottomY = getY(0).toFixed(1);
    return `${solarPath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [solarPath]);

  // Mouse scrub handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * svgWidth;

    if (relativeX >= padding.left && relativeX <= svgWidth - padding.right) {
      const normalized = (relativeX - padding.left) / chartWidth;
      const index = Math.round(normalized * (telemetry.length - 1));
      const clamped = Math.max(0, Math.min(telemetry.length - 1, index));
      setHoverIndex(clamped);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const handleClick = () => {
    if (hoverIndex !== null) {
      onSelectTimeIndex(hoverIndex);
    }
  };

  // Summary Metrics
  const peakLoadPoint = useMemo(() => {
    return telemetry.reduce((prev, curr) => (curr.totalLoadKw > prev.totalLoadKw ? curr : prev), telemetry[0]);
  }, [telemetry]);

  const totalKwhToday = useMemo(() => {
    return Math.round(telemetry.reduce((sum, p) => sum + p.totalLoadKw * 0.25, 0));
  }, [telemetry]);

  const totalSolarKwh = useMemo(() => {
    return Math.round(telemetry.reduce((sum, p) => sum + p.solarGenKw * 0.25, 0));
  }, [telemetry]);

  const peakTariffBreaches = useMemo(() => {
    return telemetry.filter((p) => p.tariffType === 'critical-peak' && p.totalLoadKw > 1000).length;
  }, [telemetry]);

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Top Controls & Layer Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-[#0d111a] border border-slate-800 rounded-xl p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              24-Hour Telemetry Load Curve
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800">
              15-Min Granularity (96 Samples)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-channel power curve comparing actual telemetry, baseline demand, and tariff pricing bands.
          </p>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setShowBaseline(!showBaseline)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              showBaseline
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'bg-transparent text-slate-500 border-slate-800 line-through'
            }`}
          >
            <span className="w-2 h-0.5 bg-slate-400 border-dashed inline-block" />
            Baseline Model
          </button>

          <button
            onClick={() => setShowSolar(!showSolar)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              showSolar
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                : 'bg-transparent text-slate-500 border-slate-800 line-through'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-400" />
            Solar PV (450kWp)
          </button>

          <button
            onClick={() => setShowBattery(!showBattery)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              showBattery
                ? 'bg-violet-950/50 text-violet-300 border-violet-500/40'
                : 'bg-transparent text-slate-500 border-slate-800 line-through'
            }`}
          >
            <Zap className="w-3 h-3 text-violet-400" />
            BESS Storage
          </button>

          <button
            onClick={() => setShowTariffBands(!showTariffBands)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              showTariffBands
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                : 'bg-transparent text-slate-500 border-slate-800 line-through'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            Tariff Bands
          </button>

          <button
            onClick={() => setShowSubsystems(!showSubsystems)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              showSubsystems
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                : 'bg-transparent text-slate-500 border-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            {showSubsystems ? 'Hide Subsystems' : 'Subsystem Stack'}
          </button>
        </div>
      </div>

      {/* Main SVG Telemetry Chart */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-3 sm:p-4 relative overflow-hidden">
        {/* Tariff bands legend in top right */}
        {showTariffBands && (
          <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 text-[11px] font-mono bg-[#090c14]/90 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
              Off-Peak $0.12
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-500/40" />
              Shoulder $0.28
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500/50" />
              Critical Peak $0.65
            </span>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            <defs>
              {/* Total Load Area Gradient */}
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>

              {/* Solar Area Gradient */}
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </linearGradient>

              {/* Grid pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172033" strokeWidth="0.8" strokeDasharray="2,2" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect
              x={padding.left}
              y={padding.top}
              width={chartWidth}
              height={chartHeight}
              fill="url(#grid)"
              className="opacity-60"
            />

            {/* Tariff Bands Shading */}
            {showTariffBands && (
              <g className="tariff-bands opacity-25">
                {/* 00:00 to 08:00 Off-Peak */}
                <rect
                  x={getX(0)}
                  y={padding.top}
                  width={getX(32) - getX(0)}
                  height={chartHeight}
                  fill="#10b981"
                />
                {/* 08:00 to 14:00 Shoulder */}
                <rect
                  x={getX(32)}
                  y={padding.top}
                  width={getX(56) - getX(32)}
                  height={chartHeight}
                  fill="#f59e0b"
                />
                {/* 14:00 to 19:00 Critical Peak */}
                <rect
                  x={getX(56)}
                  y={padding.top}
                  width={getX(76) - getX(56)}
                  height={chartHeight}
                  fill="#ef4444"
                />
                {/* 19:00 to 22:00 Shoulder */}
                <rect
                  x={getX(76)}
                  y={padding.top}
                  width={getX(88) - getX(76)}
                  height={chartHeight}
                  fill="#f59e0b"
                />
                {/* 22:00 to 24:00 Off-Peak */}
                <rect
                  x={getX(88)}
                  y={padding.top}
                  width={getX(95) - getX(88)}
                  height={chartHeight}
                  fill="#10b981"
                />
              </g>
            )}

            {/* Critical Demand Warning Line (1,000 kW Utility Ratchet) */}
            <line
              x1={padding.left}
              y1={getY(1000)}
              x2={svgWidth - padding.right}
              y2={getY(1000)}
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="6,4"
              className="opacity-70"
            />
            <text
              x={padding.left + 8}
              y={getY(1000) - 6}
              fill="#ef4444"
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              1,000 kW Utility Ratchet Threshold
            </text>

            {/* Y Axis Horizontal Grid Lines & Ticks */}
            {[0, 200, 400, 600, 800, 1000, 1200].map((kw) => {
              if (kw > maxKw) return null;
              const y = getY(kw);
              return (
                <g key={kw}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    textAnchor="end"
                  >
                    {kw} kW
                  </text>
                </g>
              );
            })}

            {/* X Axis Time Marks (every 2 hours = 8 ticks) */}
            {telemetry.map((p, i) => {
              if (i % 8 !== 0 && i !== 95) return null;
              const x = getX(i);
              return (
                <g key={p.time}>
                  <line
                    x1={x}
                    y1={padding.top + chartHeight}
                    x2={x}
                    y2={padding.top + chartHeight + 6}
                    stroke="#334155"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x}
                    y={padding.top + chartHeight + 20}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {p.time}
                  </text>
                </g>
              );
            })}

            {/* Solar Generation Area & Line */}
            {showSolar && (
              <g>
                <path d={solarArea} fill="url(#solarGradient)" />
                <path
                  d={solarPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="opacity-90"
                />
              </g>
            )}

            {/* Baseline Expected Curve */}
            {showBaseline && (
              <path
                d={baselinePath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeDasharray="5,4"
                className="opacity-70"
              />
            )}

            {/* Subsystem stacked bars at sampled intervals if toggled */}
            {showSubsystems &&
              telemetry.map((p, i) => {
                if (i % 2 !== 0) return null;
                const x = getX(i) - 3;
                let currentY = getY(0);

                // Chillers
                const chillerH = (p.chillersKw / maxKw) * chartHeight;
                // Fans
                const fansH = (p.ahuFanskW / maxKw) * chartHeight;
                // IT Labs
                const itH = (p.itLabsKw / maxKw) * chartHeight;
                // Plug/lighting
                const plugH = ((p.plugLoadsKw + p.lightingKw) / maxKw) * chartHeight;

                return (
                  <g key={`sub-${i}`} className="opacity-45">
                    <rect x={x} y={currentY - chillerH} width="6" height={chillerH} fill="#3b82f6" />
                    <rect x={x} y={currentY - chillerH - fansH} width="6" height={fansH} fill="#06b6d4" />
                    <rect x={x} y={currentY - chillerH - fansH - itH} width="6" height={itH} fill="#8b5cf6" />
                    <rect x={x} y={currentY - chillerH - fansH - itH - plugH} width="6" height={plugH} fill="#10b981" />
                  </g>
                );
              })}

            {/* Primary Total Load Curve & Area */}
            <path d={totalLoadArea} fill="url(#cyanGradient)" />
            <path
              d={totalLoadPath}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            />

            {/* Battery Charging / Discharging overlay markers */}
            {showBattery &&
              telemetry.map((p, i) => {
                if (Math.abs(p.batteryKw) < 20 || i % 3 !== 0) return null;
                const isDischarge = p.batteryKw > 0;
                const x = getX(i);
                const y = getY(p.totalLoadKw);

                return (
                  <circle
                    key={`bess-${i}`}
                    cx={x}
                    cy={isDischarge ? y - 10 : y + 10}
                    r="2.5"
                    fill={isDischarge ? '#a855f7' : '#38bdf8'}
                    className="opacity-80"
                  />
                );
              })}

            {/* Anomaly Detection Flags & Markers on the curve */}
            {anomalies.map((anom) => {
              const x = getX(anom.timeIndex);
              const point = telemetry[anom.timeIndex];
              if (!point) return null;
              const y = getY(point.totalLoadKw);
              const isResolved = anom.resolved;

              return (
                <g
                  key={anom.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTimeIndex(anom.timeIndex);
                    onInvestigateAnomaly(anom);
                  }}
                >
                  {/* Glowing halo */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isResolved ? '6' : '10'}
                    fill={isResolved ? '#10b981' : '#ef4444'}
                    className={`${isResolved ? 'opacity-30' : 'animate-ping opacity-40'}`}
                  />
                  {/* Vertical guideline */}
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke={isResolved ? '#10b981' : '#ef4444'}
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                    className="opacity-70"
                  />
                  {/* Center pin node */}
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#0a0d14"
                    stroke={isResolved ? '#10b981' : '#ef4444'}
                    strokeWidth="2.5"
                  />
                  {/* Label badge */}
                  <g transform={`translate(${x - 32}, ${y - 32})`}>
                    <rect
                      width="64"
                      height="20"
                      rx="4"
                      fill={isResolved ? '#064e3b' : '#450a0a'}
                      stroke={isResolved ? '#10b981' : '#ef4444'}
                      strokeWidth="1"
                    />
                    <text
                      x="32"
                      y="14"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {anom.id}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Active Scrub Cursor Crosshair */}
            <line
              x1={getX(activeIndex)}
              y1={padding.top}
              x2={getX(activeIndex)}
              y2={padding.top + chartHeight}
              stroke="#00f0ff"
              strokeWidth="1.6"
              strokeDasharray="4,2"
            />
            <circle
              cx={getX(activeIndex)}
              cy={getY(activePoint.totalLoadKw)}
              r="6"
              fill="#00f0ff"
              stroke="#0a0d14"
              strokeWidth="2"
              className="filter drop-shadow-[0_0_6px_#00f0ff]"
            />
          </svg>
        </div>

        {/* Time slider scrubber control */}
        <div className="mt-3 flex items-center gap-3 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-400">00:00</span>
          <input
            type="range"
            min="0"
            max={telemetry.length - 1}
            value={currentTimeIndex}
            onChange={(e) => onSelectTimeIndex(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs font-mono text-slate-400">23:45</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {activePoint.time}
          </span>
        </div>
      </div>

      {/* Scrubbed Instantaneous Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Load Decomposition Card */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-telemetry">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Power Deconstruction ({activePoint.time})
            </span>
            <span className="text-xs font-mono font-semibold text-cyan-300">
              {activePoint.totalLoadKw} kW
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono pt-1">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Chillers & Refrigeration:
              </span>
              <span>{activePoint.chillersKw} kW</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                AHU Air Handling Fans:
              </span>
              <span>{activePoint.ahuFanskW} kW</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-violet-400">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                HPC Data Labs (Fl 3):
              </span>
              <span>{activePoint.itLabsKw} kW</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Plug & Workstation Loads:
              </span>
              <span>{activePoint.plugLoadsKw} kW</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                EV Fleet Rapid Chargers:
              </span>
              <span>{activePoint.evFleetKw} kW</span>
            </div>
          </div>
        </div>

        {/* Model Deviation & Forecast */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-telemetry">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              Predictive Model Drift
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                activePoint.totalLoadKw > activePoint.baselineKw ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {activePoint.totalLoadKw > activePoint.baselineKw ? '+' : ''}
              {(activePoint.totalLoadKw - activePoint.baselineKw).toFixed(1)} kW delta
            </span>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Historical Baseline Expectation:</span>
              <span className="font-mono text-slate-200">{activePoint.baselineKw} kW</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Gemini ML 15m Ahead Forecast:</span>
              <span className="font-mono text-emerald-300">{activePoint.predictedKw} kW</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Instantaneous Tariff Charge:</span>
              <span className="font-mono text-amber-300">${activePoint.gridTariffRate.toFixed(2)}/kWh</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ambient Weather Enthalpy:</span>
              <span className="font-mono text-slate-200">{activePoint.ambientTempC}°C (54% RH)</span>
            </div>
          </div>
        </div>

        {/* Today's KPI Summary */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-telemetry">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              24-Hour Operations Summary
            </span>
            <span className="text-[10px] font-mono text-slate-400">Peak: {peakLoadPoint.time}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-[#080a0f] p-2 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Peak Demand</span>
              <span className="text-sm font-bold font-mono text-white">
                {peakLoadPoint.totalLoadKw} kW
              </span>
            </div>
            <div className="bg-[#080a0f] p-2 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Cumulative Energy</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {totalKwhToday.toLocaleString()} kWh
              </span>
            </div>
            <div className="bg-[#080a0f] p-2 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Clean Solar Yield</span>
              <span className="text-sm font-bold font-mono text-amber-300">
                {totalSolarKwh.toLocaleString()} kWh
              </span>
            </div>
            <div className="bg-[#080a0f] p-2 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Active Alerts</span>
              <span className="text-sm font-bold font-mono text-rose-400">
                {anomalies.filter((a) => !a.resolved).length} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Strip (Detected flags along timeline) */}
      <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white font-telemetry">
              Detected Timeline Anomalies ({anomalies.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click any incident to inspect time cursor or launch Multi-Agent Investigation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {anomalies.map((anom) => {
            const isSelected = currentTimeIndex === anom.timeIndex;
            const isResolved = anom.resolved;

            return (
              <div
                key={anom.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/80 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : isResolved
                    ? 'bg-[#090d14] border-emerald-900/50 hover:border-slate-700'
                    : 'bg-[#090d14] border-slate-800/90 hover:border-slate-700'
                }`}
                onClick={() => onSelectTimeIndex(anom.timeIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isResolved
                          ? 'bg-emerald-400'
                          : anom.severity === 'critical'
                          ? 'bg-rose-500 animate-ping'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-mono text-xs font-bold text-white">{anom.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {anom.timeString}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                      isResolved
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : anom.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {isResolved ? 'Resolved' : anom.severity}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 mt-1.5 line-clamp-1">
                  {anom.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{anom.summary}</p>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/70 text-[11px] font-mono">
                  <span className="text-rose-400/90 font-medium">
                    -${anom.financialImpactPerHour}/hr
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInvestigateAnomaly(anom);
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Investigate
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
