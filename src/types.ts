export type SystemType = 'HVAC' | 'Solar/BESS' | 'Weather' | 'Occupancy';
export type SeverityType = 'critical' | 'warning' | 'optimization' | 'info';

export interface AnomalyEvent {
  id: string;
  title: string;
  zoneId: string;
  floorId: number;
  timeString: string; // e.g. "14:15"
  timeIndex: number; // 0 to 95 for 15-min intervals
  severity: SeverityType;
  system: SystemType;
  summary: string;
  detectedDelta: string;
  financialImpactPerHour: number; // e.g. $142/hr
  carbonImpactPerHour: number; // e.g. 84 kg/hr
  resolved?: boolean;
}

export interface TelemetryPoint24h {
  time: string; // "14:15"
  index: number;
  totalLoadKw: number;
  baselineKw: number;
  predictedKw: number;
  solarGenKw: number;
  batteryKw: number; // positive = discharging into building, negative = charging
  chillersKw: number;
  ahuFanskW: number;
  lightingKw: number;
  itLabsKw: number;
  evFleetKw: number;
  plugLoadsKw: number;
  ambientTempC: number;
  gridTariffRate: number; // $/kWh
  tariffType: 'off-peak' | 'shoulder' | 'critical-peak';
  anomalies: AnomalyEvent[];
}

export interface ZoneData {
  id: string;
  name: string;
  floor: number;
  areaSqM: number;
  temperatureC: number;
  targetTempC: number;
  humidityPct: number;
  co2Ppm: number;
  powerKw: number;
  powerDensityWPerSqM: number;
  occupancyCount: number;
  occupancyCapacity: number;
  vavDamperPct: number;
  lightingLux: number;
  status: 'normal' | 'warning' | 'critical';
  activeAlert?: string;
  coordinates: {
    // Relative coordinates for floor plan rendering
    x: number;
    y: number;
    w: number;
    h: number;
    depth?: number;
  };
}

export interface FloorData {
  id: number;
  name: string;
  shortName: string;
  description: string;
  totalAreaSqM: number;
  zones: ZoneData[];
}

export interface AgentReport {
  agentId: 'hvac' | 'solar' | 'weather' | 'occupancy';
  agentName: string;
  agentRole: string;
  avatarIcon: string;
  confidencePct: number;
  status: 'idle' | 'analyzing' | 'flagged' | 'nominal';
  findings: string;
  evidence: {
    metric: string;
    observedValue: string;
    expectedValue: string;
    deviation: string;
  }[];
  recommendation: string;
}

export interface ArbiterSynthesis {
  rootCauseVerdict: string;
  masterConfidencePct: number;
  financialWasteEstPerDay: number;
  carbonPenaltyKgPerDay: number;
  comfortRiskLevel: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  synthesizedExplanation: string;
  recommendedActionPlan: {
    step: number;
    action: string;
    targetSystem: string;
    estimatedSavings: string;
  }[];
  automatedMitigationAvailable: boolean;
  mitigationDispatched?: boolean;
}

export interface InvestigationSession {
  id: string;
  anomalyId: string;
  anomalyTitle: string;
  timestamp: string;
  status: 'investigating' | 'completed';
  agentReports: AgentReport[];
  arbiterSynthesis?: ArbiterSynthesis;
}

export interface WhatIfParams {
  ambientTempDeltaC: number; // -5 to +10
  gridTariffMultiplier: number; // 0.8 to 3.5
  chillerDeratePct: number; // 0 to 60%
  precoolingEnabled: boolean;
  solarDegradationPct: number; // 0 to 90%
  evFleetActiveCount: number; // 0 to 120
  setpointDriftDeltaC: number; // -2 to +3
}

export interface WhatIfSimulationResult {
  baseline24hKwh: number;
  simulated24hKwh: number;
  kwhDeltaPct: number;
  baselineCost: number;
  simulatedCost: number;
  costDeltaDollar: number;
  baselineCarbonKg: number;
  simulatedCarbonKg: number;
  carbonDeltaKg: number;
  peakDemandKw: number;
  peakDemandDeltaKw: number;
  occupantPmvScore: number; // -3 to +3 (0 is ideal comfort)
  curveComparison: {
    time: string;
    baselineKw: number;
    simulatedKw: number;
    solarKw: number;
    tariff: number;
  }[];
}

export interface PipelineGatewayMetric {
  protocol: 'BACnet/IP' | 'Modbus TCP' | 'MQTT Sparkplug B' | 'LoRaWAN';
  status: 'healthy' | 'degraded' | 'offline';
  messagesPerSec: number;
  packetLossPct: number;
  latencyMs: number;
  nodesOnline: number;
  nodesTotal: number;
}

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  protocol: string;
  topicOrAddress: string;
  payloadPreview: string;
  severity: 'info' | 'warn' | 'error' | 'ok';
}
