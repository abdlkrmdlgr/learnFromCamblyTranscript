import { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import { favoritesStorage } from '../utils/storage';

const LearningCard = ({ card, onComplete, showTurkish = false, transcriptId }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const cardRef = useRef(null);

  // Check favorite status when card changes
  useEffect(() => {
    setIsFavorite(favoritesStorage.isFavorite(card.id));
  }, [card.id]);

  const handleNext = () => {
    onComplete('next');
  };

  const handlePrevious = () => {
    onComplete('previous');
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      favoritesStorage.remove(card.id);
      setIsFavorite(false);
    } else {
      favoritesStorage.add(card.id, card.type, transcriptId, card.data);
      setIsFavorite(true);
    }
  };


  // Touch handlers for swipe gestures
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Touch handlers for double tap gestures
  const handleDoubleTap = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const cardWidth = rect.width;
    const touchX = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
    const relativeX = touchX - rect.left;
    
    // Check if touch is in left or right half
    if (relativeX < cardWidth / 2) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  const renderGrammarCard = () => (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[350px] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
    >
      {/* Header with Star Button */}
      <div className="flex justify-between items-center p-4 md:p-6 pb-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isFavorite 
              ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 pb-4 flex flex-col justify-center space-y-4">
        <div className="text-center space-y-2">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-xs font-medium text-gray-600 mb-2">Original Sentence</h3>
            <p className="text-base md:text-lg text-gray-900 font-medium leading-relaxed">
              "{card.data.original}"
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-xs font-medium text-green-700 mb-2">Corrected Version</h3>
            <p className="text-base md:text-lg text-green-800 font-medium leading-relaxed">
              "{card.data.correction}"
            </p>
          </div>
        </div>

        {/* Explanations */}
        <div className="space-y-2">
          {card.data.explanation_en && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-800 mb-1">English Explanation</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{card.data.explanation_en}</p>
            </div>
          )}
          {card.data.explanation_tr && showTurkish && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-blue-800 mb-1">Turkish Explanation</h4>
              <p className="text-sm text-blue-700 leading-relaxed">{card.data.explanation_tr}</p>
            </div>
          )}
        </div>
      </div>


      {/* Navigation */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        {/* Mobile Swipe Hint */}
        <div className="md:hidden text-center mb-2">
          <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
            <span>←</span>
            <span>Double tap to navigate</span>
            <span>→</span>
          </p>
        </div>
        
        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex space-x-3">
          <button
            onClick={handlePrevious}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm font-medium"
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderVocabularyCard = () => (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[350px] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
    >
      {/* Header with Star Button */}
      <div className="flex justify-between items-center p-4 md:p-6 pb-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isFavorite 
              ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 pb-4 flex flex-col justify-center space-y-4">
        {/* Word and Definition */}
        <div className="text-center space-y-3">
          <div className="bg-blue-50 rounded-lg p-4 md:p-6 border border-blue-200">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
              {card.data.word}
            </h2>
            <p className="text-base md:text-lg text-blue-800 leading-relaxed">
              {card.data.definition_en}
            </p>
          </div>

        </div>

        {/* Example Sentence */}
        {card.data.example_sentence && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-800 mb-2">Example Sentence</h4>
            <p className="text-gray-700 text-sm md:text-base italic leading-relaxed">"{card.data.example_sentence}"</p>
          </div>
        )}

        {/* Turkish Meaning */}
        {card.data.definition_tr && showTurkish && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-green-800 mb-2">Turkish Meaning</h4>
            <p className="text-green-700 text-sm md:text-base leading-relaxed">{card.data.definition_tr}</p>
          </div>
        )}
      </div>


      {/* Navigation */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        {/* Mobile Swipe Hint */}
        <div className="md:hidden text-center mb-2">
          <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
            <span>←</span>
            <span>Double tap to navigate</span>
            <span>→</span>
          </p>
        </div>
        
        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex space-x-3">
          <button
            onClick={handlePrevious}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm font-medium"
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {card.type === 'grammar' && renderGrammarCard()}
      {card.type === 'vocabulary' && renderVocabularyCard()}
    </div>
  );
};

export default LearningCard;