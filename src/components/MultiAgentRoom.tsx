import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Cpu,
  DollarSign,
  Droplets,
  Flame,
  Globe,
  Leaf,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Wind,
  Zap,
} from 'lucide-react';
import { AnomalyEvent, AgentReport, ArbiterSynthesis, InvestigationSession } from '../types';

interface MultiAgentRoomProps {
  anomalies: AnomalyEvent[];
  selectedAnomaly: AnomalyEvent | null;
  onSelectAnomaly: (anomaly: AnomalyEvent) => void;
  onResolveAnomaly: (anomalyId: string) => void;
}

export const MultiAgentRoom: React.FC<MultiAgentRoomProps> = ({
  anomalies,
  selectedAnomaly,
  onSelectAnomaly,
  onResolveAnomaly,
}) => {
  const [activeAnomalyId, setActiveAnomalyId] = useState<string>(
    selectedAnomaly ? selectedAnomaly.id : anomalies[0]?.id || ''
  );
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationSession, setInvestigationSession] = useState<InvestigationSession | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [activeAgentTab, setActiveAgentTab] = useState<'all' | 'hvac' | 'solar' | 'weather' | 'occupancy' | 'carbon' | 'pump'>('all');

  const currentAnomaly = anomalies.find((a) => a.id === activeAnomalyId) || anomalies[0];

  const handleRunInvestigation = async () => {
    if (!currentAnomaly) return;
    setIsInvestigating(true);
    setDispatchSuccess(false);

    try {
      const res = await fetch('/api/agent/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly: currentAnomaly,
          zone: { zoneId: currentAnomaly.zoneId, floor: currentAnomaly.floorId },
          liveTelemetry: {
            timestamp: currentAnomaly.timeString,
            detectedDelta: currentAnomaly.detectedDelta,
          },
        }),
      });

      const data = await res.json();
      if (data.session) {
        setInvestigationSession(data.session);
      }
    } catch (err) {
      console.error('Error conducting agent investigation:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleDispatchMitigation = () => {
    if (!currentAnomaly) return;
    setDispatchSuccess(true);
    onResolveAnomaly(currentAnomaly.id);
  };

  return (
    <div className="space-y-4">
      {/* Investigation Room Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-[#0d111a] border border-slate-800 rounded-xl p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              Multi-Agent Autonomous Investigation Engine
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini 3.8 Flash Reasoning Arbiter
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-correlates thermal, electrical, weather, and occupancy sensor streams to uncover true root causes.
          </p>
        </div>

        {/* Action Trigger */}
        <button
          onClick={handleRunInvestigation}
          disabled={isInvestigating}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
        >
          {isInvestigating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              Coordinating Specialist Agents...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-slate-950" />
              Launch Autonomous Investigation
            </>
          )}
        </button>
      </div>

      {/* Anomaly Incident Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {anomalies.map((anom) => {
          const isSelected = anom.id === activeAnomalyId;
          const isResolved = anom.resolved;

          return (
            <button
              key={anom.id}
              onClick={() => {
                setActiveAnomalyId(anom.id);
                setDispatchSuccess(false);
                setInvestigationSession(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : isResolved
                  ? 'bg-[#090d14] border-emerald-900/60 opacity-80'
                  : 'bg-[#090c14] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">{anom.id}</span>
                <span
                  className={`text-[9px] font-mono px-1 rounded uppercase ${
                    isResolved
                      ? 'bg-emerald-950 text-emerald-300'
                      : anom.severity === 'critical'
                      ? 'bg-rose-950 text-rose-300'
                      : 'bg-amber-950 text-amber-300'
                  }`}
                >
                  {isResolved ? 'Resolved' : anom.severity}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-1 line-clamp-1">
                {anom.title}
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-500">
                <span>{anom.timeString}</span>
                <span className="text-rose-400">-${anom.financialImpactPerHour}/hr</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Anomaly Overview Banner */}
      {currentAnomaly && (
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                  {currentAnomaly.id}
                </span>
                <span className="text-xs text-slate-400">
                  Target Zone: {currentAnomaly.zoneId} (Floor {currentAnomaly.floorId})
                </span>
                <span className="text-xs text-slate-400">• Detected at {currentAnomaly.timeString}</span>
              </div>
              <h3 className="text-base font-bold text-white">{currentAnomaly.title}</h3>
              <p className="text-xs text-slate-300 max-w-4xl">{currentAnomaly.summary}</p>
            </div>

            <div className="flex items-center gap-4 bg-[#07090e] border border-slate-800 p-3 rounded-lg text-xs font-mono shrink-0">
              <div>
                <span className="text-slate-400 text-[10px] block">Metric Deviation</span>
                <span className="text-amber-300 font-bold">{currentAnomaly.detectedDelta}</span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-400 text-[10px] block">Financial Waste</span>
                <span className="text-rose-400 font-bold">${currentAnomaly.financialImpactPerHour}/hr</span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-400 text-[10px] block">Carbon Penalty</span>
                <span className="text-slate-200 font-bold">{currentAnomaly.carbonImpactPerHour} kg/hr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Investigation Canvas */}
      {!investigationSession && !isInvestigating ? (
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Bot className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-base font-bold text-white">Autonomous Agent Swarm Standing By</h4>
            <p className="text-xs text-slate-400">
              Click &quot;Launch Autonomous Investigation&quot; to coordinate AeroSense (HVAC), HelioVolt (Solar),
              AtmoPredict (Weather), and HumanMetrics (Occupancy) to isolate the root cause.
            </p>
          </div>
          <button
            onClick={handleRunInvestigation}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Play className="w-4 h-4 fill-current" />
            Dispatch Agents on {currentAnomaly?.id}
          </button>
        </div>
      ) : isInvestigating ? (
        /* Agent Analysis Scanning Screen */
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-8 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/50 border-t-cyan-400 animate-spin flex items-center justify-center">
              <Bot className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Synthesizing Domain Telemetry...</h4>
            <p className="text-xs text-slate-400">
              Correlating 1,420 high-frequency sensor streams across BACnet MSTP and Modbus registers.
            </p>
          </div>

          {/* Parallel Agent Progress Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs font-mono">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-cyan-300 animate-pulse">
              [HVAC] AeroSense: Evaluating CHW loop...
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-amber-300 animate-pulse">
              [SOLAR] HelioVolt: Checking inverter strings...
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-sky-300 animate-pulse">
              [WEATHER] AtmoPredict: Checking solar enthalpy...
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-emerald-300 animate-pulse">
              [OCC] HumanMetrics: Cross-referencing PIR...
            </div>
          </div>
        </div>
      ) : (
        /* Completed Investigation View */
        investigationSession && (
          <div className="space-y-4">
            {/* Master Arbiter Consensus Card */}
            {investigationSession.arbiterSynthesis && (
              <div className="bg-gradient-to-br from-[#0e1726] to-[#0a0e1a] border border-cyan-500/40 rounded-xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-xs font-bold font-telemetry">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        CHIEF ARBITER CONSENSUS VERDICT
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {investigationSession.arbiterSynthesis.masterConfidencePct}% Confidence
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {investigationSession.arbiterSynthesis.rootCauseVerdict}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                      {investigationSession.arbiterSynthesis.synthesizedExplanation}
                    </p>
                  </div>

                  {/* Impact Summary Pill */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#07090e]/80 p-3 rounded-lg border border-slate-800 shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Daily Waste</span>
                      <span className="text-base font-bold text-rose-400">
                        ${investigationSession.arbiterSynthesis.financialWasteEstPerDay}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Carbon Excess</span>
                      <span className="text-base font-bold text-slate-200">
                        {investigationSession.arbiterSynthesis.carbonPenaltyKgPerDay} kg CO2
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Comfort Risk:</span>
                      <span className="text-amber-400 font-bold">
                        {investigationSession.arbiterSynthesis.comfortRiskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommended Remediation Action Plan */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Actionable Mitigation Strategy
                    </span>
                    {dispatchSuccess && (
                      <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Mitigation Dispatched to BACnet Gateway DEV-304
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {investigationSession.arbiterSynthesis.recommendedActionPlan.map((action) => (
                      <div
                        key={action.step}
                        className="bg-[#07090e] p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                          {action.step}
                        </span>
                        <div className="flex-1 text-xs space-y-0.5">
                          <p className="text-white font-medium">{action.action}</p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Target: {action.targetSystem}</span>
                            <span className="text-emerald-400">{action.estimatedSavings}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch Button */}
                  <div className="mt-3 flex items-center justify-end gap-3">
                    <button
                      onClick={handleDispatchMitigation}
                      disabled={dispatchSuccess}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                        dispatchSuccess
                          ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 cursor-default'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      }`}
                    >
                      {dispatchSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Setpoints Applied & Verified
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Dispatch Automated Setpoint Mitigation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Specialist Reports (4 Agent Cards) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Domain Specialist Agent Evidence ({investigationSession.agentReports.length} Agents)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investigationSession.agentReports.map((agent) => {
                  const isFlagged = agent.status === 'flagged';
                  const AgentIcon =
                    agent.agentId === 'hvac'
                      ? Wind
                      : agent.agentId === 'solar'
                      ? Sun
                      : agent.agentId === 'weather'
                      ? CloudSun
                      : agent.agentId === 'carbon'
                      ? Leaf
                      : agent.agentId === 'pump'
                      ? Droplets
                      : Users;

                  const iconColor =
                    agent.agentId === 'hvac'
                      ? 'text-cyan-400'
                      : agent.agentId === 'solar'
                      ? 'text-amber-400'
                      : agent.agentId === 'weather'
                      ? 'text-sky-400'
                      : agent.agentId === 'carbon'
                      ? 'text-emerald-400'
                      : agent.agentId === 'pump'
                      ? 'text-blue-400'
                      : 'text-emerald-400';

                  return (
                    <div
                      key={agent.agentId}
                      className={`bg-[#0b0e17] border rounded-xl p-4 space-y-3 transition-all ${
                        isFlagged
                          ? 'border-rose-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                          : 'border-slate-800'
                      }`}
                    >
                      {/* Agent Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg bg-[#07090e] border border-slate-800 ${iconColor}`}>
                            <AgentIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{agent.agentName}</h4>
                            <p className="text-[10px] text-slate-400">{agent.agentRole}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                              isFlagged
                                ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            }`}
                          >
                            {agent.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {agent.confidencePct}%
                          </span>
                        </div>
                      </div>

                      {/* Observations */}
                      <p className="text-xs text-slate-300 leading-relaxed">{agent.findings}</p>

                      {/* Evidence Comparison Table */}
                      {agent.evidence && agent.evidence.length > 0 && (
                        <div className="bg-[#07090e] rounded-lg border border-slate-800/80 p-2.5 space-y-1.5 text-xs font-mono">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                            Telemetry Evidence Table:
                          </span>
                          {agent.evidence.map((ev, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-[11px] border-b border-slate-800/40 pb-1 last:border-0 last:pb-0"
                            >
                              <span className="text-slate-400 truncate max-w-[140px]">{ev.metric}</span>
                              <div className="flex items-center gap-2">
                                <span className={isFlagged ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                                  {ev.observedValue}
                                </span>
                                <span className="text-slate-600 text-[10px]">(Exp: {ev.expectedValue})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommendation */}
                      <div className="text-xs bg-slate-900/50 p-2 rounded border border-slate-800 text-slate-300">
                        <span className="text-cyan-400 font-semibold">Recommendation: </span>
                        {agent.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
