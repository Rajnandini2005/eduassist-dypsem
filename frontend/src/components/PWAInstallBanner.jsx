import React, { useState, useEffect } from 'react';
import { X, Download, GraduationCap } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const lastDismissed = localStorage.getItem('pwa_banner_dismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="
      fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80
      z-50 pwa-install-banner
    ">
      <div className="bg-[#1e3a5f] text-white rounded-2xl shadow-2xl p-4 border border-blue-700/50">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white">Install EduAssist</p>
            <p className="text-[11px] text-blue-200 mt-0.5 leading-relaxed">
              Add DYPSEM EduAssist to your home screen for the full app experience.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-blue-300" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 text-xs font-black transition-colors"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
