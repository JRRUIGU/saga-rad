'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CreatorWork {
  id: number;
  title: string;
  type: string;
  cover_url: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  chapter_count?: number;
  views?: number;
  likes?: number;
}

interface WorksStats {
  total: number;
  manga: number;
  webtoon: number;
  comic: number;
  novel: number;
  views: number;
  likes: number;
  chapters: number;
  published: number;
}

interface PaymentMethods {
  paypal_email: string;
  mpesa_number: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
}

export default function CreatorPage() {
  const router = useRouter();
  const [works, setWorks] = useState<CreatorWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorksStats>({
    total: 0,
    manga: 0,
    webtoon: 0,
    comic: 0,
    novel: 0,
    views: 0,
    likes: 0,
    chapters: 0,
    published: 0
  });
  
  // Payment methods state - initialized empty
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    paypal_email: '',
    mpesa_number: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_name: ''
  });
  const [savingPayments, setSavingPayments] = useState(false);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);

  useEffect(() => {
    fetchWorks();
    fetchPaymentMethods();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/creator/works');
      const data = await response.json();
      
      if (data.success) {
        setWorks(data.works || []);
        
        const worksData = data.works || [];
        const stats: WorksStats = {
          total: worksData.length,
          manga: worksData.filter((w: CreatorWork) => w.type === 'manga').length,
          webtoon: worksData.filter((w: CreatorWork) => w.type === 'webtoon').length,
          comic: worksData.filter((w: CreatorWork) => w.type === 'comic').length,
          novel: worksData.filter((w: CreatorWork) => w.type === 'novel').length,
          views: worksData.reduce((sum: number, w: any) => sum + (w.views || 0), 0),
          likes: worksData.reduce((sum: number, w: any) => sum + (w.likes || 0), 0),
          chapters: data.totalChapters || 0,
          published: worksData.filter((w: any) => w.is_published).length
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/creator/payment-methods?user_id=1');
      const data = await response.json();
      if (data.success && data.payment_methods) {
        setPaymentMethods({
          paypal_email: data.payment_methods.paypal_email || '',
          mpesa_number: data.payment_methods.mpesa_number || '',
          bank_account_name: data.payment_methods.bank_account_name || '',
          bank_account_number: data.payment_methods.bank_account_number || '',
          bank_name: data.payment_methods.bank_name || ''
        });
      }
      setPaymentsLoaded(true);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentsLoaded(true);
    }
  };

  const savePaymentMethods = async () => {
    try {
      setSavingPayments(true);
      const response = await fetch('/api/creator/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          ...paymentMethods
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Payment methods saved successfully!');
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving payment methods:', error);
      alert('Failed to save payment methods');
    } finally {
      setSavingPayments(false);
    }
  };

  const handleUpload = () => {
    router.push('/creator/upload');
  };

  const handleWorkClick = (workId: number) => {
    router.push(`/creator/works/${workId}`);
  };

  const handlePublishWork = async (e: React.MouseEvent, workId: number) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/creator/works/${workId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publish: true })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Work published successfully!');
        fetchWorks();
      } else {
        alert('Failed to publish work: ' + data.error);
      }
    } catch (error) {
      console.error('Error publishing work:', error);
      alert('Failed to publish work');
    }
  };

  const handleUnpublishWork = async (e: React.MouseEvent, workId: number) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/creator/works/${workId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publish: false })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Work unpublished successfully!');
        fetchWorks();
      } else {
        alert('Failed to unpublish work: ' + data.error);
      }
    } catch (error) {
      console.error('Error unpublishing work:', error);
      alert('Failed to unpublish work');
    }
  };

  const handleAddChapterClick = (e: React.MouseEvent, workId: number) => {
    e.stopPropagation();
    router.push(`/creator/upload?work=${workId}`);
  };

  // Stat cards data
  const statCards = [
    { type: 'all', label: 'Total', value: stats.total, icon: '📚' },
    { type: 'published', label: 'Pub', value: stats.published, icon: '🌐' },
    { type: 'manga', label: 'Manga', value: stats.manga, icon: '🇯🇵' },
    { type: 'webtoon', label: 'Web', value: stats.webtoon, icon: '🇰🇷' },
    { type: 'chapters', label: 'Ch', value: stats.chapters, icon: '📖' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 font-sans">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5">Welcome back!</h1>
            <p className="text-xs md:text-sm text-gray-600">Manage your works</p>
          </div>
          <button
            onClick={handleUpload}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-black text-white text-xs md:text-sm font-medium rounded-lg hover:opacity-90 transition-all"
          >
            + Upload
          </button>
        </div>

        {/* Stats Cards - Mobile: 5 in one row, Desktop: 5 in one row */}
        <div className="grid grid-cols-5 gap-1 md:gap-3 mb-4">
          {statCards.map((stat) => (
            <div key={stat.type} className="bg-gray-200 rounded-lg p-1.5 md:p-3 border border-gray-300">
              <div className="flex flex-col items-center">
                <div className="text-xs md:text-sm text-gray-700">{stat.icon}</div>
                <p className="text-[8px] md:text-xs text-gray-700 truncate w-full text-center">{stat.label}</p>
                <p className="text-xs md:text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats - Hidden on mobile, visible on desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg">👁️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.likes}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Novels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.novel}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg">📚</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Works Section */}
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-300">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm md:text-lg font-bold text-gray-900">My Works ({works.length})</h2>
            <div className="flex gap-2">
              <button 
                onClick={fetchWorks}
                disabled={loading}
                className="px-2 py-1 text-[10px] md:px-3 md:py-1.5 md:text-xs bg-gray-200 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black mb-2"></div>
              <p className="text-xs text-gray-600">Loading...</p>
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📭</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No works yet</h3>
              <button
                onClick={handleUpload}
                className="px-4 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:opacity-90 transition-all"
              >
                Upload First Work
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3">
              {works.map((work) => (
                <div 
                  key={work.id} 
                  onClick={() => handleWorkClick(work.id)}
                  className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:scale-[1.02] shadow-sm cursor-pointer relative group"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {work.cover_url && work.cover_url !== '/placeholder-cover.jpg' ? (
                      <img 
                        src={work.cover_url} 
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        work.type === 'manga' ? 'bg-gray-200' :
                        work.type === 'webtoon' ? 'bg-gray-300' :
                        work.type === 'comic' ? 'bg-gray-200' :
                        'bg-gray-300'
                      }`}>
                        <span className="text-xl">
                          {work.type === 'manga' && '🇯🇵'}
                          {work.type === 'webtoon' && '🇰🇷'}
                          {work.type === 'comic' && '🇺🇸'}
                          {work.type === 'novel' && '📚'}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-1 right-1">
                      <span className={`px-1 py-0.5 text-[6px] md:text-[8px] rounded-full ${
                        work.status === 'ongoing' ? 'bg-gray-700 text-white' :
                        work.status === 'completed' ? 'bg-gray-800 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {work.status === 'ongoing' ? 'Ong' : 
                         work.status === 'completed' ? 'Com' : 'Hia'}
                      </span>
                    </div>

                    {/* Published/Draft Badge */}
                    <div className="absolute top-1 left-1">
                      <span className={`px-1 py-0.5 text-[6px] md:text-[8px] rounded-full ${
                        work.is_published ? 'bg-black text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {work.is_published ? 'Pub' : 'Dft'}
                      </span>
                    </div>

                    {/* Hover Actions - Only show on desktop hover */}
                    <div className="hidden md:flex absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-1">
                      {work.is_published ? (
                        <button
                          onClick={(e) => handleUnpublishWork(e, work.id)}
                          className="w-full py-1 bg-gray-700 text-white text-[8px] font-medium rounded hover:bg-gray-600 transition-colors"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handlePublishWork(e, work.id)}
                          className="w-full py-1 bg-black text-white text-[8px] font-medium rounded hover:opacity-90 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => handleAddChapterClick(e, work.id)}
                        className="w-full py-1 bg-gray-800 text-white text-[8px] font-medium rounded hover:bg-gray-700 transition-colors"
                      >
                        + Chapter
                      </button>
                    </div>
                  </div>
                  
                  {/* Work Info */}
                  <div className="p-1 md:p-1.5">
                    <h3 className="text-[8px] md:text-[10px] font-semibold text-gray-900 dark:text-white line-clamp-1 mb-0.5" title={work.title}>
                      {work.title}
                    </h3>
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-[6px] md:text-[8px] text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                        #{work.chapter_count || 0}
                      </span>
                      <span>👁 {work.views || 0}</span>
                      <span className={`px-1 py-0.5 rounded ${
                        work.type === 'manga' ? 'bg-gray-200' :
                        work.type === 'webtoon' ? 'bg-gray-300' :
                        work.type === 'comic' ? 'bg-gray-200' :
                        'bg-gray-300'
                      }`}>
                        {work.type === 'manga' ? 'MG' :
                         work.type === 'webtoon' ? 'WT' :
                         work.type === 'comic' ? 'CM' : 'NV'}
                      </span>
                    </div>

                    {/* ID - Hide on very small screens */}
                    <div className="hidden md:block text-[6px] text-gray-400 dark:text-gray-600 mt-0.5">
                      ID: {work.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 md:mt-6 bg-white rounded-lg p-3 md:p-4 border border-gray-300">
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              onClick={handleUpload}
              className="p-2 md:p-3 bg-black text-white rounded-lg hover:opacity-90 transition-all"
            >
              <div className="text-base md:text-xl mb-0.5">📤</div>
              <div className="text-[8px] md:text-xs font-medium">Upload</div>
            </button>
            <button className="p-2 md:p-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all">
              <div className="text-base md:text-xl mb-0.5">📊</div>
              <div className="text-[8px] md:text-xs font-medium">Stats</div>
            </button>
            <button className="p-2 md:p-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all">
              <div className="text-base md:text-xl mb-0.5">👥</div>
              <div className="text-[8px] md:text-xs font-medium">Audience</div>
            </button>
            <Link 
              href="/manga"
              className="p-2 md:p-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all"
            >
              <div className="text-base md:text-xl mb-0.5">📚</div>
              <div className="text-[8px] md:text-xs font-medium">Public</div>
            </Link>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mt-4 md:mt-6 bg-white rounded-lg p-3 md:p-4 border border-gray-300">
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1">💰 Payment Methods</h3>
          <p className="text-[10px] md:text-xs text-gray-600 mb-3">For donations from readers</p>
          
          {!paymentsLoaded ? (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
              <p className="text-xs text-gray-600 mt-1">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-medium text-gray-700">PayPal Email</label>
                <input
                  type="email"
                  value={paymentMethods.paypal_email}
                  onChange={(e) => setPaymentMethods({...paymentMethods, paypal_email: e.target.value})}
                  placeholder="your@email.com"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-medium text-gray-700">M-Pesa Number</label>
                <input
                  type="tel"
                  value={paymentMethods.mpesa_number}
                  onChange={(e) => setPaymentMethods({...paymentMethods, mpesa_number: e.target.value})}
                  placeholder="254712345678"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  value={paymentMethods.bank_name}
                  onChange={(e) => setPaymentMethods({...paymentMethods, bank_name: e.target.value})}
                  placeholder="e.g. Equity Bank"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  value={paymentMethods.bank_account_name}
                  onChange={(e) => setPaymentMethods({...paymentMethods, bank_account_name: e.target.value})}
                  placeholder="Full Name"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] md:text-xs font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={paymentMethods.bank_account_number}
                  onChange={(e) => setPaymentMethods({...paymentMethods, bank_account_number: e.target.value})}
                  placeholder="1234567890"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                />
              </div>
            </div>
          )}

          <button
            onClick={savePaymentMethods}
            disabled={savingPayments || !paymentsLoaded}
            className="mt-3 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {savingPayments ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}