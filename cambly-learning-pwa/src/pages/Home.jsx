import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Brain, Target, TrendingUp, FileText, BookOpenCheck, HelpCircle } from 'lucide-react';
import LearningCard from '../components/LearningCard';
import QuizCard from '../components/QuizCard';
import { useTranscripts } from '../hooks/useTranscripts';
import { useSettings } from '../hooks/useSettings';
import { progressStorage } from '../utils/storage';

const Home = ({ showImportModal, setShowImportModal }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null); // 'grammar', 'vocabulary', 'quiz'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    correct: 0,
    total: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { transcripts, isLoading: transcriptsLoading, addTranscript, getLearningCards, getTotalStats } = useTranscripts();
  const { settings } = useSettings();

  const startSectionSession = (sectionType) => {
    const allCards = getLearningCards(50); // Get more cards to filter from
    const filteredCards = allCards.filter(card => card.type === sectionType);
    const sessionCards = filteredCards.slice(0, 20); // Take first 20 cards
    
    setSessionCards(sessionCards);
    setCurrentCardIndex(0);
    setSessionStats({ completed: 0, correct: 0, total: sessionCards.length });
    setIsSessionActive(true);
    setSessionComplete(false);
    setActiveSection(sectionType);
  };

  const handleCardComplete = (isCorrect) => {
    setSessionStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total
    }));

    if (currentCardIndex < sessionCards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 1500);
    } else {
      // Session tamamlandı
      setTimeout(() => {
        completeSession();
      }, 1500);
    }
  };

  const completeSession = () => {
    const quizScore = sessionStats.total > 0 ? sessionStats.correct / sessionStats.total : 0;
    
    progressStorage.addSession({
      cardsStudied: sessionStats.completed,
      quizScore: quizScore
    });

    setSessionComplete(true);
    setIsSessionActive(false);
  };



  const renderEmptyState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen size={48} className="text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cambly Learning App
        </h2>
        <p className="text-gray-600 mb-8">
          Upload your JSON file to start learning from your Cambly conversations.
        </p>
        <button
          onClick={() => {
            console.log('Upload button clicked, setting showImportModal to true');
            setShowImportModal(true);
          }}
          className="btn-primary flex items-center space-x-2 mx-auto"
        >
          <Plus size={20} />
          <span>Upload JSON File</span>
        </button>
      </div>
    </div>
  );

  const renderMainDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Transcripts</h1>
            <p className="text-lg text-gray-600">Select a transcript to start learning</p>
          </div>

          {transcripts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transcripts Yet</h3>
              <p className="text-gray-600 mb-6">Import your first transcript to get started</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transcripts.map((transcript) => (
                <div key={transcript.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{transcript.title}</h3>
                      <p className="text-sm text-gray-500">{transcript.date}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(transcript.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{transcript.grammar_mistakes?.length || 0}</div>
                      <div className="text-xs text-gray-600">Grammar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{transcript.vocabulary_suggestions?.length || 0}</div>
                      <div className="text-xs text-gray-600">Vocabulary</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{transcript.quizzes?.length || 0}</div>
                      <div className="text-xs text-gray-600">Quiz</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Navigate to transcript detail page
                      navigate(`/transcript/${transcript.id}`);
                    }}
                    className="w-full btn-primary"
                  >
                    Start Learning
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSessionComplete = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Session Complete!
        </h2>
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{sessionStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((sessionStats.correct / sessionStats.completed) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => {
              setActiveSection(null);
              setIsSessionActive(false);
              setSessionComplete(false);
            }}
            className="w-full btn-primary"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full btn-secondary"
          >
            Import New Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderLearningSession = () => {
    const currentCard = sessionCards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / sessionCards.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setIsSessionActive(false);
                    setActiveSection(null);
                    setSessionComplete(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeSection === 'grammar' && 'Grammar Practice'}
                  {activeSection === 'vocabulary' && 'Vocabulary Practice'}
                  {activeSection === 'quiz' && 'Quiz Practice'}
                </h1>
                <div className="text-sm text-gray-500">
                  {currentCardIndex + 1} / {sessionCards.length}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="max-w-5xl mx-auto px-6 py-4">
          {currentCard && (
            <div className="flex justify-center">
              {currentCard.type === 'quiz' ? (
                <QuizCard
                  card={currentCard}
                  onComplete={handleCardComplete}
                  showTurkish={settings.showTurkish}
                />
              ) : (
                <LearningCard
                  card={currentCard}
                  onComplete={handleCardComplete}
                  showTurkish={settings.showTurkish}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (transcriptsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (transcripts.length === 0) {
    return renderEmptyState();
  }

  if (sessionComplete) {
    return renderSessionComplete();
  }

  if (isSessionActive && sessionCards.length > 0) {
    return renderLearningSession();
  }

  return renderMainDashboard();
};

export default Home;
