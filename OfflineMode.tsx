import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, HardDrive, Clock, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

interface OfflineModeProps {
  isOnline: boolean;
}

interface DownloadedSurah {
  number: number;
  name: string;
  nameArabic: string;
  verses: any[];
  audio?: string;
  downloadedAt: string;
  size: number; // in bytes
}

interface OfflineStats {
  totalSurahs: number;
  totalVerses: number;
  totalSize: number;
  lastSync: string;
}

const OfflineMode: React.FC<OfflineModeProps> = ({ isOnline }) => {
  const [downloadedSurahs, setDownloadedSurahs] = useState<DownloadedSurah[]>([]);
  const [downloading, setDownloading] = useState<number[]>([]);
  const [offlineStats, setOfflineStats] = useState<OfflineStats>({
    totalSurahs: 0,
    totalVerses: 0,
    totalSize: 0,
    lastSync: ''
  });
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // List of popular Surahs for quick download
  const popularSurahs = [
    { number: 1, name: 'Al-Fatiha', nameArabic: 'الفاتحة', nameBengali: 'আল-ফাতিহা' },
    { number: 2, name: 'Al-Baqarah', nameArabic: 'البقرة', nameBengali: 'আল-বাকারা' },
    { number: 18, name: 'Al-Kahf', nameArabic: 'الكهف', nameBengali: 'আল-কাহফ' },
    { number: 36, name: 'Ya-Sin', nameArabic: 'يس', nameBengali: 'ইয়া-সীন' },
    { number: 55, name: 'Ar-Rahman', nameArabic: 'الرحمن', nameBengali: 'আর-রহমান' },
    { number: 67, name: 'Al-Mulk', nameArabic: 'الملك', nameBengali: 'আল-মুলক' },
    { number: 112, name: 'Al-Ikhlas', nameArabic: 'الإخلاص', nameBengali: 'আল-ইখলাস' },
    { number: 113, name: 'Al-Falaq', nameArabic: 'الفلق', nameBengali: 'আল-ফালাক' },
    { number: 114, name: 'An-Nas', nameArabic: 'الناس', nameBengali: 'আন-নাস' }
  ];

  useEffect(() => {
    loadOfflineData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [downloadedSurahs]);

  const loadOfflineData = () => {
    const saved = localStorage.getItem('offline_surahs');
    if (saved) {
      const data = JSON.parse(saved);
      setDownloadedSurahs(data);
    }

    const lastSync = localStorage.getItem('offline_last_sync');
    if (lastSync) {
      setOfflineStats(prev => ({ ...prev, lastSync }));
    }
  };

  const calculateStats = () => {
    const totalSurahs = downloadedSurahs.length;
    const totalVerses = downloadedSurahs.reduce((sum, surah) => sum + (surah.verses?.length || 0), 0);
    const totalSize = downloadedSurahs.reduce((sum, surah) => sum + surah.size, 0);

    setOfflineStats(prev => ({
      ...prev,
      totalSurahs,
      totalVerses,
      totalSize
    }));
  };

  const downloadSurah = async (surahNumber: number) => {
    if (!isOnline) {
      alert('অফলাইন মোডে ডাউনলোড করা যাবে না। ইন্টারনেট সংযোগ চালু করুন।');
      return;
    }

    setDownloading(prev => [...prev, surahNumber]);

    try {
      // Simulate API call
      const response = await fetch(`https://api.quran.com/api/v4/chapters/${surahNumber}`);
      const surahInfo = await response.json();
      
      const versesResponse = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?translations=161,20&fields=text_uthmani,translations`);
      const versesData = await versesResponse.json();

      const surahData: DownloadedSurah = {
        number: surahNumber,
        name: surahInfo.chapter.name_simple,
        nameArabic: surahInfo.chapter.name_arabic,
        verses: versesData.verses,
        downloadedAt: new Date().toISOString(),
        size: JSON.stringify(versesData.verses).length * 2 // Rough estimate
      };

      const updated = [...downloadedSurahs.filter(s => s.number !== surahNumber), surahData];
      setDownloadedSurahs(updated);
      localStorage.setItem('offline_surahs', JSON.stringify(updated));
      localStorage.setItem('offline_last_sync', new Date().toISOString());

    } catch (error) {
      console.error('Download failed:', error);
      alert('ডাউনলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setDownloading(prev => prev.filter(n => n !== surahNumber));
    }
  };

  const deleteSurah = (surahNumber: number) => {
    const updated = downloadedSurahs.filter(s => s.number !== surahNumber);
    setDownloadedSurahs(updated);
    localStorage.setItem('offline_surahs', JSON.stringify(updated));
  };

  const bulkDownload = async () => {
    if (!isOnline || selectedSurahs.length === 0) return;

    for (const surahNumber of selectedSurahs) {
      if (!downloadedSurahs.find(s => s.number === surahNumber)) {
        await downloadSurah(surahNumber);
      }
    }
    setSelectedSurahs([]);
    setShowBulkActions(false);
  };

  const bulkDelete = () => {
    const updated = downloadedSurahs.filter(s => !selectedSurahs.includes(s.number));
    setDownloadedSurahs(updated);
    localStorage.setItem('offline_surahs', JSON.stringify(updated));
    setSelectedSurahs([]);
    setShowBulkActions(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const formatLastSync = (dateStr: string) => {
    if (!dateStr) return 'কখনো নয়';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'এখনই';
    if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} দিন আগে`;
  };

  const isDownloaded = (surahNumber: number) => {
    return downloadedSurahs.some(s => s.number === surahNumber);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`p-4 rounded-2xl border-2 ${
        isOnline 
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <Wifi className="text-emerald-600 dark:text-emerald-400" size={24} />
              <div>
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 font-bengali">
                  ইন্টারনেট সংযুক্ত
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bengali">
                  নতুন সূরা ডাউনলোড করতে পারবেন
                </p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="text-amber-600 dark:text-amber-400" size={24} />
              <div>
                <h3 className="font-bold text-amber-800 dark:text-amber-300 font-bengali">
                  অফলাইন মোড
                </h3>
                <p className="text-amber-600 dark:text-amber-400 text-sm font-bengali">
                  শুধুমাত্র ডাউনলোড করা সূরা পড়তে পারবেন
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Offline Statistics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-bengali mb-4">
          📱 অফলাইন সংগ্রহ
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mb-2">
              <BookOpen className="text-blue-600 dark:text-blue-400 mx-auto" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {offlineStats.totalSurahs}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bengali">সূরা</p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg mb-2">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 mx-auto" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {offlineStats.totalVerses}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bengali">আয়াত</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg mb-2">
              <HardDrive className="text-purple-600 dark:text-purple-400 mx-auto" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatFileSize(offlineStats.totalSize)}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bengali">আকার</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg mb-2">
              <Clock className="text-orange-600 dark:text-orange-400 mx-auto" size={24} />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatLastSync(offlineStats.lastSync)}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bengali">শেষ সিঙ্ক</p>
          </div>
        </div>
      </div>

      {/* Quick Download Section */}
      {isOnline && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali">
              🔥 জনপ্রিয় সূরা
            </h3>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-bengali"
            >
              {showBulkActions ? 'বাতিল' : 'একসাথে ডাউনলোড'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {popularSurahs.map(surah => {
              const downloaded = isDownloaded(surah.number);
              const isDownloadingNow = downloading.includes(surah.number);
              const isSelected = selectedSurahs.includes(surah.number);

              return (
                <div
                  key={surah.number}
                  className={`p-4 rounded-lg border transition-all ${
                    downloaded 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {showBulkActions && !downloaded && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSurahs([...selectedSurahs, surah.number]);
                            } else {
                              setSelectedSurahs(selectedSurahs.filter(n => n !== surah.number));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                      )}
                      
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white font-bengali">
                          {surah.number}. {surah.nameBengali}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {surah.nameArabic}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {downloaded ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={16} />
                          <button
                            onClick={() => deleteSurah(surah.number)}
                            className="text-red-500 hover:text-red-700 text-sm font-bengali"
                          >
                            মুছুন
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => downloadSurah(surah.number)}
                          disabled={isDownloadingNow || !isOnline}
                          className={`p-2 rounded-lg transition-all ${
                            isDownloadingNow
                              ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {isDownloadingNow ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showBulkActions && selectedSurahs.length > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-emerald-800 dark:text-emerald-300 font-bengali">
                  {selectedSurahs.length}টি সূরা নির্বাচিত
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSurahs([])}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-bengali"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={bulkDownload}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-bengali"
                  >
                    ডাউনলোড করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Downloaded Surahs */}
      {downloadedSurahs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-bengali mb-4">
            📚 ডাউনলোড করা সূরা
          </h3>

          <div className="space-y-3">
            {downloadedSurahs.map(surah => (
              <div
                key={surah.number}
                className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white font-bengali">
                      {surah.number}. {surah.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-bengali">{surah.verses?.length || 0} আয়াত</span>
                      <span>{formatFileSize(surah.size)}</span>
                      <span className="font-bengali">
                        {new Date(surah.downloadedAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
                    <button
                      onClick={() => deleteSurah(surah.number)}
                      className="text-red-500 hover:text-red-700 text-sm font-bengali"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {downloadedSurahs.length === 0 && (
        <div className="text-center py-12">
          <HardDrive size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 font-bengali mb-2">
            কোনো সূরা ডাউনলোড করা হয়নি
          </h3>
          <p className="text-gray-500 dark:text-gray-500 font-bengali">
            অফলাইনে পড়ার জন্য আপনার প্রিয় সূরাগুলি ডাউনলোড করুন
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-300 font-bengali mb-2">
              💡 টিপস
            </h4>
            <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1 font-bengali">
              <li>• গুরুত্বপূর্ণ সূরাগুলি আগে ডাউনলোড করুন</li>
              <li>• ইন্টারনেট সংযোগ থাকাকালীন ডাউনলোড করুন</li>
              <li>• নিয়মিত ব্যবহার না হলে সূরা মুছে দিন</li>
              <li>• অফলাইনে সব বৈশিষ্ট্য পাওয়া যাবে না</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;