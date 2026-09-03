import React, { useState, useMemo } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BatteryCharging,
  CheckCircle2,
  CloudSun,
  DollarSign,
  Download,
  Flame,
  Leaf,
  RotateCcw,
  Send,
  Sliders,
  Sparkles,
  Sun,
  Thermometer,
  Users,
  Zap,
} from 'lucide-react';
import { TelemetryPoint24h, WhatIfParams, WhatIfSimulationResult } from '../types';

interface WhatIfSimulatorProps {
  telemetry: TelemetryPoint24h[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ telemetry }) => {
  // Simulator inputs
  const [params, setParams] = useState<WhatIfParams>({
    ambientTempDeltaC: 0,
    gridTariffMultiplier: 1.0,
    chillerDeratePct: 0,
    precoolingEnabled: false,
    solarDegradationPct: 0,
    evFleetActiveCount: 25,
    setpointDriftDeltaC: 0,
  });

  const [deployedSuccess, setDeployedSuccess] = useState(false);

  // Preset scenarios
  const applyPreset = (presetName: string) => {
    setDeployedSuccess(false);
    switch (presetName) {
      case 'heatwave':
        setParams({
          ambientTempDeltaC: 4.5,
          gridTariffMultiplier: 1.3,
          chillerDeratePct: 0,
          precoolingEnabled: false,
          solarDegradationPct: 10,
          evFleetActiveCount: 30,
          setpointDriftDeltaC: 0,
        });
        break;
      case 'demand-response':
        setParams({
          ambientTempDeltaC: 1.5,
          gridTariffMultiplier: 2.8,
          chillerDeratePct: 0,
          precoolingEnabled: true,
          solarDegradationPct: 0,
          evFleetActiveCount: 5, // shed EV charging
          setpointDriftDeltaC: 1.5, // relax thermostat 1.5C
        });
        break;
      case 'chiller-trip':
        setParams({
          ambientTempDeltaC: 2.0,
          gridTariffMultiplier: 1.0,
          chillerDeratePct: 35,
          precoolingEnabled: false,
          solarDegradationPct: 0,
          evFleetActiveCount: 25,
          setpointDriftDeltaC: 0.5,
        });
        break;
      case 'precooling-opt':
        setParams({
          ambientTempDeltaC: 0,
          gridTariffMultiplier: 1.0,
          chillerDeratePct: 0,
          precoolingEnabled: true,
          solarDegradationPct: 0,
          evFleetActiveCount: 25,
          setpointDriftDeltaC: 0,
        });
        break;
      case 'solar-cloud-ev':
        setParams({
          ambientTempDeltaC: 0,
          gridTariffMultiplier: 1.2,
          chillerDeratePct: 0,
          precoolingEnabled: false,
          solarDegradationPct: 75,
          evFleetActiveCount: 85,
          setpointDriftDeltaC: 0,
        });
        break;
      default:
        handleReset();
    }
  };

  const handleReset = () => {
    setParams({
      ambientTempDeltaC: 0,
      gridTariffMultiplier: 1.0,
      chillerDeratePct: 0,
      precoolingEnabled: false,
      solarDegradationPct: 0,
      evFleetActiveCount: 25,
      setpointDriftDeltaC: 0,
    });
    setDeployedSuccess(false);
  };

  // Real-time building energy model calculation
  const simulation: WhatIfSimulationResult = useMemo(() => {
    let baselineKwh = 0;
    let simulatedKwh = 0;
    let baselineCost = 0;
    let simulatedCost = 0;
    let maxSimKw = 0;
    let maxBaseKw = 0;

    const curveComparison = telemetry.map((p, i) => {
      const hour = Math.floor(i / 4);
      maxBaseKw = Math.max(maxBaseKw, p.totalLoadKw);

      // Baseline components
      let simLoad = p.totalLoadKw;

      // 1. Ambient Temp Impact on Chillers: each +1C ambient adds ~14 kW to chillers
      const tempLoadEffect = params.ambientTempDeltaC * 14.5;
      simLoad += tempLoadEffect;

      // 2. Setpoint Drift Impact: relaxing setpoint +1C reduces cooling load by ~18 kW
      const setpointEffect = params.setpointDriftDeltaC * -18.0;
      simLoad += setpointEffect;

      // 3. Pre-cooling effect:
      // Adds load between 03:00 and 07:00 (cheap off-peak) by +65 kW
      // Decreases load between 14:00 and 18:00 (critical peak) by -85 kW (thermal flywheel)
      if (params.precoolingEnabled) {
        if (hour >= 3 && hour < 7) {
          simLoad += 65;
        } else if (hour >= 14 && hour < 18) {
          simLoad -= 85;
        }
      }

      // 4. Chiller Derate: if chiller derated, building cannot cool fully, load caps out
      if (params.chillerDeratePct > 0) {
        const chillerCapacityMax = 420 * (1 - params.chillerDeratePct / 100);
        if (p.chillersKw > chillerCapacityMax) {
          simLoad -= p.chillersKw - chillerCapacityMax;
        }
      }

      // 5. EV Fleet Charging:
      // Base assumption had 25 cars (~50 kW). Each car is ~2 kW average
      const evDelta = (params.evFleetActiveCount - 25) * 2.2;
      simLoad += evDelta;

      // Ensure positive load
      simLoad = Math.max(120, simLoad);
      maxSimKw = Math.max(maxSimKw, simLoad);

      // Solar generation with degradation
      const solarSim = p.solarGenKw * (1 - params.solarDegradationPct / 100);

      // Dynamic tariff
      const tariffSim = p.gridTariffRate * params.gridTariffMultiplier;

      // Net grid draw for cost calculation
      const netGridSim = Math.max(0, simLoad - solarSim - Math.max(0, p.batteryKw));
      const netGridBase = Math.max(0, p.totalLoadKw - p.solarGenKw - Math.max(0, p.batteryKw));

      // 15-min interval energy (kWh = kW * 0.25)
      const intervalKwhSim = netGridSim * 0.25;
      const intervalKwhBase = netGridBase * 0.25;

      simulatedKwh += intervalKwhSim;
      baselineKwh += intervalKwhBase;

      simulatedCost += intervalKwhSim * tariffSim;
      baselineCost += intervalKwhBase * p.gridTariffRate;

      return {
        time: p.time,
        baselineKw: Math.round(p.totalLoadKw),
        simulatedKw: Math.round(simLoad),
        solarKw: Math.round(solarSim),
        tariff: tariffSim,
      };
    });

    // Carbon emissions: 0.385 kg CO2 per kWh grid electricity
    const baselineCarbonKg = baselineKwh * 0.385;
    const simulatedCarbonKg = simulatedKwh * 0.385;

    // PMV index estimated from setpoint drift and chiller derate
    // 0 is ideal comfort. +1 is slightly warm. +2 is hot.
    let occupantPmv = 0.15;
    occupantPmv += params.setpointDriftDeltaC * 0.45;
    if (params.chillerDeratePct > 25 && params.ambientTempDeltaC > 2) {
      occupantPmv += 0.8;
    }

    return {
      baseline24hKwh: Math.round(baselineKwh),
      simulated24hKwh: Math.round(simulatedKwh),
      kwhDeltaPct: Math.round(((simulatedKwh - baselineKwh) / (baselineKwh || 1)) * 1000) / 10,
      baselineCost: Math.round(baselineCost),
      simulatedCost: Math.round(simulatedCost),
      costDeltaDollar: Math.round(simulatedCost - baselineCost),
      baselineCarbonKg: Math.round(baselineCarbonKg),
      simulatedCarbonKg: Math.round(simulatedCarbonKg),
      carbonDeltaKg: Math.round(simulatedCarbonKg - baselineCarbonKg),
      peakDemandKw: Math.round(maxSimKw),
      peakDemandDeltaKw: Math.round(maxSimKw - maxBaseKw),
      occupantPmvScore: Math.round(occupantPmv * 10) / 10,
      curveComparison,
    };
  }, [telemetry, params]);

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const pad = { top: 20, right: 25, bottom: 35, left: 55 };
  const w = svgWidth - pad.left - pad.right;
  const h = svgHeight - pad.top - pad.bottom;
  const maxKw = Math.max(1200, simulation.peakDemandKw * 1.15);

  const getX = (i: number) => pad.left + (i / (simulation.curveComparison.length - 1)) * w;
  const getY = (kw: number) => pad.top + h - (kw / maxKw) * h;

  const basePathStr = simulation.curveComparison
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.baselineKw).toFixed(1)}`)
    .join(' ');

  const simPathStr = simulation.curveComparison
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.simulatedKw).toFixed(1)}`)
    .join(' ');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-[#0d111a] border border-slate-800 rounded-xl p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              What-If Predictive Scenario Simulator
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
              Thermodynamic & Tariff Physics Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Perturb weather, utility tariffs, solar intermittency, and EV fleet demands to stress-test financial & grid resilience.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors self-start lg:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Baseline
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Presets:</span>
        <button
          onClick={() => applyPreset('heatwave')}
          className="px-3 py-1.5 rounded-lg bg-[#0b0e17] hover:bg-slate-800 border border-slate-800 text-amber-300 whitespace-nowrap transition-colors"
        >
          🔥 Extreme Heatwave (+4.5°C)
        </button>
        <button
          onClick={() => applyPreset('demand-response')}
          className="px-3 py-1.5 rounded-lg bg-[#0b0e17] hover:bg-slate-800 border border-slate-800 text-rose-300 whitespace-nowrap transition-colors"
        >
          ⚡ Critical Peak Pricing ($0.85/kWh)
        </button>
        <button
          onClick={() => applyPreset('chiller-trip')}
          className="px-3 py-1.5 rounded-lg bg-[#0b0e17] hover:bg-slate-800 border border-slate-800 text-sky-300 whitespace-nowrap transition-colors"
        >
          ❄️ Chiller #2 Trip (-35% Capacity)
        </button>
        <button
          onClick={() => applyPreset('precooling-opt')}
          className="px-3 py-1.5 rounded-lg bg-[#0b0e17] hover:bg-slate-800 border border-slate-800 text-emerald-300 whitespace-nowrap transition-colors"
        >
          🔄 Thermal Flywheel Pre-Cooling
        </button>
        <button
          onClick={() => applyPreset('solar-cloud-ev')}
          className="px-3 py-1.5 rounded-lg bg-[#0b0e17] hover:bg-slate-800 border border-slate-800 text-violet-300 whitespace-nowrap transition-colors"
        >
          ☁️ Heavy Overcast + 85 EVs
        </button>
      </div>

      {/* KPI Impact Delta Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Cost Delta */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>24h Electricity Cost</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">
              ${simulation.simulatedCost.toLocaleString()}
            </span>
            <span
              className={`text-xs font-mono font-bold flex items-center ${
                simulation.costDeltaDollar > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {simulation.costDeltaDollar > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {simulation.costDeltaDollar > 0 ? '+' : ''}
              ${simulation.costDeltaDollar}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Baseline: ${simulation.baselineCost.toLocaleString()}
          </p>
        </div>

        {/* Energy Consumption */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Energy Draw</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">
              {simulation.simulated24hKwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">kWh</span>
            <span
              className={`text-xs font-mono font-bold ${
                simulation.kwhDeltaPct > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              ({simulation.kwhDeltaPct > 0 ? '+' : ''}
              {simulation.kwhDeltaPct}%)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Baseline: {simulation.baseline24hKwh.toLocaleString()} kWh
          </p>
        </div>

        {/* Peak Demand */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Demand Ratchet</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-bold font-mono ${
                simulation.peakDemandKw > 1000 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {simulation.peakDemandKw} kW
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                simulation.peakDemandDeltaKw > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              ({simulation.peakDemandDeltaKw > 0 ? '+' : ''}
              {simulation.peakDemandDeltaKw} kW)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {simulation.peakDemandKw > 1000
              ? 'WARNING: Breaches 1,000 kW ratchet limit!'
              : 'Within utility tariff capacity'}
          </p>
        </div>

        {/* Occupant Comfort PMV */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Occupant PMV Comfort</span>
            <Users className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-bold font-mono ${
                simulation.occupantPmvScore > 1.0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              +{simulation.occupantPmvScore} PMV
            </span>
            <span className="text-[11px] text-slate-400">
              {simulation.occupantPmvScore < 0.5
                ? '(Optimal)'
                : simulation.occupantPmvScore < 1.0
                ? '(Acceptable)'
                : '(Warm / Complain)'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Carbon: {simulation.simulatedCarbonKg.toLocaleString()} kg CO2 (
            {simulation.carbonDeltaKg > 0 ? '+' : ''}
            {simulation.carbonDeltaKg} kg)
          </p>
        </div>
      </div>

      {/* Simulator Workspace: Sliders on Left, Visual Curve on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Parameter Levers */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Simulation Input Levers
          </h3>

          {/* Ambient Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-cyan-400" />
                Ambient Temp Shift:
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {params.ambientTempDeltaC > 0 ? '+' : ''}
                {params.ambientTempDeltaC}°C
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="10"
              step="0.5"
              value={params.ambientTempDeltaC}
              onChange={(e) =>
                setParams({ ...params, ambientTempDeltaC: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-5°C (Cold snap)</span>
              <span>Baseline (0°C)</span>
              <span>+10°C (Heatwave)</span>
            </div>
          </div>

          {/* Grid Tariff Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                Tariff Multiplier:
              </span>
              <span className="font-mono text-rose-300 font-bold">
                {params.gridTariffMultiplier.toFixed(1)}x (${(0.65 * params.gridTariffMultiplier).toFixed(2)}/kWh peak)
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="3.5"
              step="0.1"
              value={params.gridTariffMultiplier}
              onChange={(e) =>
                setParams({ ...params, gridTariffMultiplier: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.8x (Off-peak)</span>
              <span>1.0x (Nominal)</span>
              <span>3.5x (Emergency)</span>
            </div>
          </div>

          {/* Solar Cloud Intermittency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                Solar Cloud Attenuation:
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {params.solarDegradationPct}% lost
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={params.solarDegradationPct}
              onChange={(e) =>
                setParams({ ...params, solarDegradationPct: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Clear Sky)</span>
              <span>50% (Haze)</span>
              <span>90% (Storm)</span>
            </div>
          </div>

          {/* EV Fleet Count */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" />
                EV Fleet Chargers:
              </span>
              <span className="font-mono text-sky-300 font-bold">
                {params.evFleetActiveCount} vehicles
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={params.evFleetActiveCount}
              onChange={(e) =>
                setParams({ ...params, evFleetActiveCount: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Thermostat Relaxation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-emerald-400" />
                Thermostat Setpoint Relax:
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                +{params.setpointDriftDeltaC}°C
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={params.setpointDriftDeltaC}
              onChange={(e) =>
                setParams({ ...params, setpointDriftDeltaC: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Pre-cooling Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Thermal Flywheel Pre-Cooling
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Pre-cools building at night ($0.12/kWh) to avoid critical peak
                </span>
              </div>
              <input
                type="checkbox"
                checked={params.precoolingEnabled}
                onChange={(e) =>
                  setParams({ ...params, precoolingEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Visual Before vs After Curve Comparison */}
        <div className="lg:col-span-2 bg-[#0b0e17] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Comparative 24-Hour Load Curve: Baseline vs Scenario
              </span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-400 border-dashed inline-block" />
                  Baseline
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <span className="w-3 h-1 bg-cyan-400 inline-block" />
                  Simulated
                </span>
              </div>
            </div>

            {/* SVG Comparison Chart */}
            <div className="w-full my-3">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
                {/* Y Axis Grid lines */}
                {[0, 300, 600, 900, 1200].map((kw) => (
                  <g key={kw}>
                    <line
                      x1={pad.left}
                      y1={getY(kw)}
                      x2={svgWidth - pad.right}
                      y2={getY(kw)}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x={pad.left - 8}
                      y={getY(kw) + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      textAnchor="end"
                    >
                      {kw} kW
                    </text>
                  </g>
                ))}

                {/* X Axis Time Marks */}
                {simulation.curveComparison.map((p, i) => {
                  if (i % 16 !== 0 && i !== 95) return null;
                  const x = getX(i);
                  return (
                    <g key={p.time}>
                      <line
                        x1={x}
                        y1={pad.top + h}
                        x2={x}
                        y2={pad.top + h + 5}
                        stroke="#334155"
                      />
                      <text
                        x={x}
                        y={pad.top + h + 18}
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

                {/* Baseline Line */}
                <path
                  d={basePathStr}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.8"
                  strokeDasharray="5,4"
                  className="opacity-75"
                />

                {/* Simulated Curve */}
                <path
                  d={simPathStr}
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                />
              </svg>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-400">
              Simulation predicts an overall financial impact of{' '}
              <span
                className={`font-mono font-bold ${
                  simulation.costDeltaDollar > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {simulation.costDeltaDollar > 0 ? '+' : ''}${simulation.costDeltaDollar} / day
              </span>
            </div>

            <button
              onClick={() => setDeployedSuccess(true)}
              disabled={deployedSuccess}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                deployedSuccess
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              }`}
            >
              {deployedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Strategy Dispatched to BMS Scheduling Daemon
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Deploy Optimization Schedule to BMS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
