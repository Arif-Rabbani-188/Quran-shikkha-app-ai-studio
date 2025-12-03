import React, { useState, useEffect } from 'react';
import { Search, Filter, History, Star, Bookmark, Clock, TrendingUp } from 'lucide-react';

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  type: 'all' | 'verses' | 'surahs' | 'topics';
  language: 'all' | 'arabic' | 'bengali' | 'english';
  surahRange?: [number, number];
}

interface SearchHistory {
  query: string;
  timestamp: number;
  results: number;
}

interface TopicSuggestion {
  name: string;
  nameArabic: string;
  nameBengali: string;
  keywords: string[];
}

const SmartSearch: React.FC<SmartSearchProps> = ({ isOpen, onClose, onSearch }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all', language: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Popular topics for quick search
  const topicSuggestions: TopicSuggestion[] = [
    { name: 'Prayer', nameArabic: 'صلاة', nameBengali: 'নামাজ', keywords: ['prayer', 'salah', 'নামাজ'] },
    { name: 'Paradise', nameArabic: 'جنة', nameBengali: 'জান্নাত', keywords: ['paradise', 'jannah', 'জান্নাত'] },
    { name: 'Patience', nameArabic: 'صبر', nameBengali: 'ধৈর্য', keywords: ['patience', 'sabr', 'ধৈর্য'] },
    { name: 'Forgiveness', nameArabic: 'مغفرة', nameBengali: 'ক্ষমা', keywords: ['forgiveness', 'maghfira', 'ক্ষমা'] },
    { name: 'Gratitude', nameArabic: 'شكر', nameBengali: 'কৃতজ্ঞতা', keywords: ['gratitude', 'shukr', 'কৃতজ্ঞতা'] },
    { name: 'Charity', nameArabic: 'زكاة', nameBengali: 'দান', keywords: ['charity', 'zakat', 'দান'] }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('quran_search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const matchingSuggestions = topicSuggestions
        .filter(topic => 
          topic.keywords.some(keyword => 
            keyword.toLowerCase().includes(query.toLowerCase())
          )
        )
        .map(topic => topic.nameBengali)
        .slice(0, 5);
      
      setSuggestions(matchingSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = () => {
    if (!query.trim()) return;

    // Add to search history
    const newHistoryItem: SearchHistory = {
      query,
      timestamp: Date.now(),
      results: 0 // Will be updated by parent component
    };

    const updatedHistory = [newHistoryItem, ...searchHistory.slice(0, 9)];
    setSearchHistory(updatedHistory);
    localStorage.setItem('quran_search_history', JSON.stringify(updatedHistory));

    onSearch(query, filters);
    onClose();
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch();
  };

  const handleTopicClick = (topic: TopicSuggestion) => {
    setQuery(topic.nameBengali);
    setTimeout(() => handleSearch(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="flex items-start justify-center min-h-screen p-4 pt-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <Search className="text-gray-400" size={24} />
              <input
                type="text"
                placeholder="কুরআনে খুঁজুন... (আয়াত, সূরা, বিষয়)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white font-bengali"
                autoFocus
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Filter size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2 font-bengali">
                      অনুসন্ধানের ধরন
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bengali"
                    >
                      <option value="all">সব ধরনের</option>
                      <option value="verses">আয়াত</option>
                      <option value="surahs">সূরা</option>
                      <option value="topics">বিষয়</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2 font-bengali">
                      ভাষা
                    </label>
                    <select
                      value={filters.language}
                      onChange={(e) => setFilters({...filters, language: e.target.value as any})}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bengali"
                    >
                      <option value="all">সব ভাষা</option>
                      <option value="arabic">আরবি</option>
                      <option value="bengali">বাংলা</option>
                      <option value="english">ইংরেজি</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-bengali flex items-center gap-2">
                  <TrendingUp size={16} />
                  পরামর্শ
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(suggestion)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-bengali text-gray-700 dark:text-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Topics */}
            {query.length === 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-bengali flex items-center gap-2">
                  <Star size={16} />
                  জনপ্রিয় বিষয়সমূহ
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {topicSuggestions.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleTopicClick(topic)}
                      className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group"
                    >
                      <div className="font-medium text-gray-900 dark:text-white font-bengali">
                        {topic.nameBengali}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-arabic">
                        {topic.nameArabic}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && query.length === 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-bengali flex items-center gap-2">
                  <History size={16} />
                  সাম্প্রতিক অনুসন্ধান
                </h3>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item.query)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-bengali text-gray-700 dark:text-gray-300">
                        {item.query}
                      </span>
                      <Clock size={16} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-bengali">
              Enter চাপুন অথবা
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-bengali flex items-center gap-2"
            >
              <Search size={16} />
              খুঁজুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSearch;