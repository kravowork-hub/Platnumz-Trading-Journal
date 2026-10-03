import React, { useState } from 'react';
import { 
  Trade, 
  Emotion, 
  PostTradeReview,
  AccountSettings 
} from '../types';
import { 
  formatCurrency, 
  formatR, 
  formatPercentage 
} from '../utils/calculations';
import { 
  X, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Camera, 
  Maximize2, 
  Star, 
  Smile, 
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { Haptics } from '../utils/haptics';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  onUpdateReview: (tradeId: string, review: PostTradeReview) => void;
  settings: AccountSettings;
  onOpenImageViewer: (imageUrl: string, caption?: string) => void;
}

const ALL_EMOTIONS: Emotion[] = [
  'Calm',
  'Confident',
  'Fearful',
  'FOMO',
  'Greedy',
  'Impatient',
  'Frustrated',
  'Revenge',
  'Hesitant',
  'Overconfident',
];

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateReview,
  settings,
  onOpenImageViewer,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVIEW' | 'CHARTS'>('OVERVIEW');

  // Local post trade review state
  const [whyTrade, setWhyTrade] = useState(trade?.review?.whyTrade || '');
  const [thesis, setThesis] = useState(trade?.review?.thesis || '');
  const [followedStrategy, setFollowedStrategy] = useState(trade?.review?.followedStrategy ?? true);
  const [followedRules, setFollowedRules] = useState(trade?.review?.followedRules ?? true);
  const [whatWentWell, setWhatWentWell] = useState(trade?.review?.whatWentWell || '');
  const [whatWentWrong, setWhatWentWrong] = useState(trade?.review?.whatWentWrong || '');
  const [doDifferently, setDoDifferently] = useState(trade?.review?.doDifferently || '');
  const [emotions, setEmotions] = useState<Emotion[]>(trade?.review?.emotions || ['Calm']);
  const [confidenceRating, setConfidenceRating] = useState<number>(trade?.review?.confidenceRating || 5);
  const [stressRating, setStressRating] = useState<number>(trade?.review?.stressRating || 1);
  const [focusRating, setFocusRating] = useState<number>(trade?.review?.focusRating || 5);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !trade) return null;

  const toggleEmotion = (emo: Emotion) => {
    setEmotions(prev => 
      prev.includes(emo) ? prev.filter(e => e !== emo) : [...prev, emo]
    );
  };

  const handleSaveReview = () => {
    if (!trade) return;
    const updatedReview: PostTradeReview = {
      whyTrade,
      thesis,
      followedStrategy,
      followedRules,
      whatWentWell,
      whatWentWrong,
      doDifferently,
      emotions,
      confidenceRating,
      stressRating,
      focusRating,
      completedAt: new Date().toISOString(),
    };

    onUpdateReview(trade.id, updatedReview);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const isWin = trade.status === 'WIN' || (trade.pnl ?? 0) > 0;
  const isLoss = trade.status === 'LOSS' || (trade.pnl ?? 0) < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-xl bg-[#0F121C] rounded-t-3xl sm:rounded-2xl border border-[#20273A] shadow-2xl flex flex-col max-h-[92vh] text-white">
        
        {/* Top Header */}
        <div className="p-4 border-b border-[#1C2234] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${
              trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {trade.direction === 'LONG' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">Trade #{trade.tradeNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isWin ? 'bg-emerald-500/20 text-emerald-300' : isLoss ? 'bg-rose-500/20 text-rose-300' : 'bg-gray-800 text-gray-300'
                }`}>
                  {trade.status}
                </span>
              </div>
              <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                {trade.instrument}
                <span className="text-xs font-sans font-normal text-gray-400">
                  {trade.session} • {trade.timeframe}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(trade)}
              className="p-2 rounded-xl bg-[#171D2D] hover:bg-[#20273D] text-gray-300 transition"
              title="Edit Trade"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                Haptics.light();
                setShowDeleteConfirm(prev => !prev);
              }}
              className={`p-2 rounded-xl transition ${
                showDeleteConfirm 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                  : 'bg-[#171D2D] hover:bg-rose-950/60 hover:text-rose-400 text-gray-400'
              }`}
              title="Delete Trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#171D2D] hover:bg-[#20273D] text-gray-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Native Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="bg-rose-950/90 border-b border-rose-800/80 p-3 px-4 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold text-rose-100">Permanently delete Trade #{trade.tradeNumber}?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  Haptics.light();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#151926] hover:bg-[#20273D] text-gray-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  Haptics.warning();
                  onDelete(trade.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation: Overview | Post-Trade Review | Charts */}
        <div className="flex border-b border-[#1C2234] bg-[#0A0D15] px-4">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'OVERVIEW' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'REVIEW' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Post-Trade Review</span>
            {trade.review?.whyTrade && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('CHARTS')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'CHARTS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Charts ({trade.screenshots?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Outcome KPI Banner */}
            <div className="bg-[#141926] p-4 rounded-2xl border border-[#20283D] grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Realized P&L</span>
                <span className={`text-lg font-bold font-mono ${
                  (trade.pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatCurrency(trade.pnl ?? 0, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">R Multiple</span>
                <span className={`text-lg font-bold font-mono ${
                  (trade.realizedR ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatR(trade.realizedR)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Planned R:R</span>
                <span className="text-lg font-bold font-mono text-gray-200">
                  1:{trade.plannedRR}
                </span>
              </div>
            </div>

            {/* Execution Details Table */}
            <div className="bg-[#141926] p-4 rounded-2xl border border-[#20283D] space-y-2.5">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Execution Matrix
              </h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-gray-400">Entry Price:</div>
                <div className="font-mono text-right text-gray-200">{trade.entryPrice}</div>

                <div className="text-gray-400">Stop Loss:</div>
                <div className="font-mono text-right text-rose-300">{trade.stopLossPrice}</div>

                <div className="text-gray-400">Take Profit:</div>
                <div className="font-mono text-right text-emerald-300">{trade.takeProfitPrice}</div>

                {trade.exitPrice && (
                  <>
                    <div className="text-gray-400">Exit Price:</div>
                    <div className="font-mono text-right text-gray-200">{trade.exitPrice}</div>
                  </>
                )}

                <div className="text-gray-400">Position Size:</div>
                <div className="font-mono text-right text-gray-200">{trade.positionSize} lots</div>

                <div className="text-gray-400">Risk Accounted:</div>
                <div className="font-mono text-right text-gray-200">
                  {trade.riskPercentage}% (${trade.dollarRisk})
                </div>

                <div className="text-gray-400">Timestamp:</div>
                <div className="font-mono text-right text-gray-300">
                  {trade.entryDate} {trade.entryTime}
                </div>
              </div>
            </div>

            {/* Strategy & Model */}
            <div className="bg-[#141926] p-4 rounded-2xl border border-[#20283D] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block">Strategy & Setup Model</span>
                <span className="text-sm font-semibold text-emerald-400">{trade.strategy}</span>
                <span className="text-xs text-gray-300 block font-mono">Setup: {trade.setup}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Discipline Status</span>
                <span className="text-xs font-semibold text-gray-200 flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {trade.checklist?.filter(c => c.checked).length || 0}/{trade.checklist?.length || 0} checklist
                </span>
              </div>
            </div>

            {/* Mistakes & Notes */}
            {trade.mistakes && trade.mistakes.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-800/40 p-3 rounded-2xl">
                <span className="text-[11px] font-semibold text-rose-300 block mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Mistakes Tagged ({trade.mistakes.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {trade.mistakes.map(m => (
                    <span key={m} className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 text-[10px] font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {trade.notes && (
              <div className="bg-[#141926] p-4 rounded-2xl border border-[#20283D]">
                <span className="text-[11px] font-semibold text-gray-400 block mb-1">Trade Notes</span>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{trade.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: POST-TRADE REVIEW QUESTIONNAIRE */}
        {activeTab === 'REVIEW' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="bg-emerald-950/20 border border-emerald-800/30 p-3 rounded-2xl text-xs text-emerald-300">
              Honest post-trade reviews are the foundation of trader development. Review every trade regardless of profit or loss.
            </div>

            {/* Questions */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  1. Why did I take this trade?
                </label>
                <textarea
                  value={whyTrade}
                  onChange={(e) => setWhyTrade(e.target.value)}
                  placeholder="Key technical triggers, market condition, HTF context..."
                  rows={2}
                  className="w-full bg-[#141926] border border-[#20283D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  2. What was my trade thesis?
                </label>
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Expected price delivery target, liquidity pool drawn to..."
                  rows={2}
                  className="w-full bg-[#141926] border border-[#20283D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#141926] p-3 rounded-xl border border-[#20283D]">
                  <label className="text-[11px] font-medium text-gray-300 block mb-2">
                    Did I follow my strategy?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFollowedStrategy(true)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        followedStrategy ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-[#0E121B] text-gray-400 border-[#1E2538]'
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowedStrategy(false)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        !followedStrategy ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-[#0E121B] text-gray-400 border-[#1E2538]'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                <div className="bg-[#141926] p-3 rounded-xl border border-[#20283D]">
                  <label className="text-[11px] font-medium text-gray-300 block mb-2">
                    Did I follow my rules?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFollowedRules(true)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        followedRules ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-[#0E121B] text-gray-400 border-[#1E2538]'
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowedRules(false)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        !followedRules ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-[#0E121B] text-gray-400 border-[#1E2538]'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  3. What went well?
                </label>
                <textarea
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="Patience, execution speed, disciplined stop loss..."
                  rows={2}
                  className="w-full bg-[#141926] border border-[#20283D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  4. What went wrong?
                </label>
                <textarea
                  value={whatWentWrong}
                  onChange={(e) => setWhatWentWrong(e.target.value)}
                  placeholder="Hesitation, moved stop, entered before confirmation..."
                  rows={2}
                  className="w-full bg-[#141926] border border-[#20283D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-300 block mb-1">
                  5. What could I have done differently?
                </label>
                <textarea
                  value={doDifferently}
                  onChange={(e) => setDoDifferently(e.target.value)}
                  placeholder="Future adjustment rule for identical market setup..."
                  rows={2}
                  className="w-full bg-[#141926] border border-[#20283D] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Psychological Emotions */}
              <div className="bg-[#141926] p-3 rounded-2xl border border-[#20283D]">
                <label className="text-xs font-semibold text-gray-200 block mb-2">
                  Emotions Experienced During Trade
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_EMOTIONS.map(emo => {
                    const active = emotions.includes(emo);
                    return (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => toggleEmotion(emo)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          active
                            ? 'bg-emerald-500 text-black font-semibold'
                            : 'bg-[#0E121B] text-gray-400 border border-[#1E2538] hover:text-white'
                        }`}
                      >
                        {emo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-3 gap-2 bg-[#141926] p-3 rounded-2xl border border-[#20283D]">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Confidence (1-5)</label>
                  <select
                    value={confidenceRating}
                    onChange={(e) => setConfidenceRating(parseInt(e.target.value))}
                    className="w-full bg-[#0D1018] border border-[#1F2638] rounded-lg p-1.5 text-xs font-mono text-white"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Stress (1-5)</label>
                  <select
                    value={stressRating}
                    onChange={(e) => setStressRating(parseInt(e.target.value))}
                    className="w-full bg-[#0D1018] border border-[#1F2638] rounded-lg p-1.5 text-xs font-mono text-white"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Level</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Focus (1-5)</label>
                  <select
                    value={focusRating}
                    onChange={(e) => setFocusRating(parseInt(e.target.value))}
                    className="w-full bg-[#0D1018] border border-[#1F2638] rounded-lg p-1.5 text-xs font-mono text-white"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Level</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Save Review Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveReview}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Post-Trade Review
              </button>
              {isSavedToast && (
                <div className="text-center text-xs text-emerald-400 font-medium mt-1.5 animate-pulse">
                  ✓ Post-trade review saved to Room Database!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: CHARTS GALLERY */}
        {activeTab === 'CHARTS' && (
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {(!trade.screenshots || trade.screenshots.length === 0) ? (
              <div className="text-center py-12 text-gray-500">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No screenshots attached for this trade.</p>
                <button
                  onClick={() => onEdit(trade)}
                  className="mt-3 text-xs text-emerald-400 hover:underline"
                >
                  Edit trade to add charts
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {trade.screenshots.map(ss => (
                  <div
                    key={ss.id}
                    className="bg-[#141926] rounded-2xl border border-[#20283D] overflow-hidden group"
                  >
                    <div className="p-2.5 flex items-center justify-between text-xs text-gray-300 border-b border-[#20283D]">
                      <span className="font-mono font-bold text-emerald-400">{ss.type} CHART</span>
                      <button
                        onClick={() => onOpenImageViewer(ss.url, ss.caption || `${ss.type} Chart`)}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Pinch & Zoom
                      </button>
                    </div>
                    <div
                      onClick={() => onOpenImageViewer(ss.url, ss.caption || `${ss.type} Chart`)}
                      className="cursor-pointer overflow-hidden bg-black max-h-64 flex items-center justify-center"
                    >
                      <img
                        src={ss.url}
                        alt={ss.type}
                        className="w-full object-contain max-h-64 hover:scale-102 transition duration-300"
                      />
                    </div>
                    {ss.caption && (
                      <div className="p-2.5 text-xs text-gray-400 italic">
                        {ss.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-[#1C2234] bg-[#0A0D15] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              Haptics.light();
              setShowDeleteConfirm(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/40 transition flex items-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Trade</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(trade)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#171D2D] hover:bg-[#20273D] text-emerald-400 border border-emerald-900/40 transition flex items-center gap-1.5 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#171D2D] hover:bg-[#20273D] text-gray-300 transition active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
