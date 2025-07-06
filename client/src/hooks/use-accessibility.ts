import { useState, useEffect, useCallback } from 'react';

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  focusVisible: boolean;
  screenReaderSupport: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  contrast: 'normal',
  reducedMotion: false,
  focusVisible: true,
  screenReaderSupport: true,
};

const STORAGE_KEY = 'accessibility-settings';

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.setAttribute('data-font-size', settings.fontSize);
    
    // Apply contrast
    root.setAttribute('data-contrast', settings.contrast);
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Apply focus visibility
    root.setAttribute('data-focus-visible', settings.focusVisible.toString());
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }, [settings]);

  // Listen for system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for reduced motion preference
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && !settings.reducedMotion) {
        updateSetting('reducedMotion', true);
      }
    };
    motionMediaQuery.addEventListener('change', handleMotionChange);

    // Listen for high contrast preference
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (e.matches && settings.contrast === 'normal') {
        updateSetting('contrast', 'high');
      }
    };
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const increaseFontSize = useCallback(() => {
    if (settings.fontSize === 'small') updateSetting('fontSize', 'medium');
    else if (settings.fontSize === 'medium') updateSetting('fontSize', 'large');
  }, [settings.fontSize, updateSetting]);

  const decreaseFontSize = useCallback(() => {
    if (settings.fontSize === 'large') updateSetting('fontSize', 'medium');
    else if (settings.fontSize === 'medium') updateSetting('fontSize', 'small');
  }, [settings.fontSize, updateSetting]);

  const toggleHighContrast = useCallback(() => {
    updateSetting('contrast', settings.contrast === 'high' ? 'normal' : 'high');
  }, [settings.contrast, updateSetting]);

  const toggleReducedMotion = useCallback(() => {
    updateSetting('reducedMotion', !settings.reducedMotion);
  }, [settings.reducedMotion, updateSetting]);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    if (!settings.screenReaderSupport) return;

    // Create or find the announcement region
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }

    // Clear and set the message
    announcer.textContent = '';
    setTimeout(() => {
      announcer!.textContent = message;
    }, 100);
  }, [settings.screenReaderSupport]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            increaseFontSize();
            break;
          case '-':
            e.preventDefault();
            decreaseFontSize();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [increaseFontSize, decreaseFontSize]);

  return {
    settings,
    updateSetting,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    resetToDefaults,
    announceToScreenReader,
  };
}