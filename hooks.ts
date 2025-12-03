
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

export function useAudio(url: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setError(null);
    setIsPlaying(false);

    if (url) {
      const audio = new Audio(url);
      
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('error', (e) => {
         console.error("Audio playback error:", e);
         setIsPlaying(false);
         setError("Failed to load audio.");
      });

      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  const toggle = () => {
    if (!audioRef.current || error) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.error("Play promise error:", e);
            setError("Playback failed.");
        });
      }
    }
  };

  return { isPlaying, toggle, error };
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>({ 
    completedLessons: [], 
    totalXP: 0,
    bookmarks: [],
    lastReadSurahId: undefined
  });

  useEffect(() => {
    const saved = localStorage.getItem('quran_learning_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist for legacy data
      if (!parsed.bookmarks) parsed.bookmarks = [];
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

  const setLastRead = (surahId: number) => {
    saveProgress({ ...progress, lastReadSurahId: surahId });
  };

  return { progress, completeLesson, toggleBookmark, setLastRead };
}
