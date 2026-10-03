import React from 'react';
import { 
  X, 
  RotateCcw, 
  AlertTriangle, 
  Trash2, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  BarChart2,
  Sparkles
} from 'lucide-react';
import { Haptics } from '../utils/haptics';

interface ResetStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  onLoadDemoData?: () => void;
  tradeCount: number;
}

export const ResetStatsModal: React.FC<ResetStatsModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  onLoadDemoData,
  tradeCount,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    Haptics.warning();
    onConfirmReset();
    onClose();
  };

  const handleDemo = () => {
    Haptics.medium();
    if (onLoadDemoData) {
      onLoadDemoData();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-[#0E121C] rounded-3xl border border-rose-900/40 shadow-2xl p-5 text-white space-y-4 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1D253B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Reset All Stats to Zero
              </h2>
              <span className="text-[10px] text-gray-400">Offline Vault Clean Slate</span>
            </div>
          </div>

          <button
            onClick={() => {
              Haptics.light();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[#161C2C] text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-3 text-xs text-rose-200/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-rose-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Are you sure you want to reset all stats?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-300">
            This will permanently remove <strong>{tradeCount} trade{tradeCount !== 1 ? 's' : ''}</strong> and all daily reviews from your local offline database, resetting all performance charts, P&L, and win-rate to 0.00.
          </p>
        </div>

        {/* What will be reset breakdown */}
        <div className="bg-[#121622] p-3 rounded-2xl border border-[#1E2538] space-y-2">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
            Values that will be set to zero:
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#161C2C] p-2 rounded-xl flex items-center gap-2 border border-[#20273A]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[9px]">Net P&L</span>
                <span className="font-mono font-bold text-white">$0.00</span>
              </div>
            </div>

            <div className="bg-[#161C2C] p-2 rounded-xl flex items-center gap-2 border border-[#20273A]">
              <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[9px]">Win Rate</span>
                <span className="font-mono font-bold text-white">0.0%</span>
              </div>
            </div>

            <div className="bg-[#161C2C] p-2 rounded-xl flex items-center gap-2 border border-[#20273A]">
              <BarChart2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[9px]">Profit Factor</span>
                <span className="font-mono font-bold text-white">0.00</span>
              </div>
            </div>

            <div className="bg-[#161C2C] p-2 rounded-xl flex items-center gap-2 border border-[#20273A]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[9px]">Discipline Score</span>
                <span className="font-mono font-bold text-white">0 / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Yes, Reset All Stats to Zero
          </button>

          <button
            onClick={() => {
              Haptics.light();
              onClose();
            }}
            className="w-full py-2.5 bg-[#171D2D] hover:bg-[#20273D] text-gray-300 text-xs rounded-xl border border-[#242D45] font-semibold transition"
          >
            Cancel (Keep Current Data)
          </button>
        </div>

        {/* Optional Demo Seed Alternative */}
        {onLoadDemoData && (
          <div className="pt-2 border-t border-[#1C2336] text-center">
            <button
              onClick={handleDemo}
              className="text-[11px] text-gray-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Or load sample demo trades for testing</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
