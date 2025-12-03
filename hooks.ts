
import { useState, useEffect, useRef } from 'react';
import { UserProgress } from './types';

// --- Audio Helpers ---

export const playBrowserTTS = (text: string) => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find(v => v.lang.startsWith('ar') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || 
                      voices.find(v => v.lang.startsWith('ar'));
  
  if (arabicVoice) {
    utterance.voice = arabicVoice;
    utterance.lang = arabicVoice.lang;
  } else {
    utterance.lang = 'ar-SA';
  }
  
  utterance.rate = 0.8; 
  window.speechSynthesis.speak(utterance);
};

export const playPronunciation = (text: string, audioText?: string) => {
  const textToSpeak = audioText || text;
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodeURIComponent(textToSpeak)}`;
  const audio = new Audio(url);
  
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      playBrowserTTS(textToSpeak);
    });
  } else {
     audio.onerror = () => playBrowserTTS(textToSpeak);
  }
  audio.onerror = () => playBrowserTTS(textToSpeak);
};

// --- Custom Hooks ---

// Global audio manager to ensure only one audio plays at a time
class GlobalAudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private listeners: Set<(isPlaying: boolean, url: string | null) => void> = new Set();
  private endedListeners: Set<(url: string) => void> = new Set();

  addListener(callback: (isPlaying: boolean, url: string | null) => void) {
    this.listeners.add(callback);
  }

  removeListener(callback: (isPlaying: boolean, url: string | null) => void) {
    this.listeners.delete(callback);
  }

  addEndedListener(callback: (url: string) => void) {
    this.endedListeners.add(callback);
  }

  removeEndedListener(callback: (url: string) => void) {
    this.endedListeners.delete(callback);
  }

  private notifyListeners(isPlaying: boolean, url: string | null) {
    this.listeners.forEach(callback => callback(isPlaying, url));
  }

  private notifyEndedListeners(url: string) {
    this.endedListeners.forEach(callback => callback(url));
  }

  play(url: string): Promise<void> {
    // Stop current audio if playing
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }

    // If same audio, don't recreate
    if (this.currentUrl === url && this.currentAudio) {
      const playPromise = this.currentAudio.play();
      this.notifyListeners(true, url);
      return playPromise || Promise.resolve();
    }

    // Create new audio
    const audio = new Audio(url);
    this.currentAudio = audio;
    this.currentUrl = url;

    audio.addEventListener('ended', () => {
      this.notifyListeners(false, null);
      this.notifyEndedListeners(url);
    });

    audio.addEventListener('pause', () => {
      this.notifyListeners(false, this.currentUrl);
    });

    audio.addEventListener('play', () => {
      this.notifyListeners(true, this.currentUrl);
    });

    audio.addEventListener('error', () => {
      this.notifyListeners(false, null);
    });

    const playPromise = audio.play();
    this.notifyListeners(true, url);
    return playPromise || Promise.resolve();
  }

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  isPlaying(url: string): boolean {
    return this.currentUrl === url && this.currentAudio && !this.currentAudio.paused;
  }

  getCurrentUrl(): string | null {
    return this.currentUrl;
  }
}

const globalAudioManager = new GlobalAudioManager();

// Export for external use
export { globalAudioManager };

// --- Custom Hooks ---

export function useAudio(url: string | undefined) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const handleAudioChange = (playing: boolean, playingUrl: string | null) => {
      if (url === playingUrl) {
        setIsPlaying(playing);
        setError(null);
      } else if (playing && playingUrl !== url) {
        // Another audio is playing
        setIsPlaying(false);
      }
    };

    globalAudioManager.addListener(handleAudioChange);
    
    // Check initial state
    setIsPlaying(globalAudioManager.isPlaying(url));

    return () => {
      globalAudioManager.removeListener(handleAudioChange);
    };
  }, [url]);

  const toggle = async () => {
    if (!url) return;

    if (isPlaying) {
      globalAudioManager.pause();
    } else {
      try {
        await globalAudioManager.play(url);
      } catch (e) {
        console.error("Audio playback error:", e);
        setError("Failed to load audio.");
      }
    }
  };

  return { isPlaying, toggle, error };
}

export function useAutoPlay(verseUrls: string[], onAutoPlayNext?: (verseIndex: number) => void) {
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  useEffect(() => {
    // Get autoPlay setting from user preferences
    const userProfile = localStorage.getItem('user_profile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        setAutoPlayEnabled(profile.preferences?.autoPlay !== false);
      } catch (e) {
        console.error('Error reading user preferences:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!autoPlayEnabled || verseUrls.length === 0) return;

    const handleAudioEnded = (endedUrl: string) => {
      // Find the current verse index and play next
      const currentIndex = verseUrls.indexOf(endedUrl);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < verseUrls.length) {
        const nextUrl = verseUrls[nextIndex];
        
        // Notify parent component about auto-play progression
        if (onAutoPlayNext) {
          onAutoPlayNext(nextIndex);
        }
        
        // Auto-play next verse after a short delay
        setTimeout(() => {
          globalAudioManager.play(nextUrl).catch(e => {
            console.error('Auto-play failed:', e);
          });
        }, 500); // 500ms delay between verses
      }
    };

    globalAudioManager.addEndedListener(handleAudioEnded);

    return () => {
      globalAudioManager.removeEndedListener(handleAudioEnded);
    };
  }, [verseUrls, autoPlayEnabled, onAutoPlayNext]);

  return { autoPlayEnabled };
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>({ 
    completedLessons: [], 
    totalXP: 0,
    bookmarks: [],
    lastReadSurahId: undefined,
    lastReadVerseKey: undefined
  });

  useEffect(() => {
    const saved = localStorage.getItem('quran_learning_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist for legacy data
      if (!parsed.bookmarks) parsed.bookmarks = [];
      if (!parsed.lastReadVerseKey) parsed.lastReadVerseKey = undefined;
      setProgress(parsed);
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('quran_learning_progress', JSON.stringify(newProgress));
  };

  const completeLesson = (lessonId: string, xp: number) => {
    if (progress.completedLessons.includes(lessonId)) return;

    saveProgress({
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      totalXP: progress.totalXP + xp
    });
  };

  const toggleBookmark = (verseKey: string) => {
    const isBookmarked = progress.bookmarks.includes(verseKey);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = progress.bookmarks.filter(b => b !== verseKey);
    } else {
      newBookmarks = [...progress.bookmarks, verseKey];
    }
    saveProgress({ ...progress, bookmarks: newBookmarks });
  };

  const setLastRead = (surahId: number, verseKey?: string) => {
    saveProgress({ 
      ...progress, 
      lastReadSurahId: surahId,
      lastReadVerseKey: verseKey || progress.lastReadVerseKey
    });
  };

  const setLastReadPosition = (verseKey: string) => {
    const [surahId] = verseKey.split(':').map(Number);
    saveProgress({ 
      ...progress, 
      lastReadSurahId: surahId,
      lastReadVerseKey: verseKey
    });
  };

  return { progress, completeLesson, toggleBookmark, setLastRead, setLastReadPosition };
}
