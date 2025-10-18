import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpenCheck, HelpCircle, Calendar, BookOpen } from 'lucide-react';
import { transcriptStorage, sessionProgressStorage } from '../utils/storage';
import LearningCard from '../components/LearningCard';
import QuizCard from '../components/QuizCard';

const TranscriptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    correct: 0,
    total: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [transcriptProgress, setTranscriptProgress] = useState({});

  useEffect(() => {
    const foundTranscript = transcriptStorage.getById(id);
    if (foundTranscript) {
      setTranscript(foundTranscript);
      // Load progress for this transcript
      const progress = sessionProgressStorage.getTranscriptProgress(foundTranscript.id);
      setTranscriptProgress(progress);
    } else {
      navigate('');
    }
  }, [id, navigate]);

  // Force load progress when activeSection changes
  useEffect(() => {
    if (transcript && activeSection) {
      const storageProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
      
      // Update entire transcriptProgress state with storage data
      if (Object.keys(storageProgress).length > 0) {
        setTranscriptProgress(storageProgress);
      }
    }
  }, [transcript, activeSection]);

  const startSectionSession = (sectionType, resumeFromProgress = false) => {
    if (!transcript) return;
    
    let cards = [];
    if (sectionType === 'grammar') {
      cards = transcript.grammar_mistakes?.map((mistake, index) => ({
        id: `grammar-${index}`,
        type: 'grammar',
        data: mistake
      })) || [];
    } else if (sectionType === 'vocabulary') {
      cards = transcript.vocabulary_suggestions?.map((vocab, index) => ({
        id: `vocab-${index}`,
        type: 'vocabulary',
        data: vocab
      })) || [];
    } else if (sectionType === 'quiz') {
      cards = transcript.quizzes?.map((quiz, index) => ({
        id: `quiz-${index}`,
        type: 'quiz',
        data: quiz
      })) || [];
    }
    
    // Check for saved progress
    const savedProgress = sessionProgressStorage.getProgress(transcript.id, sectionType);
    let startIndex = 0;
    
    if (resumeFromProgress && savedProgress && !savedProgress.completed) {
      startIndex = savedProgress.currentIndex;
    }
    
    setSessionCards(cards);
    setCurrentCardIndex(startIndex);
    setSessionStats({ completed: startIndex, correct: startIndex, total: cards.length });
    setIsSessionActive(true);
    setSessionComplete(false);
    setActiveSection(sectionType);
  };

  const handleCardComplete = (action) => {
    // QuizCard'dan gelen boolean değeri (isCorrect) veya string action'ı işle
    if (typeof action === 'boolean') {
      // QuizCard'dan gelen isCorrect değeri
      if (currentCardIndex < sessionCards.length - 1) {
        const newIndex = currentCardIndex + 1;
        setCurrentCardIndex(newIndex);
        setSessionStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          correct: action ? prev.correct + 1 : prev.correct
        }));
        
        // Save progress
        if (transcript && activeSection) {
          sessionProgressStorage.saveProgress(transcript.id, activeSection, newIndex, sessionCards.length);
          // Update local progress state
          const updatedProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
          setTranscriptProgress(prev => ({ ...prev, ...updatedProgress }));
        }
      } else {
        completeSession();
      }
    } else if (action === 'next') {
      // LearningCard'dan gelen next action'ı
      if (currentCardIndex < sessionCards.length - 1) {
        const newIndex = currentCardIndex + 1;
        setCurrentCardIndex(newIndex);
        setSessionStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          correct: prev.correct + 1
        }));
        
        // Save progress
        if (transcript && activeSection) {
          sessionProgressStorage.saveProgress(transcript.id, activeSection, newIndex, sessionCards.length);
          // Update local progress state
          const updatedProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
          setTranscriptProgress(prev => ({ ...prev, ...updatedProgress }));
        }
      } else {
        completeSession();
      }
    } else if (action === 'previous') {
      if (currentCardIndex > 0) {
        const newIndex = currentCardIndex - 1;
        setCurrentCardIndex(newIndex);
        
        // Save progress
        if (transcript && activeSection) {
          sessionProgressStorage.saveProgress(transcript.id, activeSection, newIndex, sessionCards.length);
          // Update local progress state
          const updatedProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
          setTranscriptProgress(prev => ({ ...prev, ...updatedProgress }));
        }
      }
    }
  };

  const completeSession = () => {
    // Mark as completed in progress
    if (transcript && activeSection) {
      sessionProgressStorage.saveProgress(transcript.id, activeSection, sessionCards.length, sessionCards.length);
      // Update local progress state
      const updatedProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
      setTranscriptProgress(prev => ({ ...prev, ...updatedProgress }));
    }
    
    setSessionComplete(true);
    setIsSessionActive(false);
  };

  const backToTranscript = () => {
    setIsSessionActive(false);
    setActiveSection(null);
    setSessionComplete(false);
    // Refresh progress when returning to transcript view
    if (transcript) {
      const updatedProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
      setTranscriptProgress(prev => ({ ...prev, ...updatedProgress }));
    }
  };

  if (!transcript) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpenCheck size={48} className="text-green-600" />
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
              onClick={backToTranscript}
              className="w-full btn-primary"
            >
              Back to Transcript
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSessionActive && sessionCards.length > 0) {
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
                  onClick={backToTranscript}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startSectionSession(activeSection, false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>Restart</span>
                </button>
                {transcriptProgress[activeSection] && !transcriptProgress[activeSection].completed && (
                  <button
                    onClick={() => startSectionSession(activeSection, true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-900 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span>Resume from {transcriptProgress[activeSection].currentIndex + 1}</span>
                  </button>
                )}
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
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex justify-center">
            {currentCard.type === 'quiz' ? (
              <QuizCard
                card={currentCard}
                onComplete={handleCardComplete}
                showTurkish={false}
              />
            ) : (
              <LearningCard
                card={currentCard}
                onComplete={handleCardComplete}
                showTurkish={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check if progress exists in storage and update state if needed
  if (transcript) {
    const storageProgress = sessionProgressStorage.getTranscriptProgress(transcript.id);
    
    // If no progress in state but exists in storage, force update
    if (Object.keys(transcriptProgress).length === 0 && Object.keys(storageProgress).length > 0) {
      setTranscriptProgress(storageProgress);
    }
  }

  // Main transcript view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{transcript.title}</h1>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{transcript.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} />
                    <span>Created {new Date(transcript.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Sections */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Grammar Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow relative">
            {transcriptProgress.grammar && (
              <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {transcriptProgress.grammar.completed ? 'Completed' : `${transcriptProgress.grammar.currentIndex + 1}/${transcriptProgress.grammar.totalCards} completed`}
              </div>
            )}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Grammar</h2>
              <p className="text-gray-600 mb-6">
                Practice grammar corrections and improve your sentence structure
              </p>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {transcript.grammar_mistakes?.length || 0}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => startSectionSession('grammar')}
                  disabled={(transcript.grammar_mistakes?.length || 0) === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transcriptProgress.grammar?.completed ? 'Review Grammar' : 'Start Grammar Practice'}
                </button>
              </div>
            </div>
          </div>

          {/* Vocabulary Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow relative">
            {transcriptProgress.vocabulary && (
              <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {transcriptProgress.vocabulary.completed ? 'Completed' : `${transcriptProgress.vocabulary.currentIndex + 1}/${transcriptProgress.vocabulary.totalCards} completed`}
              </div>
            )}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpenCheck size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vocabulary</h2>
              <p className="text-gray-600 mb-6">
                Learn new words and expand your vocabulary
              </p>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {transcript.vocabulary_suggestions?.length || 0}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => startSectionSession('vocabulary')}
                  disabled={(transcript.vocabulary_suggestions?.length || 0) === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transcriptProgress.vocabulary?.completed ? 'Review Vocabulary' : 'Start Vocabulary Practice'}
                </button>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow relative">
            {transcriptProgress.quiz && (
              <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {transcriptProgress.quiz.completed ? 'Completed' : `${transcriptProgress.quiz.currentIndex + 1}/${transcriptProgress.quiz.totalCards} completed`}
              </div>
            )}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz</h2>
              <p className="text-gray-600 mb-6">
                Test your knowledge with interactive quizzes
              </p>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {transcript.quizzes?.length || 0}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => startSectionSession('quiz')}
                  disabled={(transcript.quizzes?.length || 0) === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transcriptProgress.quiz?.completed ? 'Review Quiz' : 'Start Quiz Practice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptDetail;
