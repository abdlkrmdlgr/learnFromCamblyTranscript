import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const QuizCard = ({ card, onComplete, showTurkish = false }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Her yeni kart geldiğinde state'leri sıfırla
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  }, [card.id]);

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === card.data.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    onComplete(isCorrect);
  };

  const handlePrevious = () => {
    onComplete('previous');
  };

  const getAnswerStyle = (index) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'border-primary-500 bg-primary-50 text-primary-700'
        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50';
    }

    if (index === card.data.correct_answer) {
      return 'border-green-500 bg-green-50 text-green-700';
    }
    
    if (index === selectedAnswer && index !== card.data.correct_answer) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    
    return 'border-gray-300 text-gray-500';
  };

  const getAnswerIcon = (index) => {
    if (!showResult) return null;
    
    if (index === card.data.correct_answer) {
      return <CheckCircle size={20} className="text-green-600" />;
    }
    
    if (index === selectedAnswer && index !== card.data.correct_answer) {
      return <XCircle size={20} className="text-red-600" />;
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-700">
            {card.data.type === 'grammar' ? 'Grammar Quiz' : 'Vocabulary Quiz'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {card.transcriptDate}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-center space-y-8">
        {/* Question */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {showTurkish && card.data.question_tr ? card.data.question_tr : card.data.question_en}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {card.data.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                getAnswerStyle(index)
              } ${showResult ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}
            >
              <span className="text-left flex-1 text-lg">{option}</span>
              {getAnswerIcon(index)}
            </button>
          ))}
        </div>

        {/* Result */}
        {showResult && (
          <div className={`text-center p-6 rounded-lg ${
            isCorrect 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {isCorrect ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle size={24} />
                <span className="font-semibold text-lg">Correct! Well done!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <XCircle size={24} />
                <span className="font-semibold text-lg">Incorrect. Correct answer: {card.data.options[card.data.correct_answer]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
          >
            Submit Answer
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={handlePrevious}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;