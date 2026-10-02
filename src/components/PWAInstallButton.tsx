import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, ExternalLink, Check, Laptop, ShieldCheck } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return (
      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40 flex items-center gap-1">
        <Check className="w-3 h-3 stroke-[3]" />
        Installed
      </span>
    );
  }

  // When Chrome's native beforeinstallprompt has fired and is ready
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300 transition active:scale-95"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        Install App
      </button>
    );
  }

  // Fallback button with guided installation modal (e.g. inside iframes, desktop Chrome, or iOS)
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="flex items-center gap-1.5 rounded-xl bg-[#141A28] border border-[#20293D] px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-[#1C2438] transition active:scale-95"
        title="Install Kravo on Chrome or Mobile"
      >
        <Download className="w-3 h-3" />
        Install
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0F121C] p-5 shadow-2xl border border-[#222B3E] text-white space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Install Kravo on Chrome</h3>
                  <span className="text-[10px] text-gray-400">Desktop & Mobile PWA Installation Guide</span>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note on Iframe vs Full Tab */}
            <div className="bg-[#141824] p-3 rounded-xl border border-[#1E2538] space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Preview Iframe Notice
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Google Chrome security blocks the native 1-click install prompt inside embedded preview iframes. To install with Chrome's native prompt:
              </p>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open App in Full Browser Tab
              </a>
            </div>

            {/* Step by step for Chrome Desktop and Mobile */}
            <div className="space-y-2 text-xs">
              <div className="bg-[#0A0D14] p-3 rounded-xl border border-[#1A2234] space-y-1">
                <span className="font-bold text-gray-200 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-blue-400" />
                  On Google Chrome Desktop:
                </span>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Look at the right side of Chrome's address bar (URL bar). Click the <strong>Install</strong> icon (desktop monitor with down arrow) or click <strong>Chrome Menu (⋮) → Save and Share → Install Kravo</strong>.
                </p>
              </div>

              <div className="bg-[#0A0D14] p-3 rounded-xl border border-[#1A2234] space-y-1">
                <span className="font-bold text-gray-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  On Chrome Android:
                </span>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Tap Chrome's 3-dot menu <strong>(⋮)</strong> in the top right, then select <strong>Install app</strong> or <strong>Add to Home screen</strong>. Android will mint a native WebAPK.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#1C2336] hover:bg-[#252E46] text-xs font-bold text-emerald-400 transition"
            >
              Close Guide
            </button>

          </div>
        </div>
      )}
    </>
  );
};
