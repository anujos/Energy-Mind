import React from 'react';
import { Activity, Bot, Cpu, Layers, Sliders, ShieldCheck, Sparkles, Home } from 'lucide-react';

export type ActiveTab = 'load-curve' | 'spatial-heatmap' | 'multi-agent' | 'what-if' | 'intelligence' | 'pipeline-monitor';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unresolvedAnomalyCount: number;
  onOpenPortal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unresolvedAnomalyCount,
  onOpenPortal,
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
      label: 'Multi-Agent Swarm',
      icon: Bot,
      badge: `${unresolvedAnomalyCount} Alerts`,
      badgeColor:
        unresolvedAnomalyCount > 0
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
          : 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'what-if' as ActiveTab,
      label: 'What-If Simulator',
      icon: Sliders,
      badge: 'Dynamic',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'intelligence' as ActiveTab,
      label: 'Intelligence Hub',
      icon: ShieldCheck,
      badge: 'BACnet Loop',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'pipeline-monitor' as ActiveTab,
      label: 'IoT Pipeline & Gateway',
      icon: Cpu,
      badge: '1.4k Nodes',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-[#06080e]/95 backdrop-blur-md px-4 lg:px-8 shadow-sm">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {onOpenPortal && (
          <button
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              onOpenPortal();
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-subsystem font-bold uppercase tracking-wider rounded-xl text-cyan-300 hover:text-white bg-gradient-to-r from-cyan-950/60 to-blue-950/40 hover:from-cyan-900/80 hover:to-blue-900/60 transition-all duration-200 border border-cyan-500/40 shrink-0 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:-translate-y-0.5 mr-1"
            title="Return to Visual Executive Portal"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Portal Home</span>
          </button>
        )}

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                onTabChange(tab.id);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2 text-xs lg:text-sm font-subsystem font-medium rounded-xl whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 text-white border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-700 border-transparent hover:-translate-y-0.5'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="tracking-wide">{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-subsystem font-bold px-1.5 py-0.5 rounded-md border ${tab.badgeColor}`}>
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
