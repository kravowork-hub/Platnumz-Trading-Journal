import React, { useState, useRef } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { getPwaBuilderUrl } from '../utils/pwaBuilder';

interface SettingsViewProps {
  settings: AccountSettings;
  onUpdateSettings: (settings: AccountSettings) => void;
  onOpenReportModal: () => void;
  onOpenAndroidExportModal: () => void;
  onOpenAiLabModal: () => void;
  onDataReset: () => void;
  onOpenPwaBuilder?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenReportModal,
  onOpenAndroidExportModal,
  onOpenAiLabModal,
  onDataReset,
  onOpenPwaBuilder,
}) => {
  const [localSettings, setLocalSettings] = useState<AccountSettings>(settings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
                Android Build v1.2.0 • Material 3
              </span>
            </div>
          </div>
          <PWAInstallButton />
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

      {/* App Manifest & PWA Installation Standards */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Web App Manifest & Android WebAPK Info
          </h3>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono font-semibold">
            VALIDATED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-[#0C0F17] p-2.5 rounded-xl border border-[#1C2336]">
            <span className="text-[9px] text-gray-500 font-sans block">Display Mode</span>
            <span className="text-white font-bold">standalone</span>
          </div>
          <div className="bg-[#0C0F17] p-2.5 rounded-xl border border-[#1C2336]">
            <span className="text-[9px] text-gray-500 font-sans block">Orientation</span>
            <span className="text-white font-bold">portrait</span>
          </div>
          <div className="bg-[#0C0F17] p-2.5 rounded-xl border border-[#1C2336]">
            <span className="text-[9px] text-gray-500 font-sans block">Theme / Status Bar</span>
            <span className="text-emerald-400 font-bold">#090B10</span>
          </div>
          <div className="bg-[#0C0F17] p-2.5 rounded-xl border border-[#1C2336]">
            <span className="text-[9px] text-gray-500 font-sans block">Shortcuts Attached</span>
            <span className="text-blue-400 font-bold">3 Actions (Trade, Analytics, Cal)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-gray-400 text-[11px]">Specification: W3C Web App Manifest v1</span>
          <a
            href="/manifest.webmanifest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline text-[11px] font-mono flex items-center gap-1"
          >
            View Raw manifest.webmanifest ↗
          </a>
        </div>
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

      {/* Advanced Modules: Android APK & Studio Hub, AI Chart Lab */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          Android APK & Native Studio Hub
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={onOpenAndroidExportModal}
            className="p-3 bg-gradient-to-br from-[#151D2D] to-[#121724] hover:border-emerald-500 rounded-xl border border-emerald-900/40 flex items-center gap-2.5 text-left transition shadow-sm"
          >
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white flex items-center gap-1">
                Install / Build APK
                <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-bold">APK</span>
              </span>
              <span className="text-[10px] text-gray-400">WebAPK, Capacitor, Kotlin Studio</span>
            </div>
          </button>

          <button
            onClick={onOpenAiLabModal}
            className="p-3 bg-gradient-to-br from-[#1C1728] to-[#121624] hover:border-purple-500 rounded-xl border border-[#2A233D] flex items-center gap-2.5 text-left transition"
          >
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">AI Chart Lab</span>
              <span className="text-[10px] text-gray-400">Structure / FVG Preview</span>
            </div>
          </button>
        </div>

        {/* 1-Click PWABuilder Online Package Generator */}
        <button
          onClick={onOpenPwaBuilder}
          className="w-full text-left p-3 bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-900/60 hover:from-blue-900/50 hover:to-indigo-900/50 border border-blue-800/40 hover:border-blue-600/60 rounded-xl flex items-center justify-between text-xs text-white transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-100 flex items-center gap-1.5">
                Run on Microsoft PWABuilder
                <span className="text-[9px] bg-blue-600/40 text-blue-300 px-1 rounded font-mono font-bold">.APK / .AAB</span>
              </span>
              <span className="text-[10px] text-gray-400">Auto-audit manifest & generate signed package in 1-click</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/50 group-hover:bg-blue-600 group-hover:text-white transition">
            LAUNCH ↗
          </span>
        </button>
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

      {/* Danger Zone: Reset to Defaults */}
      <div className="pt-4 text-center">
        <button
          onClick={async () => {
            if (confirm('Reset database to clean initial sample trades and default settings?')) {
              await kravoDB.resetToDefaults();
              onDataReset();
              showToast('Database reset to defaults');
            }
          }}
          className="text-xs text-rose-500/70 hover:text-rose-400 hover:underline"
        >
          Reset Database to Initial Sample State
        </button>
      </div>

    </div>
  );
};
