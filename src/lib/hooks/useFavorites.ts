// lib/hooks/useFavorites.ts
import { useState, useEffect } from 'react';

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

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user_favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const addToFavorites = (item: Omit<FavoriteItem, 'added_at'>) => {
    const exists = favorites.some(f => f.id === item.id && f.type === item.type);
    if (exists) return false;

    const newItem: FavoriteItem = {
      ...item,
      added_at: new Date().toISOString()
    };

    const updated = [newItem, ...favorites];
    setFavorites(updated);
    localStorage.setItem('user_favorites', JSON.stringify(updated));
    return true;
  };

  const removeFromFavorites = (id: number, type: ContentType) => {
    const updated = favorites.filter(f => !(f.id === id && f.type === type));
    setFavorites(updated);
    localStorage.setItem('user_favorites', JSON.stringify(updated));
  };

  const isFavorite = (id: number, type: ContentType) => {
    return favorites.some(f => f.id === id && f.type === type);
  };

  return {
    favorites,
    isLoaded,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
}