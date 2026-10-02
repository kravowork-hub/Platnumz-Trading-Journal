import React, { useState, useMemo } from 'react';
import { Trade, AccountSettings, DailyReviewRecord } from '../types';
import { 
  calculatePerformanceStats, 
  filterTradesByPeriod, 
  formatCurrency, 
  formatR,
  calculateMistakeStats 
} from '../utils/calculations';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  Brain, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ReviewsViewProps {
  trades: Trade[];
  settings: AccountSettings;
  dailyReviews: DailyReviewRecord[];
  onSelectTrade: (tradeId: string) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  trades,
  settings,
  dailyReviews,
  onSelectTrade,
}) => {
  const [reviewTab, setReviewTab] = useState<'WEEKLY' | 'MONTHLY' | 'DAILY_LOGS'>('WEEKLY');

  // Weekly review calculations
  const thisWeekTrades = useMemo(() => filterTradesByPeriod(trades, 'THIS_WEEK'), [trades]);
  const thisWeekStats = useMemo(() => calculatePerformanceStats(thisWeekTrades, settings), [thisWeekTrades, settings]);

  // Monthly review calculations
  const thisMonthTrades = useMemo(() => filterTradesByPeriod(trades, 'THIS_MONTH'), [trades]);
  const thisMonthStats = useMemo(() => calculatePerformanceStats(thisMonthTrades, settings), [thisMonthTrades, settings]);

  // Identify Best Setup & Worst Setup
  const setupAnalysis = useMemo(() => {
    const map: Record<string, { r: number; trades: number; wins: number }> = {};
    thisMonthTrades.forEach(t => {
      const s = t.setup || 'General';
      if (!map[s]) map[s] = { r: 0, trades: 0, wins: 0 };
      map[s].r += (t.realizedR ?? 0);
      map[s].trades += 1;
      if ((t.pnl ?? 0) > 0) map[s].wins += 1;
    });

    const entries = Object.entries(map).map(([name, data]) => ({
      name,
      r: Number(data.r.toFixed(2)),
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100),
    })).sort((a, b) => b.r - a.r);

    return {
      best: entries[0] || null,
      worst: entries.length > 1 ? entries[entries.length - 1] : null,
    };
  }, [thisMonthTrades]);

  // Common mistake this month
  const monthlyMistakes = useMemo(() => calculateMistakeStats(thisMonthTrades), [thisMonthTrades]);
  const topMistake = monthlyMistakes[0] || null;

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Switcher: Weekly | Monthly | Daily Logs */}
      <div className="bg-[#121622] p-1 rounded-2xl flex border border-[#1E2538]">
        <button
          onClick={() => setReviewTab('WEEKLY')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            reviewTab === 'WEEKLY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Weekly Review
        </button>
        <button
          onClick={() => setReviewTab('MONTHLY')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            reviewTab === 'MONTHLY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Monthly Audit
        </button>
        <button
          onClick={() => setReviewTab('DAILY_LOGS')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            reviewTab === 'DAILY_LOGS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Daily Logs ({dailyReviews.length})
        </button>
      </div>

      {/* WEEKLY REVIEW */}
      {reviewTab === 'WEEKLY' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="bg-gradient-to-br from-[#121622] to-[#151C2A] p-4 rounded-2xl border border-emerald-950/60 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Current Week Performance Report
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {thisWeekStats.totalTrades} Executions
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-2xl font-bold font-mono ${thisWeekStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(thisWeekStats.netPnl, settings.currency)}
              </span>
              <span className={`text-sm font-bold font-mono ${thisWeekStats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({formatR(thisWeekStats.totalR)})
              </span>
            </div>
          </div>

          {/* 4-Box Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538]">
              <span className="text-[10px] text-gray-400 block mb-0.5">Win Rate</span>
              <span className="text-xl font-bold font-mono text-white">{thisWeekStats.winRate}%</span>
              <span className="text-[10px] text-gray-500 font-mono block mt-1">
                {thisWeekStats.winningTrades}W / {thisWeekStats.losingTrades}L
              </span>
            </div>

            <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538]">
              <span className="text-[10px] text-gray-400 block mb-0.5">Profit Factor</span>
              <span className="text-xl font-bold font-mono text-white">{thisWeekStats.profitFactor}</span>
              <span className="text-[10px] text-gray-500 font-mono block mt-1">
                Gross +{formatCurrency(thisWeekStats.totalWonDollar, settings.currency)}
              </span>
            </div>

            <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538]">
              <span className="text-[10px] text-gray-400 block mb-0.5">Discipline Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{thisWeekStats.disciplineScore}/100</span>
              <span className="text-[10px] text-gray-500 block mt-1">Rule consistency</span>
            </div>

            <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538]">
              <span className="text-[10px] text-gray-400 block mb-0.5">Max Drawdown</span>
              <span className="text-xl font-bold font-mono text-rose-400">{thisWeekStats.maxDrawdownPercentage}%</span>
              <span className="text-[10px] text-gray-500 block mt-1">Controlled exposure</span>
            </div>
          </div>

          {/* Best Setup & Worst Setup Insights */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#121622] p-3 rounded-2xl border border-emerald-950/40">
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5" />
                Best Weekly Setup
              </span>
              <span className="text-xs font-bold text-white block">
                {setupAnalysis.best ? setupAnalysis.best.name : 'N/A'}
              </span>
              {setupAnalysis.best && (
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  {formatR(setupAnalysis.best.r)} ({setupAnalysis.best.winRate}% win rate)
                </span>
              )}
            </div>

            <div className="bg-[#121622] p-3 rounded-2xl border border-rose-950/40">
              <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Setup to Refine
              </span>
              <span className="text-xs font-bold text-white block">
                {setupAnalysis.worst ? setupAnalysis.worst.name : 'None'}
              </span>
              {setupAnalysis.worst && (
                <span className="text-[10px] font-mono text-rose-400 block mt-0.5">
                  {formatR(setupAnalysis.worst.r)} ({setupAnalysis.worst.trades} trades)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY REVIEW */}
      {reviewTab === 'MONTHLY' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="bg-gradient-to-br from-[#121622] to-[#151C2A] p-4 rounded-2xl border border-blue-950/60 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                Monthly Comprehensive Performance Audit
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {thisMonthStats.totalTrades} Total Trades
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-extrabold font-mono ${thisMonthStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(thisMonthStats.netPnl, settings.currency)}
              </span>
              <span className={`text-base font-bold font-mono ${thisMonthStats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({formatR(thisMonthStats.totalR)})
              </span>
            </div>
          </div>

          <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              Monthly Behavioral Summary
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1A2234]">
                <span className="text-gray-400">Discipline Score:</span>
                <span className="font-mono font-bold text-emerald-400">{thisMonthStats.disciplineScore} / 100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A2234]">
                <span className="text-gray-400">Average Trade R:</span>
                <span className="font-mono font-bold text-white">{formatR(thisMonthStats.averageR)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A2234]">
                <span className="text-gray-400">Average Winner R:</span>
                <span className="font-mono font-bold text-emerald-400">+{thisMonthStats.averageWinR}R</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A2234]">
                <span className="text-gray-400">Average Loser R:</span>
                <span className="font-mono font-bold text-rose-400">-{thisMonthStats.averageLossR}R</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A2234]">
                <span className="text-gray-400">Top Leaking Mistake:</span>
                <span className="font-mono font-bold text-rose-300">
                  {topMistake ? `${topMistake.tag} (${formatR(topMistake.netRImpact)})` : 'None tagged'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAILY LOGS */}
      {reviewTab === 'DAILY_LOGS' && (
        <div className="space-y-2.5 animate-in fade-in">
          {dailyReviews.length === 0 ? (
            <div className="text-center py-16 bg-[#121622] rounded-2xl border border-[#1E2538] text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-xs">No daily review logs completed yet.</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Go to the Calendar tab and select a day to complete your daily review!
              </p>
            </div>
          ) : (
            dailyReviews.map(rev => (
              <div
                key={rev.id}
                className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-2"
              >
                <div className="flex items-center justify-between border-b border-[#1C2336] pb-2">
                  <span className="text-xs font-mono font-bold text-white">{rev.date}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${rev.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(rev.netPnl, settings.currency)} ({formatR(rev.netR)})
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {'★'.repeat(rev.overallRating)}
                    </span>
                  </div>
                </div>

                {rev.whatWentWell && (
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-semibold">What went well:</span>
                    <p className="text-xs text-gray-300">{rev.whatWentWell}</p>
                  </div>
                )}

                {rev.whatILearned && (
                  <div>
                    <span className="text-[10px] text-blue-400 block font-semibold">Lesson learned:</span>
                    <p className="text-xs text-gray-300">{rev.whatILearned}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
