export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations: {
    resource_id: number;
    text: string;
  }[];
}

export interface LessonItem {
  arabic: string;
  bengali: string;
  audioText?: string;
  description?: string;
  example?: string; 
}

export interface Lesson {
  id: string; 
  title: string;
  description: string;
  xp: number; 
  type: 'content' | 'quiz'; 
  items: LessonItem[]; 
  quizSourceModuleId?: string; 
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface UserProgress {
  completedLessons: string[]; 
  totalXP: number;
  lastReadSurahId?: number;
  lastReadVerseKey?: string; // Track exact verse position for continue reading
  bookmarks: string[]; // verse_keys
  totalAyahsRead: number; // Total ayahs read based on markers
  totalTimeSpent: number; // Total time spent in app (minutes)
  dailySessions: { [date: string]: { timeSpent: number; ayahsRead: number; lastActive: number } };
  readingHistory: string[]; // Array of verse keys that have been read (marked)
}