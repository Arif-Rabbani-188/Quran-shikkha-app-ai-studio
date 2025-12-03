import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, CheckCircle, Volume2, X, Trophy, RefreshCw, ArrowRight, ArrowLeft, ThumbsUp, AlertCircle } from 'lucide-react';
import { Lesson, LessonItem } from './types';
import { LEARNING_MODULES } from './data';
import { playPronunciation } from './hooks';

interface LessonViewProps {
    lesson: Lesson;
    onBack: () => void;
    onComplete: () => void;
    isCompleted: boolean;
    onNext?: () => void;
    onPrev?: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}

const CelebrationOverlay = ({ onContinue }: { onContinue?: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center animate-in zoom-in-50 duration-500 max-w-sm w-full mx-4">
          {/* Bursting Stars Background */}
          <div className="absolute pointer-events-none">
             <Star size={240} className="text-yellow-400 animate-ping opacity-20" fill="currentColor" />
          </div>
          
          {/* Main Icon */}
          <div className="relative mb-8">
             <Trophy size={120} className="text-yellow-400 drop-shadow-2xl filter" fill="currentColor" />
             <div className="absolute -top-6 -right-8 animate-bounce"><Star size={40} className="text-emerald-400" fill="currentColor" /></div>
             <div className="absolute -bottom-2 -left-8 animate-bounce" style={{ animationDelay: '150ms' }}><Star size={30} className="text-purple-400" fill="currentColor" /></div>
          </div>

          {/* Text */}
          <h1 className="text-4xl font-bold text-white font-bengali text-center mb-2 drop-shadow-lg">
              আলহামদুলিল্লাহ!
          </h1>
          <p className="text-white/80 font-bengali text-center mb-8">
              আপনি পাঠটি সফলভাবে সম্পন্ন করেছেন
          </p>

          {/* Action Button */}
          {onContinue && (
             <button 
                onClick={onContinue}
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 animate-bounce"
             >
                পরবর্তী পাঠে যান <ArrowRight size={24} />
             </button>
          )}
      </div>
  </div>
);

const QuizView = ({ lesson, onBack, onComplete, onNext, hasNext }: { lesson: Lesson; onBack: () => void; onComplete: () => void; onNext?: () => void; hasNext: boolean; }) => {
  const [questions, setQuestions] = useState<{question: LessonItem, options: LessonItem[]}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Track answers state
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]); // Index of selected option per question
  const [isAnswered, setIsAnswered] = useState<boolean[]>([]); // Whether question is answered
  
  // Current interaction state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isFeedbackPositive, setIsFeedbackPositive] = useState(false);

  useEffect(() => {
    if (!lesson.quizSourceModuleId) return;

    const module = LEARNING_MODULES.find(m => m.id === lesson.quizSourceModuleId);
    if (!module) return;

    const allItems: LessonItem[] = [];
    module.lessons.forEach(l => {
        if (l.type === 'content') allItems.push(...l.items);
    });

    const shuffledItems = [...allItems].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledItems.slice(0, 10);

    const generatedQuiz = selectedQuestions.map(q => {
        const distractors = allItems
            .filter(i => i.arabic !== q.arabic)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [q, ...distractors].sort(() => 0.5 - Math.random());
        return { question: q, options };
    });

    setQuestions(generatedQuiz);
    setUserAnswers(new Array(generatedQuiz.length).fill(null));
    setIsAnswered(new Array(generatedQuiz.length).fill(false));
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
  }, [lesson.quizSourceModuleId]);

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered[currentIndex]) return; // Prevent re-answering

    const correct = questions[currentIndex].options[optionIndex].arabic === questions[currentIndex].question.arabic;
    
    // Update state
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = optionIndex;
    setUserAnswers(newAnswers);
    
    const newIsAnswered = [...isAnswered];
    newIsAnswered[currentIndex] = true;
    setIsAnswered(newIsAnswered);

    if (correct) {
        setScore(prev => prev + 1);
        playPronunciation("ممتاز", "মুমতাজ");
        setFeedbackMessage("মাশাআল্লাহ! সঠিক উত্তর!");
        setIsFeedbackPositive(true);
    } else {
        playPronunciation("حاول مرة أخرى", "চেষ্টা চালিয়ে যান");
        setFeedbackMessage("ভুল হয়েছে, কিন্তু চেষ্টা চালিয়ে যান!");
        setIsFeedbackPositive(false);
    }

    // Delay before moving next
    setTimeout(() => {
        setFeedbackMessage(null);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Final score check
            const finalScore = score + (correct ? 1 : 0);
            setShowResult(true);
            if (finalScore >= 5) {
                onComplete();
            }
        }
    }, 2000); // 2 second delay to see answer
  };

  const playQuestionAudio = () => {
    const q = questions[currentIndex].question;
    playPronunciation(q.arabic, q.audioText);
  };

  const handleNext = () => {
      if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setFeedbackMessage(null);
      } else if (isAnswered[currentIndex]) {
          setShowResult(true);
      }
  };

  const handlePrev = () => {
      if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          setFeedbackMessage(null);
      }
  };

  if (questions.length === 0) return <div className="p-10 text-center">কুইজ তৈরি হচ্ছে...</div>;

  if (showResult) {
    return (
        <div className="container mx-auto p-4 max-w-2xl text-center animate-fade-in py-20">
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-800">
                {score >= 5 ? (
                    <div className="text-emerald-500 mb-6 flex justify-center"><Trophy size={80} /></div>
                ) : (
                    <div className="text-orange-500 mb-6 flex justify-center"><RefreshCw size={80} /></div>
                )}
                
                <h2 className="text-3xl font-bold font-bengali mb-4 text-gray-900 dark:text-white">
                    {score >= 5 ? "মাশাআল্লাহ! আপনি উত্তীর্ণ হয়েছেন!" : "আবার চেষ্টা করুন"}
                </h2>
                <p className="text-xl mb-8 text-gray-600 dark:text-slate-400">
                    আপনার স্কোর: {score} / {questions.length}
                </p>

                <div className="flex flex-col gap-4 justify-center items-center">
                    {score >= 5 && hasNext && (
                         <button onClick={onNext} className="w-full md:w-auto px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg flex items-center justify-center gap-2">
                            পরবর্তী পাঠ <ArrowRight size={20} />
                        </button>
                    )}
                    <button onClick={onBack} className="w-full md:w-auto px-6 py-3 rounded-full bg-gray-200 dark:bg-slate-700 font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                        তালিকায় ফিরে যান
                    </button>
                    {score < 5 && (
                        <button onClick={() => window.location.reload()} className="w-full md:w-auto px-6 py-3 rounded-full border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                            আবার কুইজ দিন
                        </button>
                    )}
                </div>
             </div>
        </div>
    );
  }

  const currentQuestionAnswered = isAnswered[currentIndex];
  const selectedOptIndex = userAnswers[currentIndex];
  const correctOptIndex = questions[currentIndex].options.findIndex(o => o.arabic === questions[currentIndex].question.arabic);

  return (
    <div className="container mx-auto p-4 max-w-3xl py-10 relative">
        <div className="flex justify-between items-center mb-8">
            <button onClick={onBack} className="text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"><X size={24}/></button>
            <div className="text-lg font-bold font-bengali">প্রশ্ন {currentIndex + 1} / {questions.length}</div>
            <div className="w-8"></div>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
            <div className={`absolute top-20 left-4 right-4 z-20 p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold animate-in slide-in-from-top-2 ${isFeedbackPositive ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                {isFeedbackPositive ? <ThumbsUp size={24} /> : <AlertCircle size={24} />}
                {feedbackMessage}
            </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 text-center mb-8 relative overflow-hidden">
            <div className="mb-4 text-gray-500 font-bengali">নিচের অডিওটি শুনুন এবং সঠিক উত্তর বাছাই করুন</div>
            <button 
                onClick={playQuestionAudio}
                className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
            >
                <Volume2 size={40} />
            </button>
            <p className="mt-4 text-sm text-gray-400">ক্লিক করে শুনুন</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            {questions[currentIndex].options.map((opt, idx) => {
                let styles = "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600";
                
                if (currentQuestionAnswered) {
                    if (idx === correctOptIndex) {
                        styles = "bg-emerald-500 text-white border-emerald-600 shadow-md transform scale-105";
                    } else if (idx === selectedOptIndex) {
                        styles = "bg-red-500 text-white border-red-600 opacity-60";
                    } else {
                        styles = "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-50";
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        disabled={currentQuestionAnswered}
                        className={`h-24 rounded-xl text-3xl font-arabic font-bold transition-all border-2 ${styles}`}
                    >
                        {opt.arabic}
                        <div className={`text-xs font-bengali font-normal mt-1 ${currentQuestionAnswered && (idx === correctOptIndex || idx === selectedOptIndex) ? "text-white/80" : "opacity-50"}`}>{opt.bengali}</div>
                    </button>
                );
            })}
        </div>

        {/* Quiz Navigation */}
        <div className="flex justify-between mt-6">
            <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className={`p-3 rounded-full ${currentIndex === 0 ? 'text-gray-300 dark:text-slate-700' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            >
                <ChevronLeft size={24} />
            </button>
            
            {/* Show Next button only if answered, to allow manual review progression */}
            <button 
                onClick={handleNext} 
                disabled={!currentQuestionAnswered && currentIndex < questions.length - 1} // Can't skip unless answered (or implement skip logic if desired)
                className={`p-3 rounded-full ${(!currentQuestionAnswered && currentIndex < questions.length - 1) ? 'text-gray-300 dark:text-slate-700' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
            >
                <ArrowRight size={24} />
            </button>
        </div>
    </div>
  );
};

const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack, onComplete, isCompleted, onNext, onPrev, hasNext, hasPrev }) => {
  const [showCelebration, setShowCelebration] = useState(false);

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id]);

  if (lesson.type === 'quiz') {
      return <QuizView lesson={lesson} onBack={onBack} onComplete={onComplete} onNext={onNext} hasNext={hasNext} />;
  }

  const handleComplete = () => {
    if (!isCompleted) {
      onComplete();
      setShowCelebration(true);
      // Removed automatic timeout to force user interaction
    } else if (hasNext && onNext) {
        onNext();
    } else {
        onBack();
    }
  };

  const handleCelebrationContinue = () => {
      setShowCelebration(false);
      if (hasNext && onNext) {
          onNext();
      } else {
          onBack();
      }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl animate-fade-in pb-32 relative overflow-hidden">
      {showCelebration && <CelebrationOverlay onContinue={hasNext ? handleCelebrationContinue : undefined} />}

      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-teal-400 transition-colors"
        >
          <ChevronLeft size={20} />
          ফিরে যান
        </button>
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star size={14} fill="currentColor" />
          {lesson.xp} XP
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 p-6 md:p-8">
        <div className="mb-8 border-b border-gray-100 dark:border-slate-800 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 font-bengali">{lesson.title}</h1>
          <p className="text-gray-600 dark:text-slate-400 font-bengali">{lesson.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lesson.items.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => playPronunciation(item.arabic, item.audioText)}
              className="group relative bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-transparent hover:border-emerald-500 dark:hover:border-teal-500 cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-3 select-none active:scale-95"
            >
              <div className="absolute top-3 right-3 text-gray-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-teal-400 transition-colors">
                <Volume2 size={20} />
              </div>

              <span className="text-5xl font-arabic text-emerald-800 dark:text-teal-400 mb-2 mt-2 leading-relaxed">
                 {item.arabic}
              </span>

              <div className="space-y-1 w-full">
                <h3 className="font-bold text-gray-800 dark:text-slate-200 font-bengali text-lg">{item.bengali}</h3>
                
                {item.example && (
                   <div className="bg-white dark:bg-slate-900 rounded px-2 py-1 text-xs font-arabic text-gray-500 dark:text-slate-400 mt-1 inline-block border border-gray-100 dark:border-slate-700">
                     যেমন: {item.example}
                   </div>
                )}

                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bengali mt-2 border-t border-gray-200 dark:border-slate-700 pt-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Complete / Action Button */}
        <div className="mt-10 flex justify-center">
            <button 
              onClick={handleComplete}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                isCompleted 
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isCompleted ? (
                 hasNext ? (
                    <>পরবর্তী পাঠে যান <ArrowRight size={20} /></>
                 ) : (
                    <><CheckCircle size={20} /> সম্পন্ন হয়েছে</>
                 )
              ) : (
                <><CheckCircle size={24} /> পাঠ সম্পন্ন করুন</>
              )}
            </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 p-4 md:hidden z-30">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
             <button 
                onClick={onPrev}
                disabled={!hasPrev}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${hasPrev ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800" : "text-gray-300 dark:text-slate-700 cursor-not-allowed"}`}
             >
                 <ArrowLeft size={16} /> আগের পাঠ
             </button>
             <button 
                onClick={onNext}
                disabled={!hasNext || !isCompleted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${hasNext && isCompleted ? "bg-emerald-600 text-white" : "text-gray-300 dark:text-slate-700 bg-gray-100 dark:bg-slate-800 cursor-not-allowed"}`}
             >
                 পরবর্তী পাঠ <ArrowRight size={16} />
             </button>
          </div>
      </div>
       {/* Desktop Navigation Footer (Inline) */}
       <div className="hidden md:flex justify-between items-center mt-12 border-t border-gray-100 dark:border-slate-800 pt-8">
             <button 
                onClick={onPrev}
                disabled={!hasPrev}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${hasPrev ? "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800" : "text-gray-300 dark:text-slate-800 cursor-not-allowed"}`}
             >
                 <ArrowLeft size={20} /> আগের পাঠ
             </button>
             <button 
                onClick={onNext}
                disabled={!hasNext || !isCompleted}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${hasNext && isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg" : "text-gray-400 dark:text-slate-600 bg-gray-100 dark:bg-slate-800 cursor-not-allowed"}`}
             >
                 পরবর্তী পাঠ <ArrowRight size={20} />
             </button>
        </div>
    </div>
  );
};

export default LessonView;