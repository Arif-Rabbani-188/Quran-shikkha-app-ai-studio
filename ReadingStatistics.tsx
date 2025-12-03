import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, BookOpen, Target, Calendar, TrendingUp, Award, Flame } from 'lucide-react';

interface ReadingStatsProps {
  userProgress: any;
}

interface ReadingSession {
  date: string;
  duration: number; // minutes
  versesRead: number;
  surahs: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface WeeklyStats {
  totalTime: number;
  totalVerses: number;
  averageSession: number;
  longestStreak: number;
  currentStreak: number;
  favoriteTime: string;
}

const ReadingStatistics: React.FC<ReadingStatsProps> = ({ userProgress }) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalTime: 0,
    totalVerses: 0,
    averageSession: 0,
    longestStreak: 0,
    currentStreak: 0,
    favoriteTime: 'evening'
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadReadingData();
  }, []);

  const loadReadingData = () => {
    // Load reading sessions from localStorage
    const savedSessions = localStorage.getItem('quran_reading_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    // Calculate weekly stats
    calculateWeeklyStats();
  };

  const calculateWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSessions = sessions.filter(session => 
      new Date(session.date) >= weekAgo
    );

    const totalTime = recentSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalVerses = recentSessions.reduce((sum, session) => sum + session.versesRead, 0);
    const averageSession = recentSessions.length > 0 ? Math.round(totalTime / recentSessions.length) : 0;

    // Calculate streak
    const currentStreak = calculateCurrentStreak();
    const longestStreak = calculateLongestStreak();

    // Find favorite time
    const timePreferences = recentSessions.reduce((acc, session) => {
      acc[session.timeOfDay] = (acc[session.timeOfDay] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteTime = Object.entries(timePreferences)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'evening';

    setWeeklyStats({
      totalTime,
      totalVerses,
      averageSession,
      longestStreak,
      currentStreak,
      favoriteTime
    });
  };

  const calculateCurrentStreak = () => {
    // Calculate consecutive days of reading
    const today = new Date().toDateString();
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toDateString();
      const hasReadingToday = sessions.some(session => 
        new Date(session.date).toDateString() === dateStr
      );

      if (hasReadingToday) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateStr === today) {
        // If today has no reading, streak is 0
        return 0;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestStreak = () => {
    // Find longest consecutive reading streak
    const sortedSessions = sessions
      .map(s => new Date(s.date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedSessions.length; i++) {
      const prevDate = new Date(sortedSessions[i - 1]);
      const currDate = new Date(sortedSessions[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(maxStreak, currentStreak);
  };

  const getTimeOfDayLabel = (time: string) => {
    const labels = {
      morning: 'সকাল',
      afternoon: 'দুপুর', 
      evening: 'সন্ধ্যা',
      night: 'রাত'
    };
    return labels[time] || time;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} মিনিট`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ঘন্টা ${mins} মিনিট`;
  };

  const getLastWeekData = () => {
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const daysSessions = sessions.filter(session => 
        new Date(session.date).toDateString() === date.toDateString()
      );

      const totalMinutes = daysSessions.reduce((sum, session) => sum + session.duration, 0);
      
      weekData.push({
        day: dayName,
        minutes: totalMinutes,
        height: Math.max((totalMinutes / 60) * 100, 5) // Convert to percentage height
      });
    }

    return weekData;
  };

  const weekData = getLastWeekData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-bengali">
          📊 পড়ার পরিসংখ্যান
        </h2>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bengali"
        >
          <option value="week">এই সপ্তাহ</option>
          <option value="month">এই মাস</option>
          <option value="year">এই বছর</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Time */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} className="text-blue-200" />
            <span className="text-blue-100 text-sm font-bengali">মোট সময়</span>
          </div>
          <p className="text-2xl font-bold">{formatDuration(weeklyStats.totalTime)}</p>
        </div>

        {/* Total Verses */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen size={24} className="text-emerald-200" />
            <span className="text-emerald-100 text-sm font-bengali">আয়াত</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats.totalVerses}</p>
          <p className="text-emerald-100 text-xs font-bengali">পড়া হয়েছে</p>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Flame size={24} className="text-orange-200" />
            <span className="text-orange-100 text-sm font-bengali">ধারাবাহিকতা</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats.currentStreak}</p>
          <p className="text-orange-100 text-xs font-bengali">দিন একটানা</p>
        </div>

        {/* Average Session */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={24} className="text-purple-200" />
            <span className="text-purple-100 text-sm font-bengali">গড় সময়</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats.averageSession}</p>
          <p className="text-purple-100 text-xs font-bengali">মিনিট/সেশন</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali mb-4">
          সাপ্তাহিক অগ্রগতি
        </h3>
        
        <div className="flex items-end justify-between h-32 gap-2">
          {weekData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-t-lg relative overflow-hidden">
                <div 
                  className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 flex items-end justify-center"
                  style={{ height: `${Math.max(day.height, 8)}px` }}
                >
                  {day.minutes > 0 && (
                    <span className="text-xs text-white font-bold mb-1">
                      {day.minutes}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-bengali">
                {day.day}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali">
            দৈনিক পড়ার সময় (মিনিট)
          </p>
        </div>
      </div>

      {/* Reading Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Favorite Reading Time */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali mb-4">
            📅 পড়ার অভ্যাস
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-bengali">প্রিয় সময়:</span>
              <span className="font-bold text-gray-900 dark:text-white font-bengali">
                {getTimeOfDayLabel(weeklyStats.favoriteTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-bengali">সর্বোচ্চ ধারাবাহিকতা:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {weeklyStats.longestStreak} দিন
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-bengali">গড় সেশন:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {weeklyStats.averageSession} মিনিট
              </span>
            </div>
          </div>
        </div>

        {/* Progress Goals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali mb-4">
            🎯 সাপ্তাহিক লক্ষ্য
          </h3>
          
          <div className="space-y-4">
            {/* Reading Time Goal */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400 font-bengali">পড়ার সময়</span>
                <span className="text-gray-900 dark:text-white font-bengali">
                  {weeklyStats.totalTime}/180 মিনিট
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((weeklyStats.totalTime / 180) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Verses Goal */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400 font-bengali">আয়াত</span>
                <span className="text-gray-900 dark:text-white font-bengali">
                  {weeklyStats.totalVerses}/50 টি
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((weeklyStats.totalVerses / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {weeklyStats.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <Award size={24} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-emerald-800 dark:text-emerald-300 font-bengali">
                চমৎকার! আপনি {weeklyStats.currentStreak} দিন একটানা পড়ছেন! 🎉
              </h3>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bengali">
                নিয়মিত অনুশীলন চালিয়ে যান। আল্লাহ আপনার প্রচেষ্টা কবুল করুন।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingStatistics;