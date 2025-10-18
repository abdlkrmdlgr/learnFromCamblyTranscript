import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LearningCard = ({ card, onComplete, showTurkish = false }) => {
  const [showTranslation, setShowTranslation] = useState(showTurkish);

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const handleNext = () => {
    onComplete('next');
  };

  const handlePrevious = () => {
    onComplete('previous');
  };

  const renderGrammarCard = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-700">Grammar Practice</span>
        </div>
        <button
          onClick={handleToggleTranslation}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{showTranslation ? 'Hide Translation' : 'Show Translation'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-4">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Original Sentence</h3>
            <p className="text-xl text-gray-900 font-medium leading-relaxed">
              "{card.data.original}"
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-sm font-medium text-green-700 mb-3">Corrected Version</h3>
            <p className="text-xl text-green-800 font-medium leading-relaxed">
              "{card.data.correction}"
            </p>
          </div>
        </div>

        {/* Explanations */}
        <div className="space-y-4">
          {showTranslation && card.data.explanation_tr && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Turkish Explanation</h4>
              <p className="text-blue-700 leading-relaxed">{card.data.explanation_tr}</p>
            </div>
          )}

          {card.data.explanation_en && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">English Explanation</h4>
              <p className="text-gray-700 leading-relaxed">{card.data.explanation_en}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={handlePrevious}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderVocabularyCard = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-700">Vocabulary Practice</span>
        </div>
        <button
          onClick={handleToggleTranslation}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{showTranslation ? 'Hide Translation' : 'Show Translation'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-center space-y-8">
        {/* Word and Definition */}
        <div className="text-center space-y-6">
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              {card.data.word}
            </h2>
            <p className="text-lg text-blue-800 leading-relaxed">
              {card.data.definition_en}
            </p>
          </div>

          {showTranslation && card.data.definition_tr && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-sm font-semibold text-green-800 mb-3">Turkish Meaning</h4>
              <p className="text-green-700 text-lg leading-relaxed">{card.data.definition_tr}</p>
            </div>
          )}
        </div>

        {/* Example Sentence */}
        {card.data.example_sentence && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Example Sentence</h4>
            <p className="text-gray-700 text-lg italic leading-relaxed">"{card.data.example_sentence}"</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={handlePrevious}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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