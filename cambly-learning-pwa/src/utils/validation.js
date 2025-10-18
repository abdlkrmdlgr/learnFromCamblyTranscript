// JSON format validation utilities

export const validateTranscriptStructure = (data) => {
  const errors = [];
  
  // Ana yapı kontrolü
  if (!data || typeof data !== 'object') {
    errors.push('Geçersiz JSON formatı');
    return { isValid: false, errors };
  }

  // Gerekli alanları kontrol et
  const requiredFields = ['grammar_mistakes', 'vocabulary_suggestions', 'quizzes'];
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`${field} alanı bulunamadı`);
    } else if (!Array.isArray(data[field])) {
      errors.push(`${field} alanı array olmalı`);
    }
  }

  // Grammar mistakes validation
  if (data.grammar_mistakes && Array.isArray(data.grammar_mistakes)) {
    data.grammar_mistakes.forEach((mistake, index) => {
      if (!mistake.original || !mistake.correction) {
        errors.push(`Grammar mistake ${index + 1}: original ve correction alanları gerekli`);
      }
    });
  }

  // Vocabulary suggestions validation
  if (data.vocabulary_suggestions && Array.isArray(data.vocabulary_suggestions)) {
    data.vocabulary_suggestions.forEach((vocab, index) => {
      if (!vocab.word || !vocab.definition_en) {
        errors.push(`Vocabulary ${index + 1}: word ve definition_en alanları gerekli`);
      }
    });
  }

  // Quizzes validation
  if (data.quizzes && Array.isArray(data.quizzes)) {
    data.quizzes.forEach((quiz, index) => {
      if (!quiz.type || !quiz.question_en || !Array.isArray(quiz.options)) {
        errors.push(`Quiz ${index + 1}: type, question_en ve options alanları gerekli`);
      }
      if (typeof quiz.correct_answer !== 'number' || quiz.correct_answer < 0) {
        errors.push(`Quiz ${index + 1}: correct_answer geçerli bir sayı olmalı`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return '';
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};

export const sanitizeTranscriptData = (data) => {
  // Boş alanları temizle ve güvenli hale getir
  const sanitized = {
    grammar_mistakes: (data.grammar_mistakes || []).filter(item => 
      item.original && item.correction
    ).map(item => ({
      original: item.original.trim(),
      correction: item.correction.trim(),
      explanation_en: item.explanation_en?.trim() || '',
      explanation_tr: item.explanation_tr?.trim() || ''
    })),
    
    vocabulary_suggestions: (data.vocabulary_suggestions || []).filter(item => 
      item.word && item.definition_en
    ).map(item => ({
      word: item.word.trim(),
      definition_en: item.definition_en.trim(),
      definition_tr: item.definition_tr?.trim() || '',
      example_sentence: item.example_sentence?.trim() || ''
    })),
    
    quizzes: (data.quizzes || []).filter(item => 
      item.type && item.question_en && Array.isArray(item.options)
    ).map(item => ({
      type: item.type.trim(),
      question_en: item.question_en.trim(),
      question_tr: item.question_tr?.trim() || '',
      options: item.options.map(option => option.trim()).filter(option => option),
      correct_answer: Math.max(0, Math.min(item.correct_answer || 0, item.options.length - 1))
    }))
  };

  return sanitized;
};
