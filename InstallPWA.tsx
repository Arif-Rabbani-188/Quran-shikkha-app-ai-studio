import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    setIsIOS(iOS);
    
    if (iOS && !isInStandaloneMode) {
      // Show iOS install instructions after a delay
      setTimeout(() => setShowInstallBanner(true), 2000);
      return;
    }

    // Check if user recently dismissed the prompt
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return; // Don't show for 24 hours after dismissal
    }

    // Handle beforeinstallprompt event for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('Install prompt intercepted');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a brief delay
      setTimeout(() => setShowInstallBanner(true), 1000);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('App installed');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For testing - show install banner after 3 seconds if no native prompt
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !iOS) {
        console.log('Showing fallback install prompt');
        setShowInstallBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Manual instructions for browsers that don't support the API
      alert('To install this app:\\n\\n• Chrome: Click the install icon in the address bar\\n• Firefox: Use browser menu > Install\\n• Safari: Share menu > Add to Home Screen');
      return;
    }

    try {
      console.log('Triggering install prompt');
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg p-4 z-50 max-w-sm mx-auto animate-slide-up">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 bg-white/20 rounded-lg p-2">
          {isIOS ? <Smartphone className="h-6 w-6" /> : <Download className="h-6 w-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">
            {isIOS ? 'Add to Home Screen' : 'Install QuranShikha'}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            {isIOS 
              ? 'Tap the share button and select "Add to Home Screen" for the best experience.'
              : 'Get the full app experience with offline access and faster loading.'
            }
          </p>
          <div className="mt-3 flex space-x-2">
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="bg-white hover:bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-lg font-bold transition-colors flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Install Now
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-emerald-100 hover:text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-emerald-200 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;