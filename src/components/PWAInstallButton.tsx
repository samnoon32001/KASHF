import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className={
          compact
            ? "flex items-center gap-1.5 rounded-lg bg-[#117B78] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
            : "flex items-center gap-2 rounded-xl bg-[#117B78] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
        }
        title="Install Kashf to your device"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className={
            compact
              ? "flex items-center gap-1.5 rounded-lg border border-[#117B78]/30 px-2.5 py-1.5 text-xs font-semibold text-[#117B78] hover:bg-[#117B78]/10 transition cursor-pointer"
              : "flex items-center gap-2 rounded-xl border border-[#117B78]/30 px-3.5 py-2 text-sm font-semibold text-[#117B78] hover:bg-[#117B78]/10 transition cursor-pointer"
          }
        >
          <Share className="w-4 h-4" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Install Kashf on iOS</h3>
                <button
                  id="close-ios-guide-btn"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#117B78]/10 text-xs font-bold text-[#117B78]">
                    1
                  </span>
                  <p>
                    Tap the <strong>Share</strong> button in your Safari toolbar at the bottom.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#117B78]/10 text-xs font-bold text-[#117B78]">
                    2
                  </span>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#117B78]/10 text-xs font-bold text-[#117B78]">
                    3
                  </span>
                  <p>Tap <strong>Add</strong> in the top-right corner to finish.</p>
                </div>
              </div>
              <button
                id="dismiss-ios-guide-btn"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#117B78] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0D9C88] transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
