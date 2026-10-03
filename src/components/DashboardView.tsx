import React, { useState } from 'react';
import { 
  Trade, 
  PeriodFilter, 
  AccountSettings 
} from '../types';
import { 
  calculatePerformanceStats, 
  filterTradesByPeriod, 
  formatCurrency, 
  formatR, 
  formatPercentage 
} from '../utils/calculations';
import { EquityCurve } from './EquityCurve';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  Calculator, 
  Target, 
  CheckCircle, 
  ChevronRight,
  Filter,
  BarChart2,
  Sparkles,
  RotateCcw,
  Wifi,
  WifiOff,
  Sun,
  Moon
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface DashboardViewProps {
  trades: Trade[];
  settings: AccountSettings;
  onOpenQuickTrade: () => void;
  onSelectTrade: (tradeId: string) => void;
  onOpenRiskCalc: () => void;
  onOpenGoals: () => void;
  onOpenReviews: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenResetModal?: () => void;
  onToggleTheme?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  settings,
  onOpenQuickTrade,
  onSelectTrade,
  onOpenRiskCalc,
  onOpenGoals,
  onOpenReviews,
  onNavigateTab,
  onOpenResetModal,
  onToggleTheme,
}) => {
  const isOnline = useOnlineStatus();
  const [period, setPeriod] = useState<PeriodFilter>('THIS_MONTH');
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [showCustomRangePicker, setShowCustomRangePicker] = useState(false);

  // Filter trades based on selected period
  const filteredTrades = filterTradesByPeriod(trades, period, customRange);
  const stats = calculatePerformanceStats(filteredTrades, settings);

  // Calculations for Today, Week, Month for top banner
  const todayTrades = filterTradesByPeriod(trades, 'TODAY');
  const todayStats = calculatePerformanceStats(todayTrades, settings);

  const weekTrades = filterTradesByPeriod(trades, 'THIS_WEEK');
  const weekStats = calculatePerformanceStats(weekTrades, settings);

  const monthTrades = filterTradesByPeriod(trades, 'THIS_MONTH');
  const monthStats = calculatePerformanceStats(monthTrades, settings);

  // Current balance
  const currentBalance = settings.startingBalance + calculatePerformanceStats(trades, settings).netPnl;
  const isLight = settings.themeMode === 'light';

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Account Balance & Executive Bar */}
      <div className={`rounded-3xl p-5 border shadow-xl relative overflow-hidden transition-all ${
        isLight 
          ? 'bg-white border-slate-200 shadow-slate-200/50' 
          : 'bg-gradient-to-br from-[#121622] via-[#0E121B] to-[#0A0D15] border-[#1E2538]'
      }`}>
        {/* Ambient background glow */}
        <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'
        }`} />

        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>ACCOUNT BALANCE</span>
          <div className="flex items-center gap-1.5">
            {/* Offline Vault Status Indicator */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono ${
              isOnline 
                ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400')
                : (isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/50 border-amber-800/50 text-amber-300')
            }`}>
              {isOnline ? (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'}`}></span>
                  <span>100% Offline Vault</span>
                </>
              ) : (
                <>
                  <WifiOff className={`w-2.5 h-2.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span>Offline Active</span>
                </>
              )}
            </div>

            {/* Quick Theme Switcher */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isLight ? 'Switch to Night / Dark mode' : 'Switch to Daylight / Light mode'}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] transition font-medium active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-[#171D2D] hover:bg-[#20273D] text-gray-300 hover:text-white border-[#232B40]'
                }`}
              >
                {isLight ? (
                  <>
                    <Moon className="w-2.5 h-2.5 text-blue-600" />
                    <span className="font-semibold">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-2.5 h-2.5 text-amber-400" />
                    <span className="font-semibold">Light</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Reset Stats to Zero Button */}
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                title="Reset all stats to zero"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] transition font-medium ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-200' 
                    : 'bg-[#171D2D] hover:bg-rose-950/40 hover:border-rose-700/50 text-gray-400 hover:text-rose-300 border-[#232B40]'
                }`}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className={`text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          <span>{formatCurrency(currentBalance, settings.currency)}</span>
          <span className={`text-xs font-mono font-bold ${
            stats.netPnl >= 0 
              ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
              : (isLight ? 'text-rose-600' : 'text-rose-400')
          }`}>
            ({formatCurrency(stats.netPnl, settings.currency)})
          </span>
        </div>

        {/* 3-Column Period P&L Badges (Today, Week, Month) */}
        <div className={`grid grid-cols-3 gap-2 mt-4 pt-3 border-t ${
          isLight ? 'border-slate-100' : 'border-[#1C2336]'
        }`}>
          <div className={`p-2 rounded-xl border text-center transition-colors ${
            isLight ? 'bg-slate-50/90 border-slate-200/70' : 'bg-[#141926]/70 border-[#20273A]'
          }`}>
            <span className={`text-[10px] block font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Today</span>
            <span className={`text-xs font-mono font-bold ${
              todayStats.netPnl >= 0 
                ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
                : (isLight ? 'text-rose-600' : 'text-rose-400')
            }`}>
              {formatCurrency(todayStats.netPnl, settings.currency)}
            </span>
          </div>
          <div className={`p-2 rounded-xl border text-center transition-colors ${
            isLight ? 'bg-slate-50/90 border-slate-200/70' : 'bg-[#141926]/70 border-[#20273A]'
          }`}>
            <span className={`text-[10px] block font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>This Week</span>
            <span className={`text-xs font-mono font-bold ${
              weekStats.netPnl >= 0 
                ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
                : (isLight ? 'text-rose-600' : 'text-rose-400')
            }`}>
              {formatCurrency(weekStats.netPnl, settings.currency)}
            </span>
          </div>
          <div className={`p-2 rounded-xl border text-center transition-colors ${
            isLight ? 'bg-slate-50/90 border-slate-200/70' : 'bg-[#141926]/70 border-[#20273A]'
          }`}>
            <span className={`text-[10px] block font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>This Month</span>
            <span className={`text-xs font-mono font-bold ${
              monthStats.netPnl >= 0 
                ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
                : (isLight ? 'text-rose-600' : 'text-rose-400')
            }`}>
              {formatCurrency(monthStats.netPnl, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Zero-Stats Banner when no trades exist */}
      {trades.length === 0 && (
        <div className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm animate-fadeIn ${
          isLight 
            ? 'bg-emerald-50/80 border-emerald-200' 
            : 'bg-gradient-to-r from-emerald-950/30 via-[#101522] to-blue-950/30 border-emerald-800/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-emerald-100 text-emerald-600 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Clean Slate • All Stats Initialized to Zero
              </h4>
              <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                100% offline vault ready. Tap <strong className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>+ Log Trade</strong> to record your first execution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
        {(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR', 'ALL_TIME', 'CUSTOM'] as PeriodFilter[]).map((p) => {
          const label = p.replace('_', ' ');
          const isSelected = period === p;
          return (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                if (p === 'CUSTOM') setShowCustomRangePicker(true);
                else setShowCustomRangePicker(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? (isLight ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20')
                  : (isLight ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-[#121622] text-gray-400 border border-[#1E2538] hover:text-white')
              }`}
            >
              {label === 'ALL TIME' ? 'All Time' : label}
            </button>
          );
        })}
      </div>

      {/* Custom Range Picker */}
      {showCustomRangePicker && (
        <div className="bg-[#121622] p-3 rounded-2xl border border-[#1E2538] flex items-center gap-2 text-xs">
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
            className="bg-[#0C0F17] border border-[#1F2638] rounded-lg px-2 py-1 text-white font-mono"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
            className="bg-[#0C0F17] border border-[#1F2638] rounded-lg px-2 py-1 text-white font-mono"
          />
        </div>
      )}

      {/* Primary Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* Win Rate */}
        <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Win Rate</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.winRate}%
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            {stats.winningTrades}W • {stats.losingTrades}L • {stats.breakEvenTrades}BE
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Profit Factor</span>
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.profitFactor}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            Gross: +{formatCurrency(stats.totalWonDollar, settings.currency)}
          </div>
        </div>

        {/* Average R */}
        <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Average R</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className={`text-xl font-bold font-mono ${stats.averageR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatR(stats.averageR)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            Net R: {formatR(stats.totalR)}
          </div>
        </div>

        {/* Total Trades & Streak */}
        <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538] shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white flex items-center gap-1.5">
            {stats.currentStreak.count > 0 ? (
              <span className={stats.currentStreak.type === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}>
                {stats.currentStreak.count} {stats.currentStreak.type === 'WIN' ? 'Wins' : 'Losses'}
              </span>
            ) : (
              <span className="text-gray-400">0</span>
            )}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            Best streak: {stats.bestStreak}W
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Discipline Score & Max Drawdown */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Discipline Score Card */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-[#121622] to-[#151B2A] border-emerald-900/30'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              Discipline Score
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
            }`}>
              0-100
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.disciplineScore}
            </span>
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>/ 100</span>
          </div>

          {/* Progress bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden mt-2 ${isLight ? 'bg-slate-100' : 'bg-[#1A2234]'}`}>
            <div
              className={`h-full transition-all duration-500 ${
                stats.disciplineScore >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : stats.disciplineScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, stats.disciplineScore)}%` }}
            />
          </div>

          <p className={`text-[10px] mt-2 leading-tight ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Measures checklist & rule execution consistency, not market prediction.
          </p>
        </div>

        {/* Max Drawdown Card */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${
          isLight ? 'bg-white border-rose-200' : 'bg-gradient-to-br from-[#121622] to-[#1A1820] border-rose-950/40'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <AlertTriangle className={`w-4 h-4 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
              Max Drawdown
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              isLight ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-rose-300 bg-rose-950/60 border-rose-800/40'
            }`}>
              Peak-to-Trough
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
              {stats.maxDrawdownPercentage}%
            </span>
          </div>

          <div className={`text-xs font-mono mt-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Drawdown: -{formatCurrency(stats.maxDrawdownDollar, settings.currency)}
          </div>

          <p className={`text-[10px] mt-1 leading-tight ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            Maximum capital pullback incurred over historical sequence.
          </p>
        </div>
      </div>

      {/* Interactive Equity Curve */}
      <EquityCurve
        trades={filteredTrades}
        startingBalance={settings.startingBalance}
        currency={settings.currency}
        onSelectTrade={onSelectTrade}
        isLight={isLight}
      />

      {/* Quick Launchpad Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenRiskCalc}
          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition active:scale-97 ${
            isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#121622] hover:bg-[#181E2E] border-[#1E2538]'
          }`}
        >
          <Calculator className="w-5 h-5 text-emerald-500 mb-1" />
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Position Size</span>
          <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Risk Calculator</span>
        </button>

        <button
          onClick={onOpenGoals}
          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition active:scale-97 ${
            isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#121622] hover:bg-[#181E2E] border-[#1E2538]'
          }`}
        >
          <Target className="w-5 h-5 text-blue-500 mb-1" />
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Process Goals</span>
          <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Progress Tracker</span>
        </button>

        <button
          onClick={onOpenReviews}
          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition active:scale-97 ${
            isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#121622] hover:bg-[#181E2E] border-[#1E2538]'
          }`}
        >
          <CheckCircle className="w-5 h-5 text-teal-500 mb-1" />
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Daily Review</span>
          <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Self Evaluation</span>
        </button>
      </div>

      {/* Recent Trades Stream */}
      <div className={`rounded-2xl p-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121622] border-[#1E2538]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
            <span>Recent Trades</span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>({trades.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('journal')}
            className={`text-xs font-semibold hover:underline flex items-center gap-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {trades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xs">No trades logged yet.</p>
            <button
              onClick={onOpenQuickTrade}
              className={`mt-2 text-xs font-bold hover:underline ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}
            >
              + Log Your First Trade
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.slice(0, 4).map((t) => {
              const isWin = t.status === 'WIN' || (t.pnl ?? 0) > 0;
              const isLoss = t.status === 'LOSS' || (t.pnl ?? 0) < 0;

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTrade(t.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                    isLight 
                      ? 'bg-slate-50/90 hover:bg-slate-100 border-slate-200/80 text-slate-900' 
                      : 'bg-[#0C0F17] hover:bg-[#141926] border-[#1C2336] text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono border ${
                      t.direction === 'LONG'
                        ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950 text-emerald-400 border-emerald-800/80')
                        : (isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950 text-rose-400 border-rose-800/80')
                    }`}>
                      {t.direction === 'LONG' ? 'L' : 'S'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold font-mono text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.instrument}</span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>#{t.tradeNumber}</span>
                      </div>
                      <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        {t.strategy} • {t.setup}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold font-mono text-sm ${
                      isWin 
                        ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
                        : isLoss 
                        ? (isLight ? 'text-rose-600' : 'text-rose-400') 
                        : (isLight ? 'text-slate-700' : 'text-gray-300')
                    }`}>
                      {t.pnl !== undefined ? formatCurrency(t.pnl, settings.currency) : 'OPEN'}
                    </div>
                    <div className={`text-[10px] font-mono flex items-center justify-end gap-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {t.realizedR !== undefined && (
                        <span className={
                          isWin 
                            ? (isLight ? 'text-emerald-600' : 'text-emerald-400') 
                            : isLoss 
                            ? (isLight ? 'text-rose-600' : 'text-rose-400') 
                            : (isLight ? 'text-slate-500' : 'text-gray-400')
                        }>
                          {formatR(t.realizedR)}
                        </span>
                      )}
                      <span>• {t.entryDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
