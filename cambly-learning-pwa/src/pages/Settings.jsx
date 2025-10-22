import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Eye, EyeOff, Info, Calendar, FileText, Brain, Target, Eye as EyeIcon } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTranscripts } from '../hooks/useTranscripts';
import { progressStorage } from '../utils/storage';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, toggleTurkish } = useSettings();
  const { transcripts, deleteTranscript } = useTranscripts();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteTranscriptModal, setShowDeleteTranscriptModal] = useState(false);
  const [transcriptToDelete, setTranscriptToDelete] = useState(null);

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
    setShowDeleteTranscriptModal(true);
  };

  const confirmDeleteTranscript = () => {
    if (transcriptToDelete) {
      deleteTranscript(transcriptToDelete);
      setShowDeleteTranscriptModal(false);
      setTranscriptToDelete(null);
    }
  };

  const cancelDeleteTranscript = () => {
    setShowDeleteTranscriptModal(false);
    setTranscriptToDelete(null);
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      const success = progressStorage.clearAll();
      if (success) {
        alert('All data has been successfully deleted. The page will refresh.');
        window.location.reload();
      } else {
        alert('An error occurred while deleting data.');
      }
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <SettingsIcon size={20} />
            <span>Application Settings</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Show Turkish Translations</h4>
                  <p className="text-sm text-gray-600">
                    Shows/hides Turkish explanations on cards
                  </p>
                </div>
                <button
                  onClick={toggleTurkish}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showTurkish ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showTurkish ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      When this setting is off, Turkish translations won't appear on cards. 
                      You can control this individually on each card with the "Show/Hide" button.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      All your data is stored on your device. If you delete your data, 
                      all transcripts, progress records and settings will be deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transcripts Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">Transcripts</h4>
                  <div className="text-sm text-gray-600">
                    {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {transcripts.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <FileText size={32} className="text-gray-400 mx-auto mb-2" />
                    <h5 className="text-sm font-medium text-gray-900 mb-1">No transcripts yet</h5>
                    <p className="text-xs text-gray-600">Start by uploading your first JSON file.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transcripts
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(transcript => {
                        const stats = getTranscriptStats(transcript);
                        return (
                          <div key={transcript.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <Calendar size={16} className="text-primary-600" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-900">
                                    {formatDate(transcript.date)}
                                  </h5>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <span className="flex items-center space-x-1">
                                      <FileText size={12} />
                                      <span>{stats.grammar} grammar</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Brain size={12} />
                                      <span>{stats.vocabulary} vocabulary</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Target size={12} />
                                      <span>{stats.quiz} quiz</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleViewTranscript(transcript.id)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                                >
                                  <EyeIcon size={12} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTranscript(transcript.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Delete All Data</h4>
                  <p className="text-sm text-gray-600">
                    All transcripts, progress records and settings will be deleted
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Application Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Application Name</h4>
                  <p className="text-sm text-gray-600">Cambly Learning PWA</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Version</h4>
                  <p className="text-sm text-gray-600">1.0.0</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Platform</h4>
                  <p className="text-sm text-gray-600">PWA (Progressive Web App)</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Storage</h4>
                  <p className="text-sm text-gray-600">LocalStorage (On Device)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">JSON File Upload</h4>
                  <p className="text-sm text-gray-600">
                    Start learning by uploading the JSON file created after your Cambly conversation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Spaced Repetition</h4>
                  <p className="text-sm text-gray-600">
                    The application uses a spaced repetition system based on learning science.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Offline Work</h4>
                  <p className="text-sm text-gray-600">
                    Works as a PWA and can be used without internet connection.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete All Data Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete All Data</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                All transcripts, progress records and settings will be deleted. 
                Are you sure you want to confirm this action?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transcript Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteTranscriptModal}
        onClose={cancelDeleteTranscript}
        onConfirm={confirmDeleteTranscript}
        title="Delete Transcript"
        message="Are you sure you want to delete this transcript? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Settings;
