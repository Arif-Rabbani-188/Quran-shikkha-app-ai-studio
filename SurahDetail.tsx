import React, { useState, useEffect } from 'react';
import { ChevronLeft, Type, Settings2, Search, X } from 'lucide-react';
import { Surah, Verse } from './types';
import VerseItem from './VerseItem';

interface SurahDetailProps {
  surah: Surah;
  onBack: () => void;
  bookmarks: string[];
  onToggleBookmark: (key: string) => void;
  onLoad: (id: number) => void;
  initialVerseKey?: string;
}

const SurahDetail: React.FC<SurahDetailProps> = ({ surah, onBack, bookmarks, onToggleBookmark, onLoad, initialVerseKey }) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [tafsirs, setTafsirs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(28); 
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    onLoad(surah.id);
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

  // Handle auto-scroll to bookmark
  useEffect(() => {
    if (initialVerseKey && !loading && verses.length > 0) {
      setTimeout(() => {
          const element = document.getElementById(`verse-${initialVerseKey}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-50', 'dark:bg-yellow-900/10');
            setTimeout(() => {
                element.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/10');
            }, 2500);
          }
      }, 100);
    }
  }, [initialVerseKey, loading, verses]);

  const filteredVerses = verses.filter(verse => {
    if (!searchQuery) return true;
    // Check both translations for search keywords
    const translationText = verse.translations.map(t => t.text).join(' ').toLowerCase();
    const cleanTranslation = translationText.replace(/<[^>]*>?/gm, '');
    return cleanTranslation.includes(searchQuery.toLowerCase()) || 
           verse.verse_key.includes(searchQuery);
  });

  const showBismillah = surah.id !== 1 && surah.id !== 9;

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-b-2xl border-b border-gray-200 dark:border-slate-800 shadow-sm mb-6 transition-all">
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
                >
                <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
                </button>
                <div>
                <h2 className="text-xl font-bold font-arabic text-gray-900 dark:text-white">{surah.name_arabic}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali">{surah.translated_name.name}</p>
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
                                <span>বড়</span>
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[500px]">
        {showBismillah && !searchQuery && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-10 text-center border-b border-gray-100 dark:border-slate-800">
                <h1 className="font-arabic text-4xl md:text-5xl text-emerald-800 dark:text-teal-400 mb-2 leading-relaxed opacity-90">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</h1>
            </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredVerses.length > 0 ? (
                filteredVerses.map((verse) => (
                <VerseItem 
                    key={verse.id} 
                    id={`verse-${verse.verse_key}`}
                    verse={verse} 
                    tafsir={tafsirs[verse.verse_key]}
                    fontSize={fontSize}
                    isBookmarked={bookmarks.includes(verse.verse_key)}
                    onToggleBookmark={() => onToggleBookmark(verse.verse_key)}
                />
                ))
            ) : (
                <div className="p-10 text-center text-gray-500 font-bengali">
                    কোনো আয়াত পাওয়া যায়নি
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahDetail;