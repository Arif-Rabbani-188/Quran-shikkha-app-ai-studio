
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Moon, Sun, GraduationCap, Bookmark, BarChart3, Settings, Wifi, WifiOff } from 'lucide-react';

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
import WelcomeOnboarding from './WelcomeOnboarding';
import SmartSearch from './SmartSearch';
import DailyGoals from './DailyGoals';
import ReadingStatistics from './ReadingStatistics';
import OfflineMode from './OfflineMode';
import UserSettings from './UserSettings';

const App = () => {
  const [view, setView] = useState<string>('list');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [initialVerseKey, setInitialVerseKey] = useState<string | undefined>(undefined);
  const [showMarkerTemporarily, setShowMarkerTemporarily] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'quran' | 'learn' | 'bookmarks' | 'stats' | 'settings'>('quran');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { progress, completeLesson, toggleBookmark, setLastRead, setLastReadPosition, markAyahAsRead } = useProgress();

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    // Check if user needs onboarding
    const hasOnboarded = localStorage.getItem('quran_app_onboarded');
    if (!hasOnboarded) {
      // Temporarily disable onboarding to debug loading issues
      // setShowOnboarding(true);
    }
    
    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add goals view event listener
  useEffect(() => {
    const handleOpenGoals = () => {
      setView('goals');
    };

    window.addEventListener('openGoals', handleOpenGoals);
    return () => window.removeEventListener('openGoals', handleOpenGoals);
  }, []);

  const switchTab = (tab: 'quran' | 'learn' | 'bookmarks' | 'stats' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'quran') setView('list');
    if (tab === 'learn') setView('learn_list');
    if (tab === 'bookmarks') setView('bookmarks');
    if (tab === 'stats') setView('statistics');
    if (tab === 'settings') setView('settings');
    
    // Auto-scroll to top when switching tabs
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const openGoalsView = () => {
    setView('goals');
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
            
            // Auto-scroll to top when navigating to bookmark
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    }
  };

  const handleSmartSearch = (query: string, filters: any) => {
    // Implement smart search logic here
    console.log('Smart search:', query, filters);
    // For now, close the search modal
    setShowSmartSearch(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
    } else {
      setDarkMode(theme === 'dark');
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
        return <BookmarksView bookmarks={progress.bookmarks} onSelect={handleBookmarkSelect} onToggleBookmark={toggleBookmark} />;
    }

    if (view === 'goals') {
        return (
            <div className="container mx-auto p-4 max-w-4xl pb-24">
                <DailyGoals 
                    userProgress={progress}
                    onGoalComplete={(goal) => {
                        console.log('Goal completed:', goal);
                    }}
                />
            </div>
        );
    }

    if (view === 'statistics') {
        return (
            <div className="container mx-auto p-4 max-w-4xl pb-24">
                <ReadingStatistics userProgress={progress} />
            </div>
        );
    }



    if (view === 'offline') {
        return (
            <div className="container mx-auto p-4 max-w-4xl pb-24">
                <OfflineMode isOnline={isOnline} />
            </div>
        );
    }

    if (view === 'settings') {
        return (
            <div className="container mx-auto p-4 max-w-4xl pb-24">
                <UserSettings 
                    currentTheme={darkMode ? 'dark' : 'light'}
                    onThemeChange={handleThemeChange}
                />
            </div>
        );
    }

    if (activeTab === 'quran') {
        if (view === 'detail' && selectedSurah) {
            return (
                <SurahDetail 
                    surah={selectedSurah} 
                    onBack={() => {
                      setView('list');
                      // Auto-scroll to top when going back to list
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
                    bookmarks={progress.bookmarks}
                    onToggleBookmark={toggleBookmark}
                    onLoad={setLastRead}
                    initialVerseKey={initialVerseKey}
                    lastReadVerseKey={progress.lastReadVerseKey}
                    onSetLastReadPosition={setLastReadPosition}
                    onMarkAyahAsRead={markAyahAsRead}
                    showMarkerTemporarily={showMarkerTemporarily}
                />
            );
        }
        return (
            <SurahList 
                onSelect={(s, verseKey) => { 
                  setSelectedSurah(s); 
                  setInitialVerseKey(verseKey); 
                  setView('detail');
                  
                  // Show marker temporarily if continuing from a specific verse
                  if (verseKey && verseKey !== `${s.id}:1`) {
                    setShowMarkerTemporarily(true);
                    setTimeout(() => {
                      setShowMarkerTemporarily(false);
                    }, 3000); // Hide after 3 seconds
                  }
                  
                  // Auto-scroll to top when selecting a surah
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }} 
                lastReadSurahId={progress.lastReadSurahId}
                lastReadVerseKey={progress.lastReadVerseKey}
            />
        );
    } else {
        if (view === 'learn_detail' && selectedLesson) {
            const { prev, next } = getNavigation(selectedLesson.id);
            // Check if next is locked? Usually handled by UI, but here we only enable if current is complete.
            
            return (
                <LessonView 
                    lesson={selectedLesson} 
                    onBack={() => {
                      setView('learn_list');
                      // Auto-scroll to top when going back to lesson list
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }} 
                    onComplete={() => completeLesson(selectedLesson.id, selectedLesson.xp)}
                    isCompleted={progress.completedLessons.includes(selectedLesson.id)}
                    onNext={next ? () => setSelectedLesson(next) : undefined}
                    onPrev={prev ? () => setSelectedLesson(prev) : undefined}
                    hasNext={!!next}
                    hasPrev={!!prev}
                />
            );
        }
        return <LearningDashboard onSelectLesson={(l) => { 
          setSelectedLesson(l); 
          setView('learn_detail');
          // Auto-scroll to top when selecting a lesson
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }} progress={progress} />;
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
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent block md:block font-bengali">
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
            <button 
                onClick={() => switchTab('stats')}
                className={`flex items-center gap-2 font-medium transition-colors ${activeTab === 'stats' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'}`}
            >
                <BarChart3 size={18} />
                পরিসংখ্যান
            </button>
            <button 
                onClick={() => switchTab('settings')}
                className={`flex items-center gap-2 font-medium transition-colors ${activeTab === 'settings' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'}`}
            >
                <Settings size={18} />
                সেটিংস
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Status */}
            <button 
              onClick={() => setView('offline')}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                isOnline 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              }`}
              title="অফলাইন মোড দেখুন"
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="hidden md:inline font-bengali">
                {isOnline ? 'অনলাইন' : 'অফলাইন'}
              </span>
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-6">
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 p-2 z-40 pb-safe">
        <div className="flex justify-around items-center">
          <button 
              onClick={() => switchTab('quran')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'quran' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-600'}`}
          >
              <BookOpen size={22} />
              <span className="text-[10px] font-bold font-bengali">কুরআন</span>
              {activeTab === 'quran' && <div className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>}
          </button>
          <button 
              onClick={() => switchTab('learn')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'learn' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-600'}`}
          >
              <GraduationCap size={22} />
              <span className="text-[10px] font-bold font-bengali">শিক্ষা</span>
              {activeTab === 'learn' && <div className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>}
          </button>
          <button 
              onClick={() => switchTab('stats')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-600'}`}
          >
              <BarChart3 size={22} />
              <span className="text-[10px] font-bold font-bengali">পরিসংখ্যান</span>
              {activeTab === 'stats' && <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>}
          </button>
          <button 
              onClick={() => switchTab('bookmarks')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all relative ${activeTab === 'bookmarks' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-slate-600'}`}
          >
              <Bookmark size={22} />
              <span className="text-[10px] font-bold font-bengali">বুকমার্ক</span>
              {activeTab === 'bookmarks' && <div className="w-1 h-1 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>}
          </button>
          <button 
              onClick={() => switchTab('settings')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-slate-600'}`}
          >
              <Settings size={22} />
              <span className="text-[10px] font-bold font-bengali">সেটিংস</span>
              {activeTab === 'settings' && <div className="w-1 h-1 bg-gray-600 dark:bg-gray-400 rounded-full"></div>}
          </button>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <InstallPWA />
      
      {/* PWA Update Notification */}
      <UpdateNotification />
      
      {/* Welcome Onboarding */}
      {showOnboarding && (
        <WelcomeOnboarding onComplete={handleOnboardingComplete} />
      )}
      
      {/* Smart Search Modal */}
      {/* <SmartSearch 
        isOpen={showSmartSearch}
        onClose={() => setShowSmartSearch(false)}
        onSearch={handleSmartSearch}
      /> */}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

export default App;
