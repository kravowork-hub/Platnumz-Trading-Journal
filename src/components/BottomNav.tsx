import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Settings, 
  Plus 
} from 'lucide-react';
import { Haptics } from '../utils/haptics';

export type NavTab = 'dashboard' | 'journal' | 'analytics' | 'calendar' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickTrade: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickTrade,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0F17]/95 backdrop-blur-xl border-t border-[#1C2233] px-3 pb-safe pt-1 max-w-2xl mx-auto">
      {/* Floating Action Button (+ Trade) centered or prominent */}
      <div className="relative flex items-center justify-between h-14">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          // Insert FAB before Analytics (center position)
          if (index === 2) {
            return (
              <React.Fragment key="fab-group">
                {/* Center Elevated FAB */}
                <div className="relative -top-5 flex flex-col items-center">
                  <button
                    onClick={() => {
                      Haptics.medium();
                      onOpenQuickTrade();
                    }}
                    className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform border border-emerald-300/40 focus:outline-none"
                    title="Quick Trade Entry (<1 min)"
                    aria-label="Add Trade"
                  >
                    <Plus className="w-6 h-6 stroke-[2.75] text-slate-950" />
                  </button>
                  <span className="text-[10px] font-semibold text-emerald-400 mt-1 tracking-tight">
                    + Trade
                  </span>
                </div>

                {/* Tab 3: Analytics */}
                <button
                  key={tab.id}
                  onClick={() => {
                    Haptics.light();
                    onTabChange(tab.id);
                  }}
                  className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors select-none ${
                    isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center px-3 py-1 rounded-full transition-all ${
                      isActive ? 'bg-emerald-500/15' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold text-emerald-400' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </button>
              </React.Fragment>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                Haptics.light();
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors select-none ${
                isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div
                className={`flex items-center justify-center px-3 py-1 rounded-full transition-all ${
                  isActive ? 'bg-emerald-500/15' : ''
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold text-emerald-400' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
