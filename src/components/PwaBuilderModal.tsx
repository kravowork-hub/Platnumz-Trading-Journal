import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Smartphone, 
  AlertTriangle,
  FolderCode,
  Zap,
  Globe,
  FileCode2
} from 'lucide-react';
import { getPublicPwaUrl, getPwaBuilderUrl } from '../utils/pwaBuilder';
import { Haptics } from '../utils/haptics';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PwaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaBuilderModal: React.FC<PwaBuilderModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<'FIX_PWABUILDER' | 'WEBAPK' | 'ANDROID_STUDIO' | 'VERCEL_HOST'>('FIX_PWABUILDER');
  const appUrl = getPublicPwaUrl();
  const reportCardUrl = getPwaBuilderUrl();
  const { install, isInstallable } = usePWAInstall();

  const manifestJsonString = JSON.stringify({
    name: "Kravo Trading Journal",
    short_name: "Kravo",
    description: "Professional Android trading journal and performance analytics terminal.",
    start_url: appUrl,
    scope: `${appUrl}/`,
    display: "standalone",
    background_color: "#090B10",
    theme_color: "#090B10",
    icons: [
      {
        src: `${appUrl}/pwa-192x192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: `${appUrl}/pwa-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  }, null, 2);

  const handleCopyUrl = async () => {
    Haptics.light();
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {}
  };

  const handleCopyManifestJson = async () => {
    Haptics.light();
    try {
      await navigator.clipboard.writeText(manifestJsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0E121C] rounded-3xl border border-[#222B42] shadow-2xl p-5 text-white space-y-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1D253B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                PWABuilder "Missing Name" Fix
              </h2>
              <span className="text-[10px] text-gray-400">Unlock "Package For Stores" or Install directly</span>
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

        {/* What the screenshot means */}
        <div className="bg-[#141926] border border-[#232D48] rounded-2xl p-3 text-xs text-gray-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
            <span>What your screenshot showed:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-300">
            PWABuilder said: <em>"We did not find a manifest before our tests timed out so we created a manifest for you."</em> 
            The grey <strong>"Package For Stores"</strong> button is locked until a name and description are added.
          </p>
        </div>

        {/* Solution Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-[#141824] p-1 rounded-2xl border border-[#1E2538] text-[10px] font-semibold text-center">
          <button
            onClick={() => {
              Haptics.light();
              setSelectedSolution('FIX_PWABUILDER');
            }}
            className={`py-2 px-1 rounded-xl transition ${
              selectedSolution === 'FIX_PWABUILDER' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            1. Fix Name
          </button>
          <button
            onClick={() => {
              Haptics.light();
              setSelectedSolution('WEBAPK');
            }}
            className={`py-2 px-1 rounded-xl transition ${
              selectedSolution === 'WEBAPK' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            2. WebAPK
          </button>
          <button
            onClick={() => {
              Haptics.light();
              setSelectedSolution('ANDROID_STUDIO');
            }}
            className={`py-2 px-1 rounded-xl transition ${
              selectedSolution === 'ANDROID_STUDIO' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            3. ./android
          </button>
          <button
            onClick={() => {
              Haptics.light();
              setSelectedSolution('VERCEL_HOST');
            }}
            className={`py-2 px-1 rounded-xl transition ${
              selectedSolution === 'VERCEL_HOST' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            4. Vercel
          </button>
        </div>

        {/* Tab 1: Fix PWABuilder "Missing Name" directly on that screen */}
        {selectedSolution === 'FIX_PWABUILDER' && (
          <div className="bg-[#121624] p-3.5 rounded-2xl border border-[#1E273E] space-y-3 overflow-y-auto">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">How to Unlock "Package For Stores" on PWABuilder</h4>
                <span className="text-[10px] text-amber-400">Takes 20 seconds right on your screen</span>
              </div>
            </div>

            <ol className="list-decimal list-inside text-[11px] text-gray-300 space-y-2 bg-[#0C0F17] p-3 rounded-xl border border-[#1C2336] leading-relaxed">
              <li>
                On that PWABuilder screen, tap <strong className="text-red-400">"Create a web app manifest"</strong> (the red exclamation box).
              </li>
              <li>
                Type or paste these values into the manifest form:
                <div className="pl-4 pt-1 space-y-1 font-mono text-[10px] text-emerald-300">
                  <div><strong>Name:</strong> Kravo Trading Journal</div>
                  <div><strong>Short Name:</strong> Kravo</div>
                  <div><strong>Description:</strong> Trading journal & discipline analytics</div>
                  <div className="break-all"><strong>Icon:</strong> {appUrl}/pwa-512x512.png</div>
                </div>
              </li>
              <li>
                Tap <strong>Save</strong> or <strong>Update</strong> at the bottom.
              </li>
              <li>
                The grey <strong>"Package For Stores"</strong> button will turn <strong className="text-emerald-400">ACTIVE</strong>! Tap it, choose <strong>Android</strong>, and download your signed <code className="text-emerald-400">.apk</code>!
              </li>
            </ol>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyManifestJson}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Manifest JSON Copied!' : 'Copy Manifest JSON'}</span>
              </button>

              <a
                href={reportCardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-[#1A2236] hover:bg-[#222E4A] text-gray-200 text-xs rounded-xl border border-[#263452] flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open PWABuilder</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Direct WebAPK on Android Phone (Fastest, zero PC required) */}
        {selectedSolution === 'WEBAPK' && (
          <div className="bg-[#121624] p-3.5 rounded-2xl border border-[#1E273E] space-y-3 overflow-y-auto">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Direct Android Install (No PWABuilder Needed)</h4>
                <span className="text-[10px] text-emerald-400">You are already in Chrome Beta on Android!</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              Your screenshot shows you are already browsing on an Android device in Chrome Beta! Android can install Kravo directly without PWABuilder:
            </p>

            <ol className="list-decimal list-inside text-[11px] text-gray-300 space-y-1.5 bg-[#0C0F17] p-3 rounded-xl border border-[#1C2336]">
              <li>Close the PWABuilder tab (tap <strong className="text-white">✕</strong> top-left).</li>
              <li>You will be right back in Kravo.</li>
              <li>Tap Chrome Beta's menu (<strong className="text-white">⋮</strong> top right).</li>
              <li>Tap <strong className="text-emerald-400">"Install app"</strong> or <strong className="text-emerald-400">"Add to Home screen"</strong>.</li>
              <li>Android installs Kravo into your phone's app drawer with standalone offline performance!</li>
            </ol>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 py-2.5 bg-[#171D2D] hover:bg-[#20273D] text-gray-200 text-xs rounded-xl border border-[#242D45] flex items-center justify-center gap-1.5 transition font-semibold"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'URL Copied!' : 'Copy Public App Link'}</span>
              </button>

              {isInstallable && (
                <button
                  onClick={install}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Install App Now</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Native Android Studio Project */}
        {selectedSolution === 'ANDROID_STUDIO' && (
          <div className="bg-[#121624] p-3.5 rounded-2xl border border-[#1E273E] space-y-3 overflow-y-auto">
            <div className="flex items-center gap-2">
              <FolderCode className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Full Native Android Project Ready in Codebase</h4>
                <span className="text-[10px] text-blue-400">Pre-built in <code className="font-mono">./android</code></span>
              </div>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              We have already created and synchronized the complete native Android project in this workspace using Capacitor 8!
            </p>

            <div className="bg-[#0C0F17] p-3 rounded-xl border border-[#1C2336] text-[11px] space-y-1.5 font-mono text-gray-300">
              <div className="text-gray-400">// Build and sync:</div>
              <div className="text-emerald-400">npm run build:apk</div>
              <div className="text-gray-400">// Open in Android Studio:</div>
              <div className="text-cyan-400">npx cap open android</div>
              <div className="text-gray-400">// In Android Studio menu:</div>
              <div className="text-amber-300">Build → Build Bundle(s) / APK(s) → Build APK(s)</div>
            </div>
          </div>
        )}

        {/* Tab 4: Deploy to Vercel/GitHub Pages */}
        {selectedSolution === 'VERCEL_HOST' && (
          <div className="bg-[#121624] p-3.5 rounded-2xl border border-[#1E273E] space-y-3 overflow-y-auto">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Deploy to Open Host for Automatic PWABuilder Scan</h4>
                <span className="text-[10px] text-purple-400">Bypasses Cloud Run cookie challenge</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              PWABuilder can only automatically scan sites that don't have Google preview authentication cookies. Push this repo to GitHub and deploy to Vercel in 1 click:
            </p>

            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Deploy to Vercel for PWABuilder ↗
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="pt-1 flex items-center justify-between text-xs border-t border-[#1D253B]">
          <span className="text-gray-400 text-[11px]">Kravo PWA & Android Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#171D2D] hover:bg-[#20273D] text-gray-200 rounded-xl border border-[#242D45] font-semibold transition text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
