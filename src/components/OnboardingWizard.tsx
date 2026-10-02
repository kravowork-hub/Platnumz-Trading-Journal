import React, { useState } from 'react';
import { AccountSettings, StrategyDefinition, ChecklistItem } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  DollarSign, 
  ShieldCheck, 
  Target, 
  Layers, 
  CheckSquare, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface OnboardingWizardProps {
  initialSettings: AccountSettings;
  strategies: StrategyDefinition[];
  checklist: ChecklistItem[];
  onComplete: (settings: AccountSettings) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialSettings,
  strategies,
  checklist,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [startingBalance, setStartingBalance] = useState(initialSettings.startingBalance);
  const [defaultRisk, setDefaultRisk] = useState(initialSettings.defaultRiskPercentage);
  const [maxDailyLoss, setMaxDailyLoss] = useState(initialSettings.maxDailyLoss);
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]?.name || 'ICT / SMC Concepts');

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const finalSettings: AccountSettings = {
        ...initialSettings,
        currency,
        startingBalance,
        currentBalance: startingBalance,
        defaultRiskPercentage: defaultRisk,
        maxDailyLoss,
        onboardingCompleted: true,
      };
      onComplete(finalSettings);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#090B10] px-5 py-8 text-white max-w-lg mx-auto overflow-y-auto">
      
      {/* Top Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
          <span>STEP {step} OF {totalSteps}</span>
          <span className="text-emerald-400 font-bold">SETUP WIZARD</span>
        </div>
        <div className="w-full h-1.5 bg-[#171D2D] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="my-auto py-6 space-y-4">
        
        {/* Step 1: Currency */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Choose Account Currency</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Select the primary base currency for your trading account balances, P&L metrics, and position size calculations.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: 'USD', name: 'US Dollar', symbol: '$' },
                { id: 'EUR', name: 'Euro', symbol: '€' },
                { id: 'GBP', name: 'British Pound', symbol: '£' },
                { id: 'ZAR', name: 'South African Rand', symbol: 'R' },
                { id: 'JPY', name: 'Japanese Yen', symbol: '¥' },
                { id: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c.id as any)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                    currency === c.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-[#121622] border-[#1F2638] text-gray-400 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block font-mono">{c.id}</span>
                    <span className="text-[10px] text-gray-400">{c.name}</span>
                  </div>
                  <span className="font-mono text-base font-bold text-emerald-400">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Starting Balance */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Enter Starting Balance</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Input your current starting capital. All equity curves, percentage returns, and drawdown computations begin from this benchmark.
            </p>

            <div className="pt-2">
              <label className="text-[11px] text-gray-400 block mb-1">Starting Account Capital ({currency})</label>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121622] border border-[#1F2638] rounded-2xl px-4 py-3 text-2xl font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 3: Default Risk % */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Default Risk Percentage</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Professional traders standardise risk per execution (typically between 0.5% and 2.0%).
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(pct => (
                <button
                  key={pct}
                  onClick={() => setDefaultRisk(pct)}
                  className={`py-3 rounded-2xl border text-center font-mono font-bold text-sm transition ${
                    defaultRisk === pct
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-[#121622] border-[#1F2638] text-gray-400'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="bg-[#121622] p-3 rounded-xl border border-[#1F2638] text-xs text-gray-400 flex justify-between">
              <span>Risk on {startingBalance} {currency}:</span>
              <strong className="text-rose-400 font-mono">
                {((startingBalance * defaultRisk) / 100).toFixed(2)} {currency}
              </strong>
            </div>
          </div>
        )}

        {/* Step 4: Max Daily Loss */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Set Maximum Daily Loss Limit</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Circuit breaker protection: if daily loss exceeds this amount, stop trading to avoid tilt and emotional spiraling.
            </p>

            <div className="pt-2">
              <label className="text-[11px] text-gray-400 block mb-1">Max Daily Loss ({currency})</label>
              <input
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121622] border border-[#1F2638] rounded-2xl px-4 py-3 text-2xl font-mono font-bold text-rose-400 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        )}

        {/* Step 5: Primary Strategy */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Select Primary Trading Model</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Choose your core framework. You can add unlimited custom strategies and setups later.
            </p>

            <div className="space-y-2 pt-2">
              {strategies.map(strat => (
                <div
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat.name)}
                  className={`p-3.5 rounded-2xl border cursor-pointer select-none transition ${
                    selectedStrategy === strat.name
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-[#121622] border-[#1F2638] text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{strat.name}</span>
                    {selectedStrategy === strat.name && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">{strat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Pre-Trade Checklist Confirmation */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Pre-Trade Execution Protocol</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Review your default pre-flight checklist. The discipline engine uses this to measure your execution consistency.
            </p>

            <div className="bg-[#121622] p-3 rounded-2xl border border-[#1F2638] space-y-1.5 max-h-56 overflow-y-auto">
              {checklist.slice(0, 6).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 text-xs text-gray-300 py-1 border-b border-[#1A2234] last:border-none">
                  <span className="w-4 h-4 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                    ✓
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1C2336]">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1E2538] text-xs font-semibold text-gray-300 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
        >
          <span>{step === totalSteps ? 'Launch Terminal' : 'Continue'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
