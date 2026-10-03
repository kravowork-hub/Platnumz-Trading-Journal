import { Trade, ChecklistItem, PeriodFilter, AccountSettings, MistakeTag } from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ZAR: 'R',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatR(rMultiple: number | undefined): string {
  if (rMultiple === undefined || isNaN(rMultiple)) return '0.00R';
  const prefix = rMultiple > 0 ? '+' : '';
  return `${prefix}${rMultiple.toFixed(2)}R`;
}

export function formatPercentage(val: number): string {
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}

/**
 * Calculates Planned Risk:Reward ratio
 */
export function calculatePlannedRR(
  direction: 'LONG' | 'SHORT',
  entry: number,
  stopLoss: number,
  takeProfit: number
): number {
  if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0) return 0;
  
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  
  if (risk === 0) return 0;
  return Number((reward / risk).toFixed(2));
}

/**
 * Calculates realized P&L and R multiple from prices
 */
export function calculateTradeOutcome(
  direction: 'LONG' | 'SHORT',
  entry: number,
  stopLoss: number,
  exit: number,
  dollarRisk: number,
  positionSize?: number
): { pnl: number; realizedR: number; pnlPercentage: number } {
  const riskDistance = Math.abs(entry - stopLoss);
  if (riskDistance === 0) return { pnl: 0, realizedR: 0, pnlPercentage: 0 };
  
  const pointDelta = direction === 'LONG' ? (exit - entry) : (entry - exit);
  const realizedR = Number((pointDelta / riskDistance).toFixed(2));
  
  // Realized Dollar P&L
  let pnl = 0;
  if (positionSize && positionSize > 0) {
    pnl = Number((pointDelta * positionSize).toFixed(2));
  } else {
    pnl = Number((realizedR * dollarRisk).toFixed(2));
  }
  
  const pnlPercentage = dollarRisk > 0 ? Number(((pnl / dollarRisk) * 100).toFixed(2)) : 0;
  
  return { pnl, realizedR, pnlPercentage };
}

/**
 * Calculates 0-100 Discipline Score for a collection of trades
 * Measurable behavior factors:
 * 1. Checklist adherence (25 pts)
 * 2. Risk adherence: stayed under max risk limit (20 pts)
 * 3. Strategy adherence: stated thesis & strategy match (15 pts)
 * 4. Stop-loss discipline: did not move stop loss to increase risk (15 pts)
 * 5. Free from revenge/FOMO trading mistakes (15 pts)
 * 6. Journal completion: completed post-trade review (10 pts)
 */
export function calculateDisciplineScore(trades: Trade[], settings?: AccountSettings): number {
  if (trades.length === 0) return 0;
  
  const maxRisk = settings?.maxRiskPerTrade ?? 2.0;
  let totalScore = 0;

  for (const trade of trades) {
    let tradeDiscipline = 0;
    
    // 1. Checklist adherence (25 pts max)
    if (trade.checklist && trade.checklist.length > 0) {
      const checkedCount = trade.checklist.filter(c => c.checked).length;
      tradeDiscipline += Math.round((checkedCount / trade.checklist.length) * 25);
    } else {
      tradeDiscipline += 20; // Default baseline if no checklist attached
    }
    
    // 2. Risk adherence (20 pts max)
    if (trade.riskPercentage <= maxRisk) {
      tradeDiscipline += 20;
    } else {
      // Partial deduction based on over-risk
      const ratio = maxRisk / trade.riskPercentage;
      tradeDiscipline += Math.max(0, Math.round(ratio * 15));
    }
    
    // 3. Strategy adherence (15 pts max)
    const followedStrategy = trade.review?.followedStrategy ?? true;
    if (followedStrategy) {
      tradeDiscipline += 15;
    }
    
    // 4. Stop-loss discipline (15 pts max)
    const hasMovedStop = trade.mistakes?.includes('Moved stop');
    const hasNoStop = trade.mistakes?.includes('No stop loss');
    if (!hasMovedStop && !hasNoStop) {
      tradeDiscipline += 15;
    }
    
    // 5. Absence of revenge / FOMO / Overtrading (15 pts max)
    const hasEmotionalMistake = trade.mistakes?.some(m => 
      ['FOMO', 'Revenge trade', 'Overtrading', 'Chased candle'].includes(m)
    );
    if (!hasEmotionalMistake) {
      tradeDiscipline += 15;
    }
    
    // 6. Journal completion (10 pts max)
    if (trade.status !== 'OPEN') {
      const isReviewed = trade.review && trade.review.whyTrade && trade.review.whatWentWell;
      if (isReviewed) {
        tradeDiscipline += 10;
      }
    } else {
      tradeDiscipline += 10;
    }
    
    totalScore += Math.min(100, tradeDiscipline);
  }
  
  return Math.round(totalScore / trades.length);
}

/**
 * Filter trades based on standard period
 */
export function filterTradesByPeriod(trades: Trade[], period: PeriodFilter, customRange?: { start: string; end: string }): Trade[] {
  const now = new Date();
  
  return trades.filter(trade => {
    const tradeDate = new Date(trade.entryDate + 'T00:00:00');
    
    if (period === 'ALL_TIME') return true;
    
    if (period === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      return trade.entryDate === todayStr;
    }
    
    if (period === 'THIS_WEEK') {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diffToMonday));
      startOfWeek.setHours(0, 0, 0, 0);
      return tradeDate >= startOfWeek;
    }
    
    if (period === 'THIS_MONTH') {
      return tradeDate.getFullYear() === now.getFullYear() && tradeDate.getMonth() === now.getMonth();
    }
    
    if (period === 'THIS_YEAR') {
      return tradeDate.getFullYear() === now.getFullYear();
    }
    
    if (period === 'CUSTOM' && customRange) {
      return trade.entryDate >= customRange.start && trade.entryDate <= customRange.end;
    }
    
    return true;
  });
}

export interface PerformanceStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // 0-100%
  netPnl: number;
  totalWonDollar: number;
  totalLostDollar: number;
  profitFactor: number;
  totalR: number;
  averageR: number;
  averageWinR: number;
  averageLossR: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'NONE'; count: number };
  bestStreak: number;
  maxDrawdownDollar: number;
  maxDrawdownPercentage: number;
  disciplineScore: number;
}

/**
 * Complete statistics engine calculated from actual trade data
 */
export function calculatePerformanceStats(trades: Trade[], settings?: AccountSettings): PerformanceStats {
  const closed = trades.filter(t => t.status !== 'OPEN');
  
  if (closed.length === 0) {
    return {
      totalTrades: trades.length,
      openTrades: trades.length,
      closedTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      netPnl: 0,
      totalWonDollar: 0,
      totalLostDollar: 0,
      profitFactor: 0,
      totalR: 0,
      averageR: 0,
      averageWinR: 0,
      averageLossR: 0,
      currentStreak: { type: 'NONE', count: 0 },
      bestStreak: 0,
      maxDrawdownDollar: 0,
      maxDrawdownPercentage: 0,
      disciplineScore: calculateDisciplineScore(trades, settings),
    };
  }
  
  let wins = 0;
  let losses = 0;
  let breakEvens = 0;
  let netPnl = 0;
  let totalWonDollar = 0;
  let totalLostDollar = 0;
  let totalR = 0;
  let winRSum = 0;
  let lossRSum = 0;
  
  // Sort trades chronologically
  const sorted = [...closed].sort((a, b) => {
    const timeA = new Date(`${a.entryDate}T${a.entryTime || '00:00'}`).getTime();
    const timeB = new Date(`${b.entryDate}T${b.entryTime || '00:00'}`).getTime();
    return timeA - timeB;
  });
  
  for (const trade of sorted) {
    const pnl = trade.pnl ?? 0;
    const r = trade.realizedR ?? 0;
    
    netPnl += pnl;
    totalR += r;
    
    if (trade.status === 'WIN' || pnl > 0) {
      wins++;
      totalWonDollar += pnl;
      winRSum += r;
    } else if (trade.status === 'LOSS' || pnl < 0) {
      losses++;
      totalLostDollar += Math.abs(pnl);
      lossRSum += Math.abs(r);
    } else {
      breakEvens++;
    }
  }
  
  const winRate = Number(((wins / (wins + losses || 1)) * 100).toFixed(1));
  const profitFactor = totalLostDollar === 0 
    ? (totalWonDollar > 0 ? 99.99 : 0) 
    : Number((totalWonDollar / totalLostDollar).toFixed(2));
    
  const averageR = Number((totalR / (closed.length || 1)).toFixed(2));
  const averageWinR = wins > 0 ? Number((winRSum / wins).toFixed(2)) : 0;
  const averageLossR = losses > 0 ? Number((lossRSum / losses).toFixed(2)) : 0;
  
  // Calculate streaks
  let currentStreakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
  let currentStreakCount = 0;
  let maxWinStreak = 0;
  let tempWinStreak = 0;
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    const isWin = t.status === 'WIN' || (t.pnl ?? 0) > 0;
    const isLoss = t.status === 'LOSS' || (t.pnl ?? 0) < 0;
    
    if (i === sorted.length - 1) {
      currentStreakType = isWin ? 'WIN' : isLoss ? 'LOSS' : 'NONE';
      currentStreakCount = isWin || isLoss ? 1 : 0;
    } else {
      if (isWin && currentStreakType === 'WIN') {
        currentStreakCount++;
      } else if (isLoss && currentStreakType === 'LOSS') {
        currentStreakCount++;
      } else {
        break; // Streak terminated
      }
    }
  }
  
  for (const t of sorted) {
    if (t.status === 'WIN' || (t.pnl ?? 0) > 0) {
      tempWinStreak++;
      if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
    } else if (t.status === 'LOSS' || (t.pnl ?? 0) < 0) {
      tempWinStreak = 0;
    }
  }
  
  // Maximum Drawdown calculation
  let peakBalance = settings?.startingBalance ?? 10000;
  let runningBalance = peakBalance;
  let maxDrawdownDollar = 0;
  let maxDrawdownPct = 0;
  
  for (const t of sorted) {
    runningBalance += (t.pnl ?? 0);
    if (runningBalance > peakBalance) {
      peakBalance = runningBalance;
    } else {
      const ddDollar = peakBalance - runningBalance;
      const ddPct = (ddDollar / peakBalance) * 100;
      if (ddDollar > maxDrawdownDollar) {
        maxDrawdownDollar = ddDollar;
      }
      if (ddPct > maxDrawdownPct) {
        maxDrawdownPct = ddPct;
      }
    }
  }
  
  return {
    totalTrades: trades.length,
    openTrades: trades.length - closed.length,
    closedTrades: closed.length,
    winningTrades: wins,
    losingTrades: losses,
    breakEvenTrades: breakEvens,
    winRate,
    netPnl: Number(netPnl.toFixed(2)),
    totalWonDollar: Number(totalWonDollar.toFixed(2)),
    totalLostDollar: Number(totalLostDollar.toFixed(2)),
    profitFactor,
    totalR: Number(totalR.toFixed(2)),
    averageR,
    averageWinR,
    averageLossR,
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    bestStreak: maxWinStreak,
    maxDrawdownDollar: Number(maxDrawdownDollar.toFixed(2)),
    maxDrawdownPercentage: Number(maxDrawdownPct.toFixed(1)),
    disciplineScore: calculateDisciplineScore(trades, settings),
  };
}

/**
 * Mistake impact analytics
 */
export interface MistakeStats {
  tag: MistakeTag;
  occurrences: number;
  netRImpact: number;
  netPnlImpact: number;
  lossCount: number;
}

export function calculateMistakeStats(trades: Trade[]): MistakeStats[] {
  const mistakeMap: Record<string, { occurrences: number; netR: number; netPnl: number; lossCount: number }> = {};
  
  for (const trade of trades) {
    if (!trade.mistakes || trade.mistakes.length === 0) continue;
    
    for (const mistake of trade.mistakes) {
      if (!mistakeMap[mistake]) {
        mistakeMap[mistake] = { occurrences: 0, netR: 0, netPnl: 0, lossCount: 0 };
      }
      mistakeMap[mistake].occurrences += 1;
      
      const r = trade.realizedR ?? 0;
      const pnl = trade.pnl ?? 0;
      mistakeMap[mistake].netR += r;
      mistakeMap[mistake].netPnl += pnl;
      if (pnl < 0 || trade.status === 'LOSS') {
        mistakeMap[mistake].lossCount += 1;
      }
    }
  }
  
  return Object.entries(mistakeMap)
    .map(([tag, data]) => ({
      tag: tag as MistakeTag,
      occurrences: data.occurrences,
      netRImpact: Number(data.netR.toFixed(2)),
      netPnlImpact: Number(data.netPnl.toFixed(2)),
      lossCount: data.lossCount,
    }))
    .sort((a, b) => a.netRImpact - b.netRImpact); // Worst impact first
}

/**
 * Generates equity curve points for interactive chart
 */
export interface EquityPoint {
  index: number;
  tradeId?: string;
  date: string;
  instrument?: string;
  direction?: 'LONG' | 'SHORT';
  pnl?: number;
  r?: number;
  cumulativePnl: number;
  cumulativeR: number;
  balance: number;
  status?: string;
}

export function generateEquityCurveData(trades: Trade[], startingBalance: number = 10000): EquityPoint[] {
  const closed = trades
    .filter(t => t.status !== 'OPEN')
    .sort((a, b) => {
      const timeA = new Date(`${a.entryDate}T${a.entryTime || '00:00'}`).getTime();
      const timeB = new Date(`${b.entryDate}T${b.entryTime || '00:00'}`).getTime();
      return timeA - timeB;
    });

  const points: EquityPoint[] = [
    {
      index: 0,
      date: closed[0]?.entryDate || new Date().toISOString().split('T')[0],
      cumulativePnl: 0,
      cumulativeR: 0,
      balance: startingBalance,
    }
  ];

  let currentCumPnl = 0;
  let currentCumR = 0;
  let currentBal = startingBalance;

  closed.forEach((t, i) => {
    const pnl = t.pnl ?? 0;
    const r = t.realizedR ?? 0;
    currentCumPnl += pnl;
    currentCumR += r;
    currentBal += pnl;

    points.push({
      index: i + 1,
      tradeId: t.id,
      date: t.entryDate,
      instrument: t.instrument,
      direction: t.direction,
      pnl,
      r,
      cumulativePnl: Number(currentCumPnl.toFixed(2)),
      cumulativeR: Number(currentCumR.toFixed(2)),
      balance: Number(currentBal.toFixed(2)),
      status: t.status,
    });
  });

  return points;
}


export interface DistributionBucket { label: string; count: number; positive: boolean }
export interface AdvancedSegmentStats { key: string; count: number; wins: number; losses: number; winRate: number; netR: number; netPnl: number; profitFactor: number }
export interface AdvancedPerformance {
  expectancyR: number; expectancyDollar: number; payoffRatio: number; recoveryFactor: number;
  returnOnStartingBalance: number; medianR: number; averageRiskPercent: number; maxRiskPercent: number;
  maxDrawdownDollar: number; maxDrawdownPercentage: number; largestWin: number; largestLoss: number;
  worstDayPnl: number; worstDayDate: string; bestDayPnl: number; bestDayDate: string;
  currentStreak: { type: 'WIN'|'LOSS'|'NONE'; count: number }; bestWinStreak: number; worstLossStreak: number;
  disciplineScore: number; reviewCompletion: number; rDistribution: DistributionBucket[];
  sessionStats: AdvancedSegmentStats[]; setupStats: AdvancedSegmentStats[];
  averageWinR: number; averageLossR: number;
}

const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b)=>a-b);
  const mid = Math.floor(sorted.length/2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
};

const buildAdvancedSegment = (trades: Trade[], keyOf: (t: Trade)=>string): AdvancedSegmentStats[] => {
  const map: Record<string, {count:number; wins:number; losses:number; netR:number; netPnl:number; winDollar:number; lossDollar:number}> = {};
  for (const t of trades.filter(x=>x.status!=='OPEN')) {
    const key = keyOf(t) || 'Unassigned';
    const x = map[key] ||= {count:0,wins:0,losses:0,netR:0,netPnl:0,winDollar:0,lossDollar:0};
    const pnl=t.pnl??0, r=t.realizedR??0; x.count++; x.netR+=r; x.netPnl+=pnl;
    if (pnl>0 || t.status==='WIN') { x.wins++; x.winDollar += Math.max(0,pnl); }
    else if (pnl<0 || t.status==='LOSS') { x.losses++; x.lossDollar += Math.abs(Math.min(0,pnl)); }
  }
  return Object.entries(map).map(([key,x])=>({
    key,count:x.count,wins:x.wins,losses:x.losses,
    winRate:Number(((x.wins/Math.max(1,x.wins+x.losses))*100).toFixed(1)),
    netR:Number(x.netR.toFixed(2)),netPnl:Number(x.netPnl.toFixed(2)),
    profitFactor:x.lossDollar===0?(x.winDollar>0?99.99:0):Number((x.winDollar/x.lossDollar).toFixed(2))
  })).sort((a,b)=>b.netR-a.netR);
};

export function calculateAdvancedPerformance(trades: Trade[], settings?: AccountSettings): AdvancedPerformance {
  const closed=[...trades.filter(t=>t.status!=='OPEN')].sort((a,b)=>`${a.entryDate}T${a.entryTime||'00:00'}`.localeCompare(`${b.entryDate}T${b.entryTime||'00:00'}`));
  const rs=closed.map(t=>t.realizedR??0), pnls=closed.map(t=>t.pnl??0);
  const wins=closed.filter(t=>(t.pnl??0)>0 || t.status==='WIN');
  const losses=closed.filter(t=>(t.pnl??0)<0 || t.status==='LOSS');
  const totalR=rs.reduce((a,b)=>a+b,0), totalPnl=pnls.reduce((a,b)=>a+b,0);
  const avgWinR=wins.length?wins.reduce((a,t)=>a+(t.realizedR??0),0)/wins.length:0;
  const avgLossR=losses.length?Math.abs(losses.reduce((a,t)=>a+(t.realizedR??0),0)/losses.length):0;
  const winRate=wins.length/(Math.max(1,wins.length+losses.length));
  const expectancyR=winRate*avgWinR-(1-winRate)*avgLossR;
  const avgWinDollar=wins.length?wins.reduce((a,t)=>a+Math.max(0,t.pnl??0),0)/wins.length:0;
  const avgLossDollar=losses.length?Math.abs(losses.reduce((a,t)=>a+Math.min(0,t.pnl??0),0)/losses.length):0;
  const starting=settings?.startingBalance??0;
  let peak=starting, balance=starting, maxDD=0, maxDDPct=0;
  for(const pnl of pnls){ balance+=pnl; if(balance>peak) peak=balance; const dd=peak-balance; maxDD=Math.max(maxDD,dd); maxDDPct=Math.max(maxDDPct,peak>0?dd/peak*100:0); }
  const dayMap:Record<string,number>={};
  closed.forEach(t=>dayMap[t.entryDate]=(dayMap[t.entryDate]||0)+(t.pnl??0));
  const days=Object.entries(dayMap);
  const best=days.length?days.reduce((a,b)=>b[1]>a[1]?b:a):['',0];
  const worst=days.length?days.reduce((a,b)=>b[1]<a[1]?b:a):['',0];
  let currentType:'WIN'|'LOSS'|'NONE'='NONE', currentCount=0, bestWin=0, worstLoss=0, runWin=0, runLoss=0;
  for(const t of closed){ const w=(t.pnl??0)>0||t.status==='WIN', l=(t.pnl??0)<0||t.status==='LOSS'; if(w){runWin++;runLoss=0;bestWin=Math.max(bestWin,runWin)} else if(l){runLoss++;runWin=0;worstLoss=Math.max(worstLoss,runLoss)} }
  if(closed.length){ const t=closed[closed.length-1]; const w=(t.pnl??0)>0||t.status==='WIN', l=(t.pnl??0)<0||t.status==='LOSS'; currentType=w?'WIN':l?'LOSS':'NONE'; const run=[...closed].reverse(); for(const x of run){const same=w?((x.pnl??0)>0||x.status==='WIN'):l?((x.pnl??0)<0||x.status==='LOSS'):false;if(same)currentCount++;else break;} }
  const buckets=[-3,-2,-1,0,1,2,3].map(n=>({label:n===-3?'<-3R':n===3?'>3R':`${n}R`,count:rs.filter(r=>n===-3?r<-3:n===3?r>3:Math.floor(r)===n).length,positive:n>=1}));
  const reviews=closed.filter(t=>!!t.review).length;
  const avgRisk=closed.length?closed.reduce((a,t)=>a+t.riskPercentage,0)/closed.length:0;
  return {
    expectancyR:Number(expectancyR.toFixed(2)), expectancyDollar:Number((expectancyR*(closed.length?closed.reduce((a,t)=>a+t.dollarRisk,0)/closed.length:0)).toFixed(2)),
    payoffRatio:avgLossR?Number((avgWinR/avgLossR).toFixed(2)):0, recoveryFactor:maxDD?Number((totalPnl/maxDD).toFixed(2)):0,
    returnOnStartingBalance:starting?Number((totalPnl/starting*100).toFixed(2)):0, medianR:Number(median(rs).toFixed(2)),
    averageRiskPercent:Number(avgRisk.toFixed(2)), maxRiskPercent:closed.length?Math.max(...closed.map(t=>t.riskPercentage)):0,
    maxDrawdownDollar:Number(maxDD.toFixed(2)),maxDrawdownPercentage:Number(maxDDPct.toFixed(2)),largestWin:wins.length?Math.max(...wins.map(t=>t.pnl??0)):0,largestLoss:losses.length?Math.min(...losses.map(t=>t.pnl??0)):0,
    worstDayPnl:Number(worst[1].toFixed(2)),worstDayDate:worst[0],bestDayPnl:Number(best[1].toFixed(2)),bestDayDate:best[0],
    currentStreak:{type:currentType,count:currentCount},bestWinStreak:bestWin,worstLossStreak:worstLoss,disciplineScore:calculateDisciplineScore(trades,settings),reviewCompletion:Number((reviews/Math.max(1,closed.length)*100).toFixed(1)),
    rDistribution:buckets,sessionStats:buildAdvancedSegment(closed,t=>t.session),setupStats:buildAdvancedSegment(closed,t=>t.setup),averageWinR:Number(avgWinR.toFixed(2)),averageLossR:Number(avgLossR.toFixed(2))
  };
}
