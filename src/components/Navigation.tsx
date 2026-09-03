import React from 'react';
import { Activity, Bot, Cpu, Layers, Sliders } from 'lucide-react';

export type ActiveTab = 'load-curve' | 'spatial-heatmap' | 'multi-agent' | 'what-if' | 'pipeline-monitor';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unresolvedAnomalyCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unresolvedAnomalyCount,
}) => {
  const tabs = [
    {
      id: 'load-curve' as ActiveTab,
      label: '24h Telemetry Load Curve',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'spatial-heatmap' as ActiveTab,
      label: '3D/2D Spatial Heatmap',
      icon: Layers,
      badge: '4 Floors',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'multi-agent' as ActiveTab,
      label: 'Multi-Agent Investigations',
      icon: Bot,
      badge: `${unresolvedAnomalyCount} Alerts`,
      badgeColor: unresolvedAnomalyCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-slate-700/40 text-slate-300',
    },
    {
      id: 'what-if' as ActiveTab,
      label: 'What-If Scenario Simulator',
      icon: Sliders,
      badge: 'Dynamic',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'pipeline-monitor' as ActiveTab,
      label: 'Telemetry Pipeline & BACnet',
      icon: Cpu,
      badge: '1.4k Nodes',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-[#07090e] px-4 lg:px-6">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-800/90 text-white border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
