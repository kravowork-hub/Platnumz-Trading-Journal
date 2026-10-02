import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Camera, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Cpu, 
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';

interface AiChartLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiChartLabModal: React.FC<AiChartLabModalProps> = ({ isOpen, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'
  );

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setHasResult(true);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0F121C] rounded-3xl border border-[#20273A] shadow-2xl p-5 text-white space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2234] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>AI Chart Vision Lab</span>
                <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                  BETA ARCHITECTURE
                </span>
              </h2>
              <span className="text-[10px] text-gray-400">Institutional Market Structure Detection</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181D2A] text-gray-400 flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mandatory Philosophy Disclaimer Banner */}
        <div className="bg-amber-950/30 border border-amber-800/60 p-3 rounded-2xl text-xs text-amber-300/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>CRITICAL PHILOSOPHY & SAFETY NOTICE</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-200/80">
            This module strictly separates <strong>Observed Chart Data</strong> (factual price pivots, candle ranges) from <strong>AI Interpretations</strong> (hypotheses). AI analysis is never guaranteed and does not predict future markets.
          </p>
        </div>

        {/* Chart Preview Frame */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {selectedImage && (
            <div className="relative rounded-2xl overflow-hidden border border-[#20273A] bg-black max-h-48 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Chart upload"
                className="w-full h-48 object-cover opacity-90"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-purple-300">
                    Scanning liquidity pools & FVGs...
                  </span>
                </div>
              )}
            </div>
          )}

          {!hasResult ? (
            <div className="pt-2">
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>Simulate AI Structure Scan</span>
              </button>
            </div>
          ) : (
            /* Analysis Breakdown Result */
            <div className="space-y-3 pt-2">
              {/* Box 1: Observed Factual Data */}
              <div className="bg-[#141926] p-3 rounded-2xl border border-[#20283D] space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
                  <Eye className="w-3.5 h-3.5" />
                  1. Observed Chart Facts (Measured)
                </span>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>Previous Asian Low swept at 09:30 UTC by 12 pips.</li>
                  <li>Imbalance / Fair Value Gap left between 1.0830 and 1.0842.</li>
                  <li>Bullish displacement candle closed above prior 15M swing high.</li>
                </ul>
              </div>

              {/* Box 2: AI Interpretation */}
              <div className="bg-[#181524] p-3 rounded-2xl border border-purple-900/50 space-y-1.5">
                <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  2. AI Interpretation & Hypothesis (Uncertain)
                </span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Market structure indicates potential Smart Money discount accumulation. If price retraces into the 15M FVG, institutional buyers may defend the zone targeting London High liquidity at 1.0855.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300 pt-1">
                  <div className="bg-[#0E0C17] p-2 rounded-lg">
                    <span className="text-gray-500 block text-[9px]">Potential Invalidation:</span>
                    <span className="text-rose-400">1.0815 (Asian low)</span>
                  </div>
                  <div className="bg-[#0E0C17] p-2 rounded-lg">
                    <span className="text-gray-500 block text-[9px]">Potential Target:</span>
                    <span className="text-emerald-400">1.0855 (Liquidity)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1C2234] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#171D2D] hover:bg-[#20273D] text-xs font-semibold text-gray-300"
          >
            Close Lab
          </button>
        </div>

      </div>
    </div>
  );
};
