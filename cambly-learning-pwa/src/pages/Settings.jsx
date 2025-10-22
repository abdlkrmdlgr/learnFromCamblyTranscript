import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Eye, EyeOff, Info, Calendar, FileText, Brain, Target, Eye as EyeIcon, RefreshCw, Download, Shield, Database } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTranscripts } from '../hooks/useTranscripts';
import { useVersion } from '../hooks/useVersion';
import { progressStorage } from '../utils/storage';
import { getStorageUsage, validateDataIntegrity, hasBackup, getBackupInfo } from '../utils/backup';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, toggleTurkish } = useSettings();
  const { transcripts, deleteTranscript } = useTranscripts();
  const { version, updateAvailable, isOnline, isUpdating, updateProgress, checkForUpdates, applyUpdate, clearCache } = useVersion();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteTranscriptModal, setShowDeleteTranscriptModal] = useState(false);
  const [transcriptToDelete, setTranscriptToDelete] = useState(null);
  const [showCacheClearModal, setShowCacheClearModal] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null); // 'checking', 'available', 'current', 'error'
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [storageUsage, setStorageUsage] = useState(null);
  const [dataIntegrity, setDataIntegrity] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);

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

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const success = await clearCache();
      if (success) {
        alert('Cache başarıyla temizlendi. Sayfa yeniden yüklenecek.');
        window.location.reload();
      } else {
        alert('Cache temizlenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      alert('Cache temizlenirken bir hata oluştu.');
    } finally {
      setIsClearingCache(false);
      setShowCacheClearModal(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus('checking');
    setShowUpdateModal(true);
    
    try {
      const hasUpdate = await checkForUpdates();
      if (hasUpdate) {
        setUpdateStatus('available');
      } else {
        setUpdateStatus('current');
      }
    } catch (error) {
      console.error('Update check error:', error);
      // Check if it's a network error or service worker error
      if (!navigator.onLine) {
        setUpdateStatus('error');
      } else {
        // If it's not a network error, treat as "no updates available"
        setUpdateStatus('current');
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleApplyUpdate = () => {
    applyUpdate();
    setShowUpdateModal(false);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateStatus(null);
  };


  // Load storage and data integrity info
  useEffect(() => {
    const loadDataInfo = () => {
      setStorageUsage(getStorageUsage());
      setDataIntegrity(validateDataIntegrity());
      setBackupInfo(getBackupInfo());
    };
    
    loadDataInfo();
  }, []);

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
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Calendar size={16} className="text-primary-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-sm font-semibold text-gray-900 truncate">
                                    {formatDate(transcript.date)}
                                  </h5>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                <button
                                  onClick={() => handleViewTranscript(transcript.id)}
                                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                                >
                                  <EyeIcon size={16} />
                                  <span className="hidden sm:inline">View</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTranscript(transcript.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                                <FileText size={12} />
                                <span>{stats.grammar} grammar</span>
                              </span>
                              <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                                <Brain size={12} />
                                <span>{stats.vocabulary} vocabulary</span>
                              </span>
                              <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                                <Target size={12} />
                                <span>{stats.quiz} quiz</span>
                              </span>
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
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <span>{version}</span>
                    {updateAvailable && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Update Available
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Platform</h4>
                  <p className="text-sm text-gray-600">PWA (Progressive Web App)</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Storage</h4>
                  <p className="text-sm text-gray-600">LocalStorage (On Device)</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Connection Status</h4>
                  <p className={`text-sm flex items-center space-x-2 ${
                    isOnline ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Protection</h4>
                  <p className={`text-sm flex items-center space-x-2 ${
                    dataIntegrity?.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <Shield size={16} />
                    <span>{dataIntegrity?.isValid ? 'Data Safe' : 'Data Issues'}</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Storage Usage</h4>
                  <p className="text-sm text-gray-600">
                    {storageUsage ? `${storageUsage.usedMB}MB / ${storageUsage.limitMB}MB (${storageUsage.percentage}%)` : 'Calculating...'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Backup Status</h4>
                  <p className={`text-sm flex items-center space-x-2 ${
                    backupInfo ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <Database size={16} />
                    <span>{backupInfo ? 'Backup Available' : 'No Backup'}</span>
                  </p>
                </div>
              </div>

              {/* Update and Cache Management */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Updates & Cache</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCheckForUpdates}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <RefreshCw size={16} />
                    <span>Check for Updates</span>
                  </button>
                  
                  {updateAvailable && (
                    <button
                      onClick={handleApplyUpdate}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Download size={16} />
                      <span>Apply Update</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowCacheClearModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Clear Cache</span>
                  </button>
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

      {/* Update Check Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  updateStatus === 'checking' ? 'bg-blue-100' :
                  updateStatus === 'available' ? 'bg-green-100' :
                  updateStatus === 'current' ? 'bg-blue-100' :
                  'bg-red-100'
                }`}>
                  {updateStatus === 'checking' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : updateStatus === 'available' ? (
                    <Download size={20} className="text-green-600" />
                  ) : updateStatus === 'current' ? (
                    <RefreshCw size={20} className="text-blue-600" />
                  ) : (
                    <AlertTriangle size={20} className="text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {updateStatus === 'checking' ? 'Checking for Updates' :
                     updateStatus === 'available' ? 'Update Available' :
                     updateStatus === 'current' ? 'App is Up to Date' :
                     'Update Check Failed'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {updateStatus === 'checking' ? 'Please wait...' :
                     updateStatus === 'available' ? 'A new version is available' :
                     updateStatus === 'current' ? 'You have the latest version' :
                     'Something went wrong'}
                  </p>
                </div>
              </div>
              
              {updateStatus === 'checking' && (
                <div className="text-center py-4">
                  <p className="text-gray-700">Checking for updates...</p>
                </div>
              )}
              
              {isUpdating && (
                <div className="space-y-4">
                  <p className="text-gray-700 text-center">Updating application...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${updateProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">{updateProgress}% complete</p>
                </div>
              )}
              
              {updateStatus === 'available' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    A new version of the app is available. Would you like to update now?
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>Current version:</strong> {version}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>New version:</strong> Available
                    </p>
                  </div>
                </div>
              )}
              
              {updateStatus === 'current' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    You are using the latest version of the app.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Current version:</strong> {version}
                    </p>
                  </div>
                </div>
              )}
              
              {updateStatus === 'error' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Unable to check for updates. This might be due to network issues or the app is already up to date.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      <strong>Connection status:</strong> {isOnline ? 'Online' : 'Offline'}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      <strong>Tip:</strong> Try refreshing the page or check your internet connection.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                {updateStatus === 'checking' || isUpdating ? (
                  <button
                    disabled
                    className="flex-1 bg-gray-100 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Checking...'}
                  </button>
                ) : updateStatus === 'available' ? (
                  <>
                    <button
                      onClick={closeUpdateModal}
                      className="flex-1 btn-secondary"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleApplyUpdate}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Update Now</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeUpdateModal}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Clear Confirmation Modal */}
      {showCacheClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clear Cache</h3>
                  <p className="text-sm text-gray-600">This will clear all cached data</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                This will clear all cached files and data. The app will reload after clearing the cache. 
                This may help resolve loading issues.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCacheClearModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={isClearingCache}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCache}
                  disabled={isClearingCache}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isClearingCache ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Clear Cache</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
