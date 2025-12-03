import React, { useState } from 'react';
import { Play, Pause, BookOpen, Bookmark, BookmarkCheck, Share2, Check, MapPin } from 'lucide-react';
import { Verse } from './types';
import { useAudio } from './hooks';

interface VerseItemProps {
  verse: Verse;
  tafsir?: string;
  fontSize: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  id?: string;
  audioUrl?: string;
  autoPlayEnabled?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  isLastRead?: boolean;
  onMarkAsLastRead?: () => void;
}

const toArabicNumerals = (n: number) => {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const VerseItem: React.FC<VerseItemProps> = ({ 
  verse, tafsir, fontSize, isBookmarked, onToggleBookmark, id, audioUrl, 
  autoPlayEnabled = false, onPlayStateChange, isLastRead = false, onMarkAsLastRead 
}) => {
  const verseKeyParts = verse.verse_key.split(':');
  const surahPad = String(verseKeyParts[0]).padStart(3, '0');
  const ayahPad = String(verseKeyParts[1]).padStart(3, '0');
  const verseNumber = parseInt(verseKeyParts[1]);
  
  // Use provided audioUrl or generate it
  const verseAudioUrl = audioUrl || `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
  
  const { isPlaying, toggle, error: audioError } = useAudio(verseAudioUrl);
  
  // Notify parent when play state changes
  React.useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Auto-highlight verse during playback
  React.useEffect(() => {
    if (isPlaying && id) {
      const element = document.getElementById(id);
      if (element) {
        element.classList.add('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-200', 'dark:ring-emerald-800');
      }
    } else if (id) {
      const element = document.getElementById(id);
      if (element) {
        element.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/20', 'ring-2', 'ring-emerald-200', 'dark:ring-emerald-800');
      }
    }
  }, [isPlaying, id]);

  // Extract Translation (Bengali - 161), Transliteration (131), and English (20)
  const translationText = verse.translations.find(t => t.resource_id === 161)?.text.replace(/<[^>]*>?/gm, '') || "অনুবাদ উপলব্ধ নেই";
  const englishTranslationText = verse.translations.find(t => t.resource_id === 20)?.text.replace(/<[^>]*>?/gm, '') || "Translation not available";
  const transliterationText = verse.translations.find(t => t.resource_id === 131)?.text.replace(/<[^>]*>?/gm, '') || "";

  const createMarkup = (html: string) => {
    return { __html: html };
  }

  const handleShare = async () => {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    const shareText = `
${verse.text_uthmani}
(সূরা ${verseKeyParts[0]}, আয়াত ${verseKeyParts[1]})

বাংলা অনুবাদ: ${translationText}
English Translation: ${englishTranslationText}

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
    <div id={id} className={`p-6 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors duration-500 relative ${
      isLastRead ? 'bg-purple-50/50 dark:bg-purple-900/10 border-l-4 border-l-purple-500' : ''
    }`}>
      
      {/* Last Read Badge */}
      {isLastRead && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          <span className="font-bengali">পড়া অবস্থান</span>
        </div>
      )}
      {/* Top Row: Arabic Text & Controls */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start mb-6 gap-4">
        
        {/* Controls */}
        <div className="flex flex-row md:flex-col gap-3 mt-2 md:mt-0 shrink-0">
          <div className="flex gap-2">
            <div className="relative">
              <button 
                  onClick={toggle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 ${
                  isPlaying 
                      ? 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none scale-110' 
                      : 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-teal-400 hover:bg-emerald-100 dark:hover:bg-slate-700'
                  }`}
                  title="Play Audio"
              >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
              
              {/* Auto-play indicator - only show when this verse is playing */}
              {autoPlayEnabled && isPlaying && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                {verse.verse_key}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(30);
                  onToggleBookmark();
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-md active:scale-95 ${
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-md active:scale-95 ${
                    copied
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title="Share Verse"
            >
                {copied ? <Check size={20} /> : <Share2 size={20} />}
            </button>

            {onMarkAsLastRead && (
              <button 
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(30);
                    onMarkAsLastRead();
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-md active:scale-95 ${
                      isLastRead
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-200 dark:ring-purple-800'
                      : 'text-gray-600 dark:text-slate-400 hover:text-purple-500 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700'
                  }`}
                  title={isLastRead ? "বর্তমান অবস্থান চিহ্নিত" : "এখানে চিহ্ন দিন"}
              >
                  <span className={`text-xs font-bold font-bengali ${isLastRead ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-slate-500'}`}>
                    {isLastRead ? 'চিহ্নিত' : 'চিহ্ন'}
                  </span>
              </button>
            )}
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
        {/* Transliteration (Pronunciation) - Bangla Uccharon */}
        {transliterationText && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4 mb-3">
                <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 font-bengali">উচ্চারণ (বাংলা)</h5>
                <p className="text-gray-700 dark:text-gray-300 font-bengali text-base leading-relaxed">
                    {transliterationText}
                </p>
            </div>
        )}

        {/* Bengali Translation */}
        <p className="text-gray-800 dark:text-gray-200 font-bengali text-lg leading-relaxed border-l-4 border-emerald-100 dark:border-emerald-900/50 pl-4 py-1">
           {translationText}
        </p>

        {/* English Translation */}
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed border-l-4 border-blue-100 dark:border-blue-900/50 pl-4 py-1 mt-3 italic">
           {englishTranslationText}
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