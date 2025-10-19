import { useState, useEffect } from 'react';
import { settingsStorage } from '../utils/storage';

export const useSettings = () => {
  const [settings, setSettings] = useState({ showTurkish: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = settingsStorage.get();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Settings could not be loaded:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings) => {
    try {
      const updatedSettings = settingsStorage.update(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Settings could not be updated:', error);
      return false;
    }
  };

  const toggleTurkish = () => {
    updateSettings({ showTurkish: !settings.showTurkish });
  };

  return {
    settings,
    isLoading,
    updateSettings,
    toggleTurkish
  };
};
