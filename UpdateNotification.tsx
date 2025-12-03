import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Listen for service worker updates with Vite PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Listen for waiting service worker
        if (reg.waiting) {
          setShowUpdate(true);
        }

        // Listen for new service worker installing
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
            setShowUpdate(true);
          }
        });
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // Listen for custom update event from Vite PWA
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    window.addEventListener('vite:sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('vite:sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Send skip waiting message
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Force reload if no waiting worker
      window.location.reload();
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 bg-blue-500 rounded-lg p-2">
          <RefreshCw className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white">
            Update Available
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            A new version of the app is available. Update now for the latest features and improvements.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleUpdate}
              className="bg-white hover:bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-100 hover:text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;