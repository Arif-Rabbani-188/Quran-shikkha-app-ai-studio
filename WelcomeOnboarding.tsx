import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Star, ArrowRight, CheckCircle, Heart, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const WelcomeOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      icon: <Heart size={60} className="text-emerald-500" fill="currentColor" />,
      title: "আসসালামু আলাইকুম!",
      subtitle: "QuranShikha অ্যাপে আপনাকে স্বাগতম",
      description: "এই অ্যাপের মাধ্যমে আপনি কুরআন পাঠ এবং আরবি শিক্ষা দুটোই করতে পারবেন।",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <BookOpen size={60} className="text-blue-500" />,
      title: "কুরআন পাঠ করুন",
      subtitle: "সব সূরা বাংলা ও ইংরেজি অনুবাদসহ",
      description: "• আরবি উচ্চারণ গাইড\n• অডিও রিসাইটেশন\n• বুকমার্ক ও শেয়ার সুবিধা\n• অফলাইনে পড়ার সুবিধা",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <GraduationCap size={60} className="text-purple-500" />,
      title: "আরবি শিখুন",
      subtitle: "ধাপে ধাপে ইন্টারেক্টিভ লেসন",
      description: "• মৌলিক আরবি অক্ষর শিক্ষা\n• উচ্চারণ অনুশীলন\n• কুইজ ও পরীক্ষা\n• XP পয়েন্ট অর্জন করুন",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Target size={60} className="text-amber-500" />,
      title: "আপনার লক্ষ্য নির্ধারণ করুন",
      subtitle: "দৈনিক পড়ার লক্ষ্য সেট করুন",
      description: "নিয়মিত অনুশীলনের জন্য দৈনিক লক্ষ্য নির্ধারণ করে আপনার পড়ার অভ্যাস গড়ে তুলুন।",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem('quran_app_onboarded', 'true');
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full mx-auto shadow-2xl animate-in zoom-in-50 duration-300">
        
        {/* Progress Indicator */}
        <div className="flex space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-emerald-500' 
                  : 'bg-gray-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Icon with gradient background */}
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentStepData.color} mx-auto flex items-center justify-center shadow-lg`}>
            {currentStepData.icon}
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-bengali">
              {currentStepData.title}
            </h2>
            <h3 className="text-lg text-gray-600 dark:text-gray-300 font-bengali">
              {currentStepData.subtitle}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-bengali whitespace-pre-line">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-6 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-bengali"
            >
              এড়িয়ে যান
            </button>
          )}
          
          <button
            onClick={handleNext}
            className={`flex-1 py-3 px-6 rounded-xl bg-gradient-to-r ${currentStepData.color} text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 font-bengali`}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle size={20} />
                শুরু করুন
              </>
            ) : (
              <>
                পরবর্তী
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Step counter */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-400 dark:text-gray-500 font-bengali">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOnboarding;