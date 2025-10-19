import { useState } from 'react';
import { Calendar, BookOpen, Trash2, ArrowLeft, FileText, Brain, Target } from 'lucide-react';
import { useTranscripts } from '../hooks/useTranscripts';
import LearningCard from '../components/LearningCard';
import QuizCard from '../components/QuizCard';
import ConfirmModal from '../components/ConfirmModal';

const History = () => {
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transcriptToDelete, setTranscriptToDelete] = useState(null);
  
  const { transcripts, deleteTranscript, getTranscriptById } = useTranscripts();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTranscriptStats = (transcript) => {
    const grammarCount = transcript.grammar_mistakes?.length || 0;
    const vocabCount = transcript.vocabulary_suggestions?.length || 0;
    const quizCount = transcript.quizzes?.length || 0;
    
    return {
      grammar: grammarCount,
      vocabulary: vocabCount,
      quiz: quizCount,
      total: grammarCount + vocabCount + quizCount
    };
  };

  const startReview = (transcript) => {
    setSelectedTranscript(transcript);
    setCurrentCardIndex(0);
    setShowCards(true);
  };

  const getCurrentCard = () => {
    if (!selectedTranscript) return null;
    
    const allCards = [];
    
    // Grammar cards
    selectedTranscript.grammar_mistakes?.forEach(mistake => {
      allCards.push({
        id: `grammar-${mistake.original}`,
        type: 'grammar',
        data: mistake,
        transcriptDate: selectedTranscript.date
      });
    });
    
    // Vocabulary cards
    selectedTranscript.vocabulary_suggestions?.forEach(vocab => {
      allCards.push({
        id: `vocab-${vocab.word}`,
        type: 'vocabulary',
        data: vocab,
        transcriptDate: selectedTranscript.date
      });
    });
    
    // Quiz cards
    selectedTranscript.quizzes?.forEach(quiz => {
      allCards.push({
        id: `quiz-${quiz.question_en}`,
        type: 'quiz',
        data: quiz,
        transcriptDate: selectedTranscript.date
      });
    });
    
    return allCards[currentCardIndex] || null;
  };

  const handleCardComplete = () => {
    const allCards = [];
    selectedTranscript.grammar_mistakes?.forEach(mistake => {
      allCards.push({ type: 'grammar', data: mistake });
    });
    selectedTranscript.vocabulary_suggestions?.forEach(vocab => {
      allCards.push({ type: 'vocabulary', data: vocab });
    });
    selectedTranscript.quizzes?.forEach(quiz => {
      allCards.push({ type: 'quiz', data: quiz });
    });

    if (currentCardIndex < allCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Review tamamlandı
      setShowCards(false);
      setSelectedTranscript(null);
      setCurrentCardIndex(0);
    }
  };

  const handleDeleteTranscript = (id) => {
    setTranscriptToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (transcriptToDelete) {
      deleteTranscript(transcriptToDelete);
      setShowDeleteModal(false);
      setTranscriptToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTranscriptToDelete(null);
  };

  const renderTranscriptList = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Geçmiş Transkriptler</h1>
          <div className="text-sm text-gray-600">
            {transcripts.length} transkript
          </div>
        </div>

        {transcripts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz transkript yok</h3>
            <p className="text-gray-600">İlk JSON dosyanızı yükleyerek başlayın.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcripts
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(transcript => {
                const stats = getTranscriptStats(transcript);
                return (
                  <div key={transcript.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Calendar size={24} className="text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(transcript.date)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <FileText size={16} />
                              <span>{stats.grammar} grammar</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Brain size={16} />
                              <span>{stats.vocabulary} vocabulary</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Target size={16} />
                              <span>{stats.quiz} quiz</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startReview(transcript)}
                          className="btn-primary"
                        >
                          Tekrar Et
                        </button>
                        <button
                          onClick={() => handleDeleteTranscript(transcript.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCardReview = () => {
    const currentCard = getCurrentCard();
    const allCards = [];
    selectedTranscript.grammar_mistakes?.forEach(mistake => {
      allCards.push({ type: 'grammar', data: mistake });
    });
    selectedTranscript.vocabulary_suggestions?.forEach(vocab => {
      allCards.push({ type: 'vocabulary', data: vocab });
    });
    selectedTranscript.quizzes?.forEach(quiz => {
      allCards.push({ type: 'quiz', data: quiz });
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCards(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Geri</span>
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedTranscript.date)}
                </h2>
                <div className="text-sm text-gray-600">
                  {currentCardIndex + 1} / {allCards.length}
                </div>
              </div>
              <div></div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / allCards.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {currentCard && (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  };

  if (showCards && selectedTranscript) {
    return (
      <>
        {renderCardReview()}
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Transkripti Sil"
          message="Bu transkripti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          confirmText="Sil"
          cancelText="İptal"
          type="danger"
        />
      </>
    );
  }

  return (
    <>
      {renderTranscriptList()}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Transkripti Sil"
        message="Bu transkripti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />
    </>
  );
};

export default History;
