import React, { useState, useMemo } from 'react';
import { Trade, AccountSettings, DailyReviewRecord } from '../types';
import { 
  formatCurrency, 
  formatR, 
  calculateDisciplineScore 
} from '../utils/calculations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  X, 
  Star,
  Brain
} from 'lucide-react';

interface CalendarViewProps {
  trades: Trade[];
  settings: AccountSettings;
  dailyReviews: DailyReviewRecord[];
  onSaveDailyReview: (review: DailyReviewRecord) => void;
  onSelectTrade: (tradeId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trades,
  settings,
  dailyReviews,
  onSaveDailyReview,
  onSelectTrade,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Oct 2026
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // Daily review form state
  const [whatWentWell, setWhatWentWell] = useState('');
  const [mistakesMade, setMistakesMade] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [improveTomorrow, setImproveTomorrow] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [savedToast, setSavedToast] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map trades by date "YYYY-MM-DD"
  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {};
    trades.forEach(t => {
      if (!map[t.entryDate]) map[t.entryDate] = [];
      map[t.entryDate].push(t);
    });
    return map;
  }, [trades]);

  // Calendar cells generation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

  // Monthly summary stats
  const monthlyStats = useMemo(() => {
    let totalPnl = 0;
    let totalR = 0;
    let winDays = 0;
    let lossDays = 0;
    let totalTrades = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dateStr] || [];
      if (dayTrades.length > 0) {
        totalTrades += dayTrades.length;
        const dayPnl = dayTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
        const dayR = dayTrades.reduce((acc, t) => acc + (t.realizedR ?? 0), 0);
        totalPnl += dayPnl;
        totalR += dayR;
        if (dayPnl > 0) winDays++;
        else if (dayPnl < 0) lossDays++;
      }
    }

    return { totalPnl, totalR, winDays, lossDays, totalTrades };
  }, [year, month, daysInMonth, tradesByDate]);

  // When a day is clicked, load its daily review
  const handleSelectDay = (dateStr: string) => {
    setSelectedDayStr(dateStr);
    const existing = dailyReviews.find(r => r.date === dateStr);
    if (existing) {
      setWhatWentWell(existing.whatWentWell);
      setMistakesMade(existing.mistakesMade);
      setWhatILearned(existing.whatILearned);
      setImproveTomorrow(existing.improveTomorrow);
      setOverallRating(existing.overallRating);
    } else {
      setWhatWentWell('');
      setMistakesMade('');
      setWhatILearned('');
      setImproveTomorrow('');
      setOverallRating(5);
    }
  };

  const selectedDayTrades = selectedDayStr ? (tradesByDate[selectedDayStr] || []) : [];
  const selectedDayPnl = selectedDayTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
  const selectedDayR = selectedDayTrades.reduce((acc, t) => acc + (t.realizedR ?? 0), 0);
  const selectedDayDiscipline = calculateDisciplineScore(selectedDayTrades, settings);

  const handleSaveReview = () => {
    if (!selectedDayStr) return;

    const review: DailyReviewRecord = {
      id: `rev_${selectedDayStr}`,
      date: selectedDayStr,
      tradesCount: selectedDayTrades.length,
      netPnl: selectedDayPnl,
      netR: selectedDayR,
      winRate: selectedDayTrades.length > 0
        ? Math.round((selectedDayTrades.filter(t => (t.pnl ?? 0) > 0).length / selectedDayTrades.length) * 100)
        : 0,
      disciplineScore: selectedDayDiscipline,
      whatWentWell,
      mistakesMade,
      whatILearned,
      improveTomorrow,
      overallRating,
    };

    onSaveDailyReview(review);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Monthly Performance Banner */}
      <div className="bg-[#121622] rounded-2xl p-4 border border-[#1E2538] shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              {monthName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-[#181E2E] hover:bg-[#20273D] text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-[#181E2E] hover:bg-[#20273D] text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top 4 Stats */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1C2336] text-center font-mono">
          <div className="bg-[#0C0F17] p-2 rounded-xl">
            <span className="text-[9px] text-gray-400 block font-sans">Month P&L</span>
            <span className={`text-xs font-bold ${monthlyStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(monthlyStats.totalPnl, settings.currency)}
            </span>
          </div>

          <div className="bg-[#0C0F17] p-2 rounded-xl">
            <span className="text-[9px] text-gray-400 block font-sans">Total R</span>
            <span className={`text-xs font-bold ${monthlyStats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatR(monthlyStats.totalR)}
            </span>
          </div>

          <div className="bg-[#0C0F17] p-2 rounded-xl">
            <span className="text-[9px] text-gray-400 block font-sans">Win / Loss Days</span>
            <span className="text-xs font-bold text-gray-200">
              <span className="text-emerald-400">{monthlyStats.winDays}W</span> - <span className="text-rose-400">{monthlyStats.lossDays}L</span>
            </span>
          </div>

          <div className="bg-[#0C0F17] p-2 rounded-xl">
            <span className="text-[9px] text-gray-400 block font-sans">Volume</span>
            <span className="text-xs font-bold text-blue-400">
              {monthlyStats.totalTrades} trades
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#121622] rounded-2xl border border-[#1E2538] p-3 shadow-lg">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-gray-500 mb-2">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[58px] bg-transparent rounded-xl" />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTrades = tradesByDate[dateStr] || [];
            const hasTrades = dayTrades.length > 0;
            const dayPnl = dayTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
            const dayR = dayTrades.reduce((acc, t) => acc + (t.realizedR ?? 0), 0);
            const isWin = dayPnl > 0;
            const isLoss = dayPnl < 0;
            const isSelected = selectedDayStr === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => handleSelectDay(dateStr)}
                className={`min-h-[62px] p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/20'
                    : hasTrades
                    ? isWin
                      ? 'bg-emerald-950/30 border-emerald-900/60 hover:border-emerald-500'
                      : isLoss
                      ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-500'
                      : 'bg-[#151A28] border-[#222B40]'
                    : 'bg-[#0E121B] border-[#181F2E] hover:border-gray-700'
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${hasTrades ? 'text-white' : 'text-gray-600'}`}>
                    {dayNum}
                  </span>
                  {hasTrades && (
                    <span className="text-[8px] font-mono bg-[#090C12] px-1 rounded text-gray-400">
                      {dayTrades.length}t
                    </span>
                  )}
                </div>

                {/* P&L & R */}
                {hasTrades ? (
                  <div className="text-right">
                    <span className={`text-[10px] font-bold font-mono block leading-tight ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-300'}`}>
                      {formatCurrency(dayPnl, settings.currency)}
                    </span>
                    <span className={`text-[9px] font-mono block ${isWin ? 'text-emerald-400/80' : isLoss ? 'text-rose-400/80' : 'text-gray-400'}`}>
                      {formatR(dayR)}
                    </span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drill-down & Daily Review Sheet */}
      {selectedDayStr && (
        <div className="bg-[#121622] rounded-2xl p-4 border border-[#1E2538] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#1E2538] pb-2">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase">Selected Day Inspection</span>
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span>{selectedDayStr}</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  selectedDayPnl >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}>
                  {formatCurrency(selectedDayPnl, settings.currency)} ({formatR(selectedDayR)})
                </span>
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayStr(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Day Trades List */}
          {selectedDayTrades.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">No trades recorded on this date.</p>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-gray-400 block">
                Trades Executed ({selectedDayTrades.length}):
              </span>
              {selectedDayTrades.map(trade => (
                <div
                  key={trade.id}
                  onClick={() => onSelectTrade(trade.id)}
                  className="bg-[#0C0F17] hover:bg-[#151A26] p-2.5 rounded-xl border border-[#1C2336] flex items-center justify-between cursor-pointer select-none text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                      trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {trade.direction}
                    </span>
                    <span className="font-bold font-mono text-white">{trade.instrument}</span>
                    <span className="text-gray-400 text-[11px] truncate max-w-[120px]">{trade.setup}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`font-bold ${
                      (trade.pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatCurrency(trade.pnl ?? 0, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Daily Review Questionnaire */}
          <div className="bg-[#0C0F17] p-3.5 rounded-2xl border border-[#1E2538] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                Daily Review Protocol
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setOverallRating(s)}
                    className="text-xs"
                  >
                    <Star className={`w-3.5 h-3.5 ${s <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">1. What did I do well today?</label>
              <textarea
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder="Disciplined risk, stayed off the charts during chop, waited for A+ setup..."
                rows={2}
                className="w-full bg-[#121622] border border-[#1E2538] rounded-xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">2. What mistake did I make?</label>
              <textarea
                value={mistakesMade}
                onChange={(e) => setMistakesMade(e.target.value)}
                placeholder="Entered 1 minute too early, jumped into news candle..."
                rows={2}
                className="w-full bg-[#121622] border border-[#1E2538] rounded-xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">3. What did I learn?</label>
              <textarea
                value={whatILearned}
                onChange={(e) => setWhatILearned(e.target.value)}
                placeholder="15M liquidity sweeps provide cleaner delivery than 1M noise..."
                rows={2}
                className="w-full bg-[#121622] border border-[#1E2538] rounded-xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">4. What will I improve tomorrow?</label>
              <textarea
                value={improveTomorrow}
                onChange={(e) => setImproveTomorrow(e.target.value)}
                placeholder="Only execute during London or NY Open killzones..."
                rows={2}
                className="w-full bg-[#121622] border border-[#1E2538] rounded-xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleSaveReview}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Daily Review
            </button>
            {savedToast && (
              <span className="block text-center text-xs text-emerald-400 font-semibold animate-pulse">
                ✓ Daily Review saved to Room Database!
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
