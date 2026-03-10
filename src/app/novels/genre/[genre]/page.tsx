'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { Heart, Eye, ArrowLeft } from 'lucide-react';

interface Novel {
  id: number;
  title: string;
  type: string;
  cover_url: string;
  status: string;
  description: string;
  created_at: string;
  chapter_count: number;
  latest_chapter_date: string;
  view_count?: number;
  genres?: string[];
}

export default function NovelGenrePage() {
  const params = useParams();
  const router = useRouter();
  const genre = params.genre as string;
  
  const [novelList, setNovelList] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);

  useEffect(() => {
    fetchNovelsByGenre();
  }, [genre]);

  const fetchNovelsByGenre = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/novels?genre=${encodeURIComponent(genre)}`);
      const data = await response.json();
      
      if (data.success) {
        setNovelList(data.works);
      }
    } catch (error) {
      console.error('Error fetching novels by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, novel: Novel) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(novel.id, 'novel')) {
      removeFromFavorites(novel.id, 'novel');
    } else {
      addToFavorites({
        id: novel.id,
        title: novel.title,
        type: 'novel',
        cover_url: novel.cover_url,
        status: novel.status,
        description: novel.description,
        chapter_count: novel.chapter_count,
        latest_chapter_date: novel.latest_chapter_date
      });
    }
  };

  const formatViewCount = (count: number = 0) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading {formattedGenre} novels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans">
      <div className="container mx-auto px-4">
        <div className="pt-4 md:pt-12 pb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4 md:mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="mb-6 md:mb-8">
            <div className="inline-block">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-5 py-2 md:px-6 md:py-2.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-xl md:text-2xl">📚</span>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {formattedGenre} Novels
                  </h1>
                  <span className="text-gray-400 dark:text-gray-500 text-base md:text-lg">|</span>
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-light">
                    {novelList.length} titles
                  </p>
                </div>
              </div>
            </div>
          </div>

          {novelList.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-800">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {formattedGenre} Novels Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Check back later for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {novelList.map((novel) => (
                <Link 
                  key={novel.id} 
                  href={`/novels/${novel.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:scale-[1.02] shadow-sm relative group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {novel.cover_url && novel.cover_url !== '/placeholder-cover.jpg' ? (
                      <img 
                        src={novel.cover_url} 
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <span className="text-3xl">📚</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 left-2 bg-gray-900/80 dark:bg-gray-800/80 text-white dark:text-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                      Novel
                    </div>
                    
                    <button
                      onClick={(e) => toggleFavorite(e, novel)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                        isFavorite(novel.id, 'novel')
                          ? 'bg-red-500 text-white'
                          : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isFavorite(novel.id, 'novel') ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1.5" title={novel.title}>
                      {novel.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate max-w-[60px]">
                        #{novel.chapter_count}
                      </span>
                      <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-500">
                        <Eye size={9} />
                        <span>{formatViewCount(novel.view_count || 0)}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}