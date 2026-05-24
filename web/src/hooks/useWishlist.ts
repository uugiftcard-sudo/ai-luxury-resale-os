/**
 * useWishlist — localStorage-persisted wishlist state
 * Syncs to user account when auth is implemented.
 */
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cloth_wishlist';

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);

  const toggle = useCallback((productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      saveWishlist(next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const clear = useCallback(() => {
    setWishlist([]);
    saveWishlist([]);
  }, []);

  return { wishlist, toggle, isWishlisted, clear, count: wishlist.length };
}
