import { useState, useEffect } from 'react';
import { transcriptStorage } from '../utils/storage';
import { getSpacedRepetitionCards, selectCardsForSession } from '../utils/spacedRepetition';

export const useTranscripts = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranscripts = () => {
      try {
        const savedTranscripts = transcriptStorage.getAll();
        setTranscripts(savedTranscripts);
      } catch (error) {
        console.error('Transcript verileri yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscripts();
  }, []);

  const addTranscript = (transcriptData) => {
    try {
      const newTranscript = transcriptStorage.add(transcriptData);
      setTranscripts(prev => [...prev, newTranscript]);
      return newTranscript;
    } catch (error) {
      console.error('Transcript eklenemedi:', error);
      throw error;
    }
  };

  const deleteTranscript = (id) => {
    try {
      const success = transcriptStorage.delete(id);
      if (success) {
        setTranscripts(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Transcript silinemedi:', error);
      return false;
    }
  };

  const getTranscriptById = (id) => {
    return transcripts.find(t => t.id === id);
  };

  const getTranscriptByDate = (date) => {
    return transcripts.find(t => t.date === date);
  };

  const getLearningCards = (maxCards = 20) => {
    const cards = getSpacedRepetitionCards(transcripts);
    return selectCardsForSession(cards, maxCards);
  };

  const getTotalStats = () => {
    const totalGrammar = transcripts.reduce((sum, t) => sum + (t.grammar_mistakes?.length || 0), 0);
    const totalVocabulary = transcripts.reduce((sum, t) => sum + (t.vocabulary_suggestions?.length || 0), 0);
    const totalQuizzes = transcripts.reduce((sum, t) => sum + (t.quizzes?.length || 0), 0);
    
    return {
      totalTranscripts: transcripts.length,
      totalGrammar,
      totalVocabulary,
      totalQuizzes,
      totalItems: totalGrammar + totalVocabulary + totalQuizzes
    };
  };

  return {
    transcripts,
    isLoading,
    addTranscript,
    deleteTranscript,
    getTranscriptById,
    getTranscriptByDate,
    getLearningCards,
    getTotalStats
  };
};
