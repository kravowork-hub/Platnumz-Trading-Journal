import React, { useEffect, useMemo, useState } from 'react';
import {
  Trade,
  Direction,
  TradeStatus,
  Timeframe,
  StrategyDefinition,
  ChecklistItem,
  MistakeTag,
  AccountSettings,
  ScreenshotAttachment,
} from '../types';
import {
  calculatePlannedRR,
  calculateTradeOutcome,
  formatCurrency,
  formatR,
} from '../utils/calculations';
import { Haptics } from '../utils/haptics';
import { WELTRADE_SYNTX_SPECS } from '../utils/weltradeSyntXRegistry';
import {
  X,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  Camera,
  Activity,
} from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
  editingTrade?: Trade | null;
  strategies: StrategyDefinition[];
  checklistTemplate: ChecklistItem[];
  settings: AccountSettings;
  tradeCount: number;
}

const TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

const MISTAKES: MistakeTag[] = [
  'FOMO',
  'Revenge trade',
  'Overtrading',
  'Moved stop',
  'Took profit early',
  'Entered too early',
  'Entered too late',
  'Oversized position',
  'Ignored setup',
  'Traded during news',
  'Chased candle',
  'No stop loss',
];

const GROUP_ORDER = [
  'FX Vol',
  'SFX Vol',
  'PainX',
  'GainX',
  'MAX PainX',
  'MAX GainX',
  'FlipX',
  'SwitchX',
  'BreakX',
  'TrendX',
  'PlusX',
  'FiboX',
  'QuadX',
  'Other',
] as const;

const SYNTX_SYMBOLS = Object.values(WELTRADE_SYNTX_SPECS);

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  onDeleteTrade,
  editingTrade,
  strategies,
  checklistTemplate,
  settings,
  tradeCount,
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().substring(0, 5);

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CHECKLIST' | 'CHARTS'>('DETAILS');
  const [instrument, setInstrument] = useState(editingTrade?.instrument || SYNTX_SYMBOLS[0]?.symbol || 'FX Vol 20');
  const [direction, setDirection] = useState<Direction>(editingTrade?.direction || 'LONG');
  const [status, setStatus] = useState<TradeStatus>(editingTrade?.status || 'OPEN');
  const [entryDate, setEntryDate] = useState(editingTrade?.entryDate || todayStr);
  const [entryTime, setEntryTime] = useState(editingTrade?.entryTime || timeStr);
  const [timeframe, setTimeframe] = useState<Timeframe>(editingTrade?.timeframe || 'M5');
  const [strategy, setStrategy] = useState(editingTrade?.strategy || strategies[0]?.name || 'ICT / SMC Concepts');
  const [setup, setSetup] = useState(editingTrade?.setup || strategies[0]?.setups[0] || 'Liquidity Sweep');

  const [entryPrice, setEntryPrice] = useState(editingTrade?.entryPrice?.toString() || '');
  const [stopLossPrice, setStopLossPrice] = useState(editingTrade?.stopLossPrice?.toString() || '');
  const [takeProfitPrice, setTakeProfitPrice] = useState(editingTrade?.takeProfitPrice?.toString() || '');
  const [exitPrice, setExitPrice] = useState(editingTrade?.exitPrice?.toString() || '');

  const [accountBalance] = useState(editingTrade?.accountBalanceAtEntry || settings.currentBalance);
  const [riskPercentage, setRiskPercentage] = useState(
    editingTrade?.riskPercentage || settings.defaultRiskPercentage
  );
  const [positionSize, setPositionSize] = useState(
    editingTrade?.positionSize?.toString() || '1'
  );

  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    editingTrade?.checklist || checklistTemplate.map(item => ({ ...item, checked: false }))
  );
  const [selectedMistakes, setSelectedMistakes] = useState<MistakeTag[]>(editingTrade?.mistakes || []);
  const [notes, setNotes] = useState(editingTrade?.notes || '');
  const [screenshots, setScreenshots] = useState<ScreenshotAttachment[]>(
    editingTrade?.screenshots || []
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const selectedSpec = WELTRADE_SYNTX_SPECS[instrument];

  useEffect(() => {
    if (editingTrade) return;
    const selectedStrategy = strategies.find(item => item.name === strategy);
    if (selectedStrategy?.setups?.length) setSetup(selectedStrategy.setups[0]);
  }, [strategy, strategies, editingTrade]);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    setInstrumentSearch('');
    setSelectedGroup('All');
  }, [isOpen]);

  const filteredSymbols = useMemo(() => {
    const query = instrumentSearch.trim().toLowerCase();
    return SYNTX_SYMBOLS.filter(spec => {
      const groupMatch = selectedGroup === 'All' || spec.group === selectedGroup;
      const searchMatch =
        !query ||
        spec.symbol.toLowerCase().includes(query) ||
        spec.group.toLowerCase().includes(query);
      return groupMatch && searchMatch;
    });
  }, [instrumentSearch, selectedGroup]);

  const numEntry = Number.parseFloat(entryPrice) || 0;
  const numStop = Number.parseFloat(stopLossPrice) || 0;
  const numTakeProfit = Number.parseFloat(takeProfitPrice) || 0;
  const numExit = Number.parseFloat(exitPrice) || 0;
  const numPosSize = Number.parseFloat(positionSize) || 1;

  const dollarRisk = Number((accountBalance * (riskPercentage / 100)).toFixed(2));
  const plannedRR = calculatePlannedRR(direction, numEntry, numStop, numTakeProfit);
  const effectiveExit =
    numExit ||
    (status === 'WIN' ? numTakeProfit : status === 'LOSS' ? numStop : numEntry);

  const outcome =
    numEntry > 0 && numStop > 0 && status !== 'OPEN'
      ? calculateTradeOutcome(
          direction,
          numEntry,
          numStop,
          effectiveExit,
          dollarRisk,
          numPosSize
        )
      : { pnl: 0, realizedR: 0, pnlPercentage: 0 };

  const toggleChecklist = (id: string) => {
    setChecklist(items =>
      items.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleMistake = (tag: MistakeTag) => {
    setSelectedMistakes(current =>
      current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]
    );
  };

  const handleScreenshot = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: ScreenshotAttachment['type']
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setScreenshots(current => [
        ...current.filter(item => item.type !== type),
        {
          id: `ss_${Date.now()}`,
          type,
          url,
          timestamp: new Date().toISOString(),
          caption: `${type} chart - ${instrument}`,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!instrument.trim() || numEntry <= 0 || numStop <= 0) {
      Haptics.warning();
      setFormError('Enter a valid SyntX instrument, entry price and stop loss.');
      return;
    }

    if (numTakeProfit <= 0 && status !== 'OPEN') {
      Haptics.warning();
      setFormError('Enter a take-profit price for a closed trade.');
      return;
    }

    const trade: Trade = {
      id: editingTrade?.id || `trade_${Date.now()}`,
      tradeNumber: editingTrade?.tradeNumber || tradeCount + 1,
      instrument: instrument.trim(),
      direction,
      status,
      entryDate,
      entryTime,
      exitDate: status !== 'OPEN' ? entryDate : undefined,
      exitTime: status !== 'OPEN' ? timeStr : undefined,
      timeframe,
      // SyntX trades do not use London/New York/Asian session classification.
      session: 'AFTER_HOURS',
      strategy,
      setup,
      entryPrice: numEntry,
      stopLossPrice: numStop,
      takeProfitPrice: numTakeProfit,
      exitPrice: status !== 'OPEN' ? effectiveExit : undefined,
      accountBalanceAtEntry: accountBalance,
      riskPercentage,
      dollarRisk,
      positionSize: numPosSize,
      plannedRR,
      pnl: status !== 'OPEN' ? outcome.pnl : undefined,
      realizedR: status !== 'OPEN' ? outcome.realizedR : undefined,
      pnlPercentage: status !== 'OPEN' ? outcome.pnlPercentage : undefined,
      screenshots,
      checklist,
      mistakes: selectedMistakes,
      notes,
      review: editingTrade?.review,
      createdAt: editingTrade?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Haptics.success();
    onSaveTrade(trade);
  };

  if (!isOpen) return null;

  return (
    <div className="trade-modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
      <div className="trade-modal-sheet w-full sm:max-w-2xl bg-[#0D111A] text-white rounded-t-[28px] sm:rounded-[24px] border border-[#20283A] shadow-2xl flex flex-col max-h-[calc(100dvh-var(--app-safe-top)-var(--app-safe-bottom)-12px)] overflow-hidden">
        <header className="shrink-0 px-5 pt-4 pb-3 border-b border-[#1D2433] bg-[#0D111A]/95">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] font-mono tracking-[0.18em] text-emerald-400 uppercase">
                Weltrade SyntX • {editingTrade ? 'Edit Trade' : 'Quick Add'}
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight truncate">{instrument}</h2>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  direction === 'LONG'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {direction}
                </span>
                {selectedSpec && (
                  <span className="px-2 py-1 rounded-lg bg-[#151B28] text-gray-400 border border-[#232C40] text-[10px]">
                    {selectedSpec.group}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-xl bg-[#151B28] border border-[#232C40] text-gray-400 hover:text-white flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {formError && (
          <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="shrink-0 flex border-b border-[#1D2433] bg-[#090D14] overflow-x-auto">
          {[
            ['DETAILS', 'Trade'],
            ['CHECKLIST', 'Checklist'],
            ['CHARTS', 'Charts'],
          ].map(([id, label], index) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`px-5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap ${
                activeTab === id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {index + 1}. {label}
              {id === 'CHECKLIST' && (
                <span className="ml-1.5 text-[10px] bg-[#151B28] px-1.5 py-0.5 rounded-full">
                  {checklist.filter(item => item.checked).length}/{checklist.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'DETAILS' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
            <section className="rounded-2xl border border-[#20283A] bg-[#111621] p-3.5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                    Instrument
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Weltrade SyntX registry
                  </div>
                </div>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  value={instrumentSearch}
                  onChange={e => setInstrumentSearch(e.target.value)}
                  placeholder="Search SyntX instrument..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#090D14] border border-[#242D40] text-sm text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedGroup('All')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border ${
                    selectedGroup === 'All'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#151B28] border-[#232C40] text-gray-500'
                  }`}
                >
                  All
                </button>
                {GROUP_ORDER.filter(group =>
                  SYNTX_SYMBOLS.some(item => item.group === group)
                ).map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border ${
                      selectedGroup === group
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-[#151B28] border-[#232C40] text-gray-500'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-0.5">
                {filteredSymbols.map(spec => (
                  <button
                    key={spec.symbol}
                    onClick={() => setInstrument(spec.symbol)}
                    className={`min-h-10 px-2.5 rounded-xl border text-left transition ${
                      instrument === spec.symbol
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                        : 'border-[#232C40] bg-[#151B28] text-gray-300 hover:border-[#34405A]'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold truncate">{spec.symbol}</span>
                    <span className="block text-[9px] text-gray-500 truncate">{spec.group}</span>
                  </button>
                ))}
              </div>

              {selectedSpec && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#090D14] border border-[#20283A] p-2.5">
                    <div className="text-[9px] uppercase tracking-wider text-gray-600">Direction</div>
                    <div className="text-xs font-semibold text-gray-300 mt-1">
                      {selectedSpec.directionHint}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#090D14] border border-[#20283A] p-2.5">
                    <div className="text-[9px] uppercase tracking-wider text-gray-600">Max volume</div>
                    <div className="text-xs font-semibold text-gray-300 mt-1">
                      {selectedSpec.maxVolumeLots ?? 'Broker-defined'}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-[#111621] border border-[#20283A] p-1.5 flex">
                <button
                  onClick={() => setDirection('LONG')}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 ${
                    direction === 'LONG'
                      ? 'bg-emerald-500 text-[#06110C]'
                      : 'text-gray-500'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> LONG
                </button>
                <button
                  onClick={() => setDirection('SHORT')}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 ${
                    direction === 'SHORT'
                      ? 'bg-rose-500 text-white'
                      : 'text-gray-500'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" /> SHORT
                </button>
              </div>

              <div className="rounded-2xl bg-[#111621] border border-[#20283A] p-1.5 flex">
                {(['OPEN', 'WIN', 'LOSS', 'BREAK_EVEN'] as TradeStatus[]).map(value => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold ${
                      status === value
                        ? 'bg-[#202A3B] text-emerald-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {value === 'BREAK_EVEN' ? 'BE' : value}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#20283A] bg-[#111621] p-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] text-gray-500">
                  Strategy
                  <select
                    value={strategy}
                    onChange={e => setStrategy(e.target.value)}
                    className="mt-1.5 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm text-gray-200 outline-none"
                  >
                    {strategies.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] text-gray-500">
                  Setup
                  <select
                    value={setup}
                    onChange={e => setSetup(e.target.value)}
                    className="mt-1.5 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm text-gray-200 outline-none"
                  >
                    {(strategies.find(item => item.name === strategy)?.setups || [setup]).map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3">
                <div className="text-[11px] text-gray-500 mb-1.5">Timeframe</div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {TIMEFRAMES.map(value => (
                    <button
                      key={value}
                      onClick={() => setTimeframe(value)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-semibold border whitespace-nowrap ${
                        timeframe === value
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-[#151B28] border-[#232C40] text-gray-500'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#20283A] bg-[#111621] p-3.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold text-gray-200">Prices & Execution</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Enter the exact price shown by your Weltrade platform.
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  R:R {plannedRR.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <label className="text-[10px] text-gray-500">
                  Entry
                  <input
                    inputMode="decimal"
                    value={entryPrice}
                    onChange={e => setEntryPrice(e.target.value)}
                    placeholder="0.0000"
                    className="mt-1 w-full h-11 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm font-mono text-white outline-none focus:border-emerald-500/60"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Stop Loss
                  <input
                    inputMode="decimal"
                    value={stopLossPrice}
                    onChange={e => setStopLossPrice(e.target.value)}
                    placeholder="0.0000"
                    className="mt-1 w-full h-11 rounded-xl bg-[#090D14] border border-rose-500/20 px-3 text-sm font-mono text-white outline-none focus:border-rose-500/60"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Take Profit
                  <input
                    inputMode="decimal"
                    value={takeProfitPrice}
                    onChange={e => setTakeProfitPrice(e.target.value)}
                    placeholder="0.0000"
                    className="mt-1 w-full h-11 rounded-xl bg-[#090D14] border border-emerald-500/20 px-3 text-sm font-mono text-white outline-none focus:border-emerald-500/60"
                  />
                </label>
              </div>

              <label className="block mt-3 text-[10px] text-gray-500">
                Actual Exit Price
                <input
                  inputMode="decimal"
                  value={exitPrice}
                  onChange={e => setExitPrice(e.target.value)}
                  placeholder={status === 'OPEN' ? 'Leave blank while trade is open' : 'Defaults to TP / SL'}
                  className="mt-1 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm font-mono text-white outline-none"
                />
              </label>
            </section>

            <section className="rounded-2xl border border-[#20283A] bg-[#111621] p-3.5">
              <div className="text-xs font-semibold text-gray-200 mb-3">Risk Management</div>
              <div className="grid grid-cols-3 gap-2.5">
                <label className="text-[10px] text-gray-500">
                  Risk %
                  <input
                    inputMode="decimal"
                    value={riskPercentage}
                    onChange={e => setRiskPercentage(Number(e.target.value) || 0)}
                    className="mt-1 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm font-mono text-white"
                  />
                </label>
                <div className="rounded-xl bg-[#090D14] border border-[#20283A] px-3 py-2.5">
                  <div className="text-[9px] text-gray-600">Dollar Risk</div>
                  <div className="text-sm font-mono text-gray-200 mt-1">
                    {formatCurrency(dollarRisk, settings.currency)}
                  </div>
                </div>
                <label className="text-[10px] text-gray-500">
                  Size / Lots
                  <input
                    inputMode="decimal"
                    value={positionSize}
                    onChange={e => setPositionSize(e.target.value)}
                    className="mt-1 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm font-mono text-white"
                  />
                </label>
              </div>

              <div className="mt-3 grid grid-cols-3 rounded-xl bg-[#090D14] border border-[#20283A] divide-x divide-[#20283A]">
                <div className="p-2.5 text-center">
                  <div className="text-[9px] text-gray-600">P&L</div>
                  <div className={`text-sm font-mono font-bold mt-1 ${outcome.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(outcome.pnl, settings.currency)}
                  </div>
                </div>
                <div className="p-2.5 text-center">
                  <div className="text-[9px] text-gray-600">Realized R</div>
                  <div className="text-sm font-mono font-bold text-gray-200 mt-1">{formatR(outcome.realizedR)}</div>
                </div>
                <div className="p-2.5 text-center">
                  <div className="text-[9px] text-gray-600">Risk</div>
                  <div className="text-sm font-mono font-bold text-gray-200 mt-1">{riskPercentage.toFixed(2)}%</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#20283A] bg-[#111621] p-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[10px] text-gray-500">
                  Date
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="mt-1 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm text-gray-200"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Time
                  <input
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    className="mt-1 w-full h-10 rounded-xl bg-[#090D14] border border-[#242D40] px-3 text-sm text-gray-200"
                  />
                </label>
              </div>
              <p className="mt-2 text-[9px] text-gray-600">
                Session tracking is intentionally disabled for Weltrade SyntX.
              </p>
            </section>

            <section>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Self-discipline audit</div>
              <div className="flex flex-wrap gap-1.5">
                {MISTAKES.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleMistake(tag)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] border ${
                      selectedMistakes.includes(tag)
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                        : 'bg-[#111621] border-[#20283A] text-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Trade notes..."
              className="w-full min-h-20 rounded-2xl bg-[#111621] border border-[#20283A] p-3 text-sm text-gray-200 placeholder:text-gray-600 outline-none resize-none"
            />
          </div>
        )}

        {activeTab === 'CHECKLIST' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
            {checklist.length === 0 ? (
              <div className="rounded-2xl border border-[#20283A] bg-[#111621] p-5 text-sm text-gray-500">
                No checklist items configured.
              </div>
            ) : (
              checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl border ${
                    item.checked
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-[#20283A] bg-[#111621]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500 text-[#06110C]'
                      : 'border-[#39445A] text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className={`text-sm ${item.checked ? 'text-gray-200' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'CHARTS' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2.5">
              {(['BEFORE', 'ENTRY', 'AFTER'] as const).map(type => {
                const shot = screenshots.find(item => item.type === type);
                return (
                  <div key={type} className="rounded-2xl border border-[#20283A] bg-[#111621] p-2">
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">{type}</div>
                    {shot ? (
                      <div className="relative">
                        <img src={shot.url} alt={`${type} chart`} className="w-full aspect-square object-cover rounded-xl" />
                        <button
                          onClick={() => setScreenshots(current => current.filter(item => item.id !== shot.id))}
                          className="absolute top-1 right-1 w-7 h-7 rounded-lg bg-black/70 text-white flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square rounded-xl border border-dashed border-[#354057] flex flex-col items-center justify-center text-gray-600 cursor-pointer">
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[9px]">Add chart</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleScreenshot(e, type)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-[#20283A] bg-[#111621] p-4 text-xs text-gray-500">
              Keep your SyntX chart screenshots attached to the execution so the journal remains auditable.
            </div>
          </div>
        )}

        <footer className="trade-modal-footer shrink-0 border-t border-[#1D2433] bg-[#0B0F17] px-4 pt-3 pb-safe">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            {editingTrade && onDeleteTrade && (
              <button
                onClick={() => onDeleteTrade(editingTrade.id)}
                className="w-11 h-11 rounded-xl border border-rose-500/20 text-rose-400 flex items-center justify-center"
                aria-label="Delete trade"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#171D29] border border-[#252E41] text-gray-400 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-[1.5] h-11 rounded-xl bg-emerald-500 text-[#06110C] font-bold text-sm shadow-lg shadow-emerald-500/15"
            >
              {editingTrade ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
