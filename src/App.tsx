import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { LoadCurveChart } from './components/LoadCurveChart';
import { SpatialHeatmap } from './components/SpatialHeatmap';
import { MultiAgentRoom } from './components/MultiAgentRoom';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { IntelligenceHub } from './components/IntelligenceHub';
import { PipelineMonitor } from './components/PipelineMonitor';
import { LandingPortal } from './components/LandingPortal';
import { generate24hTelemetry, INITIAL_ANOMALIES, BUILDING_FLOORS } from './data/mockTelemetry';
import { AnomalyEvent, TelemetryPoint24h } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<'portal' | 'console'>('portal');
  const [telemetry, setTelemetry] = useState<TelemetryPoint24h[]>(generate24hTelemetry());
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(INITIAL_ANOMALIES);
  // Default to 14:15 (index 57) - high noon peak demand with active anomaly
  const [currentTimeIndex, setCurrentTimeIndex] = useState<number>(57);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('load-curve');
  const [selectedAnomalyForInvestigation, setSelectedAnomalyForInvestigation] = useState<AnomalyEvent | null>(
    INITIAL_ANOMALIES[0]
  );

  // Live streaming tick (advances index every 4 seconds)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const timer = setInterval(() => {
      setCurrentTimeIndex((prev) => (prev + 1) % 96);
    }, 4000);

    return () => clearInterval(timer);
  }, [isLiveStreaming]);

  const currentPoint = telemetry[currentTimeIndex] || telemetry[0];

  const handleToggleLive = () => {
    setIsLiveStreaming((prev) => !prev);
  };

  const handleResetToCurrent = () => {
    setCurrentTimeIndex(57); // 14:15
    setIsLiveStreaming(true);
  };

  const handleInvestigateAnomaly = (anomaly: AnomalyEvent) => {
    setSelectedAnomalyForInvestigation(anomaly);
    setActiveTab('multi-agent');
    setViewMode('console');
  };

  const handleResolveAnomaly = (anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, resolved: true } : a))
    );
  };

  const handleFullDemoReset = () => {
    // Reset all anomalies to fresh un-resolved copies
    setAnomalies(INITIAL_ANOMALIES.map((a) => ({ ...a, resolved: false })));
    setTelemetry(generate24hTelemetry());
    setCurrentTimeIndex(57); // 14:15 peak demand
    setIsLiveStreaming(true);
    setActiveTab('load-curve');
    setSelectedAnomalyForInvestigation(INITIAL_ANOMALIES[0]);
    try {
      sessionStorage.clear();
      localStorage.removeItem('energymind_state');
    } catch {
      // ignore
    }
  };

  // Automatically ensure every page / tab navigation loads from the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [viewMode, activeTab]);

  if (viewMode === 'portal') {
    return (
      <div key="portal-view" className="animate-page-enter">
        <LandingPortal
          currentPoint={currentPoint}
          anomalies={anomalies}
          onResetDemo={handleFullDemoReset}
          onLaunchConsole={(targetTab) => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (targetTab) {
              setActiveTab(targetTab);
            }
            setViewMode('console');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Executive Header & Quick Status Telemetry Bar */}
      <Header
        currentPoint={currentPoint}
        anomalies={anomalies}
        isLiveStreaming={isLiveStreaming}
        onToggleLive={handleToggleLive}
        onResetToCurrent={handleResetToCurrent}
        currentTimeIndex={currentTimeIndex}
        onOpenPortal={() => setViewMode('portal')}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unresolvedAnomalyCount={anomalies.filter((a) => !a.resolved).length}
        onOpenPortal={() => setViewMode('portal')}
      />

      {/* Main Content Area with page entrance animation and auto-scroll to top */}
      <main key={activeTab} className="flex-1 p-4 lg:p-6 max-w-[1680px] w-full mx-auto animate-page-enter">
        {activeTab === 'load-curve' && (
          <LoadCurveChart
            telemetry={telemetry}
            currentTimeIndex={currentTimeIndex}
            onSelectTimeIndex={setCurrentTimeIndex}
            anomalies={anomalies}
            onInvestigateAnomaly={handleInvestigateAnomaly}
          />
        )}

        {activeTab === 'spatial-heatmap' && (
          <SpatialHeatmap
            anomalies={anomalies}
            onInvestigateAnomaly={handleInvestigateAnomaly}
          />
        )}

        {activeTab === 'multi-agent' && (
          <MultiAgentRoom
            anomalies={anomalies}
            selectedAnomaly={selectedAnomalyForInvestigation}
            onSelectAnomaly={setSelectedAnomalyForInvestigation}
            onResolveAnomaly={handleResolveAnomaly}
          />
        )}

        {activeTab === 'what-if' && <WhatIfSimulator telemetry={telemetry} />}

        {activeTab === 'intelligence' && (
          <IntelligenceHub 
            anomalies={anomalies}
            floors={BUILDING_FLOORS}
            onResolveAnomaly={handleResolveAnomaly}
          />
        )}

        {activeTab === 'pipeline-monitor' && <PipelineMonitor />}
      </main>

      {/* Executive SCADA Footer */}
      <footer className="border-t border-slate-700 bg-[#0f172a] py-2.5 px-4 lg:px-6 text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            BMS BACnet/IP Router: Online (MSTP Port 47808)
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Gateway Sync: 1,420 Active Telemetry Nodes</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Security: TLS 1.3 Certified</span>
          <span>•</span>
          <span className="text-cyan-400/90 font-semibold">EnergyMind Autonomous System</span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <button
            onClick={handleFullDemoReset}
            type="button"
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer select-none"
            title="Reset prototype state"
          >
            reset
          </button>
        </div>
      </footer>
    </div>
  );
}
