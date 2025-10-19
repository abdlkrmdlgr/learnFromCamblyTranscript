// Utility functions for LocalStorage management

const STORAGE_KEYS = {
  TRANSCRIPTS: 'cambly_transcripts',
  SETTINGS: 'cambly_settings',
  PROGRESS: 'cambly_progress',
  SESSION_PROGRESS: 'cambly_session_progress'
};

// Manage transcript data
export const transcriptStorage = {
  // Get all transcripts
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Transcript data could not be read:', error);
      return [];
    }
  },

  // Add new transcript
  add: (transcript) => {
    try {
      console.log('Storage add called with:', transcript);
      const transcripts = transcriptStorage.getAll();
      console.log('Current transcripts in storage:', transcripts);
      
      // Duplicate check - is there a transcript with the same date?
      const existingTranscript = transcripts.find(t => t.date === transcript.date);
      if (existingTranscript) {
        console.log('Duplicate transcript found, updating existing one:', existingTranscript);
        // Update existing transcript
        existingTranscript.title = transcript.title || existingTranscript.title;
        existingTranscript.grammar_mistakes = transcript.grammar_mistakes || existingTranscript.grammar_mistakes;
        existingTranscript.vocabulary_suggestions = transcript.vocabulary_suggestions || existingTranscript.vocabulary_suggestions;
        existingTranscript.quizzes = transcript.quizzes || existingTranscript.quizzes;
        existingTranscript.updatedAt = new Date().toISOString();
        
        localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(transcripts));
        return existingTranscript;
      }
      
      const newTranscript = {
        id: crypto.randomUUID(),
        title: transcript.title || `Transcript ${new Date().toLocaleDateString()}`,
        date: transcript.date || new Date().toISOString().split('T')[0],
        grammar_mistakes: transcript.grammar_mistakes || [],
        vocabulary_suggestions: transcript.vocabulary_suggestions || [],
        quizzes: transcript.quizzes || [],
        createdAt: new Date().toISOString()
      };
      
      console.log('New transcript created:', newTranscript);
      transcripts.push(newTranscript);
      console.log('Updated transcripts array:', transcripts);
      localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(transcripts));
      return newTranscript;
    } catch (error) {
      console.error('Transcript eklenemedi:', error);
      throw error;
    }
  },

  // Get transcript by ID
  getById: (id) => {
    const transcripts = transcriptStorage.getAll();
    return transcripts.find(t => t.id === id);
  },

  // Get transcript by date
  getByDate: (date) => {
    const transcripts = transcriptStorage.getAll();
    return transcripts.find(t => t.date === date);
  },

  // Transcript sil
  delete: (id) => {
    try {
      const transcripts = transcriptStorage.getAll();
      const filtered = transcripts.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Transcript silinemedi:', error);
      return false;
    }
  },

  // Delete all transcripts
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSCRIPTS);
      return true;
    } catch (error) {
      console.error('Transcript verileri temizlenemedi:', error);
      return false;
    }
  }
};

// Manage settings
export const settingsStorage = {
  // Get settings
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { showTurkish: false };
    } catch (error) {
      console.error('Settings could not be read:', error);
      return { showTurkish: false };
    }
  },

  // Update settings
  update: (newSettings) => {
    try {
      const currentSettings = settingsStorage.get();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Settings could not be updated:', error);
      throw error;
    }
  }
};

// Manage progress data
export const progressStorage = {
  // İlerleme verilerini getir
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : { studySessions: [] };
    } catch (error) {
      console.error('Progress data could not be read:', error);
      return { studySessions: [] };
    }
  },

  // Add study session
  addSession: (sessionData) => {
    try {
      const progress = progressStorage.get();
      const newSession = {
        date: sessionData.date || new Date().toISOString().split('T')[0],
        cardsStudied: sessionData.cardsStudied || 0,
        quizScore: sessionData.quizScore || 0,
        completedAt: new Date().toISOString()
      };
      
      progress.studySessions.push(newSession);
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      return newSession;
    } catch (error) {
      console.error('Study session could not be added:', error);
      throw error;
    }
  },

  // Get daily statistics
  getDailyStats: () => {
    const progress = progressStorage.get();
    const sessions = progress.studySessions;
    
    const totalDays = new Set(sessions.map(s => s.date)).size;
    const totalCards = sessions.reduce((sum, s) => sum + s.cardsStudied, 0);
    const avgQuizScore = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.quizScore, 0) / sessions.length 
      : 0;
    
    return {
      totalDays,
      totalCards,
      avgQuizScore: Math.round(avgQuizScore * 100) / 100
    };
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSCRIPTS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.SESSION_PROGRESS);
      return true;
    } catch (error) {
      console.error('All data could not be cleared:', error);
      return false;
    }
  }
};

// Session progress yönetimi
export const sessionProgressStorage = {
  // Session progress'i kaydet
  saveProgress: (transcriptId, sectionType, currentIndex, totalCards) => {
    try {
      const progress = sessionProgressStorage.getAll();
      const key = `${transcriptId}-${sectionType}`;
      
      progress[key] = {
        transcriptId,
        sectionType,
        currentIndex,
        totalCards,
        lastUpdated: new Date().toISOString(),
        completed: currentIndex >= totalCards
      };
      
      localStorage.setItem(STORAGE_KEYS.SESSION_PROGRESS, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Session progress kaydedilemedi:', error);
      return false;
    }
  },

  // Session progress'i getir
  getProgress: (transcriptId, sectionType) => {
    try {
      const progress = sessionProgressStorage.getAll();
      const key = `${transcriptId}-${sectionType}`;
      return progress[key] || null;
    } catch (error) {
      console.error('Session progress could not be read:', error);
      return null;
    }
  },

  // Get all progress
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Session progress data could not be read:', error);
      return {};
    }
  },

  // Get all progress for transcript
  getTranscriptProgress: (transcriptId) => {
    try {
      const progress = sessionProgressStorage.getAll();
      const transcriptProgress = {};
      
      Object.keys(progress).forEach(key => {
        if (key.startsWith(`${transcriptId}-`)) {
          const sectionType = key.split('-').pop();
          transcriptProgress[sectionType] = progress[key];
        }
      });
      
      return transcriptProgress;
    } catch (error) {
      console.error('Transcript progress could not be read:', error);
      return {};
    }
  },

  // Progress'i temizle
  clearProgress: (transcriptId, sectionType) => {
    try {
      const progress = sessionProgressStorage.getAll();
      const key = `${transcriptId}-${sectionType}`;
      delete progress[key];
      localStorage.setItem(STORAGE_KEYS.SESSION_PROGRESS, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Session progress temizlenemedi:', error);
      return false;
    }
  },

  // Clear all progress for transcript
  clearTranscriptProgress: (transcriptId) => {
    try {
      const progress = sessionProgressStorage.getAll();
      const keysToDelete = Object.keys(progress).filter(key => key.startsWith(`${transcriptId}-`));
      
      keysToDelete.forEach(key => delete progress[key]);
      localStorage.setItem(STORAGE_KEYS.SESSION_PROGRESS, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Transcript progress temizlenemedi:', error);
      return false;
    }
  }
};
