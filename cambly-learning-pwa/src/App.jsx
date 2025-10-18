import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import History from './pages/History';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import TranscriptDetail from './pages/TranscriptDetail';

function App() {
  const [showImportModal, setShowImportModal] = useState(false);

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
      </div>
    </Router>
  );
}

export default App;