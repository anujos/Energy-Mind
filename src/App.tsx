import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { LoadCurveChart } from './components/LoadCurveChart';
import { SpatialHeatmap } from './components/SpatialHeatmap';
import { MultiAgentRoom } from './components/MultiAgentRoom';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { PipelineMonitor } from './components/PipelineMonitor';
import { generate24hTelemetry, INITIAL_ANOMALIES } from './data/mockTelemetry';
import { AnomalyEvent, TelemetryPoint24h } from './types';

export default function App() {
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
  };

  const handleResolveAnomaly = (anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, resolved: true } : a))
    );
  };

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
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unresolvedAnomalyCount={anomalies.filter((a) => !a.resolved).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1680px] w-full mx-auto">
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

        {activeTab === 'pipeline-monitor' && <PipelineMonitor />}
      </main>

      {/* Executive SCADA Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06080d] py-2.5 px-4 lg:px-6 text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
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
        </div>
      </footer>
    </div>
  );
}
