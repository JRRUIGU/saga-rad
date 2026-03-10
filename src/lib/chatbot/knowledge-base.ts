// Types for your chatbot
export interface KnowledgeItem {
  id: string;
  questions: string[]; // Different ways users might ask
  answer: string;
  category: 'general' | 'manga' | 'novel' | 'webtoon' | 'account' | 'technical' | 'comics' | 'support';
  action?: 'search' | 'navigate' | 'recommend'; // Special actions
  data?: any; // Extra data for rich responses
}

// Your custom knowledge base - ADD/EDIT THIS AS YOU WANT
export const knowledgeBase: KnowledgeItem[] = [
  // GREETINGS
  {
    id: 'greeting',
    questions: ['hi', 'hello', 'hey', 'sup', 'yo', 'hiya', 'greetings'],
    answer: 'Hey there! 👋 Welcome to SAGA Read! I can help you find manga, novels, webtoons, or answer questions about the platform. What are you looking for?',
    category: 'general',
  },
  {
    id: 'how_are_you',
    questions: ['how are you', 'how you doing', 'whats up', "what's up", 'how is it going'],
    answer: "I'm doing great, ready to help you find your next favorite read! 📚 What genre are you in the mood for?",
    category: 'general',
  },

  // PLATFORM INFO
  {
    id: 'what_is_saga',
    questions: ['what is saga', 'what is this site', 'what can i do here', 'how does this work', 'what is saga read'],
    answer: 'SAGA Read is your ultimate hub for manga, webtoons, comics, and novels! You can browse different categories, bookmark favorites, track reading progress, and discover new series.',
    category: 'general',
  },
  {
    id: 'is_it_free',
    questions: ['is it free', 'do i pay', 'subscription', 'cost', 'price', 'free to read'],
    answer: 'Yes! SAGA Read is completely free to use. Just create an account to start reading and bookmarking your favorites!',
    category: 'general',
  },

  // CONTENT TYPES
  {
    id: 'what_is_manga',
    questions: ['what is manga', 'define manga', 'manga meaning', 'difference manga'],
    answer: 'Manga are Japanese comics or graphic novels, typically read right-to-left. They cover all genres from action to romance to horror!',
    category: 'manga',
  },
  {
    id: 'what_is_webtoon',
    questions: ['what is webtoon', 'define webtoon', 'webtoon meaning', 'difference webtoon'],
    answer: 'Webtoons are digital comics originating from Korea, designed for mobile reading with vertical scrolling. They\'re usually in full color!',
    category: 'webtoon',
  },
  {
    id: 'what_is_novel',
    questions: ['what is novel', 'define novel', 'light novel', 'web novel', 'difference novel'],
    answer: 'Novels on SAGA are text-based stories - from light novels (Japanese style with illustrations) to web novels (digitally published chapters).',
    category: 'novel',
  },

    {
    id: 'what_is_comic',
    questions: ['what is comic', 'define comic'],
    answer: 'Comics are a visual medium that uses a sequence of images, often combined with text, to tell stories or express ideas, Ussualy in full color.',
    category: 'comics',
  },


  // NAVIGATION HELP
  {
    id: 'find_manga',
    questions: ['find manga', 'search manga', 'manga list', 'browse manga', 'where is manga', 'show me manga'],
    answer: 'You can browse all manga at /manga or use the search bar! Popular genres include Action, Romance, Fantasy, and Isekai.',
    category: 'manga',
    action: 'navigate',
    data: { path: '/manga' },
  },
  {
    id: 'find_novels',
    questions: ['find novels', 'search novels', 'novel list', 'browse novels', 'where are novels', 'show me novels'],
    answer: 'Check out our novel collection at /novels! We have romance, fantasy, sci-fi, and more.',
    category: 'novel',
    action: 'navigate',
    data: { path: '/novels' },
  },
  {
    id: 'find_webtoons',
    questions: ['find webtoons', 'search webtoons', 'webtoon list', 'browse webtoons', 'where are webtoons', 'show me webtoons'],
    answer: 'Discover Korean webtoons at /webtoons! All vertically scrolling and full color.',
    category: 'webtoon',
    action: 'navigate',
    data: { path: '/webtoons' },
  },

  {
    id: 'find_comics',
    questions: ['find comics', 'search comics', 'comic list', 'browse comics', 'where are comics', 'show me comics'],
    answer: 'Discover comics at /comics! All vertically scrolling and full color.',
    category: 'comics',
    action: 'navigate',
    data: { path: '/comics' },
  },
  // READING HELP
  {
    id: 'how_to_read',
    questions: ['how to read', 'start reading', 'read chapter', 'open manga', 'begin reading'],
    answer: 'Click on any title to see details, then select a chapter to start reading! Your progress is automatically saved.',
    category: 'technical',
  },
  {
    id: 'bookmark',
    questions: ['how to bookmark', 'save manga', 'add to favorites', 'bookmark series', 'save for later'],
    answer: 'Click the bookmark/heart icon on any manga, novel, or webtoon page to save it to your profile!',
    category: 'account',
  },
  {
    id: 'reading_history',
    questions: ['reading history', 'continue reading', 'where did i stop', 'my progress', 'recently read'],
    answer: 'Visit your profile at /profile to see your reading history, bookmarks, and continue where you left off!',
    category: 'account',
    action: 'navigate',
    data: { path: '/profile' },
  },

  // ACCOUNT
  {
    id: 'create_account',
    questions: ['create account', 'sign up', 'register', 'make account', 'join saga'],
    answer: 'Click "Register" in the navbar or visit /register to create your free account!',
    category: 'account',
    action: 'navigate',
    data: { path: '/register' },
  },
  {
    id: 'login',
    questions: ['login', 'sign in', 'access account', 'log in'],
    answer: 'Use the login button in the navbar or visit /user to access your account!',
    category: 'account',
    action: 'navigate',
    data: { path: '/user' },
  },

  // RECOMMENDATIONS (Static examples - you can expand)
  {
    id: 'recommend_action',
    questions: ['recommend action', 'action manga', 'good action', 'fighting manga', 'battle manga'],
    answer: 'For action, check out: Solo Leveling, Chainsaw Man, Jujutsu Kaisen, or One Punch Man! Head to /manga and filter by Action genre.',
    category: 'manga',
    action: 'search',
    data: { genre: 'Action', type: 'manga' },
  },
  {
    id: 'recommend_romance',
    questions: ['recommend romance', 'romance manga', 'romance novel', 'love story', 'romantic'],
    answer: 'Try: Horimiya, Kaguya-sama: Love is War, or Fruits Basket for romance! Check /manga or /novels with the Romance filter.',
    category: 'general',
    action: 'search',
    data: { genre: 'Romance' },
  },
  {
    id: 'recommend_fantasy',
    questions: ['recommend fantasy', 'fantasy manga', 'magic', 'isekai', 'another world'],
    answer: 'Fantasy favorites: Re:Zero, Mushoku Tensei, The Beginning After The End, or Overlord! Perfect for isekai fans.',
    category: 'general',
    action: 'search',
    data: { genre: 'Fantasy' },
  },

  // SUPPORT
  {
    id: 'contact_support',
    questions: ['contact support', 'help', 'bug report', 'issue', 'problem', 'not working'],
    answer: 'Need help? Visit our support page at /support or email us at support@sagaread.com. We\'re here to help!',
    category: 'support',
    action: 'navigate',
    data: { path: '/support' },
  },
  {
    id: 'report_bug',
    questions: ['report bug', 'something broken', 'error', 'glitch', 'bug'],
    answer: 'Sorry about that! Please report bugs at /support with details about what went wrong.',
    category: 'support',
    action: 'navigate',
    data: { path: '/support' },
  },

  // FALLBACK
  {
    id: 'fallback',
    questions: ['default', 'unknown', 'fallback'],
    answer: "I'm not sure I understood that. I can help you find manga, novels, or webtoons, or answer questions about using SAGA Read. What would you like to do?",
    category: 'general',
  },
];

// Content database - Add your actual content here!
export const contentDatabase = {
  manga: [
    { id: 1, title: 'Solo Leveling', genres: ['Action', 'Fantasy', 'Supernatural'], status: 'Completed', chapters: 179, rating: 4.9 },
    { id: 2, title: 'Chainsaw Man', genres: ['Action', 'Horror', 'Supernatural'], status: 'Ongoing', chapters: 150, rating: 4.8 },
    { id: 3, title: 'Jujutsu Kaisen', genres: ['Action', 'Supernatural'], status: 'Ongoing', chapters: 250, rating: 4.7 },
    { id: 4, title: 'One Piece', genres: ['Action', 'Adventure', 'Fantasy'], status: 'Ongoing', chapters: 1100, rating: 4.9 },
    { id: 5, title: 'Horimiya', genres: ['Romance', 'Slice of Life'], status: 'Completed', chapters: 125, rating: 4.6 },
  ],
  novels: [
    { id: 1, title: 'Mushoku Tensei', genres: ['Fantasy', 'Isekai', 'Adventure'], status: 'Completed', chapters: 250, rating: 4.8 },
    { id: 2, title: 'Re:Zero', genres: ['Fantasy', 'Isekai', 'Psychological'], status: 'Ongoing', chapters: 500, rating: 4.7 },
  ],
  webtoons: [
    { id: 1, title: 'True Beauty', genres: ['Romance', 'Drama'], status: 'Ongoing', chapters: 200, rating: 4.5 },
    { id: 2, title: 'Tower of God', genres: ['Action', 'Fantasy'], status: 'Ongoing', chapters: 550, rating: 4.8 },
  ],

    comics: [  // ADDED THIS
    { id: 1, title: 'Sorcerer Supreme', genres: ['Supernatural', 'Action'], status: 'Ongoing', chapters: 50, rating: 4.6 },
    { id: 2, title: 'Absolute Batman', genres: ['Action', 'Crime'], status: 'Ongoing', chapters: 12, rating: 4.7 },
    { id: 3, title: 'Spider-Man', genres: ['Action', 'Superhero'], status: 'Ongoing', chapters: 900, rating: 4.8 },
  ],
};