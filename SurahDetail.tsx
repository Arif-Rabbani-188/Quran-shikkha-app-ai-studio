import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Type, Settings2, Search, X } from 'lucide-react';
import { Surah, Verse } from './types';
import VerseItem from './VerseItem';
import { useAutoPlay, globalAudioManager } from './hooks';

interface SurahDetailProps {
  surah: Surah;
  onBack: () => void;
  bookmarks: string[];
  onToggleBookmark: (key: string) => void;
  onLoad: (id: number, verseKey?: string) => void;
  initialVerseKey?: string;
  lastReadVerseKey?: string;
  onSetLastReadPosition: (verseKey: string) => void;
  onMarkAyahAsRead: (verseKey: string) => void;
  showMarkerTemporarily?: boolean;
}

const SurahDetail: React.FC<SurahDetailProps> = ({ 
  surah, onBack, bookmarks, onToggleBookmark, onLoad, initialVerseKey, 
  lastReadVerseKey, onSetLastReadPosition, onMarkAyahAsRead, showMarkerTemporarily = false
}) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [tafsirs, setTafsirs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(28); 
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState<string | null>(null);
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Scroll-based reading position tracking
  useEffect(() => {
    if (!verses.length) return;

    const handleScroll = () => {
      // Find the verse that's currently most visible in the viewport
      const verseElements = verses.map(verse => 
        document.getElementById(`verse-${verse.verse_key}`)
      ).filter(Boolean);

      let mostVisibleVerse: string | null = null;
      let maxVisibilityRatio = 0;

      verseElements.forEach(element => {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate how much of the verse is visible
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const elementHeight = rect.height;
        
        const visibilityRatio = visibleHeight / elementHeight;
        
        // Require at least 30% visibility and element to be in the upper half of viewport
        if (visibilityRatio > maxVisibilityRatio && visibilityRatio > 0.3 && rect.top < viewportHeight * 0.6) {
          maxVisibilityRatio = visibilityRatio;
          mostVisibleVerse = element.id.replace('verse-', '');
        }
      });

      // Auto-save reading position if a verse is clearly visible
      if (mostVisibleVerse && maxVisibilityRatio > 0.5) {
        // Debounce the save operation
        clearTimeout((window as any).positionSaveTimeout);
        (window as any).positionSaveTimeout = setTimeout(() => {
          // Silent background tracking - no UI disruption
          onSetLastReadPosition(mostVisibleVerse);
          onMarkAyahAsRead(mostVisibleVerse);
        }, 1500); // Save after 1.5 seconds of viewing
      }
    };

    const throttledScroll = (() => {
      let ticking = false;
      return () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
    })();

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Also save position when user navigates away
    const handleBeforeUnload = () => {
      handleScroll(); // Save current position immediately
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout((window as any).positionSaveTimeout);
    };
  }, [verses, onSetLastReadPosition, onMarkAyahAsRead]);

  useEffect(() => {
    onLoad(surah.id, lastReadVerseKey);
    // Auto-scroll to top when opening or changing Surah
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [surah.id]);

  // Auto-close settings on scroll or outside click
  useEffect(() => {
    if (!showSettings) return;

    const handleScroll = () => {
      setShowSettings(false);
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      const settingsButton = document.querySelector('[title="Settings"]');
      const settingsPanel = document.querySelector('.settings-panel');
      
      if (settingsButton && settingsPanel && 
          !settingsButton.contains(target) && 
          !settingsPanel.contains(target)) {
        setShowSettings(false);
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Clear old cache versions to ensure fresh data
        ['v1', 'v2', 'v3', 'v4', 'v5'].forEach(version => {
          localStorage.removeItem(`surah_${surah.id}_details_${version}`);
        });

        // Bumped cache key to v6 to fetch fresh transliteration data
        const cacheKey = `surah_${surah.id}_details_v6`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
           const parsed = JSON.parse(cached);
           // Verify that we have all required translation data
           const hasRequiredData = parsed.verses.some(v => 
             v.translations.some(t => t.resource_id === 131) &&
             v.translations.some(t => t.resource_id === 161) &&
             v.translations.some(t => t.resource_id === 20)
           );
           if (hasRequiredData) {
             setVerses(parsed.verses);
             setTafsirs(parsed.tafsirs);
             setLoading(false);
             return;
           }
        }

        // Fetching 161 (Bengali), 131 (Transliteration), and 20 (English - Sahih International)
        const versesRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?language=bn&words=false&translations=161,131,20&fields=text_uthmani&per_page=${surah.verses_count}`);
        const versesData = await versesRes.json();

        const tafsirRes = await fetch(`https://api.quran.com/api/v4/quran/tafsirs/166?chapter_number=${surah.id}`);
        const tafsirData = await tafsirRes.json();

        const tafsirMap: Record<string, string> = {};
        if (tafsirData.tafsirs) {
            tafsirData.tafsirs.forEach((t: any) => {
                tafsirMap[t.verse_key] = t.text;
            });
        }

        const dataToCache = { verses: versesData.verses, tafsirs: tafsirMap };
        try {
            localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        } catch (e) {
            console.warn('LocalStorage full', e);
        }

        setVerses(versesData.verses);
        setTafsirs(tafsirMap);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [surah]);

  // Handle auto-scroll to bookmark or continue reading (only for intentional navigation)
  useEffect(() => {
    if (!loading && verses.length > 0) {
      // Only auto-scroll for intentional navigation: bookmarks or explicit continue reading
      const targetVerseKey = initialVerseKey;
      
      if (targetVerseKey) {
        setTimeout(() => {
            const element = document.getElementById(`verse-${targetVerseKey}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Only highlight for bookmarks, not for continue reading
              if (targetVerseKey !== lastReadVerseKey) {
                // Bookmark highlight (yellow)
                element.classList.add('bg-yellow-50', 'dark:bg-yellow-900/10');
                setTimeout(() => {
                    element.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/10');
                }, 2500);
              }
            }
        }, 100);
      }
    }
  }, [initialVerseKey, loading, verses, lastReadVerseKey]);

  const filteredVerses = verses.filter(verse => {
    if (!searchQuery) return true;
    // Check both translations for search keywords
    const translationText = verse.translations.map(t => t.text).join(' ').toLowerCase();
    const cleanTranslation = translationText.replace(/<[^>]*>?/gm, '');
    return cleanTranslation.includes(searchQuery.toLowerCase()) || 
           verse.verse_key.includes(searchQuery);
  });

  // Generate audio URLs for auto-play functionality
  const verseAudioUrls = useMemo(() => {
    return filteredVerses.map(verse => {
      const verseKeyParts = verse.verse_key.split(':');
      const surahPad = String(verseKeyParts[0]).padStart(3, '0');
      const ayahPad = String(verseKeyParts[1]).padStart(3, '0');
      return `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
    });
  }, [filteredVerses]);

  // Use auto-play hook with notification callback
  const { autoPlayEnabled } = useAutoPlay(verseAudioUrls, (verseIndex) => {
    // Auto-advance to next verse
    const nextVerse = filteredVerses[verseIndex];
    if (nextVerse) {
      setCurrentPlayingVerse(nextVerse.verse_key);
      setIsCurrentlyPlaying(true);
      setHasActiveSession(true);
      
      // Auto-focus on playing verse
      setTimeout(() => {
        const element = document.getElementById(`verse-${nextVerse.verse_key}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 800);
    }
  });

  // Navigation functions for floating player
  const navigateVerse = (direction: 'next' | 'previous') => {
    if (!currentPlayingVerse) return;
    
    const currentIndex = filteredVerses.findIndex(v => v.verse_key === currentPlayingVerse);
    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (targetIndex >= 0 && targetIndex < filteredVerses.length) {
      const targetVerse = filteredVerses[targetIndex];
      const verseKeyParts = targetVerse.verse_key.split(':');
      const surahPad = String(verseKeyParts[0]).padStart(3, '0');
      const ayahPad = String(verseKeyParts[1]).padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
      
      setCurrentPlayingVerse(targetVerse.verse_key);
      setIsCurrentlyPlaying(true);
      setHasActiveSession(true);
      
      // Play the target verse audio
      globalAudioManager.play(audioUrl).catch(e => {
        console.error('Navigation play failed:', e);
        setIsCurrentlyPlaying(false);
      });
      
      // Auto-focus on target verse
      setTimeout(() => {
        const element = document.getElementById(`verse-${targetVerse.verse_key}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  };

  const showBismillah = surah.id !== 1 && surah.id !== 9;
  
  // Calculate reading progress
  const currentVerseIndex = verses.findIndex(v => v.verse_key === initialVerseKey);
  const readingProgress = currentVerseIndex >= 0 ? Math.round(((currentVerseIndex + 1) / verses.length) * 100) : 0;

  return (
    <div className="w-full p-4 pb-24">
      <div className="sticky top-16 md:top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-b-2xl border-b border-gray-200 dark:border-slate-800 shadow-sm mb-6 transition-all max-w-4xl mx-auto">
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4 flex-1">
                <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
                >
                <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
                </button>
                <div className="flex-1">
                  {/* Breadcrumb */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bengali mb-1">
                    কুরআন পাঠ → সূরা {surah.id}
                  </div>
                  <h2 className="text-xl font-bold font-arabic text-gray-900 dark:text-white">{surah.name_arabic}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali">{surah.translated_name.name}</p>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-bengali">
                      {surah.verses_count} আয়াত
                    </span>
                  </div>
                  {/* Reading Progress Bar */}
                  {!loading && verses.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-bengali">পঠন অগ্রগতি:</span>
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-1.5 rounded-full transition-all duration-500" 
                            style={{
                              width: `${lastReadVerseKey && lastReadVerseKey.startsWith(`${surah.id}:`) 
                                ? (parseInt(lastReadVerseKey.split(':')[1]) / surah.verses_count) * 100 
                                : 0}%`
                            }}
                          />
                        </div>
                        <span className="font-bengali">
                          {lastReadVerseKey && lastReadVerseKey.startsWith(`${surah.id}:`) 
                            ? lastReadVerseKey.split(':')[1] 
                            : '0'} / {surah.verses_count}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => {
                        setShowSearch(!showSearch);
                        if(showSearch) setSearchQuery('');
                    }}
                    className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'}`}
                    title="Search"
                >
                    <Search size={20} />
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'}`}
                        title="Settings"
                    >
                        <Type size={20} />
                    </button>
                    {showSettings && (
                        <div className="absolute right-0 top-full mt-3 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-64 animate-fade-in z-30 settings-panel">
                            <div className="flex items-center justify-between mb-3">
                                 <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">আরবী ফন্ট সাইজ</span>
                                 <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">{fontSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="16" 
                                max="70" 
                                value={fontSize} 
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-emerald-600"
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-400 font-arabic">
                                <span>ছোট</span>
                                <span>বড়</span>
                            </div>
                            
                            {/* Auto-play Toggle */}
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-bengali">স্বয়ংক্রিয় প্লে</div>
                                        <div className="text-xs text-blue-500 dark:text-blue-300 font-bengali mt-1">
                                            একটি আয়াত শেষ হলে পরবর্তী আয়াত চালু হবে
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {autoPlayEnabled && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        )}
                                        <span className="text-sm font-bengali text-blue-600 dark:text-blue-400">
                                            {autoPlayEnabled ? 'চালু' : 'বন্ধ'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {showSearch && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="আয়াত খুঁজুন (বাংলা অর্থ বা নম্বর)..." 
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-bengali transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[500px] max-w-4xl mx-auto">
        {showBismillah && !searchQuery && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-10 text-center border-b border-gray-100 dark:border-slate-800">
                <h1 className="font-arabic text-4xl md:text-5xl text-emerald-800 dark:text-teal-400 mb-2 leading-relaxed opacity-90">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</h1>
            </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
             <div className="relative">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-emerald-600 font-arabic text-lg">ق</span>
               </div>
             </div>
             <p className="text-gray-500 dark:text-gray-400 font-bengali text-sm animate-pulse">
               {surah.translated_name.name} লোড করা হচ্ছে...
             </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredVerses.length > 0 ? (
                filteredVerses.map((verse, index) => {
                  const verseKeyParts = verse.verse_key.split(':');
                  const surahPad = String(verseKeyParts[0]).padStart(3, '0');
                  const ayahPad = String(verseKeyParts[1]).padStart(3, '0');
                  const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
                  
                  return (
                    <VerseItem 
                      key={verse.id} 
                      id={`verse-${verse.verse_key}`}
                      verse={verse} 
                      tafsir={tafsirs[verse.verse_key]}
                      fontSize={fontSize}
                      isBookmarked={bookmarks.includes(verse.verse_key)}
                      onToggleBookmark={() => onToggleBookmark(verse.verse_key)}
                      audioUrl={audioUrl}
                      autoPlayEnabled={autoPlayEnabled && currentPlayingVerse === verse.verse_key}
                      isLastRead={lastReadVerseKey === verse.verse_key}
                      onMarkAsLastRead={() => onSetLastReadPosition(verse.verse_key)}
                      showMarkerTemporarily={showMarkerTemporarily}
                      onPlayStateChange={(isPlaying) => {
                        if (isPlaying) {
                          setCurrentPlayingVerse(verse.verse_key);
                          setIsCurrentlyPlaying(true);
                          setHasActiveSession(true);
                        } else {
                          setIsCurrentlyPlaying(false);
                          // Don't reset currentPlayingVerse immediately to keep player visible
                          setTimeout(() => {
                            // Only hide if no new audio started playing
                            if (!globalAudioManager.getCurrentUrl()) {
                              setCurrentPlayingVerse(null);
                              setHasActiveSession(false);
                            }
                          }, 100);
                        }
                      }}
                    />
                  );
                })
            ) : (
                <div className="p-10 text-center space-y-4">
                  <div className="text-6xl">🔍</div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-bengali text-lg mb-2">
                      কোনো আয়াত পাওয়া যায়নি
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 font-bengali text-sm">
                      অন্য কিছু অনুসন্ধান করে দেখুন অথবা ফিল্টার পরিবর্তন করুন
                    </p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-emerald-600 dark:text-emerald-400 font-bengali text-sm hover:underline"
                    >
                      সমস্ত আয়াত দেখুন
                    </button>
                  </div>
                </div>
            )}
          </div>
        )}
      </div>
      
      {/* Floating Audio Player */}
      {hasActiveSession && currentPlayingVerse && (
        <div className="fixed bottom-20 left-0 right-0 z-40 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 shadow-2xl border-t border-gray-200 dark:border-slate-800 px-4 py-4 w-full">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const currentIndex = filteredVerses.findIndex(v => v.verse_key === currentPlayingVerse);
                      const currentVerse = filteredVerses[currentIndex];
                      if (currentVerse) {
                        const verseKeyParts = currentVerse.verse_key.split(':');
                        const surahPad = String(verseKeyParts[0]).padStart(3, '0');
                        const ayahPad = String(verseKeyParts[1]).padStart(3, '0');
                        const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
                        
                        // Toggle play/pause
                        if (isCurrentlyPlaying) {
                          globalAudioManager.pause();
                          setIsCurrentlyPlaying(false);
                        } else {
                          globalAudioManager.play(audioUrl);
                          setIsCurrentlyPlaying(true);
                        }
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg"
                    title="Play/Pause"
                  >
                    {isCurrentlyPlaying ? 
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9Z"/>
                      </svg> : 
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                      </svg>
                    }
                  </button>
                  
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900 dark:text-white font-bengali">
                      আয়াত {currentPlayingVerse}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bengali">
                      {surah.translated_name.name}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateVerse('previous')}
                  disabled={filteredVerses.findIndex(v => v.verse_key === currentPlayingVerse) === 0}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                  title="পূর্ববর্তী আয়াত"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <button 
                  onClick={() => navigateVerse('next')}
                  disabled={filteredVerses.findIndex(v => v.verse_key === currentPlayingVerse) === filteredVerses.length - 1}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-all rotate-180"
                  title="পরবর্তী আয়াত"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <button 
                  onClick={() => {
                    globalAudioManager.pause();
                    setCurrentPlayingVerse(null);
                    setIsCurrentlyPlaying(false);
                    setHasActiveSession(false);
                  }}
                  className="ml-2 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                  title="বন্ধ করুন"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahDetail;