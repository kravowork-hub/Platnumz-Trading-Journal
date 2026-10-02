import React, { useState } from 'react';
import { AccountSettings } from '../types';
import { formatCurrency, formatR, calculatePlannedRR } from '../utils/calculations';
import { 
  X, 
  Calculator, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  ArrowRight,
  TrendingUp,
  Settings as SettingsIcon
} from 'lucide-react';

interface RiskCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccountSettings;
  onApplyToTrade?: (details: {
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    riskPercentage: number;
    positionSize: number;
  }) => void;
}

export const RiskCalculatorModal: React.FC<RiskCalculatorModalProps> = ({
  isOpen,
  onClose,
  settings,
  onApplyToTrade,
}) => {
  const [assetType, setAssetType] = useState<'FOREX' | 'FUTURES' | 'CRYPTO'>('FOREX');
  const [balance, setBalance] = useState<number>(settings.currentBalance || settings.startingBalance);
  const [riskPct, setRiskPct] = useState<number>(settings.defaultRiskPercentage || 1.0);
  const [entryPrice, setEntryPrice] = useState<string>('1.0825');
  const [stopLoss, setStopLoss] = useState<string>('1.0815');
  const [takeProfit, setTakeProfit] = useState<string>('1.0855');

  const numEntry = parseFloat(entryPrice) || 0;
  const numStop = parseFloat(stopLoss) || 0;
  const numTP = parseFloat(takeProfit) || 0;

  // Dollar Risk
  const dollarRisk = Number(((balance * (riskPct / 100))).toFixed(2));
  const priceDistance = Math.abs(numEntry - numStop);

  // Position Size calculation
  let calculatedSize = 0;
  if (priceDistance > 0) {
    if (assetType === 'FOREX') {
      // 1 standard lot = 100,000 units. Price distance in pips or raw delta
      // For pairs like EURUSD: pip is 0.0001 = $10/lot. Raw delta / 0.0001 * 10 = delta * 100,000
      calculatedSize = Number((dollarRisk / (priceDistance * 100000)).toFixed(2));
    } else if (assetType === 'FUTURES') {
      // e.g. NQ point is $20, ES point is $50. Let's assume standard $20/pt or contract delta
      calculatedSize = Number((dollarRisk / (priceDistance * 20 || 1)).toFixed(1));
    } else {
      // Crypto / Stocks: units = dollarRisk / priceDistance
      calculatedSize = Number((dollarRisk / priceDistance).toFixed(4));
    }
  }

  // Potential profit
  const rewardDistance = Math.abs(numTP - numEntry);
  const plannedRR = calculatePlannedRR(numEntry > numStop ? 'LONG' : 'SHORT', numEntry, numStop, numTP);
  const potentialProfit = Number((dollarRisk * plannedRR).toFixed(2));

  // Risk Limit Checks
  const isOverRisk = riskPct > settings.maxRiskPerTrade;
  const isOverDailyLoss = dollarRisk > settings.maxDailyLoss;

  const handleApply = () => {
    if (onApplyToTrade) {
      onApplyToTrade({
        entryPrice: numEntry,
        stopLossPrice: numStop,
        takeProfitPrice: numTP,
        riskPercentage: riskPct,
        positionSize: calculatedSize,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="w-full max-w-md bg-[#0F121C] rounded-3xl border border-[#20273A] shadow-2xl p-5 text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2234] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Position Size Calculator
              </h2>
              <span className="text-[10px] text-gray-400">Institutional Risk Engine</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181D2A] text-gray-400 flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Asset Class Switcher */}
        <div className="bg-[#141824] p-1 rounded-xl flex border border-[#1E2538] text-xs font-semibold">
          {(['FOREX', 'FUTURES', 'CRYPTO'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setAssetType(type)}
              className={`flex-1 py-1.5 rounded-lg transition ${
                assetType === type ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {type === 'FOREX' ? 'Forex (Lots)' : type === 'FUTURES' ? 'Futures (Contracts)' : 'Crypto / Stocks'}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Account Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-gray-400">Risk %</label>
                <span className="text-[9px] text-gray-500">Max: {settings.maxRiskPerTrade}%</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={riskPct}
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className={`w-full bg-[#141824] border rounded-xl px-3 py-2 text-xs font-mono text-white ${
                  isOverRisk ? 'border-amber-500 text-amber-300' : 'border-[#1F2638]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#141824] border border-[#1F2638] rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-rose-400 block mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#141824] border border-rose-900 rounded-xl px-2.5 py-1.5 text-xs font-mono text-rose-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-emerald-400 block mb-1">Take Profit</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-[#141824] border border-emerald-900 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-200"
              />
            </div>
          </div>
        </div>

        {/* Risk Limit Warning Notifications */}
        {isOverRisk && (
          <div className="bg-amber-950/40 border border-amber-800/80 p-2.5 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Risk Limit Exceeded!</strong>
              Your planned risk ({riskPct}%) exceeds configured maximum ({settings.maxRiskPerTrade}%). Reduce size to protect capital.
            </div>
          </div>
        )}

        {isOverDailyLoss && (
          <div className="bg-rose-950/40 border border-rose-800/80 p-2.5 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Exceeds Daily Loss Threshold!</strong>
              Dollar risk (${dollarRisk}) is greater than your maximum allowed daily loss (${settings.maxDailyLoss}).
            </div>
          </div>
        )}

        {/* Calculated Results Box */}
        <div className="bg-[#141926] p-4 rounded-2xl border border-[#20283D] space-y-3">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Execution Parameters
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#0C0F17] p-3 rounded-xl border border-[#1C2336]">
              <span className="text-[10px] text-gray-400 block">Recommended Size</span>
              <span className="text-xl font-bold font-mono text-white">
                {calculatedSize > 0 ? calculatedSize : '0.00'}
              </span>
              <span className="text-[9px] text-gray-500 font-sans block mt-0.5">
                {assetType === 'FOREX' ? 'Standard Lots' : assetType === 'FUTURES' ? 'Contracts' : 'Units'}
              </span>
            </div>

            <div className="bg-[#0C0F17] p-3 rounded-xl border border-[#1C2336]">
              <span className="text-[10px] text-gray-400 block">Dollar Risk</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                ${dollarRisk}
              </span>
              <span className="text-[9px] text-gray-500 font-sans block mt-0.5">
                Exact capital at risk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
            <div className="bg-[#0C0F17] p-2 rounded-xl">
              <span className="text-[9px] text-gray-400 block font-sans">Potential Profit</span>
              <span className="font-bold text-emerald-400">
                +{formatCurrency(potentialProfit, settings.currency)}
              </span>
            </div>
            <div className="bg-[#0C0F17] p-2 rounded-xl">
              <span className="text-[9px] text-gray-400 block font-sans">Planned R:R</span>
              <span className="font-bold text-gray-200">
                1:{plannedRR}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#171D2D] hover:bg-[#20273D] text-xs font-semibold text-gray-300"
          >
            Close
          </button>
          {onApplyToTrade && (
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              Apply to Trade
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
