/**
 * Market context — persists the active market across the session.
 * Reads from localStorage so the user's preference survives page refreshes.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { Market, MARKET_CONFIGS, type MarketConfig } from '../types/market';

interface MarketContextValue {
  market: Market;
  config: MarketConfig;
  setMarket: (m: Market) => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

const STORAGE_KEY = 'cloth_market';

function marketFromPath(pathname: string): Market | null {
  if (pathname === '/hk' || pathname.startsWith('/hk/')) return 'HK';
  if (pathname === '/cn' || pathname.startsWith('/cn/')) return 'CN';
  return null;
}

/** Determine the initial market: URL path wins, then localStorage. */
function resolveInitialMarket(pathname: string): Market {
  const pathMarket = marketFromPath(pathname);
  if (pathMarket) return pathMarket;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'UK' || saved === 'HK' || saved === 'CN')) {
      return saved as Market;
    }
  } catch {
    // ignore
  }
  // Default to UK for now; a real deployment would geo-redirect here
  return 'UK';
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [market, setMarketState] = useState<Market>(() => resolveInitialMarket(location.pathname));

  useEffect(() => {
    const pathMarket = marketFromPath(location.pathname);
    if (pathMarket && pathMarket !== market) {
      setMarketState(pathMarket);
    }
  }, [location.pathname, market]);

  // Persist to localStorage whenever market changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, market);
    } catch {
      // ignore
    }
  }, [market]);

  const setMarket = useCallback((m: Market) => {
    setMarketState(m);
  }, []);

  const value: MarketContextValue = {
    market,
    config: MARKET_CONFIGS[market],
    setMarket,
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
