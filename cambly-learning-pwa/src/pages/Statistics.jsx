import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, BookOpen, Brain, FileText, BarChart3 } from 'lucide-react';
import { useTranscripts } from '../hooks/useTranscripts';
import { progressStorage } from '../utils/storage';

const Statistics = () => {
  const [dailyStats, setDailyStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  
  const { getTotalStats } = useTranscripts();

  useEffect(() => {
    const loadStats = () => {
      const progress = progressStorage.get();
      const stats = progressStorage.getDailyStats();
      
      setDailyStats(stats);
      setRecentSessions(progress.studySessions.slice(-10).reverse());
    };

    loadStats();
  }, []);

  const totalStats = getTotalStats();

  const getStreakDays = () => {
    if (recentSessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedSessions = recentSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sessionDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyActivity = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const session = recentSessions.find(s => s.date === dateStr);
      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        cardsStudied: session?.cardsStudied || 0,
        quizScore: session?.quizScore || 0
      });
    }
    
    return last7Days;
  };

  const weeklyActivity = getWeeklyActivity();
  const streakDays = getStreakDays();

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

        {/* Recent Sessions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 10).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Target size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(session.date).toLocaleDateString('en-US')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {session.cardsStudied} card{session.cardsStudied !== 1 ? 's' : ''} • {Math.round(session.quizScore * 100)}% accuracy
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(session.completedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
