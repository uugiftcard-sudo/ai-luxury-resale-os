/**
 * usePoster — client-side promo poster generation hook
 *
 * Uses html2canvas to render the PosterTemplate component to a PNG image
 * and triggers a browser download. No backend required.
 *
 * html2canvas is dynamically imported so it doesn't bloat the initial bundle.
 */
import { useState, useCallback } from 'react';
import type { Product } from '../types';
import type { Market } from '../types/market';

export function usePoster() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAndDownload = useCallback(
    async (product: Product, _market: Market) => {
      setGenerating(true);
      setError(null);

      try {
        const el = document.getElementById('cloth-poster-template');
        if (!el) {
          throw new Error('Poster template not found');
        }

        const html2canvas = (await import('html2canvas')).default;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          logging: false,
        });

        const dataUrl = canvas.toDataURL('image/png', 1.0);

        const link = document.createElement('a');
        link.download = `CLOTH_${product.brand.replace(/\s+/g, '_')}_${product.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('[usePoster] Generation failed:', err);
        setError(
          err instanceof Error
            ? err.message
            : '海報生成失敗，請稍後再試',
        );
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  return { generating, error, generateAndDownload };
}
