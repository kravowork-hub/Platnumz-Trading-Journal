import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, BatteryCharging, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getPwaBuilderUrl } from '../utils/pwaBuilder';

interface AndroidStatusBarProps {
  appName?: string;
  isLocked?: boolean;
  onOpenApkModal?: () => void;
  onOpenPwaBuilder?: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ 
  isLocked, 
  onOpenApkModal,
  onOpenPwaBuilder 
}) => {
  const isOnline = useOnlineStatus();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#090B10]/95 backdrop-blur-md px-4 py-1.5 flex items-center justify-between text-xs text-gray-400 select-none border-b border-[#1E2330]/40">
      {/* Time & Terminal Mode & APK Badge */}
      <div className="flex items-center gap-2 font-mono font-medium text-gray-200">
        <span>{time || '09:41'}</span>
        <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
          TERMINAL
        </span>
        {onOpenApkModal && (
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenApkModal}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-1.5 py-0.5 rounded shadow-sm transition active:scale-95"
              title="Install or Build APK"
            >
              <Download className="w-2.5 h-2.5 stroke-[3]" />
              <span>APK</span>
            </button>
            {onOpenPwaBuilder ? (
              <button
                onClick={onOpenPwaBuilder}
                className="flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-1.5 py-0.5 rounded shadow-sm transition active:scale-95"
                title="Run on Microsoft PWABuilder"
              >
                <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>PWA Builder</span>
              </button>
            ) : (
              <a
                href={getPwaBuilderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-1.5 py-0.5 rounded shadow-sm transition active:scale-95"
                title="Run automatically on Microsoft PWABuilder"
              >
                <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>PWA Builder</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Status Icons */}
      <div className="flex items-center gap-2.5">
        {/* Offline indicator */}
        {!isOnline ? (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
            <WifiOff className="w-3 h-3" />
            <span className="text-[10px] font-medium">Offline (Room DB)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold text-gray-400">5G</span>
          </div>
        )}

        {/* Security badge */}
        {!isLocked && (
          <span title="Local SQLite/Room Encrypted" className="text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        )}

        {/* Battery */}
        <div className="flex items-center gap-1 text-gray-300">
          <span className="text-[10px] font-mono">98%</span>
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
