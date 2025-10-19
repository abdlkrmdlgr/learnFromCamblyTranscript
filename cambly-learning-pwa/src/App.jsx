import { useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import History from './pages/History';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import TranscriptDetail from './pages/TranscriptDetail';
import ImportModal from './components/ImportModal';

function AppContent() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [homeKey, setHomeKey] = useState(0);
  const navigate = useNavigate();

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImport = (transcript) => {
    // Close modal after import is completed
    setShowImportModal(false);
    // Force refresh home page
    setHomeKey(prev => prev + 1);
    // Navigate to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onImportClick={handleImportClick} />
      <main>
        <Routes>
          <Route path="/" element={<Home key={homeKey} showImportModal={showImportModal} setShowImportModal={setShowImportModal} />} />
          <Route path="/transcript/:id" element={<TranscriptDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      
      {/* Global Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;