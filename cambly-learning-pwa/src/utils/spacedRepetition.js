// Aralıklı tekrar algoritması

export const getSpacedRepetitionCards = (transcripts, currentDate = new Date()) => {
  if (!transcripts || transcripts.length === 0) return [];

  const today = currentDate.toISOString().split('T')[0];
  const threeDaysAgo = new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Transcriptleri tarihe göre kategorize et
  const todayTranscripts = transcripts.filter(t => t.date === today);
  const recentTranscripts = transcripts.filter(t => t.date > threeDaysAgo && t.date < today);
  const weekTranscripts = transcripts.filter(t => t.date > sevenDaysAgo && t.date <= threeDaysAgo);
  const oldTranscripts = transcripts.filter(t => t.date <= sevenDaysAgo);

  // Kartları oluştur
  const cards = [];

  // Bugünün materyali (%40)
  todayTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.4));
  });

  // Son 3 gün (%30)
  recentTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.3));
  });

  // Son 7 gün (%20)
  weekTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.2));
  });

  // 7+ gün önce (%10)
  oldTranscripts.forEach(transcript => {
    cards.push(...createCardsFromTranscript(transcript, 0.1));
  });

  // Kartları karıştır
  return shuffleArray(cards);
};

const createCardsFromTranscript = (transcript, weight) => {
  const cards = [];

  // Grammar mistakes kartları
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

  // Vocabulary kartları
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

  // Quiz kartları
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

// Kartları ağırlıklarına göre seç
export const selectCardsForSession = (cards, maxCards = 20) => {
  if (cards.length <= maxCards) return cards;

  // Ağırlıklı seçim yap
  const weightedCards = [];
  cards.forEach(card => {
    const count = Math.ceil(card.weight * maxCards);
    for (let i = 0; i < count; i++) {
      weightedCards.push(card);
    }
  });

  // Rastgele seç ve sınırla
  const shuffled = shuffleArray(weightedCards);
  return shuffled.slice(0, maxCards);
};

// Günlük kart dağılımını hesapla
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
