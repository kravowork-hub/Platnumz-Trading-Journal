import React from 'react';
import { Trade, AccountSettings } from '../types';
import { calculatePerformanceStats, formatCurrency, formatR } from '../utils/calculations';
import { X, Printer, Download, FileText } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  settings: AccountSettings;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  trades,
  settings,
}) => {
  if (!isOpen) return null;

  const stats = calculatePerformanceStats(trades, settings);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0F121C] rounded-3xl border border-[#20273A] shadow-2xl p-6 text-white space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2234] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Audited Performance Report
              </h2>
              <span className="text-[10px] text-gray-400">Printable Executive Trading Audit</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#181D2A] text-gray-400 flex items-center justify-center hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Preview */}
        <div className="bg-[#121622] p-5 rounded-2xl border border-[#1E2538] space-y-4 overflow-y-auto flex-1 font-sans text-xs">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-[#1E2538] pb-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-emerald-400">
                {settings.appName.toUpperCase()}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Trader: {settings.traderName}</p>
            </div>
            <div className="text-right text-gray-400 text-[11px] font-mono">
              <div>Report Date: {new Date().toLocaleDateString()}</div>
              <div>Database: Encrypted Room SQLite</div>
            </div>
          </div>

          {/* Key Executive Metrics Summary */}
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="bg-[#0C0F17] p-2.5 rounded-xl">
              <span className="text-[10px] text-gray-400 block font-sans">Net P&L</span>
              <span className={`text-base font-bold ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(stats.netPnl, settings.currency)}
              </span>
            </div>

            <div className="bg-[#0C0F17] p-2.5 rounded-xl">
              <span className="text-[10px] text-gray-400 block font-sans">Win Rate</span>
              <span className="text-base font-bold text-white">{stats.winRate}%</span>
            </div>

            <div className="bg-[#0C0F17] p-2.5 rounded-xl">
              <span className="text-[10px] text-gray-400 block font-sans">Profit Factor</span>
              <span className="text-base font-bold text-white">{stats.profitFactor}</span>
            </div>

            <div className="bg-[#0C0F17] p-2.5 rounded-xl">
              <span className="text-[10px] text-gray-400 block font-sans">Discipline Score</span>
              <span className="text-base font-bold text-emerald-400">{stats.disciplineScore}/100</span>
            </div>
          </div>

          {/* Detailed Statistics Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">
              Audit Statistics
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-b border-[#1E2538] py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sample Trades:</span>
                <span className="font-mono text-white">{stats.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Winning Trades:</span>
                <span className="font-mono text-emerald-400">{stats.winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Losing Trades:</span>
                <span className="font-mono text-rose-400">{stats.losingTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Realized R:</span>
                <span className="font-mono text-white">{formatR(stats.totalR)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average R:</span>
                <span className="font-mono text-white">{formatR(stats.averageR)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Peak-to-Trough Drawdown:</span>
                <span className="font-mono text-rose-400">{stats.maxDrawdownPercentage}% (-{formatCurrency(stats.maxDrawdownDollar, settings.currency)})</span>
              </div>
            </div>
          </div>

          {/* Recent Trades Snippet */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">
              Recent Audit Log
            </h3>
            <table className="w-full text-left text-[11px] font-mono">
              <thead>
                <tr className="text-gray-400 border-b border-[#1E2538]">
                  <th className="py-1.5">Date</th>
                  <th className="py-1.5">Pair</th>
                  <th className="py-1.5">Dir</th>
                  <th className="py-1.5">Strategy</th>
                  <th className="py-1.5 text-right">R</th>
                  <th className="py-1.5 text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171D2D]">
                {trades.slice(0, 8).map(t => (
                  <tr key={t.id}>
                    <td className="py-1 text-gray-400">{t.entryDate}</td>
                    <td className="py-1 text-white font-bold">{t.instrument}</td>
                    <td className="py-1">{t.direction}</td>
                    <td className="py-1 text-gray-300 font-sans truncate max-w-[120px]">{t.strategy}</td>
                    <td className={`py-1 text-right ${(t.realizedR ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatR(t.realizedR)}
                    </td>
                    <td className={`py-1 text-right ${(t.pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(t.pnl ?? 0, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};
