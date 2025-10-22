import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
import { useTranscripts } from '../hooks/useTranscripts';
import { progressStorage, sessionProgressStorage, cardCountStorage } from '../utils/storage';

const Statistics = () => {
  const [dailyStats, setDailyStats] = useState(null);
  
  const { transcripts, getTotalStats } = useTranscripts();

  const loadStats = useCallback(async () => {
    try {
      const progress = progressStorage.get();
      const stats = progressStorage.getDailyStats();
      
      console.log('Loading stats:', { progress, stats });
      setDailyStats(stats);
    } catch (error) {
      console.error('Stats could not be loaded:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // localStorage değişikliklerini dinle
    const handleStorageChange = (e) => {
      if (e.key === 'cambly_progress' || e.key === 'cambly_transcripts' || e.key === 'cambly_session_progress') {
        console.log('Storage change detected:', e.key);
        loadStats();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Aynı tab'da localStorage değişikliklerini dinle
    const handleLocalStorageChange = () => {
      console.log('Data updated event received');
      loadStats();
    };
    
    // Custom event listener for same-tab updates
    window.addEventListener('dataUpdated', handleLocalStorageChange);
    
    // Periyodik kontrol (5 saniyede bir)
    const interval = setInterval(() => {
      console.log('Periodic stats check');
      loadStats();
    }, 5000);
    
    // Sayfa focus olduğunda güncelle
    const handleFocus = () => {
      console.log('Page focused, updating stats');
      loadStats();
    };
    
    // Sayfa görünür olduğunda güncelle
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, updating stats');
        loadStats();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataUpdated', handleLocalStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [loadStats]);

  // Transcripts değiştiğinde istatistikleri güncelle
  useEffect(() => {
    loadStats();
  }, [transcripts, loadStats]);

  const totalStats = getTotalStats();


  const weeklyActivity = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Card count storage'dan o günkü card count'ları al
      const cardCount = cardCountStorage.getCardCount(dateStr);
      
      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        cardsStudied: cardCount,
        quizScore: 0 // Quiz score'u kaldırdık
      });
    }
    
    return last7Days;
  }, []);

  const streakDays = useMemo(() => {
    // Card count storage'dan streak hesapla
    const counts = cardCountStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    
    let streak = 0;
    for (let i = 0; i < 365; i++) { // Maksimum 365 gün kontrol et
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (counts[dateStr] && counts[dateStr] > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 size={20} />
            <span>Learning Analytics</span>
          </div>
        </div>

        {/* General Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{dailyStats?.totalDays || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{streakDays}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{dailyStats?.totalCards || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((dailyStats?.avgQuizScore || 0) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Grammar Mistakes</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{totalStats.totalGrammar}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Vocabulary</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{totalStats.totalVocabulary}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Quiz Questions</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{totalStats.totalQuizzes}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-lg font-bold text-primary-600">{totalStats.totalItems}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h3>
            <div className="space-y-3">
              {weeklyActivity.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 w-12">
                      {day.dayName}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((day.cardsStudied / 20) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 ml-3">
                    {day.cardsStudied} card{day.cardsStudied !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Statistics;
