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
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  trades: Trade[];
  settings: AccountSettings;
  onOpenQuickTrade: () => void;
  onSelectTrade: (tradeId: string) => void;
  onOpenRiskCalc: () => void;
  onOpenGoals: () => void;
  onOpenReviews: () => void;
  onNavigateTab: (tab: any) => void;
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
}) => {
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

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Account Balance & Executive Bar */}
      <div className="bg-gradient-to-br from-[#121622] via-[#0E121B] to-[#0A0D15] rounded-3xl p-5 border border-[#1E2538] shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 font-medium">ACCOUNT BALANCE</span>
          <div className="flex items-center gap-1.5 bg-[#171D2D] px-2 py-0.5 rounded-full border border-[#232B40]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-semibold text-emerald-300">
              {settings.currency} • LIVE
            </span>
          </div>
        </div>

        <div className="text-3xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-2">
          <span>{formatCurrency(currentBalance, settings.currency)}</span>
          <span className={`text-xs font-mono font-bold ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({formatCurrency(stats.netPnl, settings.currency)})
          </span>
        </div>

        {/* 3-Column Period P&L Badges (Today, Week, Month) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1C2336]">
          <div className="bg-[#141926]/70 p-2 rounded-xl border border-[#20273A] text-center">
            <span className="text-[10px] text-gray-400 block font-medium">Today</span>
            <span className={`text-xs font-mono font-bold ${todayStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(todayStats.netPnl, settings.currency)}
            </span>
          </div>
          <div className="bg-[#141926]/70 p-2 rounded-xl border border-[#20273A] text-center">
            <span className="text-[10px] text-gray-400 block font-medium">This Week</span>
            <span className={`text-xs font-mono font-bold ${weekStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(weekStats.netPnl, settings.currency)}
            </span>
          </div>
          <div className="bg-[#141926]/70 p-2 rounded-xl border border-[#20273A] text-center">
            <span className="text-[10px] text-gray-400 block font-medium">This Month</span>
            <span className={`text-xs font-mono font-bold ${monthStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(monthStats.netPnl, settings.currency)}
            </span>
          </div>
        </div>
      </div>

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
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-[#121622] text-gray-400 border border-[#1E2538] hover:text-white'
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
        <div className="bg-gradient-to-br from-[#121622] to-[#151B2A] p-4 rounded-2xl border border-emerald-900/30 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Discipline Score
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              0-100
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {stats.disciplineScore}
            </span>
            <span className="text-xs font-medium text-gray-400">/ 100</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#1A2234] rounded-full overflow-hidden mt-2">
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

          <p className="text-[10px] text-gray-400 mt-2 leading-tight">
            Measures checklist & rule execution consistency, not market prediction.
          </p>
        </div>

        {/* Max Drawdown Card */}
        <div className="bg-gradient-to-br from-[#121622] to-[#1A1820] p-4 rounded-2xl border border-rose-950/40 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Max Drawdown
            </span>
            <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
              Peak-to-Trough
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-400">
              {stats.maxDrawdownPercentage}%
            </span>
          </div>

          <div className="text-xs font-mono text-gray-400 mt-2">
            Drawdown: -{formatCurrency(stats.maxDrawdownDollar, settings.currency)}
          </div>

          <p className="text-[10px] text-gray-500 mt-1 leading-tight">
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
      />

      {/* Quick Launchpad Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenRiskCalc}
          className="bg-[#121622] hover:bg-[#181E2E] p-3 rounded-2xl border border-[#1E2538] flex flex-col items-center justify-center text-center transition active:scale-97"
        >
          <Calculator className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-xs font-semibold text-gray-200">Position Size</span>
          <span className="text-[9px] text-gray-500">Risk Calculator</span>
        </button>

        <button
          onClick={onOpenGoals}
          className="bg-[#121622] hover:bg-[#181E2E] p-3 rounded-2xl border border-[#1E2538] flex flex-col items-center justify-center text-center transition active:scale-97"
        >
          <Target className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-xs font-semibold text-gray-200">Process Goals</span>
          <span className="text-[9px] text-gray-500">Progress Tracker</span>
        </button>

        <button
          onClick={onOpenReviews}
          className="bg-[#121622] hover:bg-[#181E2E] p-3 rounded-2xl border border-[#1E2538] flex flex-col items-center justify-center text-center transition active:scale-97"
        >
          <CheckCircle className="w-5 h-5 text-teal-400 mb-1" />
          <span className="text-xs font-semibold text-gray-200">Daily Review</span>
          <span className="text-[9px] text-gray-500">Self Evaluation</span>
        </button>
      </div>

      {/* Recent Trades Stream */}
      <div className="bg-[#121622] rounded-2xl p-4 border border-[#1E2538]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>Recent Trades</span>
            <span className="text-[10px] text-gray-400 font-mono">({trades.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('journal')}
            className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-0.5"
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
              className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
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
                  className="bg-[#0C0F17] hover:bg-[#141926] p-3 rounded-xl border border-[#1C2336] flex items-center justify-between cursor-pointer transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                      t.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                    }`}>
                      {t.direction === 'LONG' ? 'L' : 'S'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-sm text-white">{t.instrument}</span>
                        <span className="text-[10px] text-gray-400 font-mono">#{t.tradeNumber}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block">
                        {t.strategy} • {t.setup}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold font-mono text-sm ${
                      isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-300'
                    }`}>
                      {t.pnl !== undefined ? formatCurrency(t.pnl, settings.currency) : 'OPEN'}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 flex items-center justify-end gap-1">
                      {t.realizedR !== undefined && (
                        <span className={isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-400'}>
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
