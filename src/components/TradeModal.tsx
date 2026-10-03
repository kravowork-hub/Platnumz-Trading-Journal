import React, { useState, useEffect } from 'react';
import { 
  Trade, 
  Direction, 
  TradeStatus, 
  TradingSession, 
  Timeframe, 
  StrategyDefinition, 
  ChecklistItem, 
  MistakeTag,
  AccountSettings,
  ScreenshotAttachment
} from '../types';
import { 
  calculatePlannedRR, 
  calculateTradeOutcome, 
  formatCurrency, 
  formatR 
} from '../utils/calculations';
import { Haptics } from '../utils/haptics';
import { 
  X, 
  Camera, 
  CheckSquare, 
  AlertTriangle, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  editingTrade?: Trade | null;
  strategies: StrategyDefinition[];
  checklistTemplate: ChecklistItem[];
  settings: AccountSettings;
  tradeCount: number;
}

const COMMON_INSTRUMENTS = ['EURUSD', 'NQ', 'ES', 'XAUUSD', 'BTCUSDT', 'GBPUSD', 'US30', 'ETHUSDT'];
const TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
const SESSIONS: { id: TradingSession; label: string }[] = [
  { id: 'LONDON', label: 'London' },
  { id: 'NEW_YORK', label: 'New York' },
  { id: 'ASIAN', label: 'Asian' },
  { id: 'OVERLAP', label: 'London/NY Overlap' },
  { id: 'FRANKFURT', label: 'Frankfurt' },
];

const AVAILABLE_MISTAKES: MistakeTag[] = [
  'FOMO',
  'Revenge trade',
  'Overtrading',
  'Moved stop',
  'Took profit early',
  'Entered too early',
  'Entered too late',
  'Oversized position',
  'Ignored setup',
  'Traded outside session',
  'Traded during news',
  'Chased candle',
  'No stop loss',
];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  editingTrade,
  strategies,
  checklistTemplate,
  settings,
  tradeCount,
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().substring(0, 5);

  // Form State
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CHECKLIST' | 'SCREENSHOTS'>('DETAILS');
  const [instrument, setInstrument] = useState(editingTrade?.instrument || 'EURUSD');
  const [direction, setDirection] = useState<Direction>(editingTrade?.direction || 'LONG');
  const [status, setStatus] = useState<TradeStatus>(editingTrade?.status || 'WIN');
  const [entryDate, setEntryDate] = useState(editingTrade?.entryDate || todayStr);
  const [entryTime, setEntryTime] = useState(editingTrade?.entryTime || timeStr);
  const [timeframe, setTimeframe] = useState<Timeframe>(editingTrade?.timeframe || 'M5');
  const [session, setSession] = useState<TradingSession>(editingTrade?.session || 'LONDON');
  
  // Strategy & Setup
  const [strategy, setStrategy] = useState(editingTrade?.strategy || strategies[0]?.name || 'ICT / SMC Concepts');
  const currentStrategyObj = strategies.find(s => s.name === strategy) || strategies[0];
  const [setup, setSetup] = useState(editingTrade?.setup || currentStrategyObj?.setups[0] || 'Liquidity Sweep');

  // Prices
  const [entryPrice, setEntryPrice] = useState<string>(editingTrade?.entryPrice?.toString() || '');
  const [stopLossPrice, setStopLossPrice] = useState<string>(editingTrade?.stopLossPrice?.toString() || '');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>(editingTrade?.takeProfitPrice?.toString() || '');
  const [exitPrice, setExitPrice] = useState<string>(editingTrade?.exitPrice?.toString() || '');

  // Risk parameters
  const [accountBalance, setAccountBalance] = useState<number>(editingTrade?.accountBalanceAtEntry || settings.currentBalance);
  const [riskPercentage, setRiskPercentage] = useState<number>(editingTrade?.riskPercentage || settings.defaultRiskPercentage);
  const [positionSize, setPositionSize] = useState<string>(editingTrade?.positionSize?.toString() || '1');

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    editingTrade?.checklist || checklistTemplate.map(c => ({ ...c, checked: false }))
  );

  // Mistakes & Notes
  const [selectedMistakes, setSelectedMistakes] = useState<MistakeTag[]>(editingTrade?.mistakes || []);
  const [notes, setNotes] = useState(editingTrade?.notes || '');

  // Screenshots
  const [screenshots, setScreenshots] = useState<ScreenshotAttachment[]>(editingTrade?.screenshots || []);
  const [formError, setFormError] = useState<string | null>(null);

  // Update setup list when strategy changes
  useEffect(() => {
    if (!editingTrade) {
      const match = strategies.find(s => s.name === strategy);
      if (match && match.setups.length > 0) {
        setSetup(match.setups[0]);
      }
    }
  }, [strategy, strategies, editingTrade]);

  // Numeric values
  const numEntry = parseFloat(entryPrice) || 0;
  const numStop = parseFloat(stopLossPrice) || 0;
  const numTakeProfit = parseFloat(takeProfitPrice) || 0;
  const numExit = parseFloat(exitPrice) || 0;
  const numPosSize = parseFloat(positionSize) || 1;

  // Real-time calculations
  const dollarRisk = Number(((accountBalance * (riskPercentage / 100))).toFixed(2));
  const plannedRR = calculatePlannedRR(direction, numEntry, numStop, numTakeProfit);
  
  // Realized outcome if closed
  const effectiveExit = numExit || (status === 'WIN' ? numTakeProfit : status === 'LOSS' ? numStop : numEntry);
  const outcome = (numEntry > 0 && numStop > 0 && status !== 'OPEN')
    ? calculateTradeOutcome(direction, numEntry, numStop, effectiveExit, dollarRisk, numPosSize)
    : { pnl: 0, realizedR: 0, pnlPercentage: 0 };

  // Risk Limit Warning
  const isOverRisk = riskPercentage > settings.maxRiskPerTrade;

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Toggle mistake tag
  const toggleMistake = (tag: MistakeTag) => {
    setSelectedMistakes(prev => 
      prev.includes(tag) ? prev.filter(m => m !== tag) : [...prev, tag]
    );
  };

  // Handle local screenshot upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'BEFORE' | 'ENTRY' | 'AFTER') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment: ScreenshotAttachment = {
        id: `ss_${Date.now()}`,
        type,
        url: dataUrl,
        timestamp: new Date().toISOString(),
        caption: `${type} Chart - ${instrument}`,
      };
      setScreenshots(prev => [...prev.filter(s => s.type !== type), newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    if (!instrument.trim() || numEntry <= 0 || numStop <= 0) {
      Haptics.warning();
      setFormError('Please enter a valid instrument, entry price, and stop loss.');
      return;
    }
    setFormError(null);
    Haptics.success();

    const tradeToSave: Trade = {
      id: editingTrade?.id || `trade_${Date.now()}`,
      tradeNumber: editingTrade?.tradeNumber || tradeCount + 1,
      instrument: instrument.toUpperCase().trim(),
      direction,
      status,
      entryDate,
      entryTime,
      exitDate: status !== 'OPEN' ? entryDate : undefined,
      exitTime: status !== 'OPEN' ? timeStr : undefined,
      timeframe,
      session,
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

    onSaveTrade(tradeToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg bg-[#0F121B] rounded-t-3xl sm:rounded-2xl border border-[#202738] shadow-2xl flex flex-col max-h-[92vh] text-white">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-[#1C2233] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider">
              {editingTrade ? `EDIT TRADE #${editingTrade.tradeNumber}` : 'FAST TRADE ENTRY'}
            </span>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <span>{instrument}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {direction}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181D2A] hover:bg-[#22293B] text-gray-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="mx-4 mt-2.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              {formError}
            </span>
            <button onClick={() => setFormError(null)} className="p-1 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Switcher: Details | Checklist | Screenshots */}
        <div className="flex border-b border-[#1C2233] px-4 bg-[#0A0D14]">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'DETAILS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400'
            }`}
          >
            1. Trade Details
          </button>
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'CHECKLIST' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400'
            }`}
          >
            <span>2. Checklist</span>
            <span className="text-[10px] bg-[#1A2030] px-1.5 py-0.2 rounded-full text-emerald-400">
              {checklist.filter(c => c.checked).length}/{checklist.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('SCREENSHOTS')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'SCREENSHOTS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400'
            }`}
          >
            <span>3. Charts</span>
            {screenshots.length > 0 && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded-full">
                {screenshots.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Trade Details */}
        {activeTab === 'DETAILS' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            
            {/* Direction & Status Switchers */}
            <div className="grid grid-cols-2 gap-2">
              {/* Direction Toggle */}
              <div className="bg-[#141824] p-1 rounded-xl flex border border-[#1F2638]">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                    direction === 'LONG'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                    direction === 'SHORT'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  SHORT
                </button>
              </div>

              {/* Status Selector */}
              <div className="bg-[#141824] p-1 rounded-xl flex border border-[#1F2638]">
                <button
                  type="button"
                  onClick={() => setStatus('WIN')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    status === 'WIN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'text-gray-400'
                  }`}
                >
                  WIN
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('LOSS')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    status === 'LOSS' ? 'bg-rose-950 text-rose-400 border border-rose-700' : 'text-gray-400'
                  }`}
                >
                  LOSS
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('BREAK_EVEN')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    status === 'BREAK_EVEN' ? 'bg-slate-800 text-gray-200' : 'text-gray-400'
                  }`}
                >
                  BE
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('OPEN')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    status === 'OPEN' ? 'bg-blue-900/60 text-blue-300' : 'text-gray-400'
                  }`}
                >
                  OPEN
                </button>
              </div>
            </div>

            {/* Quick Instrument Selector */}
            <div>
              <label className="text-[11px] font-medium text-gray-400 mb-1 block">
                Instrument / Pair
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {COMMON_INSTRUMENTS.map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => setInstrument(inst)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap border transition ${
                      instrument === inst
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#141824] border-[#1F2638] text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value.toUpperCase())}
                placeholder="Or type custom symbol (e.g. SOLUSDT, NVDA)"
                className="mt-1 w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Strategy & Setup Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1 block">Strategy</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {strategies.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1 block">Setup Model</label>
                <select
                  value={setup}
                  onChange={(e) => setSetup(e.target.value)}
                  className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {(currentStrategyObj?.setups || ['Default Setup']).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session & Timeframe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1 block">Trading Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value as TradingSession)}
                  className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {SESSIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1 block">Timeframe</label>
                <div className="flex gap-1 overflow-x-auto">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                        timeframe === tf
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-[#141824] border-[#1F2638] text-gray-400'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Entry Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1 block">Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 mb-1 block">Time</label>
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Price Inputs: Entry, Stop Loss, Take Profit, Exit */}
            <div className="bg-[#141824] p-3 rounded-2xl border border-[#1E2538] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 border-b border-[#1F2638] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  Prices & Executions
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Planned R:R: <strong className="text-emerald-400 font-mono">1:{plannedRR}</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Entry Price *</label>
                  <input
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="e.g. 1.0825"
                    className="w-full bg-[#0D1018] border border-[#1E2538] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-400 block mb-0.5">Stop Loss *</label>
                  <input
                    type="number"
                    step="any"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    placeholder="e.g. 1.0815"
                    className="w-full bg-[#0D1018] border border-rose-950 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-rose-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-0.5">Take Profit</label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    placeholder="e.g. 1.0855"
                    className="w-full bg-[#0D1018] border border-emerald-950 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-200"
                  />
                </div>
              </div>

              {/* Exit Price (if closed) */}
              {status !== 'OPEN' && (
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-gray-300">Actual Exit Price (optional)</label>
                    <span className="text-[9px] text-gray-500">Defaults to TP or SL</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    placeholder={status === 'WIN' ? `Defaults to TP: ${takeProfitPrice || 'Auto'}` : `Defaults to SL: ${stopLossPrice || 'Auto'}`}
                    className="w-full bg-[#0D1018] border border-[#1E2538] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Risk & Position Sizing with Automated Outputs */}
            <div className="bg-[#141824] p-3 rounded-2xl border border-[#1E2538] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 border-b border-[#1F2638] pb-1.5">
                <span>Risk Management</span>
                {isOverRisk && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
                    <AlertTriangle className="w-3 h-3" />
                    Exceeds max limit ({settings.maxRiskPerTrade}%)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Risk %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(parseFloat(e.target.value) || 0)}
                    className={`w-full bg-[#0D1018] border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white ${
                      isOverRisk ? 'border-amber-500 text-amber-300' : 'border-[#1E2538]'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Dollar Risk ($)</label>
                  <input
                    type="text"
                    readOnly
                    value={`$${dollarRisk}`}
                    className="w-full bg-[#090C12] border border-[#1B2130] rounded-lg px-2.5 py-1.5 text-xs font-mono text-gray-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Size / Lots</label>
                  <input
                    type="number"
                    step="0.01"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    placeholder="1.0"
                    className="w-full bg-[#0D1018] border border-[#1E2538] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Automatic Calculated Results Bar */}
              {status !== 'OPEN' && (
                <div className="bg-[#0A0D15] p-2.5 rounded-xl border border-[#1E2535] grid grid-cols-3 text-center">
                  <div>
                    <span className="text-[9px] text-gray-400 block">P&L</span>
                    <span className={`text-sm font-bold font-mono ${outcome.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(outcome.pnl, settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block">Realized R</span>
                    <span className={`text-sm font-bold font-mono ${outcome.realizedR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatR(outcome.realizedR)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block">Gain / Loss</span>
                    <span className={`text-sm font-bold font-mono ${outcome.pnlPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {outcome.pnlPercentage > 0 ? `+${outcome.pnlPercentage}%` : `${outcome.pnlPercentage}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mistakes Tracker Tagging */}
            <div>
              <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
                Tag Mistakes (Self-Discipline Audit)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_MISTAKES.map(tag => {
                  const isSelected = selectedMistakes.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleMistake(tag)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                        isSelected
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-700/80'
                          : 'bg-[#141824] text-gray-400 border border-[#1E2538] hover:text-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trade Notes */}
            <div>
              <label className="text-[11px] font-medium text-gray-400 mb-1 block">Trade Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key price action observations, liquidity targets, market sentiment..."
                rows={2}
                className="w-full bg-[#141824] border border-[#1F2638] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Pre-Trade Checklist */}
        {activeTab === 'CHECKLIST' && (
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <div className="bg-[#141824] p-3 rounded-2xl border border-[#1E2538]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  Pre-Execution Protocol Checklist
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {checklist.filter(c => c.checked).length} of {checklist.length} verified
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">
                Strict adherence directly calculates your 0–100 Discipline Score. Check items confirmed before pulling the trigger.
              </p>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                      item.checked
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-[#0E121B] border-[#1C2233] text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#161C2A] border-[#293248]"
                    />
                    <span className="text-xs flex-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Screenshot Attachments */}
        {activeTab === 'SCREENSHOTS' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="text-xs text-gray-400">
              Attach TradingView or broker charts for post-trade retrospective and future AI pattern analysis.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['BEFORE', 'ENTRY', 'AFTER'] as const).map(type => {
                const existing = screenshots.find(s => s.type === type);
                return (
                  <div
                    key={type}
                    className="bg-[#141824] rounded-xl border border-[#1E2538] p-3 flex flex-col items-center justify-center text-center min-h-[140px] relative overflow-hidden"
                  >
                    {existing ? (
                      <div className="w-full h-full relative group">
                        <img
                          src={existing.url}
                          alt={type}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(existing.id)}
                          className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                          {type} CHART
                        </span>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2">
                        <div className="w-10 h-10 rounded-full bg-[#1B2234] flex items-center justify-center text-gray-400 mb-2">
                          <Camera className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-200">
                          {type === 'BEFORE' ? 'Before Setup' : type === 'ENTRY' ? 'Entry Trigger' : 'After Result'}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5">Upload image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, type)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1C2233] bg-[#0A0D14] flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-gray-400">
            {activeTab !== 'DETAILS' && (
              <button
                type="button"
                onClick={() => setActiveTab('DETAILS')}
                className="text-emerald-400 hover:underline"
              >
                ← Back to Details
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#151926] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              Save Trade
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
