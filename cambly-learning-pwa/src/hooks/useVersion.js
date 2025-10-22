import { useState, useEffect } from 'react';
import { createBackup, autoBackup } from '../utils/backup.js';

export const useVersion = () => {
  const [version, setVersion] = useState('1.1.1'); // Set to current version
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed, update available');
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SW_UPDATE_AVAILABLE' || event.data.type === 'SW_VERSION_UPDATE') {
            console.log('Service worker update available:', event.data.version);
            setVersion(event.data.version);
            setUpdateAvailable(true);
          }
        });

        // Check if there's already a waiting service worker
        if (registration.waiting) {
          console.log('Waiting service worker found');
          setUpdateAvailable(true);
        }

        // Force check for updates on load
        registration.update().catch(() => {
          // Ignore errors, this is normal when no updates
        });
      });
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkForUpdates = async (force = false) => {
    if ('serviceWorker' in navigator) {
      try {
        // Force clear update check cache for aggressive checking
        if (force) {
          localStorage.removeItem('lastUpdateCheck');
        }
        
        // Check if we should skip update check (to avoid too frequent checks)
        if (!force) {
          const lastCheck = localStorage.getItem('lastUpdateCheck');
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
          
          if (lastCheck && (now - parseInt(lastCheck)) < fiveMinutes) {
            console.log('Skipping update check - checked recently');
            return false;
          }
        }
        
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Check if there's already a waiting service worker
          if (registration.waiting) {
            setUpdateAvailable(true);
            return true;
          }
          
          // Check if there's an installing service worker
          if (registration.installing) {
            return new Promise((resolve) => {
              registration.installing.addEventListener('statechange', () => {
                if (registration.installing.state === 'installed') {
                  setUpdateAvailable(true);
                  resolve(true);
                } else if (registration.installing.state === 'redundant') {
                  resolve(false);
                }
              });
            });
          }
          
          // Try to check for updates (this might fail if no new version)
          try {
            await registration.update();
            
            // Update last check time
            localStorage.setItem('lastUpdateCheck', Date.now().toString());
            
            // Check again after update attempt
            if (registration.waiting) {
              setUpdateAvailable(true);
              return true;
            }
            
            return false;
          } catch (updateError) {
            // This is normal when no updates are available
            console.log('No updates available:', updateError.message);
            return false;
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
        // Don't throw error, just return false
        return false;
      }
    }
    return false;
  };


  const applyUpdate = async () => {
    if ('serviceWorker' in navigator) {
      setIsUpdating(true);
      setUpdateProgress(0);
      
      try {
        // Create backup before update
        console.log('Creating backup before update...');
        const backup = createBackup();
        if (!backup) {
          console.warn('Backup creation failed, but continuing with update');
        }
        
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.waiting) {
          // Simulate update progress
          const progressInterval = setInterval(() => {
            setUpdateProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + 10;
            });
          }, 200);
          
          // Send skip waiting message
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Wait a bit for the new service worker to take control
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setUpdateProgress(100);
          
          // Reload the page to apply the update
          window.location.reload();
        } else {
          // No waiting service worker, just reload
          window.location.reload();
        }
      } catch (error) {
        console.error('Error applying update:', error);
        setIsUpdating(false);
        setUpdateProgress(0);
        throw error;
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        // Only clear PWA-related caches, preserve user data
        const cacheNames = await caches.keys();
        const pwaCaches = cacheNames.filter(cacheName => 
          cacheName.startsWith('cambly-') || 
          cacheName.startsWith('workbox-') ||
          cacheName.includes('vite-')
        );
        
        await Promise.all(
          pwaCaches.map(cacheName => caches.delete(cacheName))
        );
        console.log('PWA caches cleared, user data preserved');
        
        // Clear only sessionStorage, NOT localStorage (to preserve user data)
        sessionStorage.clear();
        
        // Force reload to get fresh version
        window.location.reload();
        
        return true;
      } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
      }
    }
    return false;
  };

  return {
    version,
    updateAvailable,
    isOnline,
    isUpdating,
    updateProgress,
    checkForUpdates,
    applyUpdate,
    clearCache
  };
};
