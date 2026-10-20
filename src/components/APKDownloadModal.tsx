import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  FileCode2,
  X,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sounds } from '../utils/audio';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'flutter'>('apk');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=101426&color=FFC857`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#141930] border-2 border-[#FFC857]/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-white p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Smartphone className="w-6 h-6 text-[#101426]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                LUDO ROYAL FOR ANDROID
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-white/70">
              Download native APK or install as instant Android WebAPK app
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('apk');
            }}
            type="button"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-[#FFC857] text-[#101426] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Direct APK
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('pwa');
            }}
            type="button"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-[#FFC857] text-[#101426] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> 1-Tap PWA
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('flutter');
            }}
            type="button"
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'flutter'
                ? 'bg-[#FFC857] text-[#101426] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" /> Flutter Source
          </button>
        </div>

        {/* TAB 1: DIRECT APK DOWNLOAD */}
        {activeTab === 'apk' && (
          <div className="space-y-5">
            {/* Download CTA Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-white/5 to-white/5 border border-amber-400/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">LudoRoyal.apk</h3>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Signed & Verified
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Universal Android release package with offline WebView engine, sound & vibration support.
                  </p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-white/50 mt-2">
                    <span>Size: <strong>~210 KB</strong></span>
                    <span>•</span>
                    <span>Android 5.0+ (Lollipop to 14+)</span>
                    <span>•</span>
                    <span>Package: <code className="text-amber-300">com.royal.ludo</code></span>
                  </div>
                </div>

                <a
                  href="/LudoRoyal.apk"
                  download="LudoRoyal.apk"
                  onClick={() => sounds.playClick()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-[#101426] hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD APK
                </a>
              </div>
            </div>

            {/* Android Installation Instructions */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h4 className="text-xs font-bold text-amber-300 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> 3-Step Android Installation Guide
              </h4>
              <ol className="space-y-2.5 text-xs text-white/80 list-decimal list-inside">
                <li className="leading-relaxed">
                  Tap <strong>Download APK</strong> above. If Chrome warns <em>"File might be harmful"</em>, tap <strong>Download anyway</strong> (standard notice for apps downloaded outside Google Play).
                </li>
                <li className="leading-relaxed">
                  Open the downloaded <code>LudoRoyal.apk</code> from your notifications or <strong>Downloads</strong> folder.
                </li>
                <li className="leading-relaxed">
                  If prompted to <em>"Install unknown apps"</em>, tap <strong>Settings</strong> &rarr; toggle <strong>Allow from this source</strong> &rarr; tap <strong>Install</strong>.
                </li>
              </ol>
            </div>

            {/* QR Code for phone scan */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0d1020] border border-white/10">
              <div className="p-1.5 rounded-xl bg-white/5 border border-amber-400/20 shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Scan to open on mobile"
                  className="w-20 h-20 rounded-lg"
                />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-200 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Scan with Android Camera
                </p>
                <p className="text-white/60 mt-1">
                  Point your phone's camera at this QR code to immediately open Ludo Royal or download the APK directly on your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PWA WEB-APK INSTALL */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-white text-sm mb-1">
                Progressive Web App (Android WebAPK)
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Installs directly onto your Android home screen as a standalone application without security prompts or APK file management. Automatically updates when online and caches assets for offline play!
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                {isInstalled ? (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Already Installed as Standalone App
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={async () => {
                      sounds.playClick();
                      await install();
                    }}
                    type="button"
                    className="px-5 py-3 rounded-xl font-bold text-xs bg-amber-400 text-[#101426] hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" /> Install on Android Now
                  </button>
                ) : (
                  <div className="text-xs text-amber-200/90 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                    To install from Chrome on Android: tap the <strong>three dots menu (&vellip;)</strong> in the top right, then tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                  </div>
                )}
              </div>
            </div>

            {/* Offline & Features Checklist */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/80">Fullscreen No Address Bar</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/80">Offline Service Worker</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/80">High-Res Maskable Icons</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/80">Zero Battery Drain</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FLUTTER STARTER SOURCE */}
        {activeTab === 'flutter' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Original Flutter Source Starter
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    The source archive provided in the project: <code>ludo_royal_source_885c423e.zip</code>
                  </p>
                </div>
                <a
                  href="/assets/aistudio/ludo_royal_source_885c423e.zip"
                  download="ludo_royal_source.zip"
                  onClick={() => sounds.playClick()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download ZIP
                </a>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-[#0b0e1b] font-mono text-[11px] text-amber-200/90 overflow-x-auto space-y-1">
                <div># Build Flutter APK locally in terminal:</div>
                <div className="text-white/70">cd ludo_royal</div>
                <div className="text-white/70">flutter create --platforms=android .</div>
                <div className="text-white/70">flutter pub get</div>
                <div className="text-white/70">flutter build apk --release</div>
                <div className="text-emerald-400 mt-1"># Output: build/app/outputs/flutter-apk/app-release.apk</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>Google AI Studio • Ludo Royal Android</span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            type="button"
            className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
