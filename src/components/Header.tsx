import React from 'react';
import { Activity, AlertTriangle, BatteryCharging, Clock, Flame, Play, Pause, RefreshCw, Sun, Zap } from 'lucide-react';
import { AnomalyEvent, TelemetryPoint24h } from '../types';

interface HeaderProps {
  currentPoint: TelemetryPoint24h;
  anomalies: AnomalyEvent[];
  isLiveStreaming: boolean;
  onToggleLive: () => void;
  onResetToCurrent: () => void;
  currentTimeIndex: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPoint,
  anomalies,
  isLiveStreaming,
  onToggleLive,
  onResetToCurrent,
  currentTimeIndex,
}) => {
  const unresolvedAnomalies = anomalies.filter((a) => !a.resolved);
  const netGridKw = Math.max(0, currentPoint.totalLoadKw - currentPoint.solarGenKw - Math.max(0, currentPoint.batteryKw));
  const isBessDischarging = currentPoint.batteryKw > 0;

  return (
    <header className="border-b border-slate-800/80 bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Brand & Facility Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Zap className="w-5 h-5 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0d14] animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0d14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-telemetry">
                  Energy<span className="text-cyan-400">Mind</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  SCADA Core v4.2
                </span>
                <span className="hidden md:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Multi-Agent Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Apex Tower Metropark • 38,500 m² • Microgrid & Chiller Plant
              </p>
            </div>
          </div>

          {/* Mobile streaming toggle */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onToggleLive}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                isLiveStreaming
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isLiveStreaming ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* Telemetry Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* Building Demand */}
          <div className="bg-[#0e131f] border border-slate-800 rounded-md p-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                Total Demand
              </span>
              <span className="font-mono text-cyan-400/80 text-[10px]">
                {currentPoint.totalLoadKw > currentPoint.baselineKw ? '+' : ''}
                {Math.round((currentPoint.totalLoadKw - currentPoint.baselineKw) * 10) / 10} kW
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold font-telemetry text-white">
                {currentPoint.totalLoadKw.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kW</span>
            </div>
            {/* Mini baseline bar */}
            <div className="w-full bg-slate-800/80 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentPoint.totalLoadKw > 900 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (currentPoint.totalLoadKw / 1200) * 100)}%` }}
              />
            </div>
          </div>

          {/* Grid Draw */}
          <div className="bg-[#0e131f] border border-slate-800 rounded-md p-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-sky-400" />
                Grid Ingest
              </span>
              <span className="text-[10px] font-mono text-sky-300">
                ${currentPoint.gridTariffRate.toFixed(2)}/kWh
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold font-telemetry text-sky-100">
                {Math.round(netGridKw).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kW</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-mono">
              <span
                className={`px-1 rounded ${
                  currentPoint.tariffType === 'critical-peak'
                    ? 'bg-red-500/20 text-red-300'
                    : currentPoint.tariffType === 'shoulder'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {currentPoint.tariffType.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Solar PV Generation */}
          <div className="bg-[#0e131f] border border-slate-800 rounded-md p-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                Solar PV
              </span>
              <span className="text-[10px] font-mono text-amber-400/80">450 kWp</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold font-telemetry text-amber-300">
                {currentPoint.solarGenKw}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kW</span>
            </div>
            <div className="w-full bg-slate-800/80 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (currentPoint.solarGenKw / 450) * 100)}%` }}
              />
            </div>
          </div>

          {/* Battery BESS */}
          <div className="bg-[#0e131f] border border-slate-800 rounded-md p-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <BatteryCharging className="w-3 h-3 text-violet-400" />
                BESS Storage
              </span>
              <span className="text-[10px] font-mono text-violet-300">1.2 MWh</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`text-base sm:text-lg font-bold font-telemetry ${
                  isBessDischarging ? 'text-violet-300' : 'text-slate-300'
                }`}
              >
                {isBessDischarging ? `+${currentPoint.batteryKw}` : `${currentPoint.batteryKw}`}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kW</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              {isBessDischarging ? 'Peak Shaving Active' : currentPoint.batteryKw < 0 ? 'Charging from Grid/Solar' : 'Standby SoC 68%'}
            </p>
          </div>

          {/* Active Anomalies */}
          <div className="bg-[#0e131f] border border-slate-800 rounded-md p-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Anomalies
              </span>
              <span className="text-[10px] font-mono text-rose-400">
                {unresolvedAnomalies.length > 0 ? 'Action Req' : 'Clear'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold font-telemetry text-rose-400">
                {unresolvedAnomalies.length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">active</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
              {unresolvedAnomalies[0]?.title || 'All systems nominal'}
            </p>
          </div>

          {/* Time & Controls */}
          <div className="bg-[#0e131f] border border-slate-800 rounded-md p-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Telemetry Time
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                {currentPoint.ambientTempC}°C Amb
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base sm:text-lg font-bold font-telemetry text-white tracking-wider">
                {currentPoint.time}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleLive}
                  title={isLiveStreaming ? 'Pause streaming simulation' : 'Resume live telemetry stream'}
                  className={`p-1 rounded text-xs transition-colors ${
                    isLiveStreaming
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onResetToCurrent}
                  title="Snap to present hour (14:15)"
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Slot {currentTimeIndex + 1}/96 (15m step)
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
