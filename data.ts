import { Module } from './types';

export const LEARNING_MODULES: Module[] = [
  {
    id: "alphabet",
    title: "পর্ব ১: আরবী বর্ণমালা (Alphabet)",
    lessons: [
      {
        id: "alph_1",
        title: "একক বর্ণ (আলিফ - খা)",
        description: "আরবী বর্ণমালার প্রথম ৭টি হরফ।",
        xp: 10,
        type: 'content',
        items: [
          { arabic: "ا", bengali: "আলিফ", audioText: "أَلِفْ", description: "খালি আলিফ মাদ্দের কাজ দেয়। জবর/জের/পেশ হলে তা 'হামজা'।" },
          { arabic: "ب", bengali: "বা", audioText: "بَاءْ", description: "দুই ঠোঁট হতে উচ্চারিত হয়।" },
          { arabic: "ت", bengali: "তা", audioText: "تَاءْ", description: "জিহ্বার আগা ও ওপরের দাঁতের গোড়া।" },
          { arabic: "ث", bengali: "ছা", audioText: "ثَاءْ", description: "জিহ্বার আগা ও ওপরের দাঁতের আগা (নরম করে)।" },
          { arabic: "ج", bengali: "জীম", audioText: "جِيمْ", description: "জিহ্বার মধ্যখান ও ওপরের তালু।" },
          { arabic: "ح", bengali: "হা", audioText: "حَاءْ", description: "গলার মধ্যখান হতে (শাঁ শাঁ করে)।" },
          { arabic: "خ", bengali: "খ", audioText: "خَاءْ", description: "গলার শেষভাগ হতে (একটু ঘষা লেগে)।" }
        ]
      },
      {
        id: "alph_2",
        title: "একক বর্ণ (দাল - দদ)",
        description: "পরবর্তী ৮টি হরফ। মাখরাজ খেয়াল করুন।",
        xp: 10,
        type: 'content',
        items: [
          { arabic: "د", bengali: "দাল", audioText: "دَالْ", description: "জিহ্বার আগা ও ওপরের দাঁতের গোড়া।" },
          { arabic: "ذ", bengali: "যাল", audioText: "ذَالْ", description: "জিহ্বার আগা ও ওপরের দাঁতের আগা (নরম করে)।" },
          { arabic: "ر", bengali: "র", audioText: "رَاءْ", description: "জিহ্বার আগার উল্টোপিঠ ও ওপরের তালু (মোটা হবে)।" },
          { arabic: "ز", bengali: "ঝা", audioText: "زَايْ", description: "জিহ্বার আগা ও নিচের দাঁতের পেট (শিষ দিয়ে)।" },
          { arabic: "س", bengali: "সীন", audioText: "سِينْ", description: "জিহ্বার আগা ও নিচের দাঁতের পেট (তীক্ষ্ণ শিষ)।" },
          { arabic: "ش", bengali: "শীন", audioText: "شِينْ", description: "জিহ্বার মধ্যখান ও ওপরের তালু।" },
          { arabic: "ص", bengali: "ছদ", audioText: "صَادْ", description: "জিহ্বার আগা ও নিচের দাঁতের পেট (মোটা ও শিষ)।" },
          { arabic: "ض", bengali: "দদ", audioText: "ضَادْ", description: "জিহ্বার গোড়ার কিনারা ও ওপরের মাড়ির দাঁত।" }
        ]
      },
      {
        id: "alph_3",
        title: "একক বর্ণ (ত্ব - গাইন)",
        description: "মাঝখানের ৪টি হরফ।",
        xp: 10,
        type: 'content',
        items: [
          { arabic: "ط", bengali: "ত্ব", audioText: "طَاءْ", description: "জিহ্বার আগা ও ওপরের দাঁতের গোড়া (মোটা)।" },
          { arabic: "ظ", bengali: "জ্ব", audioText: "ظَاءْ", description: "জিহ্বার আগা ও ওপরের দাঁতের আগা (মোটা ও নরম)।" },
          { arabic: "ع", bengali: "আইন", audioText: "عَيْنْ", description: "গলার মধ্যখান হতে (চাপ দিয়ে)।" },
          { arabic: "غ", bengali: "গাইন", audioText: "غَيْنْ", description: "গলার শেষভাগ হতে (মুখের দিকে)।" }
        ]
      },
      {
        id: "alph_4",
        title: "একক বর্ণ (ফা - ইয়া)",
        description: "শেষের ১০টি হরফ।",
        xp: 15,
        type: 'content',
        items: [
          { arabic: "ف", bengali: "ফা", audioText: "فَاءْ", description: "নিচের ঠোঁটের পেট ও ওপরের দাঁতের আগা।" },
          { arabic: "ق", bengali: "ক্বফ", audioText: "قَافْ", description: "জিহ্বার গোড়া ও ওপরের তালু (মোটা)।" },
          { arabic: "ك", bengali: "কাফ", audioText: "كَافْ", description: "জিহ্বার গোড়া থেকে একটু আগে ও ওপরের তালু।" },
          { arabic: "ل", bengali: "লাম", audioText: "لاَمْ", description: "জিহ্বার আগার কিনারা ও ওপরের তালু।" },
          { arabic: "م", bengali: "মীম", audioText: "مِيمْ", description: "দুই ঠোঁটের শুষ্ক জায়গা হতে।" },
          { arabic: "ن", bengali: "নূন", audioText: "نُونْ", description: "জিহ্বার আগা ও ওপরের তালু।" },
          { arabic: "و", bengali: "ওয়াও", audioText: "وَاوْ", description: "দুই ঠোঁট গোল করে।" },
          { arabic: "هـ", bengali: "হা", audioText: "هَاءْ", description: "গলার শুরু হতে (বুকের ভেতর থেকে)।" },
          { arabic: "ء", bengali: "হামজা", audioText: "هَمْزَةْ", description: "গলার শুরু হতে (শক্তভাবে)।" },
          { arabic: "ي", bengali: "ইয়া", audioText: "يَاءْ", description: "জিহ্বার মধ্যখান ও ওপরের তালু।" }
        ]
      },
      {
        id: "alph_quiz",
        title: "কুইজ: বর্ণমালা পরীক্ষা",
        description: "বর্ণ চেনার দক্ষতা যাচাই করুন।",
        xp: 50,
        type: 'quiz',
        quizSourceModuleId: 'alphabet',
        items: []
      }
    ]
  },
  {
    id: "makhraj",
    title: "পর্ব ২: মাখরাজ (উচ্চারণ স্থল)",
    lessons: [
        {
            id: "makh_1",
            title: "হলক বা কণ্ঠনালী (Throat)",
            description: "কণ্ঠনালী থেকে ৩টি মাখরাজ ও ৬টি হরফ উচ্চারিত হয়।",
            xp: 20,
            type: 'content',
            items: [
                { arabic: "أ هـ", bengali: "শুরু ভাগ", audioText: "أَلِفْ هَاءْ", description: "১নং মাখরাজ: কণ্ঠনালীর শুরু হতে (বুকের দিক থেকে)।", example: "হামজা, হা" },
                { arabic: "ع ح", bengali: "মধ্য ভাগ", audioText: "عَيْنْ حَاءْ", description: "২নং মাখরাজ: কণ্ঠনালীর মধ্যখান হতে।", example: "আইন, হা" },
                { arabic: "غ خ", bengali: "শেষ ভাগ", audioText: "غَيْنْ خَاءْ", description: "৩নং মাখরাজ: কণ্ঠনালীর শেষ ভাগ হতে (মুখের দিকে)।", example: "গাইন, খ" }
            ]
        },
        {
            id: "makh_2",
            title: "জিহ্বা (Tongue) - পার্ট ১",
            description: "জিহ্বার গোড়া থেকে উচ্চারিত হরফ।",
            xp: 20,
            type: 'content',
            items: [
                { arabic: "ق", bengali: "গোড়া (মোটা)", audioText: "قَافْ", description: "৪নং মাখরাজ: জিহ্বার গোড়া ও তার বরাবর ওপরের তালু।" },
                { arabic: "ك", bengali: "গোড়া (চিকন)", audioText: "كَافْ", description: "৫নং মাখরাজ: জিহ্বার গোড়া থেকে একটু আগে ও ওপরের তালু।" },
                { arabic: "ج ش ي", bengali: "মধ্যভাগ", audioText: "جِيمْ شِينْ يَاءْ", description: "৬নং মাখরাজ: জিহ্বার মধ্যখান ও ওপরের তালু।" }
            ]
        },
        {
            id: "makh_3",
            title: "জিহ্বা (Tongue) - পার্ট ২",
            description: "জিহ্বার আগা ও দাঁতের সংযোগস্থল।",
            xp: 20,
            type: 'content',
            items: [
                { arabic: "ض", bengali: "পার্শ্বভাগ", audioText: "ضَادْ", description: "৭নং মাখরাজ: জিহ্বার গোড়ার কিনারা ও ওপরের মাড়ির দাঁতের গোড়া।" },
                { arabic: "ل", bengali: "আগার কিনারা", audioText: "لاَمْ", description: "৮নং মাখরাজ: জিহ্বার আগার কিনারা ও ওপরের দাঁতের মাড়ি।" },
                { arabic: "ن", bengali: "আগা", audioText: "نُونْ", description: "৯নং মাখরাজ: জিহ্বার আগা ও তার বরাবর ওপরের তালু।" },
                { arabic: "ر", bengali: "আগার পিঠ", audioText: "رَاءْ", description: "১০নং মাখরাজ: জিহ্বার আগার উল্টোপিঠ ও ওপরের তালু।" }
            ]
        },
        {
            id: "makh_4",
            title: "শাফাতাইন (Lips) ও নাসিকা",
            description: "ঠোঁট এবং নাক থেকে উচ্চারিত হরফ।",
            xp: 20,
            type: 'content',
            items: [
                { arabic: "ف", bengali: "ঠোঁট ও দাঁত", audioText: "فَاءْ", description: "১৪নং মাখরাজ: নিচের ঠোঁটের পেট ও ওপরের সামনের দুই দাঁতের আগা।" },
                { arabic: "ب م و", bengali: "দুই ঠোঁট", audioText: "بَاءْ مِيمْ وَاوْ", description: "১৫নং মাখরাজ: দুই ঠোঁট হতে উচ্চারিত হয় (ওয়াও গোল করে, বা ভিজা, মীম শুকনা)।" },
                { arabic: "نّ مّ", bengali: "গুন্নাহ", audioText: "غُنَّة", description: "১৭নং মাখরাজ: নাকের বাঁশি হতে গুন্নাহ উচ্চারিত হয়।" }
            ]
        },
        {
            id: "makh_quiz",
            title: "কুইজ: মাখরাজ পরীক্ষা",
            description: "উচ্চারণ স্থল ও হরফ চেনার পরীক্ষা।",
            xp: 50,
            type: 'quiz',
            quizSourceModuleId: 'makhraj',
            items: []
        }
    ]
  },
  {
    id: "compounds",
    title: "পর্ব ৩: যুক্তবর্ণের রূপ (Combined Forms)",
    lessons: [
      {
        id: "forms_1",
        title: "বা, তা, ছা, নুন, ইয়া (Ba-Ta Group)",
        description: "শুরু, মধ্য ও শেষ অবস্থায় রূপ।",
        xp: 25,
        type: 'content',
        items: [
          { arabic: "ب", bengali: "বা (একক)", audioText: "بَاءْ", description: "মূল রূপ" },
          { arabic: "بـ", bengali: "বা (শুরু)", audioText: "بَاءْ", description: "নিচে ১ নুকতা" },
          { arabic: "ـبـ", bengali: "বা (মধ্য)", audioText: "بَاءْ", description: "উভয় পাশে সংযোগ" },
          { arabic: "ـب", bengali: "বা (শেষ)", audioText: "بَاءْ", description: "শেষে পূর্ণ রূপের কাছাকাছি" },
          
          { arabic: "ت", bengali: "তা (একক)", audioText: "تَاءْ", description: "মূল রূপ" },
          { arabic: "تـ", bengali: "তা (শুরু)", audioText: "تَاءْ", description: "ওপরে ২ নুকতা" },
          { arabic: "ـتـ", bengali: "তা (মধ্য)", audioText: "تَاءْ", description: "ওপরে ২ নুকতা" },
          { arabic: "ـت", bengali: "তা (শেষ)", audioText: "تَاءْ", description: "শেষে" }
        ]
      },
      {
        id: "forms_2",
        title: "জীম, হা, খা (Jeem Group)",
        description: "মাথা একই, নুকতা ভিন্ন।",
        xp: 25,
        type: 'content',
        items: [
          { arabic: "جـ", bengali: "জীম (শুরু)", audioText: "جِيمْ", description: "নিচে ১ নুকতা" },
          { arabic: "ـجـ", bengali: "জীম (মধ্য)", audioText: "جِيمْ", description: "নিচে ১ নুকতা" },
          { arabic: "حـ", bengali: "হা (শুরু)", audioText: "حَاءْ", description: "নুকতা নেই" },
          { arabic: "ـخـ", bengali: "খা (মধ্য)", audioText: "خَاءْ", description: "ওপরে ১ নুকতা" }
        ]
      },
      {
        id: "forms_3",
        title: "সীন, শীন, সদ, দদ (Seen/Sad Group)",
        description: "দাঁত এবং মাথা চেনার উপায়।",
        xp: 25,
        type: 'content',
        items: [
          { arabic: "سـ", bengali: "সীন (শুরু)", audioText: "سِينْ", description: "৩টি দাঁত" },
          { arabic: "ـشـ", bengali: "শীন (মধ্য)", audioText: "شِينْ", description: "৩টি দাঁত, ৩ নুকতা" },
          { arabic: "صـ", bengali: "সদ (শুরু)", audioText: "صَادْ", description: "মাথা গোল" },
          { arabic: "ـضـ", bengali: "দদ (মধ্য)", audioText: "ضَادْ", description: "মাথা গোল, ১ নুকতা" }
        ]
      },
      {
        id: "forms_4",
        title: "আইন, গাইন, ফা, ক্বফ",
        description: "মাথা ও গর্ত চেনার উপায়।",
        xp: 25,
        type: 'content',
        items: [
          { arabic: "عـ", bengali: "আইন (শুরু)", audioText: "عَيْنْ", description: "খোলা মুখ" },
          { arabic: "ـعـ", bengali: "আইন (মধ্য)", audioText: "عَيْنْ", description: "ভরাট মাথা" },
          { arabic: "فـ", bengali: "ফা (শুরু)", audioText: "فَاءْ", description: "গোল মাথা, ১ নুকতা" },
          { arabic: "ـقـ", bengali: "ক্বফ (মধ্য)", audioText: "قَافْ", description: "গোল মাথা, ২ নুকতা" }
        ]
      },
      {
        id: "forms_5",
        title: "কাফ, লাম, মীম, হা",
        description: "আকৃতি পরিবর্তন।",
        xp: 25,
        type: 'content',
        items: [
          { arabic: "كـ", bengali: "কাফ (শুরু)", audioText: "كَافْ", description: "এস এর মতো আকৃতি" },
          { arabic: "ـلـ", bengali: "লাম (মধ্য)", audioText: "لاَمْ", description: "সোজা দাগ" },
          { arabic: "مـ", bengali: "মীম (শুরু)", audioText: "مِيمْ", description: "গোল মাথা নিচে" },
          { arabic: "ـهـ", bengali: "হা (মধ্য)", audioText: "هَاءْ", description: "দুই চোখের মতো" }
        ]
      },
      {
        id: "forms_quiz",
        title: "কুইজ: যুক্তবর্ণের রূপ",
        description: "শুরু, মধ্য ও শেষ রূপ চেনার পরীক্ষা।",
        xp: 60,
        type: 'quiz',
        quizSourceModuleId: 'compounds',
        items: []
      }
    ]
  },
  {
    id: "signs",
    title: "পর্ব ৪: হরকত ও চিহ্ন (Harakat & Signs)",
    lessons: [
      {
        id: "sign_1",
        title: "হরকত (Short Vowels)",
        description: "যবর (আ), জের (ই), পেশ (উ) এর পরিচিতি।",
        xp: 30,
        type: 'content',
        items: [
          { arabic: "بَ", bengali: "বা (যবর)", audioText: "بَ", description: "উচ্চারণ দ্রুত হবে। 'আ' কারের মতো।" },
          { arabic: "بِ", bengali: "বি (জের)", audioText: "بِ", description: "উচ্চারণ দ্রুত হবে। 'ই' কারের মতো।" },
          { arabic: "بُ", bengali: "বু (পেশ)", audioText: "بُ", description: "উচ্চারণ দ্রুত হবে। 'উ' কারের মতো।" },
          { arabic: "تَ", bengali: "তা", audioText: "تَ" },
          { arabic: "تِ", bengali: "তি", audioText: "تِ" },
          { arabic: "تُ", bengali: "তু", audioText: "تُ" }
        ]
      },
      {
        id: "sign_2",
        title: "তানভীন (Tanween)",
        description: "দুই যবর, দুই জের, দুই পেশ (নুন সাকিন উহ্য থাকে)।",
        xp: 30,
        type: 'content',
        items: [
          { arabic: "بًا", bengali: "বান", audioText: "بَنْ", description: "শেষে 'ন' এর মতো শব্দ হবে।" },
          { arabic: "بٍ", bengali: "বিন", audioText: "بِنْ" },
          { arabic: "بٌ", bengali: "বুন", audioText: "بُنْ" },
          { arabic: "مَسَدٍ", bengali: "মাসাদিন", audioText: "مَسَدِنْ", example: "সূরা লাহাব" }
        ]
      },
      {
        id: "sign_3",
        title: "মাদ (Long Vowels)",
        description: "এক আলিফ পরিমাণ টেনে পড়ার নিয়ম।",
        xp: 35,
        type: 'content',
        items: [
          { arabic: "بَا", bengali: "বা-", audioText: "بَا", description: "আলিফ মাদ - যবরের পর খালি আলিফ।" },
          { arabic: "بِي", bengali: "বি-", audioText: "بِي", description: "ইয়া মাদ - জেরের পর যজম-যুক্ত ইয়া।" },
          { arabic: "بُو", bengali: "বু-", audioText: "بُو", description: "ওয়াও মাদ - পেশের পর যজম-যুক্ত ওয়াও।" },
          { arabic: "نُوحِيهَا", bengali: "নূহীহা", audioText: "نُوحِيهَا", example: "তিনটি মাদ একসাথে" }
        ]
      },
      {
        id: "sign_4",
        title: "সাকিন ও তাশদীদের ব্যবহার",
        description: "অক্ষর যুক্ত করা ও জোর দেওয়া।",
        xp: 35,
        type: 'content',
        items: [
          { arabic: "اَبْ", bengali: "আব", audioText: "اَبْ", description: "সাকিন (্) - পূর্বের অক্ষরের সাথে মিলায়।" },
          { arabic: "رَبِّ", bengali: "রব্বি", audioText: "رَبِّ", description: "তাশদীদ ( ّ ) - দুইবার উচ্চারণ হয় (র+ব+বি)।" },
          { arabic: "اِنَّ", bengali: "ইন্না", audioText: "اِنَّ", description: "নুন ও মীমে তাশদীদ হলে গুন্নাহ হবে।" }
        ]
      },
      {
        id: "sign_quiz",
        title: "কুইজ: চিহ্ন পরিচিতি",
        description: "হরকত, মাদ ও তানভীন চেনার পরীক্ষা।",
        xp: 60,
        type: 'quiz',
        quizSourceModuleId: 'signs',
        items: []
      }
    ]
  },
  {
    id: "tajweed",
    title: "পর্ব ৫: তাজবীদ (Tajweed Rules)",
    lessons: [
      {
        id: "taj_1",
        title: "কলকলা (Qalqalah)",
        description: "ধাক্কা দিয়ে বা প্রতিধ্বনি করে পড়ার ৫টি হরফ (ق ط ب ج د)।",
        xp: 40,
        type: 'content',
        items: [
          { arabic: "ق", bengali: "ক্বফ", audioText: "قَافْ" },
          { arabic: "اَقْ", bengali: "আক্ব", audioText: "اَقْ", description: "গলার গোড়া থেকে ধাক্কা আসবে।" },
          { arabic: "اَطْ", bengali: "আত্ব", audioText: "اَطْ" },
          { arabic: "اَبْ", bengali: "আব", audioText: "اَبْ" },
          { arabic: "اَجْ", bengali: "আজ", audioText: "اَجْ" },
          { arabic: "اَدْ", bengali: "আদ", audioText: "اَدْ" },
          { arabic: "فَلَق", bengali: "ফালাক্ব", audioText: "فَلَقْ", example: "থেমে গেলে কলকলা স্পষ্ট হয়।" }
        ]
      },
      {
        id: "taj_2",
        title: "ওয়াজিব গুন্নাহ (Ghunnah)",
        description: "নুন (ن) বা মীম (م) এ তাশদীদ থাকলে গুন্নাহ করা আবশ্যক।",
        xp: 40,
        type: 'content',
        items: [
          { arabic: "اِنَّ", bengali: "ইন্না", audioText: "اِنَّ", description: "নাক দিয়ে শব্দ করা (১ আলিফ পরিমাণ)।" },
          { arabic: "اُمَّ", bengali: "উম্মা", audioText: "اُمَّ" },
          { arabic: "ثُمَّ", bengali: "ছুম্মা", audioText: "ثُمَّ" },
          { arabic: "جَنَّة", bengali: "জান্নাহ", audioText: "جَنَّة" }
        ]
      },
      {
        id: "taj_quiz",
        title: "কুইজ: তাজবীদ",
        description: "কলকলা ও গুন্নাহ নিয়ম যাচাই।",
        xp: 70,
        type: 'quiz',
        quizSourceModuleId: 'tajweed',
        items: []
      }
    ]
  },
  {
    id: "practice_combined",
    title: "পর্ব ৬: শব্দ গঠন অনুশীলন (Word Practice)",
    lessons: [
      {
        id: "prac_1",
        title: "২ অক্ষরের শব্দ (সেট ১)",
        description: "সহজ যুক্তবর্ণ অনুশীলন।",
        xp: 30,
        type: 'content',
        items: [
           { arabic: "بَلْ", bengali: "বাল", audioText: "بَلْ" },
           { arabic: "مِنْ", bengali: "মিন", audioText: "مِنْ" },
           { arabic: "هَلْ", bengali: "হাল", audioText: "هَلْ" },
           { arabic: "قُلْ", bengali: "কুল", audioText: "قُلْ" },
           { arabic: "كُنْ", bengali: "কুন", audioText: "كُنْ" },
           { arabic: "عَنْ", bengali: "আন", audioText: "عَنْ" },
           { arabic: "فِي", bengali: "ফি", audioText: "فِي" },
           { arabic: "لِي", bengali: "লি", audioText: "لِي" },
           { arabic: "بِي", bengali: "বি", audioText: "بِي" },
           { arabic: "مَا", bengali: "মা", audioText: "مَا" },
           { arabic: "لَا", bengali: "লা", audioText: "لَا" },
           { arabic: "يَا", bengali: "ইয়া", audioText: "يَا" }
        ]
      },
      {
        id: "prac_2",
        title: "২ অক্ষরের শব্দ (সেট ২)",
        description: "আরও কিছু যুক্তবর্ণ।",
        xp: 30,
        type: 'content',
        items: [
           { arabic: "هُوَ", bengali: "হুয়া", audioText: "هُوَ" },
           { arabic: "هِيَ", bengali: "হিয়া", audioText: "هِيَ" },
           { arabic: "لَكَ", bengali: "লাকা", audioText: "لَكَ" },
           { arabic: "لَهُ", bengali: "লাহু", audioText: "لَهُ" },
           { arabic: "بِهِ", bengali: "বিহি", audioText: "بِهِ" },
           { arabic: "لَن", bengali: "লান", audioText: "لَن" },
           { arabic: "لَمْ", bengali: "লাম", audioText: "لَمْ" },
           { arabic: "كَيْ", bengali: "কাই", audioText: "كَيْ" },
           { arabic: "لَوْ", bengali: "লাও", audioText: "لَوْ" },
           { arabic: "أَوْ", bengali: "আও", audioText: "أَوْ" }
        ]
      },
      {
        id: "prac_3",
        title: "৩ অক্ষরের শব্দ (সেট ১)",
        description: "তিনটি হরফ যুক্ত করার নিয়ম।",
        xp: 40,
        type: 'content',
        items: [
           { arabic: "كَتَبَ", bengali: "কাতাবা", audioText: "كَتَبَ" },
           { arabic: "نَظَرَ", bengali: "নাজারা", audioText: "نَظَرَ" },
           { arabic: "خَلَقَ", bengali: "খালাক্বা", audioText: "خَلَقَ" },
           { arabic: "ذَهَبَ", bengali: "জাহাবা", audioText: "ذَهَبَ" },
           { arabic: "رَجَعَ", bengali: "রাজা'আ", audioText: "رَجَعَ" },
           { arabic: "سَجَدَ", bengali: "সাজাদা", audioText: "سَجَدَ" },
           { arabic: "عَبَدَ", bengali: "আবাদা", audioText: "عَبَدَ" },
           { arabic: "كَفَرَ", bengali: "কাফারা", audioText: "كَفَرَ" },
           { arabic: "وَعَدَ", bengali: "ওয়া'আদা", audioText: "وَعَدَ" },
           { arabic: "نَصَرَ", bengali: "নাছারা", audioText: "نَصَرَ" }
        ]
      },
      {
        id: "prac_4",
        title: "৩ অক্ষরের শব্দ (সেট ২)",
        description: "জবর, জের, পেশ যুক্ত শব্দ।",
        xp: 40,
        type: 'content',
        items: [
           { arabic: "عُلِمَ", bengali: "উলিমা", audioText: "عُلِمَ" },
           { arabic: "خُلِقَ", bengali: "খুলিক্বা", audioText: "خُلِقَ" },
           { arabic: "قُرِئَ", bengali: "কুরি'আ", audioText: "قُرِئَ" },
           { arabic: "سُئِلَ", bengali: "সু'ইলা", audioText: "سُئِلَ" },
           { arabic: "رُسُل", bengali: "রুসুলু", audioText: "رُسُل" },
           { arabic: "صُحُف", bengali: "ছুহুফি", audioText: "صُحُف" },
           { arabic: "مَثَل", bengali: "মাছালু", audioText: "مَثَل" },
           { arabic: "قَمَر", bengali: "ক্বমারু", audioText: "قَمَر" },
           { arabic: "مَلِك", bengali: "মালিকি", audioText: "مَلِك" },
           { arabic: "أَحَد", bengali: "আহাদু", audioText: "أَحَد" }
        ]
      },
      {
        id: "prac_quiz",
        title: "কুইজ: শব্দ গঠন",
        description: "শব্দ শুনে সঠিক লেখাটি বাছাই করুন।",
        xp: 80,
        type: 'quiz',
        quizSourceModuleId: 'practice_combined',
        items: []
      }
    ]
  },
  {
    id: "quran_words",
    title: "পর্ব ৭: কুরআনের শব্দভাণ্ডার (Vocabulary)",
    lessons: [
      {
        id: "vocab_1",
        title: "বহুল ব্যবহৃত শব্দ (১-২৫)",
        description: "কুরআনে এই শব্দগুলো বারবার এসেছে।",
        xp: 50,
        type: 'content',
        items: [
           { arabic: "ٱللَّه", bengali: "আল্লাহ", audioText: "ٱللَّه", description: "মহান সৃষ্টিকর্তা" },
           { arabic: "رَبّ", bengali: "রব (প্রভু)", audioText: "رَبّ" },
           { arabic: "يَوْم", bengali: "দিন (দিবস)", audioText: "يَوْم" },
           { arabic: "دِين", bengali: "দ্বীন (ধর্ম/বিচার)", audioText: "دِين" },
           { arabic: "كِتَـٰب", bengali: "কিতাব (বই)", audioText: "كِتَـٰب" },
           { arabic: "رَسُول", bengali: "রাসূল (বার্তাবাহক)", audioText: "رَسُول" },
           { arabic: "نَبِيّ", bengali: "নবী", audioText: "نَبِيّ" },
           { arabic: "جَنَّة", bengali: "জান্নাত (বাগান)", audioText: "جَنَّة" },
           { arabic: "نَار", bengali: "নার (আগুন/জাহান্নাম)", audioText: "نَار" },
           { arabic: "سَمَـٰوَات", bengali: "সামাওয়াত (আকাশমন্ডলী)", audioText: "سَمَـٰوَات" },
           { arabic: "أَرْض", bengali: "আরদ (পৃথিবী)", audioText: "أَرْض" },
           { arabic: "عَبْد", bengali: "আব্দ (বান্দা)", audioText: "عَبْد" },
           { arabic: "قَلْب", bengali: "ক্বলব (অন্তর)", audioText: "قَلْب" },
           { arabic: "نَفْس", bengali: "নফস (আত্মা)", audioText: "نَفْس" },
           { arabic: "خَيْر", bengali: "খাইর (উত্তম)", audioText: "خَيْر" },
           { arabic: "شَرّ", bengali: "শার (মন্দ)", audioText: "شَرّ" },
           { arabic: "حَقّ", bengali: "হক (সত্য)", audioText: "حَقّ" },
           { arabic: "بَـٰطِل", bengali: "বাতিল (মিথ্যা)", audioText: "بَـٰطِل" },
           { arabic: "إِيمَـٰن", bengali: "ঈমান (বিশ্বাস)", audioText: "إِيمَـٰن" },
           { arabic: "كُفْر", bengali: "কুফর (অবিশ্বাস)", audioText: "كُفْر" },
           { arabic: "صَلَوٰة", bengali: "সালাত (নামাজ)", audioText: "صَلَوٰة" },
           { arabic: "زَكَوٰة", bengali: "যাকাত", audioText: "زَكَوٰة" },
           { arabic: "صِيَام", bengali: "সিয়াম (রোজা)", audioText: "صِيَام" },
           { arabic: "حَجّ", bengali: "হজ", audioText: "حَجّ" },
           { arabic: "ذِكْر", bengali: "যিকির (স্মরণ)", audioText: "ذِكْر" }
        ]
      },
      {
        id: "vocab_2",
        title: "বহুল ব্যবহৃত শব্দ (২৬-৫০)",
        description: "অর্থসহ অনুশীলন করুন।",
        xp: 50,
        type: 'content',
        items: [
           { arabic: "رَحْمَـٰن", bengali: "রহমান (পরম দয়ালু)", audioText: "رَحْمَـٰن" },
           { arabic: "رَحِيم", bengali: "রহীম (অতি দয়ালু)", audioText: "رَحِيم" },
           { arabic: "عَظِيم", bengali: "আজীম (মহান)", audioText: "عَظِيم" },
           { arabic: "حَكِيم", bengali: "হাকীম (প্রজ্ঞাময়)", audioText: "حَكِيم" },
           { arabic: "عَلِيم", bengali: "আলীম (সর্বজ্ঞ)", audioText: "عَلِيم" },
           { arabic: "قَدِير", bengali: "ক্বাদীর (সর্বশক্তিমান)", audioText: "قَدِير" },
           { arabic: "غَفُور", bengali: "গফুর (ক্ষমাশীল)", audioText: "غَفُور" },
           { arabic: "تَوَّاب", bengali: "তাওয়াব (তওবা কবুলকারী)", audioText: "تَوَّاب" },
           { arabic: "مَلَك", bengali: "মালাক (ফেরেশতা)", audioText: "مَلَك" },
           { arabic: "شَيْطَـٰن", bengali: "শয়তান", audioText: "شَيْطَـٰن" },
           { arabic: "دُنْيَا", bengali: "দুনিয়া", audioText: "دُنْيَا" },
           { arabic: "آخِرَة", bengali: "আখিরাত (পরকাল)", audioText: "آخِرَة" },
           { arabic: "عَذَاب", bengali: "আজাব (শাস্তি)", audioText: "عَذَاب" },
           { arabic: "أَجْر", bengali: "আজৱ (পুরস্কার)", audioText: "أَجْر" },
           { arabic: "نُور", bengali: "নূর (আলো)", audioText: "نُور" },
           { arabic: "ظُلُمَـٰت", bengali: "জুলুমাত (অন্ধকার)", audioText: "ظُلُمَـٰت" },
           { arabic: "هُدًى", bengali: "হুদাহ (পথনির্দেশ)", audioText: "هُدًى" },
           { arabic: "ضَلَـٰل", bengali: "দলাল (পথভ্রষ্টতা)", audioText: "ضَلَـٰل" },
           { arabic: "مُؤْمِن", bengali: "মুমিন (বিশ্বাসী)", audioText: "مُؤْمِن" },
           { arabic: "كَافِر", bengali: "কাফির (অবিশ্বাসী)", audioText: "كَافِر" },
           { arabic: "مُشْرِك", bengali: "মুশরিক (অংশীদারী)", audioText: "مُشْرِك" },
           { arabic: "مُنَافِق", bengali: "মুনাফিক (কপট)", audioText: "مُنَافِق" },
           { arabic: "صَـٰلِح", bengali: "সালিহ (সৎকর্মশীল)", audioText: "صَـٰلِح" },
           { arabic: "ظَالِم", bengali: "জালিম (অত্যাচারী)", audioText: "ظَالِم" },
           { arabic: "أُمّ", bengali: "উম্ম (মা)", audioText: "أُمّ" }
        ]
      },
      {
        id: "vocab_quiz",
        title: "কুইজ: শব্দভাণ্ডার",
        description: "অর্থ ও উচ্চারণ মিলিয়ে দেখুন।",
        xp: 100,
        type: 'quiz',
        quizSourceModuleId: 'quran_words',
        items: []
      }
    ]
  }
];