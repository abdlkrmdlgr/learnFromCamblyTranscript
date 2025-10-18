import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ImportModal from './components/ImportModal';
import Home from './pages/Home';
import History from './pages/History';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import TranscriptDetail from './pages/TranscriptDetail';

function App() {
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImport = (transcript) => {
    setShowImportModal(false);
    // Import sonrası otomatik olarak ana sayfaya yönlendir
    window.location.hash = '#/';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header onImportClick={() => setShowImportModal(true)} />
        <main>
          <Routes>
            <Route path="/" element={<Home showImportModal={showImportModal} setShowImportModal={setShowImportModal} />} />
            <Route path="/transcript/:id" element={<TranscriptDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        
        {/* Global Import Modal - tüm sayfalarda kullanılabilir */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      </div>
    </Router>
  );
}

export default App;