
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Moon, Sun, GraduationCap, Bookmark } from 'lucide-react';

import { Surah, Lesson } from './types';
import { useProgress } from './hooks';
import { LEARNING_MODULES } from './data'; // Import data here to calc nav logic

import SurahList from './SurahList';
import SurahDetail from './SurahDetail';
import LearningDashboard from './LearningDashboard';
import LessonView from './LessonView';
import BookmarksView from './BookmarksView';
import InstallPWA from './InstallPWA';
import OnlineStatus from './OnlineStatus';
import UpdateNotification from './UpdateNotification';
import PWAStatus from './PWAStatus';

const App = () => {
  const [view, setView] = useState<'list' | 'detail' | 'learn_list' | 'learn_detail' | 'bookmarks'>('list');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [initialVerseKey, setInitialVerseKey] = useState<string | undefined>(undefined);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'quran' | 'learn' | 'bookmarks'>('quran');
  
  const { progress, completeLesson, toggleBookmark, setLastRead } = useProgress();

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto scroll to top when view or tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, activeTab]);

  const switchTab = (tab: 'quran' | 'learn' | 'bookmarks') => {
    setActiveTab(tab);
    if (tab === 'quran') setView('list');
    if (tab === 'learn') setView('learn_list');
    if (tab === 'bookmarks') setView('bookmarks');
  };

  const handleBookmarkSelect = (surahId: number, verseKey: string) => {
    const cached = localStorage.getItem('quran_chapters_bn');
    if (cached) {
        const surahs: Surah[] = JSON.parse(cached);
        const surah = surahs.find(s => s.id === surahId);
        if (surah) {
            setSelectedSurah(surah);
            setInitialVerseKey(verseKey);
            setActiveTab('quran');
            setView('detail');
        }
    }
  };

  // Helper to flatten lessons and find neighbors
  const allLessons = useMemo(() => LEARNING_MODULES.flatMap(m => m.lessons), []);

  const getNavigation = (currentLessonId: string | undefined) => {
      if (!currentLessonId) return { prev: null, next: null };
      const idx = allLessons.findIndex(l => l.id === currentLessonId);
      if (idx === -1) return { prev: null, next: null };
      
      return {
          prev: idx > 0 ? allLessons[idx - 1] : null,
          next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null
      };
  };

  const renderContent = () => {
    if (view === 'bookmarks') {
        return <BookmarksView bookmarks={progress.bookmarks} onSelect={handleBookmarkSelect} />;
    }

    if (activeTab === 'quran') {
        if (view === 'detail' && selectedSurah) {
            return (
                <SurahDetail 
                    surah={selectedSurah} 
                    onBack={() => setView('list')}
                    bookmarks={progress.bookmarks}
                    onToggleBookmark={toggleBookmark}
                    onLoad={setLastRead}
                    initialVerseKey={initialVerseKey}
                />
            );
        }
        return (
            <SurahList 
                onSelect={(s) => { setSelectedSurah(s); setInitialVerseKey(undefined); setView('detail'); }} 
                lastReadSurahId={progress.lastReadSurahId}
            />
        );
    } else {
        if (view === 'learn_detail' && selectedLesson) {
            const { prev, next } = getNavigation(selectedLesson.id);
            // Check if next is locked? Usually handled by UI, but here we only enable if current is complete.
            
            return (
                <LessonView 
                    lesson={selectedLesson} 
                    onBack={() => setView('learn_list')} 
                    onComplete={() => completeLesson(selectedLesson.id, selectedLesson.xp)}
                    isCompleted={progress.completedLessons.includes(selectedLesson.id)}
                    onNext={next ? () => setSelectedLesson(next) : undefined}
                    onPrev={prev ? () => setSelectedLesson(prev) : undefined}
                    hasNext={!!next}
                    hasPrev={!!prev}
                />
            );
        }
        return <LearningDashboard onSelectLesson={(l) => { setSelectedLesson(l); setView('learn_detail'); }} progress={progress} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans`}>
      {/* PWA Components */}
      <OnlineStatus />
      {/* <PWAStatus /> */}
      
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold font-arabic">
                ق
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent block md:block font-bengali">
              কুরআন শিক্ষা
            </span>
          </div>

          {/* <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-full md:hidden">
              <button 
                onClick={() => switchTab('quran')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'quran' ? 'bg-white dark:bg-slate-700 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500'}`}
              >
                  কুরআন
              </button>
              <button 
                onClick={() => switchTab('learn')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'learn' ? 'bg-white dark:bg-slate-700 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500'}`}
              >
                  শিক্ষা
              </button>
              <button 
                onClick={() => switchTab('bookmarks')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'bookmarks' ? 'bg-white dark:bg-slate-700 shadow text-yellow-600 dark:text-yellow-400' : 'text-gray-500'}`}
              >
                  বুকমার্ক
              </button>
          </div> */}

          <div className="hidden md:flex gap-6 mr-auto ml-12">
            <button 
                onClick={() => switchTab('quran')}
                className={`flex items-center gap-2 font-medium transition-colors ${activeTab === 'quran' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'}`}
            >
                <BookOpen size={18} />
                কুরআন পাঠ
            </button>
            <button 
                onClick={() => switchTab('learn')}
                className={`flex items-center gap-2 font-medium transition-colors ${activeTab === 'learn' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'}`}
            >
                <GraduationCap size={18} />
                মুয়াল্লিম
            </button>
            <button 
                onClick={() => switchTab('bookmarks')}
                className={`flex items-center gap-2 font-medium transition-colors ${activeTab === 'bookmarks' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'}`}
            >
                <Bookmark size={18} />
                বুকমার্ক
            </button>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <main className="pt-6">
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-around p-3 z-40 pb-safe">
        <button 
            onClick={() => switchTab('quran')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'quran' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-600'}`}
        >
            <BookOpen size={24} />
            <span className="text-[10px] font-bold">কুরআন</span>
        </button>
        <button 
            onClick={() => switchTab('learn')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'learn' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-600'}`}
        >
            <GraduationCap size={24} />
            <span className="text-[10px] font-bold">শিক্ষা</span>
        </button>
        <button 
            onClick={() => switchTab('bookmarks')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'bookmarks' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-slate-600'}`}
        >
            <Bookmark size={24} />
            <span className="text-[10px] font-bold">বুকমার্ক</span>
        </button>
      </div>
      
      {/* PWA Install Prompt */}
      <InstallPWA />
      
      {/* PWA Update Notification */}
      <UpdateNotification />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
