import React, { useState } from 'react';
import { Trophy, Star, Award, BookOpen, CheckCircle, Play, HelpCircle, ArrowRight, Lock, AlertCircle, Target } from 'lucide-react';
import { Lesson, UserProgress } from './types';
import { LEARNING_MODULES } from './data';

interface LearningDashboardProps {
  onSelectLesson: (lesson: Lesson) => void;
  progress: UserProgress;
}

const LearningDashboard: React.FC<LearningDashboardProps> = ({ onSelectLesson, progress }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flatten all lessons to determine global order
  const allLessons = LEARNING_MODULES.flatMap(m => m.lessons);
  const completedSet = new Set(progress.completedLessons);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24 relative">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* XP Card */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-bengali mb-1">মোট পয়েন্ট</h3>
              <p className="text-2xl font-bold">{progress.totalXP}</p>
              <p className="text-amber-100 text-sm font-bengali">XP</p>
            </div>
            <Trophy size={40} className="text-amber-200" />
          </div>
        </div>
        
        {/* Completed Lessons */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-bengali mb-1">সম্পন্ত পাঠ</h3>
              <p className="text-2xl font-bold">{progress.completedLessons.length}</p>
              <p className="text-emerald-100 text-sm font-bengali">{allLessons.length} এর মধ্যে</p>
            </div>
            <CheckCircle size={40} className="text-emerald-200" fill="currentColor" />
          </div>
        </div>
        
        {/* Goals Button */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openGoals'))}
          className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all transform hover:scale-[1.02] text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-bengali mb-1">দৈনিক লক্ষ্য</h3>
              <p className="text-sm font-bengali text-purple-100 leading-tight">
                আজকের অগ্রগতি দেখুন
              </p>
            </div>
            <Target size={40} className="text-purple-200" />
          </div>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300">
              <AlertCircle size={20} className="text-yellow-400" />
              <span className="font-bengali">{toastMessage}</span>
          </div>
      )}

      {/* Gamification Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Trophy size={100} />
        </div>
        <div className="relative z-10">
           <h1 className="text-3xl font-bold font-bengali mb-2">আসসালামু আলাইকুম!</h1>
           <p className="font-bengali opacity-90 mb-6">আপনার শেখার অগ্রগতি</p>
           
           <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                 <div className="text-xs uppercase tracking-wider opacity-80 mb-1">মোট পয়েন্ট</div>
                 <div className="text-3xl font-bold flex items-center gap-2">
                   <Star size={24} className="text-yellow-300" fill="currentColor" />
                   {progress.totalXP}
                 </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                 <div className="text-xs uppercase tracking-wider opacity-80 mb-1">সম্পন্ন পাঠ</div>
                 <div className="text-3xl font-bold flex items-center gap-2">
                   <Award size={24} className="text-emerald-200" />
                   {progress.completedLessons.length}
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {LEARNING_MODULES.map((module) => {
           // Calculate module completion stats
           const moduleLessonIds = module.lessons.map(l => l.id);
           const completedCount = moduleLessonIds.filter(id => completedSet.has(id)).length;
           const progressPercent = Math.round((completedCount / moduleLessonIds.length) * 100);

           return (
            <div key={module.id} className="animate-slide-up">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xl font-bold text-emerald-900 dark:text-teal-200 font-bengali flex items-center gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-900/50 p-1 rounded-md">
                    <BookOpen size={20} className="text-emerald-700 dark:text-emerald-400" />
                  </span>
                  {module.title}
                </h2>
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500">
                    {progressPercent}% সম্পন্ন
                </span>
              </div>
              
              {/* Module Progress Bar */}
              <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
              </div>

              <div className="grid md:grid-cols-1 gap-4">
                {module.lessons.map((lesson) => {
                  const isCompleted = completedSet.has(lesson.id);
                  
                  // Locking Logic:
                  // A lesson is locked if the PREVIOUS lesson in the global list is NOT completed.
                  // The very first lesson is always unlocked.
                  const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                  const prevLessonId = globalIndex > 0 ? allLessons[globalIndex - 1].id : null;
                  const isLocked = prevLessonId ? !completedSet.has(prevLessonId) : false;

                  return (
                    <button 
                      key={lesson.id}
                      onClick={() => {
                          if (isLocked) {
                              showToast("অনুগ্রহ করে আগের পাঠটি সম্পন্ন করুন!");
                          } else {
                              onSelectLesson(lesson);
                          }
                      }}
                      className={`w-full text-left p-5 rounded-xl border shadow-sm transition-all group flex items-center justify-between relative overflow-hidden ${
                          isLocked 
                            ? "bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-70 cursor-not-allowed" 
                            : isCompleted 
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900 hover:shadow-md cursor-pointer" 
                                : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-emerald-200 dark:hover:border-teal-900 cursor-pointer"
                      }`}
                    >
                      {/* Locked Overlay Pattern */}
                      {isLocked && (
                          <div className="absolute inset-0 bg-gray-100/50 dark:bg-slate-950/50 z-10" />
                      )}

                      <div className="flex items-center gap-4 relative z-20">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isLocked
                                ? "bg-gray-200 dark:bg-slate-800 text-gray-400"
                                : isCompleted
                                    ? "bg-emerald-500 text-white"
                                    : (lesson.type === 'quiz' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400")
                        }`}>
                            {isLocked ? (
                                <Lock size={20} />
                            ) : isCompleted ? (
                                <CheckCircle size={24} />
                            ) : lesson.type === 'quiz' ? (
                                <HelpCircle size={24} />
                            ) : (
                                <Play size={20} fill="currentColor" />
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold font-bengali text-lg transition-colors ${
                                  isLocked 
                                    ? "text-gray-400 dark:text-slate-600"
                                    : isCompleted 
                                      ? "text-emerald-800 dark:text-emerald-400" 
                                      : "text-gray-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-teal-400"
                              }`}>
                                {lesson.title}
                              </h3>
                              {lesson.type === 'quiz' && !isLocked && <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">কুইজ</span>}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-500 font-bengali line-clamp-1">
                                {isLocked ? "আগের পাঠ সম্পন্ন করে আনলক করুন" : lesson.description}
                            </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 relative z-20">
                          {!isLocked && (
                              <span className="text-xs font-bold text-gray-400 dark:text-slate-600 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                              {lesson.xp} XP
                              </span>
                          )}
                          <div className={`transition-colors ${isLocked ? "text-gray-300" : "text-gray-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-teal-400"}`}>
                            {isLocked ? <Lock size={20} /> : <ArrowRight size={20} />}
                          </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningDashboard;