import React, { useState } from 'react';
import { Wind, Sun, Droplets, Leaf, Target, Zap, CheckCircle } from 'lucide-react';
import { AnomalyEvent, FloorData } from '../types';
import { BUILDING_FLOORS } from '../data/mockTelemetry';

interface IntelligenceModule {
  id: string;
  title: string;
  icon: React.ElementType;
  status: string;
  desc: string;
  metric: string;
  color: string;
  details: string;
  recommendation: string;
}

interface IntelligenceHubProps {
  anomalies: AnomalyEvent[];
  floors?: FloorData[];
  onResolveAnomaly: (anomalyId: string) => void;
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ 
  anomalies, 
  floors = BUILDING_FLOORS, 
  onResolveAnomaly 
}) => {
  const [selectedModule, setSelectedModule] = useState<IntelligenceModule | null>(null);
  const [authorizedAction, setAuthorizedAction] = useState<string | null>(null);

  const moduleToAnomalyMap: Record<string, string> = {
    hvac: 'ANOM-4029',
    solar: 'ANOM-1082',
    planner: 'ANOM-7720'
  };

  const dynamicModules: IntelligenceModule[] = floors.flatMap(f => f.zones)
    .filter(z => z.temperatureC > z.targetTempC + 1.0)
    .map(z => ({
      id: `hvac-${z.id}`,
      title: `HVAC: ${z.name} Thermal Drift`,
      icon: Wind,
      status: 'Action Required',
      desc: 'Room temp exceeds target.',
      metric: `${Math.round(z.temperatureC - z.targetTempC)}°C Over`,
      color: 'text-rose-400',
      details: `${z.name} is at ${z.temperatureC}°C, target is ${z.targetTempC}°C.`,
      recommendation: 'Authorize automated VAV damper adjustment and AHU supply temp reduction.',
    }));

  const modules: IntelligenceModule[] = [
    ...dynamicModules,
    {
      id: 'solar',
      title: 'Solar Intelligence',
      icon: Sun,
      status: 'Warning',
      desc: 'Actual vs. Expected generation.',
      metric: '42% Deficit',
      color: 'text-amber-400',
      details: 'Inverter #3 DC current 42% below irradiance model. Potential soiling.',
      recommendation: 'Schedule string fuse inspection and array surface cleaning.',
    },
    {
      id: 'pumps',
      title: 'Pump Monitoring',
      icon: Droplets,
      status: 'Monitoring',
      desc: 'VFD flow/power performance.',
      metric: 'Abnormal',
      color: 'text-sky-400',
      details: 'Secondary loop pump P-202 shows low pressure with static VFD frequency.',
      recommendation: 'Check secondary loop suction side for strainer blockage.',
    },
    {
      id: 'carbon',
      title: 'Carbon & Sustainability',
      icon: Leaf,
      status: 'Tracking',
      desc: 'Grid-intensity emission tracking.',
      metric: '141 g/kWh',
      color: 'text-emerald-400',
      details: 'Current grid carbon intensity is high for this tariff block.',
      recommendation: 'Shift non-essential high-load processes to off-peak hours.',
    },
    {
      id: 'planner',
      title: 'Optimization Planner',
      icon: Target,
      status: 'Advisory',
      desc: 'Combined action playbooks.',
      metric: '14% Potential',
      color: 'text-rose-400',
      details: 'Setpoint simulation projects 14% savings with minimal comfort impact.',
      recommendation: 'Apply recommended setpoint drift of +1.5°C to Tier-2 office zones.',
    },
  ];

  const moduleActionMap: Record<string, string> = {
    hvac: 'Dispatching BACnet Damper Reset',
    solar: 'Requesting Inverter Remote Reset',
    pumps: 'Modulating Pump VFD Frequency',
    carbon: 'Optimizing Grid Load Schedule',
    planner: 'Applying Setpoint Drift'
  };

  const handleAuthorize = () => {
    if (selectedModule) {
      setAuthorizedAction(moduleActionMap[selectedModule.id] || 'Authorizing Action');
      
      const anomalyId = moduleToAnomalyMap[selectedModule.id];
      if (anomalyId) {
        onResolveAnomaly(anomalyId);
      }

      setTimeout(() => setAuthorizedAction(null), 3000);
    }
  };

  return (
    <div className="flex gap-6 h-full p-4 bg-[#1e293b]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {modules.map((m) => (
          <button 
            key={m.id} 
            onClick={() => setSelectedModule(m)}
            className={`bg-[#0b0e17] border rounded-xl p-5 hover:border-slate-700 transition-all text-left ${selectedModule?.id === m.id ? 'border-cyan-500' : 'border-slate-800'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${m.status === 'Action Required' ? 'bg-rose-900/20 text-rose-300 border-rose-800' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                {m.status}
              </span>
            </div>
            <h3 className="text-white font-bold font-telemetry mb-2">{m.title}</h3>
            <p className="text-xs text-slate-400 mb-4">{m.desc}</p>
            <div className="text-xs font-mono font-semibold text-slate-200 bg-[#07090e] p-2 rounded border border-slate-800 flex items-center justify-between">
              <span>{m.metric}</span>
              <Zap className="w-3 h-3 text-cyan-400" />
            </div>
          </button>
        ))}
      </div>

      {selectedModule && (
        <div className="w-96 bg-[#0b0e17] border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white font-telemetry">{selectedModule.title} AI Analysis</h2>
          <p className="text-sm text-slate-300">{selectedModule.details}</p>
          <div className="bg-[#07090e] p-4 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
            <h4 className="font-bold text-cyan-400 mb-2">Gemini Advisory:</h4>
            <p className="mb-4">{selectedModule.recommendation}</p>
            <button 
              onClick={handleAuthorize}
              disabled={!!authorizedAction}
              className={`w-full py-2 rounded flex items-center justify-center gap-2 ${authorizedAction ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
            >
              {authorizedAction ? (
                <><CheckCircle className="w-4 h-4" /> {authorizedAction}</>
              ) : (
                'Authorize Advisory Action'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
