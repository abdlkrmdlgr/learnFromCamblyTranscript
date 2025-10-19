// LocalStorage yönetimi için utility fonksiyonları

const STORAGE_KEYS = {
  TRANSCRIPTS: 'cambly_transcripts',
  SETTINGS: 'cambly_settings',
  PROGRESS: 'cambly_progress',
  SESSION_PROGRESS: 'cambly_session_progress'
};

// Transcript verilerini yönetme
export const transcriptStorage = {
  // Tüm transcriptleri getir
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Transcript verileri okunamadı:', error);
      return [];
    }
  },

  // Yeni transcript ekle
  add: (transcript) => {
    try {
      console.log('Storage add called with:', transcript);
      const transcripts = transcriptStorage.getAll();
      console.log('Current transcripts in storage:', transcripts);
      
      // Duplicate kontrolü - aynı tarihli transcript var mı?
      const existingTranscript = transcripts.find(t => t.date === transcript.date);
      if (existingTranscript) {
        console.log('Duplicate transcript found, updating existing one:', existingTranscript);
        // Mevcut transcript'i güncelle
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

  // ID'ye göre transcript getir
  getById: (id) => {
    const transcripts = transcriptStorage.getAll();
    return transcripts.find(t => t.id === id);
  },

  // Tarihe göre transcript getir
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

  // Tüm transcriptleri sil
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

// Ayarları yönetme
export const settingsStorage = {
  // Ayarları getir
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { showTurkish: false };
    } catch (error) {
      console.error('Ayarlar okunamadı:', error);
      return { showTurkish: false };
    }
  },

  // Ayarları güncelle
  update: (newSettings) => {
    try {
      const currentSettings = settingsStorage.get();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Ayarlar güncellenemedi:', error);
      throw error;
    }
  }
};

// İlerleme verilerini yönetme
export const progressStorage = {
  // İlerleme verilerini getir
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : { studySessions: [] };
    } catch (error) {
      console.error('İlerleme verileri okunamadı:', error);
      return { studySessions: [] };
    }
  },

  // Çalışma oturumu ekle
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
      console.error('Çalışma oturumu eklenemedi:', error);
      throw error;
    }
  },

  // Günlük istatistikleri getir
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

  // Tüm verileri temizle
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSCRIPTS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.SESSION_PROGRESS);
      return true;
    } catch (error) {
      console.error('Tüm veriler temizlenemedi:', error);
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
      console.error('Session progress okunamadı:', error);
      return null;
    }
  },

  // Tüm progress'leri getir
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Session progress verileri okunamadı:', error);
      return {};
    }
  },

  // Transcript için tüm progress'leri getir
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
      console.error('Transcript progress okunamadı:', error);
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

  // Transcript'in tüm progress'lerini temizle
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
