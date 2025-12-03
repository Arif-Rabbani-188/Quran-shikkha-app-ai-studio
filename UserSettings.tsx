import React, { useState, useEffect } from 'react';
import { Settings, User, Moon, Sun, Bell, Languages, Download, Volume2, VolumeX, Trash2, RefreshCw, Shield, Smartphone } from 'lucide-react';

interface UserSettingsProps {
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  currentTheme: string;
}

interface UserProfile {
  name: string;
  avatar?: string;
  joinedDate: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'bn' | 'en' | 'ar';
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    autoPlay: boolean;
    notifications: boolean;
    reciterVoice: string;
    translationLanguage: string;
    downloadQuality: 'low' | 'medium' | 'high';
  };
  stats: {
    totalReadingTime: number;
    versesRead: number;
    currentStreak: number;
    achievements: number;
  };
}

const UserSettings: React.FC<UserSettingsProps> = ({ onThemeChange, currentTheme }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'ব্যবহারকারী',
    joinedDate: '2025-11-28',
    preferences: {
      theme: 'auto',
      language: 'bn',
      fontSize: 'medium',
      autoPlay: true,
      notifications: true,
      reciterVoice: 'abdul_basit',
      translationLanguage: 'bengali',
      downloadQuality: 'medium'
    },
    stats: {
      totalReadingTime: 0,
      versesRead: 0,
      currentStreak: 0,
      achievements: 0
    }
  });

  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'data' | 'about'>('profile');
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      const savedProfile = JSON.parse(saved);
      setProfile(prev => ({ ...prev, ...savedProfile }));
    }

    // Load stats from various localStorage keys
    const readingSessions = JSON.parse(localStorage.getItem('quran_reading_sessions') || '[]');
    const achievements = JSON.parse(localStorage.getItem('user_achievements') || '[]');
    
    const totalReadingTime = readingSessions.reduce((sum: number, session: any) => sum + session.duration, 0);
    const versesRead = readingSessions.reduce((sum: number, session: any) => sum + session.versesRead, 0);
    const achievementsCount = achievements.filter((a: any) => a.unlocked).length;

    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalReadingTime,
        versesRead,
        achievements: achievementsCount
      }
    }));
  };

  const saveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
  };

  const updatePreference = (key: keyof UserProfile['preferences'], value: any) => {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value
      }
    };
    saveProfile(updated);

    // Special handling for theme changes
    if (key === 'theme') {
      onThemeChange(value);
    }
  };

  const resetAllData = () => {
    const keysToRemove = [
      'user_profile',
      'quran_reading_sessions',
      'user_achievements',
      'daily_goals',
      'reading_progress',
      'bookmarked_verses',
      'offline_surahs',
      'search_history'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reset to default profile
    const defaultProfile: UserProfile = {
      name: 'ব্যবহারকারী',
      joinedDate: new Date().toISOString().split('T')[0],
      preferences: {
        theme: 'auto',
        language: 'bn',
        fontSize: 'medium',
        autoPlay: true,
        notifications: true,
        reciterVoice: 'abdul_basit',
        translationLanguage: 'bengali',
        downloadQuality: 'medium'
      },
      stats: {
        totalReadingTime: 0,
        versesRead: 0,
        currentStreak: 0,
        achievements: 0
      }
    };

    setProfile(defaultProfile);
    setShowResetDialog(false);
    alert('সব ডেটা রিসেট হয়ে গেছে!');
  };

  const exportData = () => {
    const exportData = {
      profile,
      readingSessions: JSON.parse(localStorage.getItem('quran_reading_sessions') || '[]'),
      achievements: JSON.parse(localStorage.getItem('user_achievements') || '[]'),
      goals: JSON.parse(localStorage.getItem('daily_goals') || '[]'),
      bookmarks: JSON.parse(localStorage.getItem('bookmarked_verses') || '[]'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quranshikha-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} মিনিট`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ঘন্টা ${mins} মিনিট`;
  };

  const reciterOptions = [
    { value: 'abdul_basit', label: 'আবদুল বাসিত' },
    { value: 'mishary', label: 'মিশারি আল আফাসি' },
    { value: 'sudais', label: 'আব্দুর রহমান আস-সুদাইস' },
    { value: 'shuraim', label: 'সায়ূদ আশ-শুরাইম' },
    { value: 'huzaifi', label: 'আলি আল-হুযাইফি' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'ছোট' },
    { value: 'medium', label: 'মাঝারি' },
    { value: 'large', label: 'বড়' },
    { value: 'xl', label: 'অতি বড়' }
  ];

  const menuItems = [
    { key: 'profile', label: 'প্রোফাইল', icon: User },
    { key: 'preferences', label: 'পছন্দসমূহ', icon: Settings },
    { key: 'data', label: 'ডেটা ব্যবস্থাপনা', icon: Download },
    { key: 'about', label: 'অ্যাপ সম্পর্কে', icon: Smartphone }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold font-bengali mb-2">⚙️ সেটিংস</h1>
        <p className="text-emerald-100 font-bengali">আপনার অভিজ্ঞতা কাস্টমাইজ করুন</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800">
            <nav className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all font-bengali ${
                      activeSection === item.key
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bengali">
                  👤 ব্যবহারকারীর প্রোফাইল
                </h2>

                {/* Profile Photo */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500 font-bengali">
                      যোগ দিয়েছেন: {new Date(profile.joinedDate).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatDuration(profile.stats.totalReadingTime)}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bengali">মোট সময়</p>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {profile.stats.versesRead}
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bengali">আয়াত পড়া</p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {profile.stats.currentStreak}
                    </p>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-bengali">দিন স্ট্রিক</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {profile.stats.achievements}
                    </p>
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-bengali">অর্জন</p>
                  </div>
                </div>

                {/* Edit Profile Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-bengali mb-2">
                      নাম
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bengali">
                  🎨 পছন্দসমূহ
                </h2>

                {/* Theme Setting */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-bengali">
                    থিম
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'আলো', icon: Sun },
                      { value: 'dark', label: 'অন্ধকার', icon: Moon },
                      { value: 'auto', label: 'অটো', icon: Smartphone }
                    ].map(theme => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.value}
                          onClick={() => updatePreference('theme', theme.value)}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-bengali ${
                            profile.preferences.theme === theme.value
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                              : 'border-gray-300 dark:border-slate-600 hover:border-emerald-300'
                          }`}
                        >
                          <Icon size={18} />
                          {theme.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-bengali">
                    অক্ষরের আকার
                  </label>
                  <select
                    value={profile.preferences.fontSize}
                    onChange={(e) => updatePreference('fontSize', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bengali"
                  >
                    {fontSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reciter Voice */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-bengali">
                    তিলাওয়াতকারীর কণ্ঠস্বর
                  </label>
                  <select
                    value={profile.preferences.reciterVoice}
                    onChange={(e) => updatePreference('reciterVoice', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bengali"
                  >
                    {reciterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Volume2 className="text-gray-600 dark:text-gray-400" size={20} />
                      <span className="font-bengali text-gray-900 dark:text-white">অটো প্লে</span>
                    </div>
                    <button
                      onClick={() => updatePreference('autoPlay', !profile.preferences.autoPlay)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        profile.preferences.autoPlay ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        profile.preferences.autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="text-gray-600 dark:text-gray-400" size={20} />
                      <span className="font-bengali text-gray-900 dark:text-white">নোটিফিকেশন</span>
                    </div>
                    <button
                      onClick={() => updatePreference('notifications', !profile.preferences.notifications)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        profile.preferences.notifications ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        profile.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Section */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bengali">
                  💾 ডেটা ব্যবস্থাপনা
                </h2>

                <div className="space-y-4">
                  {/* Export Data */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-blue-800 dark:text-blue-300 font-bengali">
                          ডেটা এক্সপোর্ট করুন
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-bengali">
                          আপনার সব অগ্রগতি একটি ফাইলে সেভ করুন
                        </p>
                      </div>
                      <button
                        onClick={exportData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bengali"
                      >
                        এক্সপোর্ট করুন
                      </button>
                    </div>
                  </div>

                  {/* Reset All Data */}
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300 font-bengali">
                          সব ডেটা রিসেট করুন
                        </h3>
                        <p className="text-red-600 dark:text-red-400 text-sm font-bengali">
                          সতর্ক! এটি সব অগ্রগতি মুছে দেবে
                        </p>
                      </div>
                      <button
                        onClick={() => setShowResetDialog(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bengali"
                      >
                        রিসেট করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Section */}
            {activeSection === 'about' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bengali">
                  📱 অ্যাপ সম্পর্কে
                </h2>

                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl">
                    📖
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-bengali mb-2">
                    QuranShikha
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-bengali mb-4">
                    বাংলা কুরআন শিক্ষা অ্যাপ
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Version 1.0.0
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white font-bengali mb-2">
                      বৈশিষ্ট্যসমূহ
                    </h4>
                    <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1 font-bengali">
                      <li>• সম্পূর্ণ কুরআন বাংলা অনুবাদসহ</li>
                      <li>• অডিও তিলাওয়াত</li>
                      <li>• অফলাইন পড়ার সুবিধা</li>
                      <li>• দৈনিক লক্ষ্য ও অগ্রগতি ট্র্যাকিং</li>
                      <li>• বুকমার্ক ও নোট</li>
                      <li>• অর্জন ও পুরস্কার</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white font-bengali mb-2">
                      ডেভেলপার
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-bengali">
                      এই অ্যাপটি কুরআন শিক্ষার্থীদের সুবিধার জন্য তৈরি করা হয়েছে।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="text-red-500" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali">
                সব ডেটা মুছে ফেলবেন?
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 font-bengali mb-6">
              এটি আপনার সব অগ্রগতি, বুকমার্ক, অর্জন এবং সেটিংস মুছে দেবে। 
              এই কাজ আর পূর্বাবস্থায় ফেরানো যাবে না।
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-bengali"
              >
                বাতিল
              </button>
              <button
                onClick={resetAllData}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bengali"
              >
                হ্যাঁ, মুছে দিন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;