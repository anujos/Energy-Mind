import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BatteryCharging,
  Clock,
  Flame,
  Play,
  Pause,
  RefreshCw,
  Sun,
  Zap,
} from 'lucide-react';
import { AnomalyEvent, TelemetryPoint24h } from '../types';

interface HeaderProps {
  currentPoint: TelemetryPoint24h;
  anomalies: AnomalyEvent[];
  isLiveStreaming: boolean;
  onToggleLive: () => void;
  onResetToCurrent: () => void;
  currentTimeIndex: number;
  onOpenPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPoint,
  anomalies,
  isLiveStreaming,
  onToggleLive,
  onResetToCurrent,
  currentTimeIndex,
  onOpenPortal,
}) => {
  const unresolvedAnomalies = anomalies.filter((a) => !a.resolved);
  const netGridKw = Math.max(
    0,
    currentPoint.totalLoadKw - currentPoint.solarGenKw - Math.max(0, currentPoint.batteryKw)
  );

  const getTariffBadge = () => {
    switch (currentPoint.tariffType) {
      case 'critical-peak':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-subsystem font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <Flame className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
            Critical Peak ${currentPoint.gridTariffRate.toFixed(2)}
          </span>
        );
      case 'shoulder':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-subsystem font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40">
            Shoulder ${currentPoint.gridTariffRate.toFixed(2)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-subsystem font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
            Off-Peak ${currentPoint.gridTariffRate.toFixed(2)}
          </span>
        );
    }
  };

  return (
    <header className="relative border-b border-cyan-500/20 bg-[#060912]/90 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-2.5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.65)]">
      {/* Ambient glowing accent line on bottom */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Brand & Facility Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onOpenPortal ? (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  onOpenPortal();
                }}
                title="Return to Executive Landing Portal"
                className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950/90 via-[#0c1e38] to-[#081224] border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
                  <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 group-hover:rotate-6 transition-all" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#060912] animate-ping" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#060912]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-white font-tech group-hover:text-cyan-300 transition-colors">
                      Energy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Mind</span>
                    </span>
                    <span className="text-[10px] font-subsystem font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      SCADA CORE
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-subsystem px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-950/70 hover:border-cyan-400 transition-all">
                      <ArrowLeft className="w-3 h-3 text-cyan-400" />
                      Executive Portal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-medium text-slate-300">Apex Tower Metropark</span>
                    <span>•</span>
                    <span className="text-[11px] font-subsystem text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      38,500 m² Microgrid Online
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950/90 via-[#0c1e38] to-[#081224] border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white font-tech">
                    Energy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Mind</span>
                  </span>
                  <p className="text-xs text-slate-400">Apex Tower Metropark • 38,500 m²</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile streaming toggle */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onToggleLive}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-subsystem font-bold rounded-lg border transition-all ${
                isLiveStreaming
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isLiveStreaming ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* Telemetry Quick Bar with Futuristic Glass Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* Building Demand */}
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#0a0f1d]/90 border border-cyan-950 hover:border-cyan-500/40 rounded-xl p-2.5 transition-all duration-200 card-hover-glow group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-subsystem uppercase text-slate-400 font-semibold tracking-wider">
                Total Demand
              </span>
              <Activity className="w-3.5 h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-num text-white group-hover:text-cyan-300 transition-colors">
                {currentPoint.totalLoadKw.toLocaleString()}
              </span>
              <span className="text-xs font-subsystem text-cyan-400">kW</span>
            </div>
          </div>

          {/* Net Grid Draw */}
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#0a0f1d]/90 border border-slate-800 hover:border-sky-500/40 rounded-xl p-2.5 transition-all duration-200 card-hover-glow group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-subsystem uppercase text-slate-400 font-semibold tracking-wider">
                Net Grid Draw
              </span>
              <Zap className="w-3.5 h-3.5 text-sky-400 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-num text-sky-300">
                {Math.round(netGridKw).toLocaleString()}
              </span>
              <span className="text-xs font-subsystem text-sky-400">kW</span>
            </div>
          </div>

          {/* Solar & Battery Storage */}
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#0a0f1d]/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-2.5 transition-all duration-200 card-hover-glow group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-subsystem uppercase text-slate-400 font-semibold tracking-wider">
                Clean Gen / Storage
              </span>
              <Sun className="w-3.5 h-3.5 text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold font-num text-amber-300 flex items-center gap-1">
                {currentPoint.solarGenKw}kW
              </span>
              <span className="text-xs font-num font-semibold text-violet-300 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/50">
                {currentPoint.batteryKw > 0 ? '+' : ''}{currentPoint.batteryKw}kW
              </span>
            </div>
          </div>

          {/* Active Anomalies */}
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#0a0f1d]/90 border border-slate-800 hover:border-rose-500/40 rounded-xl p-2.5 transition-all duration-200 card-hover-glow group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-subsystem uppercase text-slate-400 font-semibold tracking-wider">
                Active Anomalies
              </span>
              <AlertTriangle className={`w-3.5 h-3.5 ${unresolvedAnomalies.length > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-bold font-num ${unresolvedAnomalies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {unresolvedAnomalies.length}
              </span>
              <span className="text-xs font-subsystem text-slate-400">
                {unresolvedAnomalies.length === 1 ? 'incident' : 'incidents'}
              </span>
            </div>
          </div>

          {/* Time, Tariff & Live Controls */}
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#0a0f1d]/90 border border-cyan-950/60 hover:border-cyan-500/40 rounded-xl p-2.5 flex flex-col justify-between transition-all duration-200 card-hover-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-base font-bold font-num text-white tracking-wider">
                  {currentPoint.time}
                </span>
              </div>
              <button
                onClick={onToggleLive}
                title={isLiveStreaming ? 'Pause Real-Time Telemetry' : 'Resume Real-Time Telemetry'}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLiveStreaming
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between">
              {getTariffBadge()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
