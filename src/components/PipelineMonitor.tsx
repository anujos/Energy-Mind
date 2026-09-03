import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Filter,
  Layers,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Search,
  Server,
  Wifi,
  Zap,
} from 'lucide-react';
import { PIPELINE_GATEWAYS, INITIAL_LOGS } from '../data/mockTelemetry';
import { PipelineGatewayMetric, TelemetryLogEntry } from '../types';

export const PipelineMonitor: React.FC = () => {
  const [logs, setLogs] = useState<TelemetryLogEntry[]>(INITIAL_LOGS);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');
  const [registerSearch, setRegisterSearch] = useState<string>('');

  // Sample registers for live inspection
  const registers = [
    { id: 'REG_40001', proto: 'Modbus TCP', device: 'Chiller Plant #1', name: 'Evaporator Entering Water Temp', val: '12.4', unit: '°C', poll: '1s', quality: 'GOOD' },
    { id: 'REG_40002', proto: 'Modbus TCP', device: 'Chiller Plant #1', name: 'Evaporator Leaving Water Temp', val: '6.8', unit: '°C', poll: '1s', quality: 'GOOD' },
    { id: 'REG_40015', proto: 'Modbus TCP', device: 'Chiller Plant #2', name: 'Compressor Electrical kW', val: '184.2', unit: 'kW', poll: '500ms', quality: 'GOOD' },
    { id: 'DEV_304/AV_42', proto: 'BACnet/IP', device: 'AHU-3 VAV Master', name: 'CHW 3-Way Valve Stroke', val: '94.2', unit: '%', poll: '5s', quality: 'WARN (Hunting)' },
    { id: 'DEV_304/AI_12', proto: 'BACnet/IP', device: 'Zone 302 Cleanroom', name: 'Static Pressure Duct Delta', val: '1.45', unit: 'in.wg', poll: '2s', quality: 'GOOD' },
    { id: 'DEV_102/AI_18', proto: 'BACnet/IP', device: 'Auditorium VAV', name: 'Indoor CO2 PPM Concentration', val: '1,420', unit: 'ppm', poll: '10s', quality: 'WARN (High)' },
    { id: 'spBv1/INV_03/DC', proto: 'MQTT Sparkplug B', device: 'Solar Rooftop Inverter 3', name: 'String Combiner DC Current', val: '18.4', unit: 'Amps', poll: '1s', quality: 'ERR (Clipping)' },
    { id: 'spBv1/BESS_01/SOC', proto: 'MQTT Sparkplug B', device: 'BESS 1.2MWh Battery', name: 'State of Charge (SoC)', val: '68.4', unit: '%', poll: '2s', quality: 'GOOD' },
    { id: 'LORA_70B3D5/TMP', proto: 'LoRaWAN', device: 'Executive Boardroom Pod', name: 'Zone Dry Bulb Ambient', val: '22.1', unit: '°C', poll: '30s', quality: 'GOOD' },
  ];

  // Dynamic log streamer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const protocols = ['BACnet/IP', 'Modbus TCP', 'MQTT Sparkplug B', 'LoRaWAN'];
      const chosenProto = protocols[Math.floor(Math.random() * protocols.length)];
      const randomTime = new Date().toLocaleTimeString();

      const newEntry: TelemetryLogEntry = {
        id: `log-${Date.now().toString().slice(-4)}`,
        timestamp: randomTime,
        protocol: chosenProto,
        topicOrAddress:
          chosenProto === 'BACnet/IP'
            ? `DEV_${Math.floor(Math.random() * 300 + 100)}/AV_${Math.floor(Math.random() * 40)}`
            : chosenProto === 'Modbus TCP'
            ? `REG_40${Math.floor(Math.random() * 900 + 100)}: CHW_PUMP_SPEED`
            : chosenProto === 'MQTT Sparkplug B'
            ? `spBv1.0/ApexTower/DDATA/METER_${Math.floor(Math.random() * 12)}`
            : `LORA_70B3D5${Math.floor(Math.random() * 9000)}/PORT_1`,
        payloadPreview: `{ val: ${(Math.random() * 100).toFixed(1)}, quality: "GOOD", latencyMs: ${Math.floor(
          Math.random() * 20 + 8
        )} }`,
        severity: Math.random() > 0.88 ? 'warn' : 'ok',
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 24)]);
    }, 2400);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredLogs = logs.filter((l) =>
    selectedProtocol === 'all' ? true : l.protocol.toLowerCase().includes(selectedProtocol.toLowerCase())
  );

  const filteredRegisters = registers.filter(
    (r) =>
      r.id.toLowerCase().includes(registerSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(registerSearch.toLowerCase()) ||
      r.device.toLowerCase().includes(registerSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-[#0d111a] border border-slate-800 rounded-xl p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              Telemetry Pipeline & IoT Gateway Health
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 border border-sky-800">
              5,330 msgs/sec Ingest
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time BACnet MSTP, Modbus TCP, MQTT Sparkplug B, and LoRaWAN gateway health monitors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07090e] border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ingest Latency: 12ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07090e] border border-slate-800 text-slate-300">
            <span>Buffer: 18%</span>
          </div>
        </div>
      </div>

      {/* Protocol Gateways Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINE_GATEWAYS.map((gw) => {
          const isHealthy = gw.status === 'healthy';

          return (
            <div
              key={gw.protocol}
              className="bg-[#0b0e17] border border-slate-800 rounded-xl p-3.5 space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  {gw.protocol}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                    isHealthy
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {gw.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Throughput</span>
                  <span className="text-sm font-bold text-white">
                    {gw.messagesPerSec.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400"> msg/s</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Packet Loss</span>
                  <span
                    className={`text-sm font-bold ${
                      gw.packetLossPct > 1.0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {gw.packetLossPct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Avg Latency</span>
                  <span className="text-sm font-bold text-cyan-300">{gw.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Nodes Online</span>
                  <span className="text-sm font-bold text-slate-200">
                    {gw.nodesOnline} / {gw.nodesTotal}
                  </span>
                </div>
              </div>

              {/* Progress bar of nodes online */}
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full ${isHealthy ? 'bg-cyan-500' : 'bg-amber-500'}`}
                  style={{ width: `${(gw.nodesOnline / gw.nodesTotal) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split: Live Ingest Ticker & Register Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Packet Ingestion Stream Ticker */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Sensor Stream Ingest Ticker
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
                    isPaused
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </div>
            </div>

            {/* Protocol Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 text-[11px] font-mono">
              {['all', 'bacnet', 'modbus', 'mqtt', 'lorawan'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProtocol(p)}
                  className={`px-2 py-0.5 rounded uppercase border transition-colors ${
                    selectedProtocol === p
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Stream Logs List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#07090e] p-2 rounded-lg border border-slate-800/70 flex items-center justify-between text-xs font-mono hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                        log.protocol === 'BACnet/IP'
                          ? 'bg-cyan-950 text-cyan-400'
                          : log.protocol === 'Modbus TCP'
                          ? 'bg-sky-950 text-sky-400'
                          : log.protocol === 'MQTT Sparkplug B'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-violet-950 text-violet-400'
                      }`}
                    >
                      {log.protocol.split(' ')[0]}
                    </span>
                    <span className="text-slate-300 truncate max-w-[180px] font-medium">
                      {log.topicOrAddress}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] truncate max-w-[160px]">
                    {log.payloadPreview}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/60 flex justify-between">
            <span>Buffer capacity: 10,000 frames</span>
            <span>CRC Checks: 100% Pass</span>
          </div>
        </div>

        {/* BACnet & Modbus Register Inspector */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  BACnet & Modbus Register Inspector
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {filteredRegisters.length} Registers
              </span>
            </div>

            {/* Search filter */}
            <div className="relative my-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={registerSearch}
                onChange={(e) => setRegisterSearch(e.target.value)}
                placeholder="Search register ID, equipment, or metric..."
                className="w-full bg-[#07090e] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Register Table */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredRegisters.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-[#07090e] p-2.5 rounded-lg border border-slate-800/80 space-y-1 text-xs font-mono hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">{reg.id}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                        reg.quality.includes('WARN')
                          ? 'bg-amber-950 text-amber-300'
                          : reg.quality.includes('ERR')
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {reg.quality}
                    </span>
                  </div>
                  <div className="text-white font-medium text-xs">{reg.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{reg.device}</span>
                    <span className="text-white font-bold font-mono">
                      {reg.val} {reg.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/60 flex justify-between">
            <span>Protocol Bind: MSTP over RS-485</span>
            <span>Scan cycle: 1000ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
