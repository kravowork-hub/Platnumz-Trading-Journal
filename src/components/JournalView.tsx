import React, { useState, useMemo } from 'react';
import { Trade, AccountSettings, StrategyDefinition } from '../types';
import { formatCurrency, formatR } from '../utils/calculations';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LayoutList, 
  LayoutGrid,
  ChevronDown,
  X
} from 'lucide-react';

interface JournalViewProps {
  trades: Trade[];
  settings: AccountSettings;
  strategies: StrategyDefinition[];
  onSelectTrade: (tradeId: string) => void;
  onOpenQuickTrade: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  trades,
  settings,
  strategies,
  onSelectTrade,
  onOpenQuickTrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAK_EVEN' | 'OPEN'>('ALL');
  const [filterStrategy, setFilterStrategy] = useState<string>('ALL');
  const [filterInstrument, setFilterInstrument] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'COMPACT'>('CARDS');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Extract distinct instruments
  const uniqueInstruments = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.instrument))).sort();
  }, [trades]);

  // Filtered and searched trade list
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      // Global Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesInst = t.instrument.toLowerCase().includes(query);
        const matchesStrat = t.strategy.toLowerCase().includes(query);
        const matchesSetup = t.setup.toLowerCase().includes(query);
        const matchesNotes = (t.notes || '').toLowerCase().includes(query);
        const matchesDate = t.entryDate.includes(query);
        const matchesMistakes = (t.mistakes || []).some(m => m.toLowerCase().includes(query));
        if (!matchesInst && !matchesStrat && !matchesSetup && !matchesNotes && !matchesDate && !matchesMistakes) {
          return false;
        }
      }

      // Filter direction
      if (filterDirection !== 'ALL' && t.direction !== filterDirection) return false;

      // Filter status
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'WIN' && t.status !== 'WIN' && (t.pnl ?? 0) <= 0) return false;
        if (filterStatus === 'LOSS' && t.status !== 'LOSS' && (t.pnl ?? 0) >= 0) return false;
        if (filterStatus === 'BREAK_EVEN' && t.status !== 'BREAK_EVEN') return false;
        if (filterStatus === 'OPEN' && t.status !== 'OPEN') return false;
      }

      // Filter strategy
      if (filterStrategy !== 'ALL' && t.strategy !== filterStrategy) return false;

      // Filter instrument
      if (filterInstrument !== 'ALL' && t.instrument !== filterInstrument) return false;

      return true;
    });
  }, [trades, searchQuery, filterDirection, filterStatus, filterStrategy, filterInstrument]);

  const activeFiltersCount = [
    filterDirection !== 'ALL',
    filterStatus !== 'ALL',
    filterStrategy !== 'ALL',
    filterInstrument !== 'ALL',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilterDirection('ALL');
    setFilterStatus('ALL');
    setFilterStrategy('ALL');
    setFilterInstrument('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Search Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instrument, setup, mistake, notes..."
            className="w-full bg-[#121622] border border-[#1E2538] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition ${
            activeFiltersCount > 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-[#121622] text-gray-400 border-[#1E2538] hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* View Switcher: Card vs Compact Table */}
        <div className="bg-[#121622] p-1 rounded-xl border border-[#1E2538] flex items-center">
          <button
            onClick={() => setViewMode('CARDS')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'CARDS' ? 'bg-[#1F273B] text-emerald-400' : 'text-gray-400'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('COMPACT')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'COMPACT' ? 'bg-[#1F273B] text-emerald-400' : 'text-gray-400'
            }`}
            title="Compact Table View"
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {isFilterExpanded && (
        <div className="bg-[#121622] p-3.5 rounded-2xl border border-[#1E2538] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300 border-b border-[#1E2538] pb-1.5">
            <span>Filter Criteria</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Status */}
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-lg p-1.5 text-xs text-white"
              >
                <option value="ALL">All Outcomes</option>
                <option value="WIN">Wins Only</option>
                <option value="LOSS">Losses Only</option>
                <option value="BREAK_EVEN">Break Even</option>
                <option value="OPEN">Open Trades</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Direction</label>
              <select
                value={filterDirection}
                onChange={(e) => setFilterDirection(e.target.value as any)}
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-lg p-1.5 text-xs text-white"
              >
                <option value="ALL">All Directions</option>
                <option value="LONG">Long Only</option>
                <option value="SHORT">Short Only</option>
              </select>
            </div>

            {/* Instrument */}
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Instrument</label>
              <select
                value={filterInstrument}
                onChange={(e) => setFilterInstrument(e.target.value)}
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-lg p-1.5 text-xs text-white"
              >
                <option value="ALL">All Instruments</option>
                {uniqueInstruments.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Strategy</label>
              <select
                value={filterStrategy}
                onChange={(e) => setFilterStrategy(e.target.value)}
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-lg p-1.5 text-xs text-white"
              >
                <option value="ALL">All Strategies</option>
                {strategies.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Trade Count Badge & Quick Summary */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-mono">
        <span>Showing {filteredTrades.length} of {trades.length} trades</span>
        <span>
          Net:{' '}
          <strong className={
            filteredTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }>
            {formatCurrency(filteredTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0), settings.currency)}
          </strong>
        </span>
      </div>

      {/* Trades List */}
      {filteredTrades.length === 0 ? (
        <div className="text-center py-16 bg-[#121622] rounded-3xl border border-[#1E2538] p-6 text-gray-400">
          <p className="text-sm font-semibold text-gray-300">No matching trades found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search keywords.</p>
          <button
            onClick={resetFilters}
            className="mt-3 px-3 py-1.5 bg-[#1F273B] text-emerald-400 text-xs rounded-xl hover:bg-[#28324C]"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Card View */
        <div className="space-y-2.5">
          {filteredTrades.map(trade => {
            const isWin = trade.status === 'WIN' || (trade.pnl ?? 0) > 0;
            const isLoss = trade.status === 'LOSS' || (trade.pnl ?? 0) < 0;

            return (
              <div
                key={trade.id}
                onClick={() => onSelectTrade(trade.id)}
                className="bg-[#121622] hover:bg-[#161B2B] p-4 rounded-2xl border border-[#1E2538] transition cursor-pointer select-none active:scale-99 shadow-sm"
              >
                {/* Top Row: Instrument, Direction, Status, Date */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                      trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {trade.direction === 'LONG' ? 'L' : 'S'}
                    </span>
                    <span className="font-bold font-mono text-base text-white">{trade.instrument}</span>
                    <span className="text-[10px] text-gray-500 font-mono">#{trade.tradeNumber}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWin ? 'bg-emerald-500/20 text-emerald-300' : isLoss ? 'bg-rose-500/20 text-rose-300' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {trade.status}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{trade.entryDate}</span>
                  </div>
                </div>

                {/* Middle Row: Strategy, Setup, Session */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <div className="truncate max-w-[240px]">
                    <span className="text-gray-300">{trade.strategy}</span>
                    <span className="mx-1.5">•</span>
                    <span className="text-emerald-400/90 font-mono">{trade.setup}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{trade.session}</span>
                </div>

                {/* Bottom Row: P&L, Realized R, Risk */}
                <div className="pt-2 border-t border-[#1C2336] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-gray-500 block">P&L</span>
                      <span className={`font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-300'}`}>
                        {trade.pnl !== undefined ? formatCurrency(trade.pnl, settings.currency) : 'OPEN'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block">R MULTIPLE</span>
                      <span className={`font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-300'}`}>
                        {formatR(trade.realizedR)}
                      </span>
                    </div>
                  </div>

                  {/* Mistakes or Screenshot pills */}
                  <div className="flex items-center gap-1.5">
                    {trade.screenshots && trade.screenshots.length > 0 && (
                      <span className="text-[10px] bg-[#1A2234] text-gray-300 px-1.5 py-0.5 rounded border border-[#26324D]">
                        📷 {trade.screenshots.length}
                      </span>
                    )}
                    {trade.mistakes && trade.mistakes.length > 0 && (
                      <span className="text-[10px] bg-rose-950/70 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/60 font-medium">
                        {trade.mistakes[0]} {trade.mistakes.length > 1 && `+${trade.mistakes.length - 1}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-[#121622] rounded-2xl border border-[#1E2538] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0C0F17] text-gray-400 border-b border-[#1E2538] text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Dir</th>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Setup</th>
                  <th className="py-2.5 px-3 text-right">R</th>
                  <th className="py-2.5 px-3 text-right">P&L</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2236]">
                {filteredTrades.map(trade => {
                  const isWin = trade.status === 'WIN' || (trade.pnl ?? 0) > 0;
                  const isLoss = trade.status === 'LOSS' || (trade.pnl ?? 0) < 0;

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => onSelectTrade(trade.id)}
                      className="hover:bg-[#161D2E] cursor-pointer transition select-none"
                    >
                      <td className="py-2.5 px-3 text-gray-400">{trade.tradeNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{trade.instrument}</td>
                      <td className={`py-2.5 px-3 font-bold ${trade.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.direction === 'LONG' ? 'L' : 'S'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 font-sans truncate max-w-[120px]">{trade.strategy}</td>
                      <td className="py-2.5 px-3 text-emerald-400/90 truncate max-w-[120px]">{trade.setup}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-400'}`}>
                        {formatR(trade.realizedR)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-gray-400'}`}>
                        {trade.pnl !== undefined ? formatCurrency(trade.pnl, settings.currency) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isWin ? 'bg-emerald-500/20 text-emerald-300' : isLoss ? 'bg-rose-500/20 text-rose-300' : 'bg-gray-800 text-gray-300'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
