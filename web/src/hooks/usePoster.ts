/**
 * usePoster — client-side promo poster generation hook
 *
 * Uses html2canvas to render the PosterTemplate component to a PNG image
 * and triggers a browser download. No backend required.
 */
import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import type { Product } from '../types';
import type { Market } from '../types/market';

export function usePoster() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * generateAndDownload — renders the poster template to canvas and downloads it.
   *
   * @param product   The product data to render on the poster
   * @param market    The active market (controls language and currency)
   */
  const generateAndDownload = useCallback(
    async (product: Product, _market: Market) => {
      setGenerating(true);
      setError(null);

      try {
        // Find the hidden poster template element
        const el = document.getElementById('cloth-poster-template');
        if (!el) {
          throw new Error('Poster template not found');
        }

        // Render the template to a canvas
        const canvas = await html2canvas(el, {
          scale: 2, // Retina-quality output (2160x2700px)
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          logging: false,
        });

        // Convert to a data URL
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // Trigger download
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
