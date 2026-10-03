import React, { useState, useEffect, useRef } from 'react';
import { AccountSettings, Trade } from '../types';
import { kravoDB } from '../db/kravo_db';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Lock, 
  Key, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Bell, 
  Smartphone, 
  Sparkles, 
  Code,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { Haptics } from '../utils/haptics';

interface SettingsViewProps {
  settings: AccountSettings;
  onUpdateSettings: (settings: AccountSettings) => void;
  onOpenReportModal: () => void;
  onOpenAiLabModal: () => void;
  onDataReset: () => void;
  onOpenResetModal?: () => void;
  onLoadDemoData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenReportModal,
  onOpenAiLabModal,
  onDataReset,
  onOpenResetModal,
  onLoadDemoData,
}) => {
  const [localSettings, setLocalSettings] = useState<AccountSettings>(settings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleThemeChange = (mode: 'dark' | 'light') => {
    const updated: AccountSettings = { ...localSettings, themeMode: mode };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    Haptics.light();
    showToast(mode === 'light' ? 'Daylight Light mode activated' : 'Night Dark mode activated');
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    showToast('Settings saved to Room Database!');
  };

  // Export Trades to CSV
  const handleExportCSV = async () => {
    const csvContent = await kravoDB.exportTradesToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kravo_trades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Trades exported as CSV file');
  };

  // Full JSON Backup
  const handleBackupJSON = async () => {
    const jsonContent = await kravoDB.generateFullBackupJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kravo_room_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full Room Database backup downloaded');
  };

  // Restore from JSON
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await kravoDB.restoreFromBackupJSON(content);
      if (success) {
        showToast('Database successfully restored!');
        onDataReset();
      } else {
        alert('Failed to restore backup. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-28 px-3 sm:px-4 max-w-2xl mx-auto pt-2 text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* App Branding & Identity */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0E121B] rounded-[10px] flex items-center justify-center font-bold text-emerald-400 font-mono">
                K
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{localSettings.appName}</h2>
              <span className="text-[10px] text-gray-400 font-mono">
                Offline Vault • Material 3
              </span>
            </div>
          </div>

          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={() => handleThemeChange(localSettings.themeMode === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C0F17] hover:bg-[#171D2D] border border-[#1E2538] text-xs font-medium transition active:scale-95 text-gray-200"
            title="Toggle Light / Dark mode"
          >
            {localSettings.themeMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold">Dark</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">App Display Name</label>
            <input
              type="text"
              value={localSettings.appName}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, appName: e.target.value }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Trader Name / Callout</label>
            <input
              type="text"
              value={localSettings.traderName}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, traderName: e.target.value }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Theme & Display Appearance Selection */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Theme & Display Mode</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
            {localSettings.themeMode === 'light' ? 'DAYLIGHT ACTIVE' : 'NIGHT MODE ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Dark / Night Mode Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`theme-preview-dark p-3.5 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden active:scale-98 ${
              localSettings.themeMode !== 'light'
                ? 'bg-gradient-to-br from-[#101420] to-[#090B10] border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-[#0C0F17] border-[#1E2538] hover:border-gray-600 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
                <Moon className="w-4 h-4" />
              </div>
              {localSettings.themeMode !== 'light' && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Night / Dark Mode</span>
              <span className="text-[10px] text-gray-400 leading-snug block mt-0.5">
                OLED terminal black, high-contrast neon data, easier on eyes in dark rooms.
              </span>
            </div>
          </button>

          {/* Light / Daylight Mode Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden active:scale-98 ${
              localSettings.themeMode === 'light'
                ? 'bg-gradient-to-br from-white to-slate-100 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-[#0C0F17] border-[#1E2538] hover:border-gray-600 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                <Sun className="w-4 h-4" />
              </div>
              {localSettings.themeMode === 'light' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Daylight / Light Mode</span>
              <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">
                Crisp financial paper layout, clean white cards, high sunlight visibility.
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Account & Currency Settings */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Capital & Currency Parameters
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Account Currency</label>
            <select
              value={localSettings.currency}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, currency: e.target.value as any }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl px-3 py-2 text-xs text-white font-mono"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="ZAR">ZAR (R)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Starting Balance</label>
            <input
              type="number"
              value={localSettings.startingBalance}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, startingBalance: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl px-3 py-2 text-xs font-mono text-white"
            />
          </div>
        </div>

        {/* Risk Limits */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Default Risk %</label>
            <input
              type="number"
              step="0.1"
              value={localSettings.defaultRiskPercentage}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultRiskPercentage: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-2 text-xs font-mono text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Max Risk / Trade %</label>
            <input
              type="number"
              step="0.1"
              value={localSettings.maxRiskPerTrade}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, maxRiskPerTrade: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-2 text-xs font-mono text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Max Daily Loss ($)</label>
            <input
              type="number"
              value={localSettings.maxDailyLoss}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, maxDailyLoss: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-2 text-xs font-mono text-white"
            />
          </div>
        </div>
      </div>

      {/* Security & Biometrics */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          Android App Security & Locks
        </h3>

        <div className="flex items-center justify-between py-1 border-b border-[#1A2234]">
          <div>
            <span className="text-xs font-semibold text-white block">PIN Code Lock</span>
            <span className="text-[10px] text-gray-400">Require 4-digit PIN on app launch</span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.pinEnabled}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, pinEnabled: e.target.checked }))}
            className="w-4 h-4 rounded text-emerald-500 bg-[#0C0F17] border-[#222B40]"
          />
        </div>

        {localSettings.pinEnabled && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">4-Digit PIN Code</label>
            <input
              type="password"
              maxLength={4}
              value={localSettings.pinCode}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, pinCode: e.target.value }))}
              className="w-32 bg-[#0C0F17] border border-[#1E2538] rounded-xl px-3 py-1.5 text-center text-sm font-mono tracking-widest text-emerald-400"
            />
          </div>
        )}

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-semibold text-white block">Biometric Fingerprint / Face Unlock</span>
            <span className="text-[10px] text-gray-400">Web Authentication API (Android BiometricPrompt)</span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.biometricEnabled}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, biometricEnabled: e.target.checked }))}
            className="w-4 h-4 rounded text-emerald-500 bg-[#0C0F17] border-[#222B40]"
          />
        </div>

        {localSettings.biometricEnabled && (
          <div className="pt-1">
            <button
              type="button"
              onClick={async () => {
                const { authenticateWithBiometrics } = await import('../utils/webAuthn');
                showToast('Prompting WebAuthn Biometric Scanner...');
                const res = await authenticateWithBiometrics('Test Kravo Biometric Verification');
                if (res.success) {
                  showToast('✓ Biometric Identity Verified Successfully!');
                } else {
                  showToast(res.error || 'Biometric verification failed');
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#171D2D] hover:bg-[#222B40] text-emerald-400 text-xs font-semibold border border-emerald-800/40 flex items-center justify-center gap-2 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              Test Biometric Prompt (Fingerprint / Face ID)
            </button>
          </div>
        )}
      </div>

      {/* Data, Backup & Report Export */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Download className="w-4 h-4 text-emerald-400" />
          Data Backup & Reports
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleExportCSV}
            className="p-3 bg-[#171D2D] hover:bg-[#20273D] rounded-xl border border-[#232B40] flex items-center gap-2 text-left transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">Export CSV</span>
              <span className="text-[10px] text-gray-400">Trades & Metrics</span>
            </div>
          </button>

          <button
            onClick={handleBackupJSON}
            className="p-3 bg-[#171D2D] hover:bg-[#20273D] rounded-xl border border-[#232B40] flex items-center gap-2 text-left transition"
          >
            <Download className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">Backup Room DB</span>
              <span className="text-[10px] text-gray-400">Complete JSON File</span>
            </div>
          </button>

          <label className="p-3 bg-[#171D2D] hover:bg-[#20273D] rounded-xl border border-[#232B40] flex items-center gap-2 text-left transition cursor-pointer">
            <Upload className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">Restore Backup</span>
              <span className="text-[10px] text-gray-400">Load JSON file</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileRestore}
            />
          </label>

          <button
            onClick={onOpenReportModal}
            className="p-3 bg-[#171D2D] hover:bg-[#20273D] rounded-xl border border-[#232B40] flex items-center gap-2 text-left transition"
          >
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">Export Report</span>
              <span className="text-[10px] text-gray-400">Printable PDF format</span>
            </div>
          </button>
        </div>
      </div>

      {/* Experimental AI Lab */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Experimental Tools & AI Lab
        </h3>

        <button
          onClick={onOpenAiLabModal}
          className="w-full p-3 bg-gradient-to-br from-[#1C1728] to-[#121624] hover:border-purple-500 rounded-xl border border-[#2A233D] flex items-center justify-between text-left transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-white text-xs group-hover:text-purple-300 transition">
                AI Chart Lab
              </span>
              <span className="text-[10px] text-gray-400">Structure / FVG Visualizer Preview</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
            OPEN
          </span>
        </button>
      </div>

      {/* Offline Database & Stats Management */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-rose-400" />
            Stats & Local Storage Management
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            100% Offline Vault
          </span>
        </h3>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          Kravo operates completely offline using browser IndexedDB and Room architecture. All data resides on your physical device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {onOpenResetModal && (
            <button
              onClick={onOpenResetModal}
              className="py-3 px-4 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white rounded-xl border border-rose-800/50 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset All Stats to Zero</span>
            </button>
          )}

          {onLoadDemoData && (
            <button
              onClick={onLoadDemoData}
              className="py-3 px-4 bg-[#181E2E] hover:bg-[#20283C] text-gray-300 hover:text-emerald-300 rounded-xl border border-[#232B40] text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Load Demo Sample Trades</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Settings Bar */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/25 active:scale-98"
        >
          Save All Settings
        </button>
      </div>

    </div>
  );
};
