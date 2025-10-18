import { useState } from 'react';
import { X, Upload, FileText, Calendar, BookOpen } from 'lucide-react';
import { validateTranscriptStructure, formatValidationErrors, sanitizeTranscriptData } from '../utils/validation';
import { transcriptStorage } from '../utils/storage';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'paste'
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid JSON file');
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const validation = validateTranscriptStructure(data);
      if (!validation.isValid) {
        setError(formatValidationErrors(validation.errors));
        return;
      }

      const sanitizedData = sanitizeTranscriptData(data);
      const transcript = transcriptStorage.add({
        ...sanitizedData,
        date: selectedDate,
        title: title.trim() || `Transcript ${new Date().toLocaleDateString()}`
      });

      onImport(transcript);
      onClose();
    } catch (err) {
      setError('JSON file could not be read: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteImport = () => {
    if (!jsonText.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const data = JSON.parse(jsonText);
      
      const validation = validateTranscriptStructure(data);
      if (!validation.isValid) {
        setError(formatValidationErrors(validation.errors));
        return;
      }

      const sanitizedData = sanitizeTranscriptData(data);
      const transcript = transcriptStorage.add({
        ...sanitizedData,
        date: selectedDate,
        title: title.trim() || `Transcript ${new Date().toLocaleDateString()}`
      });

      onImport(transcript);
      onClose();
    } catch (err) {
      setError('Invalid JSON format: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJsonText('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import JSON File</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <BookOpen size={16} />
              <span>Transcript Title</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this transcript (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Import Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Import Method</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setImportMethod('file')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  importMethod === 'file'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload size={20} />
                <span>Select File</span>
              </button>
              <button
                onClick={() => setImportMethod('paste')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  importMethod === 'paste'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText size={20} />
                <span>Paste JSON</span>
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              <span>Conversation Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors hover:border-gray-400"
              max={new Date().toISOString().split('T')[0]}
              style={{
                colorScheme: 'light',
                cursor: 'pointer'
              }}
            />
            <p className="text-xs text-gray-500">
              Select the date when this conversation took place
            </p>
          </div>

          {/* File Upload */}
          {importMethod === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload size={48} className="text-gray-400" />
                  <span className="text-lg font-medium text-gray-600">
                    {file ? file.name : 'Select JSON file'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Upload .json file
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* JSON Paste */}
          {importMethod === 'paste' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                JSON Content
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste JSON content here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-sm whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={importMethod === 'file' ? handleFileUpload : handlePasteImport}
              disabled={isLoading || (importMethod === 'file' && !file) || (importMethod === 'paste' && !jsonText.trim())}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;