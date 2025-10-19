// Spaced repetition algorithm

export const getSpacedRepetitionCards = (transcripts, currentDate = new Date()) => {
  if (!transcripts || transcripts.length === 0) return [];

  const today = currentDate.toISOString().split('T')[0];
  const threeDaysAgo = new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Categorize transcripts by date
  const todayTranscripts = transcripts.filter(t => t.date === today);
  const recentTranscripts = transcripts.filter(t => t.date > threeDaysAgo && t.date < today);
  const weekTranscripts = transcripts.filter(t => t.date > sevenDaysAgo && t.date <= threeDaysAgo);
  const oldTranscripts = transcripts.filter(t => t.date <= sevenDaysAgo);

  // Create cards
  const cards = [];

  // Today's material (40%)
  todayTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.4));
  });

  // Last 3 days (30%)
  recentTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.3));
  });

  // Last 7 days (20%)
  weekTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.2));
  });

  // 7+ days ago (10%)
  oldTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.1));
  });

  // Shuffle cards
  return shuffleArray(cards);
};

const createCardsFromTranscript = (transcript, weight) => {
  const cards = [];

  // Grammar mistakes cards
  transcript.grammar_mistakes?.forEach(mistake => {
    cards.push({
      id: `${transcript.id}-grammar-${mistake.original}`,
      type: 'grammar',
      transcriptId: transcript.id,
      transcriptDate: transcript.date,
      data: mistake,
      weight
    });
  });

  // Vocabulary cards
  transcript.vocabulary_suggestions?.forEach(vocab => {
    cards.push({
      id: `${transcript.id}-vocab-${vocab.word}`,
      type: 'vocabulary',
      transcriptId: transcript.id,
      transcriptDate: transcript.date,
      data: vocab,
      weight
    });
  });

  // Quiz cards
  transcript.quizzes?.forEach(quiz => {
    cards.push({
      id: `${transcript.id}-quiz-${quiz.question_en}`,
      type: 'quiz',
      transcriptId: transcript.id,
      transcriptDate: transcript.date,
      data: quiz,
      weight
    });
  });

  return cards;
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Select cards by weight
export const selectCardsForSession = (cards, maxCards = 20) => {
  if (cards.length <= maxCards) return cards;

  // Make weighted selection
  const weightedCards = [];
  cards.forEach(card => {
    const count = Math.ceil(card.weight * maxCards);
    for (let i = 0; i < count; i++) {
      weightedCards.push(card);
    }
  });

  // Randomly select and limit
  const shuffled = shuffleArray(weightedCards);
  return shuffled.slice(0, maxCards);
};

// Calculate daily card distribution
export const calculateDailyDistribution = (transcripts) => {
  const today = new Date().toISOString().split('T')[0];
  const cards = getSpacedRepetitionCards(transcripts);

  const distribution = {
    today: cards.filter(c => c.transcriptDate === today).length,
    recent: cards.filter(c => {
      const cardDate = new Date(c.transcriptDate);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return cardDate > threeDaysAgo && c.transcriptDate < today;
    }).length,
    week: cards.filter(c => {
      const cardDate = new Date(c.transcriptDate);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return cardDate > sevenDaysAgo && cardDate <= threeDaysAgo;
    }).length,
    old: cards.filter(c => {
      const cardDate = new Date(c.transcriptDate);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return cardDate <= sevenDaysAgo;
    }).length
  };

  return distribution;
};
