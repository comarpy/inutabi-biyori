'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  amenities: LucideIcon[];
  image: string;
  coordinates: [number, number];
}

interface FavoritesContextType {
  favorites: Hotel[];
  addToFavorites: (hotel: Hotel) => void;
  removeFromFavorites: (hotelId: number) => void;
  isFavorite: (hotelId: number) => boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Hotel[]>([]);
  const [mounted, setMounted] = useState(false);

  // コンポーネントマウント時にローカルストレージから読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('dogHotelFavorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('お気に入りの読み込みに失敗しました:', error);
        }
      }
      setMounted(true);
    }
  }, []);

  // お気に入りが変更されたらローカルストレージに保存
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('dogHotelFavorites', JSON.stringify(favorites));
    }
  }, [favorites, mounted]);

  const addToFavorites = (hotel: Hotel) => {
    setFavorites(prev => {
      // 既に存在する場合は追加しない
      if (prev.some(fav => fav.id === hotel.id)) {
        return prev;
      }
      return [...prev, hotel];
    });
  };

  const removeFromFavorites = (hotelId: number) => {
    setFavorites(prev => prev.filter(hotel => hotel.id !== hotelId));
  };

  const isFavorite = (hotelId: number) => {
    return favorites.some(hotel => hotel.id === hotelId);
  };

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    favoritesCount: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 