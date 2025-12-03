
import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronRight } from 'lucide-react';
import { Surah } from './types';

interface BookmarksViewProps {
  bookmarks: string[];
  onSelect: (surahId: number, verseKey: string) => void;
}

const BookmarksView: React.FC<BookmarksViewProps> = ({ bookmarks, onSelect }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);

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
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      <div className="mb-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Bookmark size={100} />
        </div>
        <div className="relative z-10">
           <h1 className="text-3xl font-bold font-bengali mb-2">বুকমার্ক সমূহ</h1>
           <p className="font-bengali opacity-90">আপনার সংরক্ষিত আয়াতগুলো এখানে রয়েছে</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
           <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <Bookmark size={32} />
           </div>
           <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 font-bengali">কোনো বুকমার্ক নেই</h3>
           <p className="text-gray-500 dark:text-gray-500 mt-2 font-bengali">পড়ার সময় বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedBookmarks.map((bookmark) => {
            const [surahId, verseNum] = bookmark.split(':').map(Number);
            const surah = getSurahInfo(surahId);

            return (
              <div 
                key={bookmark}
                onClick={() => onSelect(surahId, bookmark)}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        <Bookmark size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                আয়াত {verseNum}
                             </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 font-bengali text-lg group-hover:text-emerald-600 transition-colors">
                            {surah ? surah.translated_name.name : `সূরা #${surahId}`}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic">
                             {surah?.name_arabic}
                        </p>
                    </div>
                 </div>
                 <div className="text-gray-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors">
                    <ChevronRight size={24} />
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookmarksView;
