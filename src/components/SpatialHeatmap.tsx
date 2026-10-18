import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Box,
  Compass,
  Eye,
  Flame,
  Layers,
  Maximize2,
  RefreshCw,
  Thermometer,
  Users,
  Wind,
  Zap,
} from 'lucide-react';
import { BUILDING_FLOORS } from '../data/mockTelemetry';
import { AnomalyEvent, FloorData, ZoneData } from '../types';

interface SpatialHeatmapProps {
  anomalies: AnomalyEvent[];
  onInvestigateAnomaly: (anomaly: AnomalyEvent) => void;
}

type HeatmapMode = 'thermal' | 'power' | 'airflow' | 'occupancy';
type ViewProjection = '3d' | '2d';

export const SpatialHeatmap: React.FC<SpatialHeatmapProps> = ({
  anomalies,
  onInvestigateAnomaly,
}) => {
  const [selectedFloorId, setSelectedFloorId] = useState<number>(3); // Default to Floor 3 (HPC & Cleanroom)
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('thermal');
  const [viewProjection, setViewProjection] = useState<ViewProjection>('3d');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('fl3-cleanroom');

  const currentFloor: FloorData =
    BUILDING_FLOORS.find((f) => f.id === selectedFloorId) || BUILDING_FLOORS[0];

  const selectedZone: ZoneData | undefined = currentFloor.zones.find(
    (z) => z.id === selectedZoneId
  );

  // Check if zone has an active anomaly
  const getZoneAnomaly = (zoneId: string) => {
    return anomalies.find((a) => a.zoneId === zoneId && !a.resolved);
  };

  // Color generator based on metric mode
  const getZoneColor = (zone: ZoneData) => {
    if (heatmapMode === 'thermal') {
      const temp = zone.temperatureC;
      if (temp > 25.0) return { fill: '#ef4444', stroke: '#f87171', text: 'text-rose-400', bg: 'bg-rose-500/20' };
      if (temp > 23.5) return { fill: '#f59e0b', stroke: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/20' };
      if (temp > 22.0) return { fill: '#10b981', stroke: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      return { fill: '#06b6d4', stroke: '#38bdf8', text: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    }

    if (heatmapMode === 'power') {
      const density = zone.powerDensityWPerSqM;
      if (density > 200) return { fill: '#ec4899', stroke: '#f472b6', text: 'text-pink-400', bg: 'bg-pink-500/20' };
      if (density > 80) return { fill: '#f59e0b', stroke: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/20' };
      if (density > 40) return { fill: '#06b6d4', stroke: '#38bdf8', text: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      return { fill: '#10b981', stroke: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    }

    if (heatmapMode === 'airflow') {
      const damper = zone.vavDamperPct;
      if (damper > 80) return { fill: '#0284c7', stroke: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/20' };
      if (damper > 40) return { fill: '#0d9488', stroke: '#2dd4bf', text: 'text-teal-400', bg: 'bg-teal-500/20' };
      return { fill: '#475569', stroke: '#94a3b8', text: 'text-slate-400', bg: 'bg-slate-500/20' };
    }

    // Occupancy
    const ratio = zone.occupancyCount / zone.occupancyCapacity;
    if (ratio > 0.8) return { fill: '#ef4444', stroke: '#f87171', text: 'text-rose-400', bg: 'bg-rose-500/20' };
    if (ratio > 0.4) return { fill: '#f59e0b', stroke: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { fill: '#10b981', stroke: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  };

  // Convert floor coordinates to isometric projection
  // In 3D: origin is center (400, 220).
  // x goes right-down, y goes left-down, z goes up
  const toIso = (x: number, y: number, z: number = 0) => {
    const originX = 400;
    const originY = 160;
    const scale = 4.2;

    // isometric transform
    const isoX = originX + (x - y) * 1.732 * scale;
    const isoY = originY + (x + y) * 1.0 * scale - z * scale * 1.2;
    return { x: isoX, y: isoY };
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-[#0d111a] border border-slate-800 rounded-xl p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              Spatial Micro-Zone Heatmap
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {viewProjection.toUpperCase()} Isometric SCADA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time zone thermodynamics, airflow VAV telemetry, and localized power density.
          </p>
        </div>

        {/* View Mode & Projection Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap metric mode selector */}
          <div className="flex items-center bg-[#07090e] border border-slate-800 rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setHeatmapMode('thermal')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                heatmapMode === 'thermal' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Thermal (°C)
            </button>
            <button
              onClick={() => setHeatmapMode('power')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                heatmapMode === 'power' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Power (W/m²)
            </button>
            <button
              onClick={() => setHeatmapMode('airflow')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                heatmapMode === 'airflow' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              Airflow (VAV)
            </button>
            <button
              onClick={() => setHeatmapMode('occupancy')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                heatmapMode === 'occupancy' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Occupancy
            </button>
          </div>

          {/* 3D vs 2D Perspective Toggle */}
          <div className="flex items-center bg-[#07090e] border border-slate-800 rounded-lg p-1 text-xs font-mono">
            <button
              onClick={() => setViewProjection('3d')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewProjection === '3d' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              3D Isometric
            </button>
            <button
              onClick={() => setViewProjection('2d')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewProjection === '2d' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              2D Blueprint
            </button>
          </div>
        </div>
      </div>

        {/* Floor Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
                key={0}
                onClick={() => setSelectedFloorId(0)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                selectedFloorId === 0
                    ? 'bg-slate-800/90 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-[#0b0e17] border-slate-800 hover:border-slate-700'
                }`}
            >
                <div className="text-xs font-bold font-telemetry text-white">ALL FLOORS</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Full Building View</p>
            </button>
        {BUILDING_FLOORS.map((floor) => {
          const isSelected = floor.id === selectedFloorId;
          const floorAnomalies = floor.zones.filter((z) => getZoneAnomaly(z.id));

          return (
            <button
              key={floor.id}
              onClick={() => {
                setSelectedFloorId(floor.id);
                setSelectedZoneId(floor.zones[0].id);
              }}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-[#0b0e17] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-telemetry text-white">
                  Level 0{floor.id}
                </span>
                {floorAnomalies.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1 truncate">{floor.shortName}</p>
            </button>
          );
        })}
        </div>

      {/* Main Floor Canvas and Zone Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Floor Canvas */}
        <div className="lg:col-span-2 bg-[#090c14] border border-slate-800 rounded-xl p-4 relative min-h-[440px] flex flex-col justify-between overflow-hidden">
          {/* Canvas Floating Overlay Info */}
          <div className="flex items-center justify-between z-10">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-telemetry">
                {selectedFloorId === 0 ? 'Building Overview' : currentFloor.name}
              </span>
              <p className="text-[11px] text-slate-400">{selectedFloorId === 0 ? 'Full 4-Level Digital Twin' : currentFloor.description}</p>
            </div>

            {/* Scale legend */}
            <div className="flex items-center gap-2 text-[10px] font-mono bg-[#07090e]/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-slate-400">Scale:</span>
              <span className="text-cyan-400">Low</span>
              <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 via-amber-500 to-rose-500" />
              <span className="text-rose-400">High</span>
            </div>
          </div>

          {/* SVG Plan / Isometric Renderer */}
          <div className="w-full flex-1 flex items-center justify-center my-2">
            {viewProjection === '3d' ? (
              <svg viewBox="0 0 800 600" className="w-full max-w-[720px] h-auto select-none">
                {/* Interactive Zone Polygons in 3D */}
                {(selectedFloorId === 0 ? BUILDING_FLOORS : [currentFloor]).map((floor, floorIdx) => 
                  floor.zones.map((zone) => {
                  const { x, y, w, h } = zone.coordinates;
                  const isSelected = selectedZoneId === zone.id;
                  const zoneColor = getZoneColor(zone);
                  const hasAnomaly = getZoneAnomaly(zone.id);

                  // Floor-based Z-offset for stacking in 3D
                  const floorZ = (floor.id - 1) * 25;
                  const heightZ = isSelected ? floorZ + 12 : floorZ + 5;

                  // Top polygon points
                  const t1 = toIso(x, y, heightZ);
                  const t2 = toIso(x + w, y, heightZ);
                  const t3 = toIso(x + w, y + h, heightZ);
                  const t4 = toIso(x, y + h, heightZ);

                  // Base points on floor
                  const b1 = toIso(x, y, floorZ);
                  const b2 = toIso(x + w, y, floorZ);
                  const b3 = toIso(x + w, y + h, floorZ);
                  const b4 = toIso(x, y + h, floorZ);

                  // Center point for label
                  const center = toIso(x + w / 2, y + h / 2, heightZ + 2);

                  return (
                    <g
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="cursor-pointer group"
                    >
                      {/* Left Wall */}
                      <polygon
                        points={`${t4.x},${t4.y} ${t3.x},${t3.y} ${b3.x},${b3.y} ${b4.x},${b4.y}`}
                        fill={zoneColor.fill}
                        fillOpacity={isSelected ? 0.45 : 0.25}
                        stroke={zoneColor.stroke}
                        strokeWidth="1"
                      />

                      {/* Right Wall */}
                      <polygon
                        points={`${t2.x},${t2.y} ${t3.x},${t3.y} ${b3.x},${b3.y} ${b2.x},${b2.y}`}
                        fill={zoneColor.fill}
                        fillOpacity={isSelected ? 0.35 : 0.18}
                        stroke={zoneColor.stroke}
                        strokeWidth="1"
                      />

                      {/* Top Surface */}
                      <polygon
                        points={`${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                        fill={zoneColor.fill}
                        fillOpacity={isSelected ? 0.75 : 0.45}
                        stroke={isSelected ? '#ffffff' : zoneColor.stroke}
                        strokeWidth={isSelected ? 2 : 1.2}
                        className="transition-all duration-300 group-hover:fill-opacity-80"
                      />

                      {/* Anomaly Beacon Pin if active */}
                      {hasAnomaly && (
                        <g>
                          <circle
                            cx={center.x}
                            cy={center.y - 12}
                            r="8"
                            fill="#ef4444"
                            className="animate-ping opacity-70"
                          />
                          <circle
                            cx={center.x}
                            cy={center.y - 12}
                            r="5"
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        </g>
                      )}

                      {/* Zone Center Text Label */}
                      <text
                        x={center.x}
                        y={center.y}
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        {zone.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                }))}
              </svg>
            ) : (
              /* 2D Architectural Schematic Blueprint */
              <svg viewBox="0 0 220 220" className="w-full max-w-[480px] h-auto select-none">
                <rect x="0" y="0" width="220" height="220" fill="#0b0f19" stroke="#1e293b" strokeWidth="1" />
                {(selectedFloorId === 0 ? BUILDING_FLOORS : [currentFloor]).map((floor, floorIdx) => 
                  floor.zones.map((zone) => {
                  const { x, y, w, h } = zone.coordinates;
                  const isSelected = selectedZoneId === zone.id;
                  const zoneColor = getZoneColor(zone);
                  const hasAnomaly = getZoneAnomaly(zone.id);
                  
                  // Simple grid offset for 2D overview
                  const offsetX = (floorIdx % 2) * 110;
                  const offsetY = Math.floor(floorIdx / 2) * 110;

                  return (
                    <g
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x={x/2 + offsetX}
                        y={y/2 + offsetY}
                        width={w/2}
                        height={h/2}
                        fill={zoneColor.fill}
                        fillOpacity={isSelected ? 0.65 : 0.35}
                        stroke={isSelected ? '#00f0ff' : zoneColor.stroke}
                        strokeWidth={isSelected ? 1.5 : 0.8}
                        rx="2"
                        className="transition-all group-hover:fill-opacity-70"
                      />
                      {hasAnomaly && (
                        <circle cx={x/2 + w/2 + offsetX} cy={y/2 + h/2 + offsetY} r="3" fill="#ef4444" className="animate-pulse" />
                      )}
                    </g>
                  );
                }))}
              </svg>
            )
          }
          </div>

          {/* Quick zone status pills at bottom */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-500 font-mono text-[10px]">Select Zone:</span>
            {currentFloor.zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZoneId(z.id)}
                className={`px-2.5 py-1 rounded-md font-mono text-xs whitespace-nowrap border transition-all ${
                  selectedZoneId === z.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {z.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deep-Dive Zone Inspector Drawer */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          {selectedZone ? (
            <div className="space-y-4">
              {/* Zone Header */}
              <div className="border-b border-slate-800/80 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Zone ID: {selectedZone.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedZone.status === 'critical'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : selectedZone.status === 'warning'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {selectedZone.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-2 font-telemetry">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Floor {selectedZone.floor} • Floor Area: {selectedZone.areaSqM} m²
                </p>
              </div>

              {/* Active Alert Banner if exists */}
              {selectedZone.activeAlert && (
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-2.5 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Active Sensor Alert</span>
                    <span>{selectedZone.activeAlert}</span>
                  </div>
                </div>
              )}

              {/* Sensor Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Temperature */}
                <div className="bg-[#07090e] p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Dry-Bulb Temp</span>
                    <Thermometer className="w-3 h-3 text-cyan-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-white">
                      {selectedZone.temperatureC}°C
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (Tgt: {selectedZone.targetTempC}°C)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedZone.temperatureC > 24.5 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, (selectedZone.temperatureC / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Relative Humidity */}
                <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 card-hover-glow">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-subsystem uppercase">
                    <span>Humidity</span>
                    <Wind className="w-3 h-3 text-sky-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-num text-white">
                      {selectedZone.humidityPct}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-subsystem">RH</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-subsystem">ASHRAE 55 Optimal</p>
                </div>

                {/* CO2 Concentration */}
                <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 card-hover-glow">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-subsystem uppercase">
                    <span>CO2 Level</span>
                    <Users className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`text-lg font-bold font-num ${
                        selectedZone.co2Ppm > 1000 ? 'text-rose-400' : 'text-white'
                      }`}
                    >
                      {selectedZone.co2Ppm}
                    </span>
                    <span className="text-[10px] text-slate-500 font-subsystem">ppm</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-subsystem">
                    {selectedZone.co2Ppm > 1000 ? 'Poor IAQ / Ventilate' : 'Good Indoor Air'}
                  </p>
                </div>

                {/* Power & Density */}
                <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 card-hover-glow">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-subsystem uppercase">
                    <span>Power Load</span>
                    <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-num text-amber-300">
                      {selectedZone.powerKw} kW
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-subsystem mt-1">
                    {selectedZone.powerDensityWPerSqM} W/m²
                  </p>
                </div>

                {/* Occupancy */}
                <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 card-hover-glow">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-subsystem uppercase">
                    <span>Occupancy</span>
                    <Users className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-num text-white">
                      {selectedZone.occupancyCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      / {selectedZone.occupancyCapacity} cap
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (selectedZone.occupancyCount / selectedZone.occupancyCapacity) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* VAV Damper */}
                <div className="bg-[#07090e] p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>VAV Damper</span>
                    <Wind className="w-3 h-3 text-teal-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-teal-300">
                      {selectedZone.vavDamperPct}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">stroke</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Illuminance: {selectedZone.lightingLux} Lux
                  </p>
                </div>
              </div>

              {/* Action Button if zone has anomaly */}
              {(() => {
                const zoneAnom = getZoneAnomaly(selectedZone.id);
                if (zoneAnom) {
                  return (
                    <div className="pt-2">
                      <button
                        onClick={() => onInvestigateAnomaly(zoneAnom)}
                        className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Investigate {zoneAnom.id} with Multi-Agent
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }
                return (
                  <div className="pt-2 text-[11px] text-slate-500 font-mono text-center">
                    All BACnet/Modbus control loops nominal in this zone.
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a zone on the floor map to inspect live telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
