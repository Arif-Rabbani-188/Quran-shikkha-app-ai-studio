import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock } from 'lucide-react';
import { Surah } from './types';

interface SurahListProps {
  onSelect: (s: Surah) => void;
  lastReadSurahId?: number;
}

const SurahList: React.FC<SurahListProps> = ({ onSelect, lastReadSurahId }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      {lastReadSurah && !search && (
          <div 
            onClick={() => onSelect(lastReadSurah)}
            className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-[1.01] transition-all relative overflow-hidden"
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
              onClick={() => onSelect(surah)}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-teal-900 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold text-sm transform rotate-45 group-hover:rotate-0 transition-transform duration-300">
                    <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-300">{surah.id}</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-teal-400 transition-colors font-bengali">{surah.translated_name.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{surah.name_simple}</p>
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