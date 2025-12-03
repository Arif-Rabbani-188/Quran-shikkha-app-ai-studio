import React, { useState } from 'react';
import { Play, Pause, BookOpen, Bookmark, BookmarkCheck, Share2, Check } from 'lucide-react';
import { Verse } from './types';
import { useAudio } from './hooks';

interface VerseItemProps {
  verse: Verse;
  tafsir?: string;
  fontSize: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  id?: string;
}

const toArabicNumerals = (n: number) => {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, tafsir, fontSize, isBookmarked, onToggleBookmark, id }) => {
  const verseKeyParts = verse.verse_key.split(':');
  const surahPad = String(verseKeyParts[0]).padStart(3, '0');
  const ayahPad = String(verseKeyParts[1]).padStart(3, '0');
  const verseNumber = parseInt(verseKeyParts[1]);
  // Audio source: EveryAyah (Alafasy)
  const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
  
  const { isPlaying, toggle, error: audioError } = useAudio(audioUrl);
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract Translation (Bengali - 161) and Transliteration (131)
  const translationText = verse.translations.find(t => t.resource_id === 161)?.text.replace(/<[^>]*>?/gm, '') || "অনুবাদ উপলব্ধ নেই";
  const transliterationText = verse.translations.find(t => t.resource_id === 131)?.text.replace(/<[^>]*>?/gm, '') || "";

  const createMarkup = (html: string) => {
    return { __html: html };
  }

  const handleShare = async () => {
    const shareText = `
${verse.text_uthmani}
(সূরা ${verseKeyParts[0]}, আয়াত ${verseKeyParts[1]})

উচ্চারণ: ${transliterationText}
অনুবাদ: ${translationText}

- QuranShikha থেকে শেয়ার করা
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verse ${verse.verse_key}`,
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    }
  };

  return (
    <div id={id} className="p-6 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors duration-500">
      {/* Top Row: Arabic Text & Controls */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start mb-6 gap-4">
        
        {/* Controls */}
        <div className="flex flex-row md:flex-col gap-3 mt-2 md:mt-0 shrink-0">
          <div className="flex gap-2">
            <button 
                onClick={toggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isPlaying 
                    ? 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none scale-110' 
                    : 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-teal-400 hover:bg-emerald-100 dark:hover:bg-slate-700'
                }`}
                title="Play Audio"
            >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                {verse.verse_key}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={onToggleBookmark}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isBookmarked
                    ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'text-gray-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
            >
                {isBookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
            </button>

            <button 
                onClick={handleShare}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    copied
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title="Share Verse"
            >
                {copied ? <Check size={20} /> : <Share2 size={20} />}
            </button>
          </div>
        </div>
        
        {/* Arabic Text (Right) */}
        <p 
            className="text-right font-arabic leading-[2.5] text-gray-800 dark:text-gray-100 w-full select-text" 
            dir="rtl"
            style={{ fontSize: `${fontSize}px` }}
        >
          {verse.text_uthmani} 
          <span className="font-arabic text-emerald-600 dark:text-emerald-400 mr-2 inline-block transform translate-y-1" style={{ fontSize: '0.8em' }}>
             ۝{toArabicNumerals(verseNumber)}
          </span>
        </p>
      </div>

      {/* Translations & Tafsir Section */}
      <div className="pl-0 md:pl-14 space-y-4">
        {/* Transliteration (Pronunciation) */}
        {transliterationText && (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-2 font-sans border-l-2 border-gray-200 dark:border-slate-700 pl-4 py-1">
                {transliterationText}
            </p>
        )}

        {/* Translation */}
        <p className="text-gray-800 dark:text-gray-200 font-bengali text-lg leading-relaxed border-l-4 border-emerald-100 dark:border-emerald-900/50 pl-4 py-1">
           {translationText}
        </p>

        <div className="flex items-center gap-3 pt-2">
            {tafsir && (
                <button 
                onClick={() => setShowTafsir(!showTafsir)}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                    showTafsir 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700'
                }`}
                >
                <BookOpen size={16} />
                {showTafsir ? "তাফসীর লুকান" : "তাফসীর দেখুন"}
                </button>
            )}
        </div>

        {audioError && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">Audio not available for this verse</div>}

        {showTafsir && tafsir && (
            <div className="mt-4 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 animate-fade-in shadow-inner">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 font-bengali flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                    তাফসীর (আহসানুল বায়ান)
                </h4>
                <div 
                    className="prose dark:prose-invert prose-emerald prose-lg max-w-none font-bengali text-gray-600 dark:text-slate-300 leading-loose"
                    dangerouslySetInnerHTML={createMarkup(tafsir)}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default VerseItem;