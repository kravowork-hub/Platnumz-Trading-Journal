import React, { useMemo } from 'react';
import { Trade, AccountSettings } from '../types';
import {
  calculateAdvancedPerformance,
  formatCurrency,
  formatR,
  formatPercentage,
} from '../utils/calculations';
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays,
  Clock3, Gauge, ShieldCheck, Target, TrendingDown, TrendingUp,
  Trophy, Zap
} from 'lucide-react';

interface Props { trades: Trade[]; settings: AccountSettings; }

const Metric: React.FC<{label:string; value:string; sub?:string; tone?:'good'|'bad'|'neutral'}> = ({label,value,sub,tone='neutral'}) => (
  <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-3">
    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
    <div className={`text-lg font-bold font-mono mt-1 ${tone==='good'?'text-emerald-400':tone==='bad'?'text-rose-400':'text-white'}`}>{value}</div>
    {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
  </div>
);

export const AdvancedAnalyticsView: React.FC<Props> = ({ trades, settings }) => {
  const a = useMemo(() => calculateAdvancedPerformance(trades, settings), [trades, settings]);
  const maxAbsR = Math.max(1, ...a.rDistribution.map(x => Math.abs(x.count)));

  return (
    <div className="space-y-3 mb-5">
      <div className="bg-gradient-to-br from-[#101A19] to-[#121622] border border-emerald-900/50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider"><Activity className="w-4 h-4"/> Performance Engine</div>
            <p className="text-[11px] text-gray-400 mt-1">Expectancy, risk efficiency, recovery and consistency from closed trades.</p>
          </div>
          <div className="text-right"><div className="text-[10px] text-gray-500">EDGE / TRADE</div><div className={`text-lg font-bold font-mono ${a.expectancyR >= 0 ? 'text-emerald-400':'text-rose-400'}`}>{formatR(a.expectancyR)}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric label="Expectancy" value={formatR(a.expectancyR)} sub={`${formatCurrency(a.expectancyDollar, settings.currency)} / trade`} tone={a.expectancyR>=0?'good':'bad'} />
        <Metric label="Payoff Ratio" value={a.payoffRatio.toFixed(2)} sub="avg win ÷ avg loss" />
        <Metric label="Recovery Factor" value={a.recoveryFactor.toFixed(2)} sub="net P&L ÷ max DD" />
        <Metric label="Return" value={formatPercentage(a.returnOnStartingBalance)} sub="on starting balance" tone={a.returnOnStartingBalance>=0?'good':'bad'} />
        <Metric label="Median R" value={formatR(a.medianR)} sub="typical trade outcome" tone={a.medianR>=0?'good':'bad'} />
        <Metric label="Avg Risk" value={`${a.averageRiskPercent.toFixed(2)}%`} sub={`max ${a.maxRiskPercent.toFixed(2)}%`} />
      </div>

      <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300"><Gauge className="w-4 h-4 text-cyan-400"/> Risk & Drawdown</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-gray-500">Max drawdown</span><div className="font-mono font-bold text-rose-400">-{formatCurrency(a.maxDrawdownDollar, settings.currency)}</div><div className="text-[10px] text-gray-600">{a.maxDrawdownPercentage.toFixed(1)}% peak-to-trough</div></div>
          <div><span className="text-gray-500">Worst day</span><div className="font-mono font-bold text-rose-400">{formatCurrency(a.worstDayPnl, settings.currency)}</div><div className="text-[10px] text-gray-600">{a.worstDayDate || '—'}</div></div>
          <div><span className="text-gray-500">Best day</span><div className="font-mono font-bold text-emerald-400">{formatCurrency(a.bestDayPnl, settings.currency)}</div><div className="text-[10px] text-gray-600">{a.bestDayDate || '—'}</div></div>
          <div><span className="text-gray-500">Largest win / loss</span><div className="font-mono font-bold text-white">{formatCurrency(a.largestWin, settings.currency)} / {formatCurrency(a.largestLoss, settings.currency)}</div></div>
        </div>
      </div>

      <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-3"><BarChart3 className="w-4 h-4 text-purple-400"/> R Distribution</div>
        <div className="space-y-1.5">
          {a.rDistribution.map(bucket => (
            <div key={bucket.label} className="flex items-center gap-2 text-[10px]">
              <span className="w-14 text-gray-500 font-mono">{bucket.label}</span>
              <div className="flex-1 h-2 bg-[#0C0F17] rounded-full overflow-hidden"><div className={`h-full rounded-full ${bucket.positive?'bg-emerald-500':'bg-rose-500'}`} style={{width:`${Math.min(100,(bucket.count/maxAbsR)*100)}%`}}/></div>
              <span className="w-7 text-right font-mono text-gray-300">{bucket.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400"><Trophy className="w-3.5 h-3.5 text-amber-400"/> Streaks</div>
          <div className="mt-2 text-sm font-mono text-white">Current: <b className={a.currentStreak.type==='WIN'?'text-emerald-400':a.currentStreak.type==='LOSS'?'text-rose-400':'text-gray-300'}>{a.currentStreak.type} {a.currentStreak.count}</b></div>
          <div className="text-[10px] text-gray-500 mt-1">Best win {a.bestWinStreak} · Worst loss {a.worstLossStreak}</div>
        </div>
        <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/> Discipline</div>
          <div className="mt-2 text-lg font-mono font-bold text-emerald-400">{a.disciplineScore}/100</div>
          <div className="text-[10px] text-gray-500">{a.reviewCompletion}% reviews completed</div>
        </div>
      </div>

      <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-3"><Clock3 className="w-4 h-4 text-cyan-400"/> Session & Direction</div>
        <div className="grid grid-cols-2 gap-2">
          {a.sessionStats.slice(0,6).map(s => (
            <div key={s.key} className="bg-[#0C0F17] rounded-xl p-2.5 flex items-center justify-between">
              <div><div className="text-[10px] text-gray-400">{s.key}</div><div className="text-[10px] text-gray-600">{s.count} trades · {s.winRate}% WR</div></div>
              <span className={`font-mono font-bold text-xs ${s.netR>=0?'text-emerald-400':'text-rose-400'}`}>{formatR(s.netR)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-3"><Target className="w-4 h-4 text-amber-400"/> Setup Edge</div>
        <div className="space-y-2">
          {a.setupStats.slice(0,5).map(s => (
            <div key={s.key} className="flex items-center justify-between border-b border-[#1B2232] pb-2 last:border-0">
              <div><div className="text-xs font-semibold text-gray-200">{s.key}</div><div className="text-[10px] text-gray-500">{s.count} trades · {s.winRate}% WR · PF {s.profitFactor.toFixed(2)}</div></div>
              <span className={`font-mono text-xs font-bold ${s.netR>=0?'text-emerald-400':'text-rose-400'}`}>{formatR(s.netR)}</span>
            </div>
          ))}
          {a.setupStats.length===0 && <div className="text-xs text-gray-500">No closed trades yet.</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-3"><div className="text-[10px] text-gray-500">Avg winner</div><div className="font-mono font-bold text-emerald-400">{formatR(a.averageWinR)}</div><ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mt-1"/></div>
        <div className="bg-[#121622] border border-[#1E2538] rounded-2xl p-3"><div className="text-[10px] text-gray-500">Avg loser</div><div className="font-mono font-bold text-rose-400">-{formatR(a.averageLossR).replace('+','')}</div><ArrowDownRight className="w-3.5 h-3.5 text-rose-500 mt-1"/></div>
      </div>
    </div>
  );
};
