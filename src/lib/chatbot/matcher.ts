import { knowledgeBase, contentDatabase, KnowledgeItem } from './knowledge-base';

// Simple word matching algorithm
function calculateSimilarity(input: string, question: string): number {
  const inputWords = input.toLowerCase().split(/\s+/);
  const questionWords = question.toLowerCase().split(/\s+/);
  
  let matches = 0;
  inputWords.forEach(word => {
    if (questionWords.includes(word)) matches++;
    questionWords.forEach(qWord => {
      if (qWord.includes(word) || word.includes(qWord)) matches += 0.5;
    });
  });
  
  return matches / Math.max(inputWords.length, questionWords.length);
}

// Find best matching knowledge item
export function findBestMatch(input: string): KnowledgeItem {
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;
  
  knowledgeBase.forEach(item => {
    if (item.id === 'fallback') return;
    
    item.questions.forEach(question => {
      const score = calculateSimilarity(input, question);
      if (score > highestScore && score > 0.3) {
        highestScore = score;
        bestMatch = item;
      }
    });
  });
  
  return bestMatch || knowledgeBase.find(k => k.id === 'fallback')!;
}

// Search content database by title/description - SAFE VERSION
export function searchContent(query: string, type?: 'manga' | 'novel' | 'webtoon' | 'comic') {
  // Build allContent safely with empty array fallback
  const allContent = [
    ...(contentDatabase.manga || []).map(c => ({ ...c, type: 'manga' as const })),
    ...(contentDatabase.novels || []).map(c => ({ ...c, type: 'novel' as const })),
    ...(contentDatabase.webtoons || []).map(c => ({ ...c, type: 'webtoon' as const })),
    ...(contentDatabase.comics || []).map(c => ({ ...c, type: 'comic' as const })),
  ];
  
  const filtered = allContent.filter(item => {
    const matchesType = !type || item.type === type;
    const matchesQuery = 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.genres || []).some(g => g.toLowerCase().includes(query.toLowerCase()));
    return matchesType && matchesQuery;
  });
  
  return filtered.slice(0, 5);
}

// Get recommendations by genre - SAFE VERSION
export function getRecommendations(genre: string, type?: string) {
  // Build allContent safely with empty array fallback
  const allContent = [
    ...(contentDatabase.manga || []).map(c => ({ ...c, type: 'manga' as const })),
    ...(contentDatabase.novels || []).map(c => ({ ...c, type: 'novel' as const })),
    ...(contentDatabase.webtoons || []).map(c => ({ ...c, type: 'webtoon' as const })),
    ...(contentDatabase.comics || []).map(c => ({ ...c, type: 'comic' as const })),
  ];
  
  return allContent
    .filter(item => (item.genres || []).some(g => g.toLowerCase() === genre.toLowerCase()))
    .slice(0, 5);
}