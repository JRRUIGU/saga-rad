// app/favorites/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, BookOpen, Filter, X } from 'lucide-react';

type ContentType = 'manga' | 'comic' | 'webtoon' | 'novel';

interface FavoriteItem {
  id: number;
  title: string;
  type: ContentType;
  cover_url: string;
  status: string;
  description: string;
  added_at: string;
  chapter_count: number;
  latest_chapter_date: string;
  author?: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('user_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed.sort((a: FavoriteItem, b: FavoriteItem) => 
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: number, type: ContentType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingId(id);
    
    // Animation delay before actual removal
    setTimeout(() => {
      const updated = favorites.filter(item => !(item.id === id && item.type === type));
      setFavorites(updated);
      localStorage.setItem('user_favorites', JSON.stringify(updated));
      setRemovingId(null);
    }, 300);
  };

  const clearAllFavorites = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      setFavorites([]);
      localStorage.removeItem('user_favorites');
    }
  };

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(item => item.type === filter);

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case 'manga': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'comic': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'webtoon': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'novel': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'manga': return '🇯🇵';
      case 'comic': return '🇺🇸';
      case 'webtoon': return '🇰🇷';
      case 'novel': return '📚';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <Heart className="w-8 h-8 text-red-600 dark:text-red-400 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Favorites</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm">
            Your personal collection of saved manga, comics, webtoons, and novels
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-800">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start exploring and add items to your favorites to see them here
            </p>
            <Link 
              href="/discover" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Discover Content
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                {(['all', 'manga', 'comic', 'webtoon', 'novel'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      filter === type
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    {type !== 'all' && (
                      <span className="ml-2 text-xs opacity-75">
                        ({favorites.filter(f => f.type === type).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={clearAllFavorites}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {filter === 'all' ? 'All Favorites' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`}
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                  ({filteredFavorites.length})
                </span>
              </h2>
            </div>

            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-800 border-dashed">
                <p className="text-gray-500 dark:text-gray-400">
                  No {filter}s in your favorites yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFavorites.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg ${
                      removingId === item.id ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
                  >
                    <Link href={`/${item.type}/${item.id}`} className="block">
                      {/* Cover Image */}
                      <div className="h-56 relative overflow-hidden">
                        {item.cover_url && item.cover_url !== '/placeholder-cover.jpg' ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                            <span className="text-6xl">{getTypeIcon(item.type)}</span>
                          </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-sm bg-white/80 dark:bg-black/50 ${
                            item.status === 'ongoing' ? 'text-green-700 dark:text-green-400' :
                            item.status === 'completed' ? 'text-blue-700 dark:text-blue-400' :
                            'text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => removeFavorite(item.id, item.type, e)}
                          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/70 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110"
                          title="Remove from favorites"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content Info */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title={item.title}>
                          {item.title}
                        </h3>
                        
                        {item.author && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            by {item.author}
                          </p>
                        )}
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                          {item.description || 'No description available'}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {item.chapter_count} chapters
                          </span>
                          <span>
                            Added {new Date(item.added_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}