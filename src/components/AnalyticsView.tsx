import React, { useState, useMemo } from 'react';
import { Trade, AccountSettings, MistakeTag, Emotion } from '../types';
import { 
  formatCurrency, 
  formatR, 
  formatPercentage, 
  calculateMistakeStats, 
  calculatePerformanceStats 
} from '../utils/calculations';
import { 
  BarChart3, 
  Layers, 
  Zap, 
  Clock, 
  Calendar, 
  AlertOctagon, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Smile, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsViewProps {
  trades: Trade[];
  settings: AccountSettings;
}

type BreakdownCategory = 
  | 'STRATEGY' 
  | 'SETUP' 
  | 'INSTRUMENT' 
  | 'DIRECTION' 
  | 'SESSION' 
  | 'TIMEFRAME' 
  | 'EMOTION' 
  | 'MISTAKES';

interface SegmentPerformance {
  key: string;
  sampleSize: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  netR: number;
  averageR: number;
  profitFactor: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades, settings }) => {
  const [activeCategory, setActiveCategory] = useState<BreakdownCategory>('SETUP');

  const mistakeStats = useMemo(() => calculateMistakeStats(trades), [trades]);
  const overallStats = useMemo(() => calculatePerformanceStats(trades, settings), [trades, settings]);

  // Aggregate breakdown data by category
  const segmentStats = useMemo(() => {
    const closed = trades.filter(t => t.status !== 'OPEN');
    const map: Record<string, { wins: number; losses: number; netPnl: number; netR: number; winDollar: number; lossDollar: number; count: number }> = {};

    closed.forEach(t => {
      let keys: string[] = [];
      if (activeCategory === 'STRATEGY') keys = [t.strategy || 'Unassigned'];
      else if (activeCategory === 'SETUP') keys = [t.setup || 'Unassigned'];
      else if (activeCategory === 'INSTRUMENT') keys = [t.instrument || 'Unknown'];
      else if (activeCategory === 'DIRECTION') keys = [t.direction];
      else if (activeCategory === 'SESSION') keys = [t.session];
      else if (activeCategory === 'TIMEFRAME') keys = [t.timeframe];
      else if (activeCategory === 'EMOTION') keys = t.review?.emotions && t.review.emotions.length > 0 ? t.review.emotions : ['Untagged'];
      else keys = ['All'];

      const pnl = t.pnl ?? 0;
      const r = t.realizedR ?? 0;
      const isWin = t.status === 'WIN' || pnl > 0;
      const isLoss = t.status === 'LOSS' || pnl < 0;

      keys.forEach(k => {
        if (!map[k]) {
          map[k] = { wins: 0, losses: 0, netPnl: 0, netR: 0, winDollar: 0, lossDollar: 0, count: 0 };
        }
        map[k].count++;
        map[k].netPnl += pnl;
        map[k].netR += r;
        if (isWin) {
          map[k].wins++;
          map[k].winDollar += pnl;
        } else if (isLoss) {
          map[k].losses++;
          map[k].lossDollar += Math.abs(pnl);
        }
      });
    });

    return Object.entries(map).map(([key, data]): SegmentPerformance => {
      const winRate = Number(((data.wins / (data.wins + data.losses || 1)) * 100).toFixed(1));
      const pf = data.lossDollar === 0 ? (data.winDollar > 0 ? 99.99 : 0) : Number((data.winDollar / data.lossDollar).toFixed(2));
      const averageR = Number((data.netR / (data.count || 1)).toFixed(2));

      return {
        key,
        sampleSize: data.count,
        wins: data.wins,
        losses: data.losses,
        winRate,
        netPnl: Number(data.netPnl.toFixed(2)),
        netR: Number(data.netR.toFixed(2)),
        averageR,
        profitFactor: pf,
      };
    }).sort((a, b) => b.netR - a.netR); // Highest net R first
  }, [trades, activeCategory]);

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
        {[
          { id: 'SETUP', label: 'By Setup' },
          { id: 'STRATEGY', label: 'By Strategy' },
          { id: 'INSTRUMENT', label: 'By Instrument' },
          { id: 'DIRECTION', label: 'Long vs Short' },
          { id: 'SESSION', label: 'By Session' },
          { id: 'TIMEFRAME', label: 'By Timeframe' },
          { id: 'EMOTION', label: 'Psychology' },
          { id: 'MISTAKES', label: 'Mistake Tracker' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as BreakdownCategory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'bg-[#121622] text-gray-400 border border-[#1E2538] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* MISTAKE TRACKER SPECIFIC VIEW */}
      {activeCategory === 'MISTAKES' ? (
        <div className="space-y-3">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#1A1116] to-[#121622] p-4 rounded-2xl border border-rose-950/60 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4" />
                Trading Mistake Impact Laboratory
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {mistakeStats.length} Recurring Violations
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every tagged mistake directly drains capital and expectancy. Eliminate your top 2 mistakes to drastically improve your equity curve.
            </p>
          </div>

          {mistakeStats.length === 0 ? (
            <div className="text-center py-16 bg-[#121622] rounded-2xl border border-[#1E2538] text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-200">Zero Mistakes Recorded!</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Maintain strict discipline on all trades.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {mistakeStats.map(stat => (
                <div
                  key={stat.tag}
                  className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      {stat.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-300 bg-[#171D2D] px-2 py-0.5 rounded-full border border-[#232B40]">
                      {stat.occurrences} {stat.occurrences === 1 ? 'occurrence' : 'occurrences'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C2336] text-center text-xs font-mono">
                    <div className="bg-[#0C0F17] p-2 rounded-xl">
                      <span className="text-[9px] text-gray-400 block font-sans">Net R Lost</span>
                      <span className={`font-bold ${stat.netRImpact < 0 ? 'text-rose-400' : 'text-gray-300'}`}>
                        {formatR(stat.netRImpact)}
                      </span>
                    </div>

                    <div className="bg-[#0C0F17] p-2 rounded-xl">
                      <span className="text-[9px] text-gray-400 block font-sans">Total Loss ($)</span>
                      <span className={`font-bold ${stat.netPnlImpact < 0 ? 'text-rose-400' : 'text-gray-300'}`}>
                        {formatCurrency(stat.netPnlImpact, settings.currency)}
                      </span>
                    </div>

                    <div className="bg-[#0C0F17] p-2 rounded-xl">
                      <span className="text-[9px] text-gray-400 block font-sans">Loss Ratio</span>
                      <span className="font-bold text-amber-400">
                        {Math.round((stat.lossCount / stat.occurrences) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SEGMENTED BREAKDOWN VIEW */
        <div className="space-y-3">
          {/* Sample Size Warning Banner */}
          <div className="bg-[#121622] p-3 rounded-xl border border-[#1E2538] flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              Categorical Performance Engine
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Confidence threshold: N ≥ 5
            </span>
          </div>

          {segmentStats.length === 0 ? (
            <div className="text-center py-16 bg-[#121622] rounded-2xl border border-[#1E2538] text-gray-400 text-xs">
              No closed trade records available for this segment.
            </div>
          ) : (
            <div className="space-y-2.5">
              {segmentStats.map(seg => {
                const isSmallSample = seg.sampleSize < 5;
                const isProfitable = seg.netR > 0;

                return (
                  <div
                    key={seg.key}
                    className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white font-mono">{seg.key}</span>
                          {isSmallSample && (
                            <span className="text-[9px] bg-amber-950/70 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Small Sample
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {seg.sampleSize} trades ({seg.wins}W / {seg.losses}L)
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-base font-bold font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatR(seg.netR)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block">
                          Avg: {formatR(seg.averageR)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Win Rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>Win Rate: <strong className="text-white">{seg.winRate}%</strong></span>
                        <span>Profit Factor: <strong className="text-white">{seg.profitFactor}</strong></span>
                        <span>Net P&L: <strong className={seg.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(seg.netPnl, settings.currency)}</strong></span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A2234] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, seg.winRate)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
