import { useState, useEffect } from 'react';
import { getFontSettings, updateFontSettings } from '@/api/settings';
import type { FontSettingsVO, UpdateFontSettingsRequest } from '@/types';

const STORAGE_KEY = 'font_settings';
const DEFAULT_FONT_FAMILY = 'system-ui, -apple-system, sans-serif';
const DEFAULT_FONT_SIZE = '16';

export function useFontSettings() {
  const [fontSettings, setFontSettings] = useState<FontSettingsVO>({
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
  });
  const [loading, setLoading] = useState(false);

  const applyFontSettings = (settings: FontSettingsVO) => {
    const root = document.documentElement;
    if (settings.fontFamily) {
      root.style.setProperty('--global-font-family', settings.fontFamily);
      document.body.style.fontFamily = settings.fontFamily;
    }
    if (settings.fontSize) {
      root.style.setProperty('--global-font-size', `${settings.fontSize}px`);
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
    }
  };

  const fetchFontSettings = async () => {
    setLoading(true);
    try {
      const settings = await getFontSettings();
      setFontSettings(settings);
      applyFontSettings(settings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to fetch font settings, using default or cached:', error);
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setFontSettings(parsed);
          applyFontSettings(parsed);
        } catch {
          applyFontSettings(fontSettings);
        }
      } else {
        applyFontSettings(fontSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: UpdateFontSettingsRequest) => {
    setLoading(true);
    try {
      const updated = await updateFontSettings(data);
      setFontSettings(updated);
      applyFontSettings(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFontSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    fontSettings,
    loading,
    updateSettings,
    refreshSettings: fetchFontSettings,
  };
}
