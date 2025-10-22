import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Trash2, FileText, Brain, Target, Eye } from 'lucide-react';
import { useTranscripts } from '../hooks/useTranscripts';
import ConfirmModal from '../components/ConfirmModal';

const History = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transcriptToDelete, setTranscriptToDelete] = useState(null);
  
  const { transcripts, deleteTranscript } = useTranscripts();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  const handleViewTranscript = (transcriptId) => {
    navigate(`/transcript/${transcriptId}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Transcript History</h1>
          <div className="text-sm text-gray-600">
            {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {transcripts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transcripts yet</h3>
            <p className="text-gray-600">Start by uploading your first JSON file.</p>
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
                          onClick={() => handleViewTranscript(transcript.id)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Eye size={16} />
                          <span>View</span>
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


  return (
    <>
      {renderTranscriptList()}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Transcript"
        message="Are you sure you want to delete this transcript? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default History;
