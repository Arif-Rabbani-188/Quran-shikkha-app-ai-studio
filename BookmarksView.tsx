
import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronRight, ChevronDown, Play, Pause, Share2, Check, BookmarkCheck, Volume2 } from 'lucide-react';
import { Surah, Verse } from './types';

interface BookmarksViewProps {
  bookmarks: string[];
  onSelect: (surahId: number, verseKey: string) => void;
  onToggleBookmark: (verseKey: string) => void;
}

const toArabicNumerals = (n: number) => {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const BookmarkItem: React.FC<{
  bookmark: string;
  surah: Surah | undefined;
  onNavigate: (surahId: number, verseKey: string) => void;
  onToggleBookmark: (verseKey: string) => void;
}> = ({ bookmark, surah, onNavigate, onToggleBookmark }) => {
  const [expanded, setExpanded] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const [surahId, verseNum] = bookmark.split(':').map(Number);
  
  // Audio handling - Using correct format for verse audio
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${bookmark.replace(':', '_')}.mp3`;

  const toggleAudio = async () => {
    if (!audio) {
      setAudioLoading(true);
      // Try multiple audio sources
      const audioSources = [
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${bookmark.replace(':', '_')}.mp3`,
        `https://everyayah.com/data/Alafasy_128kbps/${surahId.toString().padStart(3, '0')}${verseNum.toString().padStart(3, '0')}.mp3`,
        `https://audio.qurancdn.com/${bookmark.replace(':', '/')}.mp3`
      ];
      
      let audioLoaded = false;
      
      for (const url of audioSources) {
        try {
          const newAudio = new Audio(url);
          
          // Test if audio can load
          await new Promise((resolve, reject) => {
            newAudio.oncanplaythrough = resolve;
            newAudio.onerror = reject;
            newAudio.load();
          });
          
          newAudio.onended = () => setIsPlaying(false);
          setAudio(newAudio);
          await newAudio.play();
          setIsPlaying(true);
          audioLoaded = true;
          break;
        } catch (error) {
          console.log(`Failed to load audio from ${url}`);
          continue;
        }
      }
      
      setAudioLoading(false);
      
      if (!audioLoaded) {
        alert('অডিও লোড করতে পারেনি। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      }
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Audio playback failed:', error);
          setIsPlaying(false);
        }
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const fetchVerse = async () => {
    if (verse || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.quran.com/api/v4/verses/by_key/${bookmark}?translations=161&fields=text_uthmani,translations`);
      const data = await response.json();
      setVerse(data.verse);
    } catch (error) {
      console.error('Error fetching verse:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    if (!expanded && !verse) {
      fetchVerse();
    }
    setExpanded(!expanded);
  };

  const handleShare = async () => {
    if (!verse || !surah) return;
    
    const arabicText = verse.text_uthmani;
    const translation = verse.translations?.[0]?.text || '';
    const shareText = `${arabicText}\n\n${translation}\n\n- ${surah.translated_name.name}, আয়াত ${verseNum}`;
    
    try {
      await navigator.share({ text: shareText });
    } catch (err) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-lg hover:shadow-xl transition-all overflow-hidden mb-4">
      {/* Main bookmark item */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md">
              <Bookmark size={15} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight">
                {surah ? surah.name_simple : `Surah #${surahId}`}
              </h3>
              <div className="flex items-center mt-2">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold">
                  আয়াত {verseNum}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpand}
              className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 transition-colors"
            >
              {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-3">লোড হচ্ছে...</p>
            </div>
          ) : verse ? (
            <div className="p-6">
              {/* Arabic text */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 mb-5 shadow-sm">
                <p className="text-right font-arabic leading-[2.2] text-gray-800 dark:text-gray-100 text-xl mb-3" dir="rtl">
                  {verse.text_uthmani}
                  <span className="font-arabic text-emerald-600 dark:text-emerald-400 mr-2 inline-block transform translate-y-1 text-base">
                    ۝{toArabicNumerals(verseNum)}
                  </span>
                </p>
              </div>

              {/* Translation */}
              {verse.translations && verse.translations[0] && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-5 border border-blue-100 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm">
                    {verse.translations[0].text}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Audio button */}
                  <button
                    onClick={toggleAudio}
                    disabled={audioLoading}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium text-sm ${
                      isPlaying
                        ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                        : audioLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    {audioLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : isPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                    <span>
                      {audioLoading ? 'লোড হচ্ছে...' : isPlaying ? 'বিরতি' : 'শুনুন'}
                    </span>
                  </button>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium text-sm ${
                      copied
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                    <span>
                      {copied ? 'কপি হয়েছে' : 'শেয়ার'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Remove bookmark */}
                  <button
                    onClick={() => onToggleBookmark(bookmark)}
                    className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium text-sm"
                  >
                    <BookmarkCheck size={16} />
                    <span>সরান</span>
                  </button>

                  {/* Go to surah */}
                  <button
                    onClick={() => onNavigate(surahId, bookmark)}
                    className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors font-medium text-sm"
                  >
                    <ChevronRight size={16} />
                    <span>সূরায় যান</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const BookmarksView: React.FC<BookmarksViewProps> = ({ bookmarks, onSelect, onToggleBookmark }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);

  // Auto-scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('quran_chapters_bn');
    if (cached) {
      setSurahs(JSON.parse(cached));
    } else {
        // Fallback fetch if not cached (though SurahList usually caches it)
        fetch('https://api.quran.com/api/v4/chapters?language=bn')
            .then(res => res.json())
            .then(data => setSurahs(data.chapters));
    }
  }, []);

  const getSurahInfo = (surahId: number) => {
    return surahs.find(s => s.id === surahId);
  };

  // Sort bookmarks numerically by Surah then Verse
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    const [sA, vA] = a.split(':').map(Number);
    const [sB, vB] = b.split(':').map(Number);
    if (sA !== sB) return sA - sB;
    return vA - vB;
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl pb-24">
      <div className="mb-3 bg-gradient-to-br from-green-800 via-green-600 to-green-400 rounded-3xl p-4 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Bookmark size={100} />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-2">বুকমার্ক সমূহ</h1>
          <p className="opacity-90 text-sm">আপনার সংরক্ষিত আয়াতগুলো এখানে রয়েছে</p>
          {bookmarks.length > 0 && (
            <p className="opacity-75 text-xs mt-2">
              মোট {bookmarks.length} টি আয়াত সংরক্ষিত • বিস্তারিত দেখতে ক্লিক করুন
            </p>
          )}
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
           <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <Bookmark size={32} />
           </div>
           <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">কোন বুকমার্ক নেই</h3>
           <p className="text-gray-400 dark:text-gray-500">আপনি এখনও কোন আয়াত বুকমার্ক করেননি</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBookmarks.map((bookmark) => {
            const [surahId] = bookmark.split(':').map(Number);
            const surah = getSurahInfo(surahId);

            return (
              <BookmarkItem
                key={bookmark}
                bookmark={bookmark}
                surah={surah}
                onNavigate={onSelect}
                onToggleBookmark={onToggleBookmark}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookmarksView;
