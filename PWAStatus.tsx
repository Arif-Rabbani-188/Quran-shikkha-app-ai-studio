import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

const PWAStatus: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if running as PWA (standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode || isIOSStandalone);
    };

    checkStandalone();

    // Listen for install prompt
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Don't show anything if we can't determine PWA status
  if (!isStandalone && !isInstallable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      {isStandalone && (
        <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
          <Smartphone className="h-3 w-3" />
          PWA Mode
        </div>
      )}
    </div>
  );
};

export default PWAStatus;