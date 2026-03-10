'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { Heart, HeartHandshake, Home } from 'lucide-react';

interface MangaWork {
  id: number;
  user_id: number;
  title: string;
  type: string;
  cover_url: string;
  description: string;
  status: string;
  created_at: string;
}

interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  page_count: number;
  created_at: string;
}

export default function MangaViewPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  
  const [manga, setManga] = useState<MangaWork | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const isFav = manga ? isFavorite(manga.id, 'manga') : false;

  useEffect(() => {
    if (mangaId) {
      fetchMangaDetails();
    }
  }, [mangaId]);

  const fetchMangaDetails = async () => {
    try {
      const response = await fetch(`/api/manga/${mangaId}`);
      const data = await response.json();
      
      if (data.success) {
        setManga(data.manga);
        fetchChapters();
      }
    } catch (error) {
      console.error('Error fetching manga:', error);
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/manga/${mangaId}/chapters`);
      const data = await response.json();
      
      if (data.success) {
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!manga) return;
    
    if (isFav) {
      removeFromFavorites(manga.id, 'manga');
    } else {
      addToFavorites({
        id: manga.id,
        title: manga.title,
        type: 'manga',
        cover_url: manga.cover_url,
        status: manga.status,
        description: manga.description,
        chapter_count: chapters.length,
        latest_chapter_date: chapters.length > 0 ? chapters[chapters.length - 1].created_at : manga.created_at
      });
    }
  };

  // Get the content type page route
  const getContentRoute = () => {
    if (!manga) return '/';
    return manga.type === 'manga' ? '/manga' :
           manga.type === 'webtoon' ? '/webtoons' :
           manga.type === 'comic' ? '/comics' : '/novels';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading manga...</p>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Manga not found</h3>
          <Link 
            href="/"
            className="px-6 py-3 bg-black text-white rounded-lg hover:opacity-90"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
          
          {/* Simple Navigation Links */}
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
            >
              <Home size={16} />
              <span>Home</span>
            </Link>

            <Link
              href={getContentRoute()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
            >
              <span>← Back to {manga.type === 'manga' ? 'Manga' :
                               manga.type === 'webtoon' ? 'Webtoons' :
                               manga.type === 'comic' ? 'Comics' : 'Novels'}</span>
            </Link>
          </div>

          {/* Hero Section with Landscape Cover */}
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-6 md:mb-8">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
              style={{ 
                backgroundImage: `url(${manga.cover_url && manga.cover_url !== '/placeholder-cover.jpg' ? manga.cover_url : ''})`,
                backgroundColor: manga.type === 'manga' ? '#1a1a1a' : 
                                manga.type === 'webtoon' ? '#2d2d2d' : 
                                manga.type === 'comic' ? '#1e3a5f' : '#1e3f2f'
              }}
            >
              {(!manga.cover_url || manga.cover_url === '/placeholder-cover.jpg') && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl opacity-30">
                    {manga.type === 'manga' && '🇯🇵'}
                    {manga.type === 'webtoon' && '🇰🇷'}
                    {manga.type === 'comic' && '🇺🇸'}
                    {manga.type === 'novel' && '📚'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center p-4 md:p-12">
              <div className="flex flex-row items-center gap-4 md:gap-6 w-full">
                {/* Cover - Always on left */}
                <div className="w-24 h-36 md:w-44 md:h-60 flex-shrink-0 rounded-xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  {manga.cover_url && manga.cover_url !== '/placeholder-cover.jpg' ? (
                    <img 
                      src={manga.cover_url} 
                      alt={manga.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      manga.type === 'manga' ? 'bg-gradient-to-br from-black to-gray-900' :
                      manga.type === 'webtoon' ? 'bg-gradient-to-br from-gray-900 to-black' :
                      manga.type === 'comic' ? 'bg-gradient-to-br from-blue-900 to-cyan-900' :
                      'bg-gradient-to-br from-green-900 to-emerald-900'
                    }`}>
                      <span className="text-3xl md:text-5xl">
                        {manga.type === 'manga' && '🇯🇵'}
                        {manga.type === 'webtoon' && '🇰🇷'}
                        {manga.type === 'comic' && '🇺🇸'}
                        {manga.type === 'novel' && '📚'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title and Info - Always on right */}
                <div className="flex-1 text-white min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium uppercase">
                      {manga.type}
                    </span>
                    <span className={`px-2 py-1 backdrop-blur-sm rounded text-xs font-medium ${
                      manga.status === 'ongoing' ? 'bg-green-500/30 text-green-200' :
                      manga.status === 'completed' ? 'bg-blue-500/30 text-blue-200' :
                      'bg-yellow-500/30 text-yellow-200'
                    }`}>
                      {manga.status}
                    </span>
                  </div>
                  <h1 className="text-base md:text-4xl font-bold mb-1 md:mb-2 drop-shadow-lg line-clamp-2">{manga.title}</h1>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-white/80">
                    <span>{chapters.length} Chapters</span>
                    <span>•</span>
                    <span>{new Date(manga.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg backdrop-blur-sm transition-all ${
                      isFav 
                        ? 'bg-red-500/80 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFav ? 'fill-current' : ''}`} />
                    <span className="text-xs md:text-sm font-medium hidden sm:inline">{isFav ? 'Favorited' : 'Favorite'}</span>
                  </button>

                  <Link
                    href={`/support/${manga.user_id}?workId=${manga.id}`}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg backdrop-blur-sm bg-amber-500/80 text-white hover:bg-amber-500 transition-all"
                  >
                    <HeartHandshake className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm font-medium hidden sm:inline">Support</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-300 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Description</h3>
            <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
              {manga.description || 'No description available.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-300 text-center">
              <p className="text-gray-600 text-xs mb-1">Chapters</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{chapters.length}</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-300 text-center">
              <p className="text-gray-600 text-xs mb-1">Status</p>
              <p className="text-sm md:text-lg font-bold text-gray-900 capitalize">{manga.status}</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-300 text-center">
              <p className="text-gray-600 text-xs mb-1">Created</p>
              <p className="text-xs md:text-sm font-bold text-gray-900">{new Date(manga.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Chapters List */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-300">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Chapters ({chapters.length})</h2>
            
            {chapters.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6">📭</div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No chapters yet</h3>
                <p className="text-gray-600 text-xs md:text-sm">Check back later for updates!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...chapters].reverse().map((chapter) => (
                  <div 
                    key={chapter.id}
                    className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200 hover:border-gray-400 transition-all hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-base md:text-lg font-bold text-white">{chapter.chapter_number}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 truncate">{chapter.title}</h3>
                          <p className="text-gray-500 text-xs">
                            {chapter.page_count} pages • {new Date(chapter.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/read/${manga.id}/${chapter.id}`}
                        className="px-4 md:px-6 py-1.5 md:py-2 bg-black text-white text-xs md:text-sm font-medium rounded-lg hover:opacity-90 transition-all whitespace-nowrap"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}