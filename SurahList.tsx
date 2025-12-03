import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock } from 'lucide-react';
import { Surah } from './types';

interface SurahListProps {
  onSelect: (s: Surah, verseKey?: string) => void;
  lastReadSurahId?: number;
  lastReadVerseKey?: string;
}

const SurahList: React.FC<SurahListProps> = ({ onSelect, lastReadSurahId, lastReadVerseKey }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Auto-scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchSurahs = async () => {
      const cached = localStorage.getItem('quran_chapters_bn');
      if (cached) {
          setSurahs(JSON.parse(cached));
          setLoading(false);
          fetch('https://api.quran.com/api/v4/chapters?language=bn')
            .then(res => res.json())
            .then(data => {
                setSurahs(data.chapters);
                localStorage.setItem('quran_chapters_bn', JSON.stringify(data.chapters));
            });
          return;
      }

      try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=bn');
        const data = await response.json();
        setSurahs(data.chapters);
        localStorage.setItem('quran_chapters_bn', JSON.stringify(data.chapters));
      } catch (error) {
        console.error('Error fetching surahs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name_simple.toLowerCase().includes(search.toLowerCase()) ||
    s.translated_name.name.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );

  const lastReadSurah = lastReadSurahId ? surahs.find(s => s.id === lastReadSurahId) : null;

  const totalSurahs = surahs.length;
  const readSurahs = surahs.filter(s => s.id <= (lastReadSurahId || 0)).length;
  const progressPercentage = totalSurahs > 0 ? Math.round((readSurahs / totalSurahs) * 100) : 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {lastReadSurah && (
          <div 
            onClick={() => onSelect(lastReadSurah, lastReadVerseKey)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold font-bengali">পড়া চালিয়ে যান</h3>
              <div className="text-white/80 text-sm">📖</div>
            </div>
            <p className="font-arabic text-xl mb-2">{lastReadSurah.name_simple}</p>
            
            {/* Last Read Position Info */}
            {lastReadVerseKey && (
              <div className="mt-3 bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-100 font-bengali">শেষ পড়া স্থান:</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      আয়াত {lastReadVerseKey.split(':')[1]}
                    </span>
                    <span className="text-xs text-emerald-100 font-bengali">থেকে শুরু করুন</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* <div className="mt-4 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500" 
                style={{width: `${progressPercentage}%`}}
              />
            </div>
            <p className="text-xs text-emerald-100 mt-1">{progressPercentage}% সম্পন্ন</p> */}
          </div>
        )}
        
        {/* Reading Stats Card */}
        {/* <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-gray-800 dark:text-white font-bengali mb-2">পড়ার পরিসংখ্যান</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>{readSurahs} টি সূরা পড়া হয়েছে</p>
              <p>{totalSurahs - readSurahs} টি বাকি</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Continue Reading Section (legacy support) */}
      {lastReadSurah && !search && (
          <div 
            onClick={() => onSelect(lastReadSurah, lastReadVerseKey)}
            className="hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 text-white cursor-pointer transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
          >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                  <BookOpen size={120} />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full">
                      <Clock size={24} />
                  </div>
                  <div>
                      <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">সর্বশেষ পাঠ করেছেন</div>
                      <h2 className="text-2xl font-bold font-bengali">{lastReadSurah.translated_name.name}</h2>
                      <p className="font-arabic text-xl opacity-90">{lastReadSurah.name_arabic}</p>
                  </div>
              </div>
          </div>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="সূরা খুঁজুন (নাম বা নম্বর)..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow font-bengali"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[...Array(6)].map((_,i) => (
               <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <div 
              key={surah.id}
              onClick={() => onSelect(surah, surah.id === lastReadSurahId ? lastReadVerseKey : undefined)}
              className={`bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border transition-all cursor-pointer group flex items-center justify-between ${
                surah.id === lastReadSurahId 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                  : 'border-gray-100 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-teal-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transform rotate-45 group-hover:rotate-0 transition-transform duration-300 ${
                  surah.id === lastReadSurahId
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                }`}>
                    <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-300">
                      {surah.id === lastReadSurahId ? '📍' : surah.id}
                    </span>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold transition-colors font-bengali ${
                        surah.id === lastReadSurahId
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-gray-800 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-teal-400'
                      }`}>
                        {surah.name_simple}
                      </h3>
                      {surah.id === lastReadSurahId && (
                        <span className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-full font-bengali animate-pulse">
                          শেষ পড়া
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{surah.translated_name.name}</p>
                </div>
              </div>
              <div className="text-right">
                  <p className="font-arabic text-3xl text-emerald-800 dark:text-teal-400 font-bold leading-none pb-1">{surah.name_arabic}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bengali">{surah.verses_count} আয়াত</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurahList;