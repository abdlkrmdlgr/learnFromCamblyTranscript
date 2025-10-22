// Backup and restore utilities for data protection

import { 
  transcriptStorage, 
  settingsStorage, 
  progressStorage, 
  sessionProgressStorage, 
  favoritesStorage, 
  cardCountStorage 
} from './storage.js';

const BACKUP_KEY = 'cambly_backup';
const BACKUP_VERSION = '1.0.0';

// Create a complete backup of all user data
export const createBackup = () => {
  try {
    const backup = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        transcripts: transcriptStorage.getAll(),
        settings: settingsStorage.get(),
        progress: progressStorage.get(),
        sessionProgress: sessionProgressStorage.getAll(),
        favorites: favoritesStorage.getAll(),
        cardCounts: cardCountStorage.getAll()
      }
    };
    
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    console.log('Backup created successfully');
    return backup;
  } catch (error) {
    console.error('Backup creation failed:', error);
    return null;
  }
};

// Restore data from backup
export const restoreBackup = () => {
  try {
    const backupData = localStorage.getItem(BACKUP_KEY);
    if (!backupData) {
      console.log('No backup found');
      return false;
    }
    
    const backup = JSON.parse(backupData);
    
    // Restore all data
    localStorage.setItem('cambly_transcripts', JSON.stringify(backup.data.transcripts));
    localStorage.setItem('cambly_settings', JSON.stringify(backup.data.settings));
    localStorage.setItem('cambly_progress', JSON.stringify(backup.data.progress));
    localStorage.setItem('cambly_session_progress', JSON.stringify(backup.data.sessionProgress));
    localStorage.setItem('cambly_favorites', JSON.stringify(backup.data.favorites));
    localStorage.setItem('cambly_card_counts', JSON.stringify(backup.data.cardCounts));
    
    console.log('Backup restored successfully');
    return true;
  } catch (error) {
    console.error('Backup restoration failed:', error);
    return false;
  }
};

// Check if backup exists
export const hasBackup = () => {
  return localStorage.getItem(BACKUP_KEY) !== null;
};

// Get backup info
export const getBackupInfo = () => {
  try {
    const backupData = localStorage.getItem(BACKUP_KEY);
    if (!backupData) return null;
    
    const backup = JSON.parse(backupData);
    return {
      version: backup.version,
      timestamp: backup.timestamp,
      dataSize: JSON.stringify(backup.data).length
    };
  } catch (error) {
    console.error('Backup info could not be retrieved:', error);
    return null;
  }
};

// Clear backup
export const clearBackup = () => {
  try {
    localStorage.removeItem(BACKUP_KEY);
    console.log('Backup cleared');
    return true;
  } catch (error) {
    console.error('Backup could not be cleared:', error);
    return false;
  }
};

// Check storage usage
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    const keys = [
      'cambly_transcripts',
      'cambly_settings', 
      'cambly_progress',
      'cambly_session_progress',
      'cambly_favorites',
      'cambly_card_counts',
      'cambly_backup'
    ];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length;
      }
    });
    
    return {
      used: totalSize,
      usedMB: (totalSize / (1024 * 1024)).toFixed(2),
      limit: 5 * 1024 * 1024, // 5MB typical limit
      limitMB: 5,
      percentage: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1)
    };
  } catch (error) {
    console.error('Storage usage could not be calculated:', error);
    return null;
  }
};

// Auto-backup before critical operations
export const autoBackup = () => {
  try {
    // Create backup before any critical operation
    const backup = createBackup();
    if (backup) {
      console.log('Auto-backup created before critical operation');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Auto-backup failed:', error);
    return false;
  }
};

// Validate data integrity
export const validateDataIntegrity = () => {
  try {
    const issues = [];
    
    // Check if all required data exists
    const transcripts = transcriptStorage.getAll();
    const settings = settingsStorage.get();
    const progress = progressStorage.get();
    const favorites = favoritesStorage.getAll();
    
    if (!Array.isArray(transcripts)) {
      issues.push('Transcripts data is corrupted');
    }
    
    if (!settings || typeof settings !== 'object') {
      issues.push('Settings data is corrupted');
    }
    
    if (!progress || typeof progress !== 'object') {
      issues.push('Progress data is corrupted');
    }
    
    if (!Array.isArray(favorites)) {
      issues.push('Favorites data is corrupted');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues
    };
  } catch (error) {
    console.error('Data integrity validation failed:', error);
    return {
      isValid: false,
      issues: ['Data validation failed']
    };
  }
};
