import React, { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle, TrendingUp, Award, Flame, BarChart3, BookOpen } from 'lucide-react';

interface DailyGoalsProps {
  onGoalSet: (goal: DailyGoal) => void;
  currentProgress: {
    versesRead: number;
    lessonsCompleted: number;
    timeSpent: number; // minutes
  };
}

interface DailyGoal {
  id: string;
  type: 'verses' | 'lessons' | 'time';
  target: number;
  current: number;
  streak: number;
  lastUpdated: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

const DailyGoals: React.FC<DailyGoalsProps> = ({ onGoalSet, currentProgress }) => {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);

  // Default achievements
  const defaultAchievements: Achievement[] = [
    {
      id: 'first_verse',
      title: 'প্রথম আয়াত',
      description: 'প্রথম আয়াত পড়ুন',
      icon: '📖',
      unlocked: false,
      progress: 0,
      target: 1
    },
    {
      id: 'daily_reader',
      title: 'নিয়মিত পাঠক',
      description: '৭ দিন একটানা পড়ুন',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      target: 7
    },
    {
      id: 'surah_master',
      title: 'সূরা মাস্টার',
      description: '১০টি সূরা সম্পন্ন করুন',
      icon: '⭐',
      unlocked: false,
      progress: 0,
      target: 10
    },
    {
      id: 'lesson_learner',
      title: 'শিক্ষার্থী',
      description: '৫টি লেসন সম্পন্ন করুন',
      icon: '🎓',
      unlocked: false,
      progress: 0,
      target: 5
    },
    {
      id: 'dedicated_student',
      title: 'নিবেদিতপ্রাণ ছাত্র',
      description: '১০০ XP অর্জন করুন',
      icon: '💎',
      unlocked: false,
      progress: 0,
      target: 100
    }
  ];

  useEffect(() => {
    loadGoalsAndAchievements();
  }, []);

  useEffect(() => {
    updateGoalProgress();
    checkAchievements();
  }, [currentProgress]);

  const loadGoalsAndAchievements = () => {
    const savedGoals = localStorage.getItem('quran_daily_goals');
    const savedAchievements = localStorage.getItem('quran_achievements');
    const savedStreak = localStorage.getItem('quran_streak');

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      setAchievements(defaultAchievements);
    }

    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  };

  const updateGoalProgress = () => {
    const today = new Date().toDateString();
    const updatedGoals = goals.map(goal => {
      let newCurrent = goal.current;
      
      if (goal.lastUpdated !== today) {
        // Reset daily progress if it's a new day
        newCurrent = 0;
      }

      switch (goal.type) {
        case 'verses':
          newCurrent = currentProgress.versesRead;
          break;
        case 'lessons':
          newCurrent = currentProgress.lessonsCompleted;
          break;
        case 'time':
          newCurrent = currentProgress.timeSpent;
          break;
      }

      return {
        ...goal,
        current: newCurrent,
        lastUpdated: today
      };
    });

    setGoals(updatedGoals);
    localStorage.setItem('quran_daily_goals', JSON.stringify(updatedGoals));
  };

  const checkAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      let progress = achievement.progress;
      
      switch (achievement.id) {
        case 'first_verse':
          progress = currentProgress.versesRead > 0 ? 1 : 0;
          break;
        case 'daily_reader':
          progress = streak;
          break;
        case 'lesson_learner':
          progress = currentProgress.lessonsCompleted;
          break;
        default:
          break;
      }

      return {
        ...achievement,
        progress: Math.min(progress, achievement.target),
        unlocked: progress >= achievement.target
      };
    });

    setAchievements(updatedAchievements);
    localStorage.setItem('quran_achievements', JSON.stringify(updatedAchievements));
  };

  const createGoal = (type: 'verses' | 'lessons' | 'time', target: number) => {
    const newGoal: DailyGoal = {
      id: Date.now().toString(),
      type,
      target,
      current: 0,
      streak: 0,
      lastUpdated: new Date().toDateString()
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('quran_daily_goals', JSON.stringify(updatedGoals));
    onGoalSet(newGoal);
    setShowGoalSetter(false);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'verses':
        return <BookOpen size={20} className="text-emerald-600" />;
      case 'lessons':
        return <Target size={20} className="text-blue-600" />;
      case 'time':
        return <Calendar size={20} className="text-purple-600" />;
      default:
        return <Target size={20} />;
    }
  };

  const getGoalLabel = (type: string) => {
    switch (type) {
      case 'verses':
        return 'আয়াত পড়া';
      case 'lessons':
        return 'লেসন সম্পন্ন';
      case 'time':
        return 'সময় ব্যয়';
      default:
        return 'লক্ষ্য';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Streak Counter */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-bengali mb-1">ধারাবাহিকতা</h3>
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-orange-100 text-sm font-bengali">দিন একটানা</p>
          </div>
          <Flame size={48} className="text-orange-200" />
        </div>
      </div>

      {/* Daily Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-bengali">
            আজকের লক্ষ্য
          </h3>
          <button
            onClick={() => setShowGoalSetter(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bengali transition-colors"
          >
            + নতুন লক্ষ্য
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-bengali">
            <Target size={48} className="mx-auto mb-4 text-gray-300" />
            <p>কোনো লক্ষ্য নির্ধারণ করা হয়নি</p>
            <p className="text-sm mt-1">দৈনিক লক্ষ্য সেট করে নিয়মিত অনুশীলন করুন</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal.current, goal.target);
              const isCompleted = goal.current >= goal.target;

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getGoalIcon(goal.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white font-bengali">
                          {getGoalLabel(goal.type)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali">
                          {goal.current} / {goal.target} {goal.type === 'time' ? 'মিনিট' : ''}
                        </p>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle size={24} className="text-emerald-600" fill="currentColor" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-bengali flex items-center gap-2">
          <Award size={24} className="text-yellow-500" />
          অর্জনসমূহ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border transition-all ${
                achievement.unlocked
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-medium font-bengali ${
                    achievement.unlocked ? 'text-yellow-800 dark:text-yellow-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali mb-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(achievement.progress / achievement.target) * 100}%` 
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {achievement.unlocked ? '✅ সম্পন্ন' : `${achievement.progress}/${achievement.target}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Setter Modal */}
      {showGoalSetter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali mb-4">
              নতুন লক্ষ্য নির্ধারণ
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={() => createGoal('verses', 5)}
                className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-emerald-600" />
                  <div>
                    <h4 className="font-medium font-bengali">দৈনিক ৫টি আয়াত পড়া</h4>
                    <p className="text-sm text-gray-500 font-bengali">কুরআন পাঠের অভ্যাস গড়ুন</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => createGoal('lessons', 2)}
                className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-blue-600" />
                  <div>
                    <h4 className="font-medium font-bengali">দৈনিক ২টি লেসন</h4>
                    <p className="text-sm text-gray-500 font-bengali">আরবি শেখার গতি বাড়ান</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => createGoal('time', 15)}
                className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-purple-600" />
                  <div>
                    <h4 className="font-medium font-bengali">দৈনিক ১৫ মিনিট অধ্যয়ন</h4>
                    <p className="text-sm text-gray-500 font-bengali">নিয়মিত সময় ব্যয় করুন</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGoalSetter(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-bengali"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGoals;