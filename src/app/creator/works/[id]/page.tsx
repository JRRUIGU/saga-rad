'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, BookOpen, CheckCircle, XCircle, MoreVertical, Home } from 'lucide-react';

interface WorkDetails {
  id: number;
  title: string;
  type: string;
  cover_url: string;
  description: string;
  status: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  page_count: number;
  created_at: string;
  is_published: boolean;
}

export default function WorkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.id as string;
  
  const [work, setWork] = useState<WorkDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chapters');
  const [darkMode, setDarkMode] = useState(false);

  // REMOVED: Navbar hiding code - navbar will now be visible

  useEffect(() => {
    if (workId) {
      fetchWorkDetails();
      fetchChapters();
    }
  }, [workId]);

  const fetchWorkDetails = async () => {
    try {
      const response = await fetch(`/api/creator/works/${workId}`);
      const data = await response.json();
      
      if (data.success) {
        setWork(data.work);
      }
    } catch (error) {
      console.error('Error fetching work:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/creator/works/${workId}/chapters`);
      const data = await response.json();
      
      if (data.success) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWork = async () => {
    if (!confirm('Are you sure you want to delete this work? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/creator/works/${workId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Work deleted successfully!');
        router.push('/creator');
      }
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  const handlePublishChapter = async (chapterId: number, publish: boolean) => {
    try {
      const response = await fetch(`/api/creator/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: publish })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Chapter ${publish ? 'published' : 'unpublished'} successfully!`);
        fetchChapters();
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/creator/chapters/${chapterId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Chapter deleted successfully!');
        fetchChapters();
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleReadChapter = (chapterId: number) => {
    router.push(`/read/${workId}/${chapterId}`);
  };

  const handleEditWork = () => {
    router.push(`/creator/works/${workId}/edit`);
  };

  // Get content type specific route
  const getContentRoute = () => {
    if (!work) return '/creator';
    
    switch(work.type) {
      case 'manga': return '/manga';
      case 'webtoon': return '/webtoons';
      case 'comic': return '/comics';
      case 'novel': return '/novels';
      default: return '/creator';
    }
  };

  // Get content type display name
  const getContentTypeName = () => {
    if (!work) return '';
    
    switch(work.type) {
      case 'manga': return 'Manga';
      case 'webtoon': return 'Webtoons';
      case 'comic': return 'Comics';
      case 'novel': return 'Novels';
      default: return '';
    }
  };

  // Theme classes - default light mode
  const bgClass = darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} pt-20 flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className={mutedTextClass}>Loading work details...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className={`min-h-screen ${bgClass} pt-20 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-6">😕</div>
          <h3 className={`text-xl font-semibold ${textClass} mb-2`}>Work not found</h3>
          <Link 
            href="/creator"
            className="px-6 py-3 bg-black text-white rounded-lg hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="pt-12 md:pt-20">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
          
          {/* Navigation Row - Back, Content Type, and Home Buttons */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              {/* Back to Creator Dashboard */}
              <Link
                href="/creator"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>

              {/* Back to Content Type Page */}
              <Link
                href={getContentRoute()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
              >
                <span>← Back to {getContentTypeName()}</span>
              </Link>
            </div>

            {/* Home Button */}
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
            >
              <Home size={16} />
              <span>Home</span>
            </Link>
          </div>

          {/* Hero Section with Landscape Cover */}
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-6 md:mb-8">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
              style={{ 
                backgroundImage: `url(${work.cover_url && work.cover_url !== '/placeholder-cover.jpg' ? work.cover_url : ''})`,
                backgroundColor: work.type === 'manga' ? '#1a1a1a' : 
                                work.type === 'webtoon' ? '#2d2d2d' : 
                                work.type === 'comic' ? '#1e3a5f' : '#1e3f2f'
              }}
            >
              {(!work.cover_url || work.cover_url === '/placeholder-cover.jpg') && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl opacity-30">
                    {work.type === 'manga' && '🇯🇵'}
                    {work.type === 'webtoon' && '🇰🇷'}
                    {work.type === 'comic' && '🇺🇸'}
                    {work.type === 'novel' && '📚'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center p-4 md:p-12">
              <div className="flex flex-row items-center gap-4 md:gap-6 w-full">
                {/* Cover - Always on left */}
                <div className="w-24 h-36 md:w-44 md:h-60 flex-shrink-0 rounded-xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  {work.cover_url && work.cover_url !== '/placeholder-cover.jpg' ? (
                    <img 
                      src={work.cover_url} 
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      work.type === 'manga' ? 'bg-gradient-to-br from-black to-gray-900' :
                      work.type === 'webtoon' ? 'bg-gradient-to-br from-gray-900 to-black' :
                      work.type === 'comic' ? 'bg-gradient-to-br from-blue-900 to-cyan-900' :
                      'bg-gradient-to-br from-green-900 to-emerald-900'
                    }`}>
                      <span className="text-3xl md:text-5xl">
                        {work.type === 'manga' && '🇯🇵'}
                        {work.type === 'webtoon' && '🇰🇷'}
                        {work.type === 'comic' && '🇺🇸'}
                        {work.type === 'novel' && '📚'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title and Info - Always on right */}
                <div className="flex-1 text-white min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium uppercase">
                      {work.type}
                    </span>
                    <span className={`px-2 py-1 backdrop-blur-sm rounded text-xs font-medium ${
                      work.status === 'ongoing' ? 'bg-green-500/30 text-green-200' :
                      work.status === 'completed' ? 'bg-blue-500/30 text-blue-200' :
                      'bg-yellow-500/30 text-yellow-200'
                    }`}>
                      {work.status}
                    </span>
                  </div>
                  <h1 className="text-base md:text-4xl font-bold mb-1 md:mb-2 drop-shadow-lg line-clamp-2">{work.title}</h1>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-white/80">
                    <span>{chapters.length} Chapters</span>
                    <span>•</span>
                    <span>{new Date(work.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons - Creator Only */}
                <div className="flex flex-col gap-1.5 md:gap-2">
                  <button
                    onClick={handleEditWork}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm bg-white/20 text-white hover:bg-white/30 transition-all"
                    title="Edit Work"
                  >
                    <Edit className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-sm font-medium hidden xs:inline">Edit</span>
                  </button>

                  <button
                    onClick={handleDeleteWork}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm bg-red-500/80 text-white hover:bg-red-600 transition-all"
                    title="Delete Work"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-sm font-medium hidden xs:inline">Delete</span>
                  </button>

                  <Link
                    href={`/creator/upload?work=${workId}`}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm bg-amber-500/80 text-white hover:bg-amber-600 transition-all"
                    title="Add Chapter"
                  >
                    <span className="text-sm md:text-base font-bold">+</span>
                    <span className="text-[10px] md:text-sm font-medium hidden xs:inline">Chapter</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Minimal Style */}
          <div className="mb-6">
            <div className="flex bg-white rounded-xl p-1 border border-gray-300">
              {['chapters', 'analytics', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-gray-200 text-black'
                      : 'text-gray-500'
                  }`}
                >
                  {tab} {tab === 'chapters' && `(${chapters.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Description Section - Only show when on chapters tab */}
          {activeTab === 'chapters' && (
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-300 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Description</h3>
              <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                {work.description || 'No description available.'}
              </p>
            </div>
          )}

          {/* Stats Grid - Only show when on chapters tab */}
          {activeTab === 'chapters' && (
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
              <div className="bg-white rounded-xl p-2 md:p-4 border border-gray-300 text-center">
                <p className="text-gray-600 text-[10px] md:text-xs mb-1">Chapters</p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">{chapters.length}</p>
              </div>
              <div className="bg-white rounded-xl p-2 md:p-4 border border-gray-300 text-center">
                <p className="text-gray-600 text-[10px] md:text-xs mb-1">Views</p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">{work.views || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-2 md:p-4 border border-gray-300 text-center">
                <p className="text-gray-600 text-[10px] md:text-xs mb-1">Likes</p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">{work.likes || 0}</p>
              </div>
            </div>
          )}

          {/* Chapters Tab - Reader Style List */}
          {activeTab === 'chapters' && (
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-300">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Chapters ({chapters.length})</h2>
              
              {chapters.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="text-5xl md:text-6xl mb-4 md:mb-6">📭</div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No chapters yet</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-6">Start by uploading your first chapter!</p>
                  <Link 
                    href={`/creator/upload?work=${workId}`}
                    className="px-6 py-2.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Upload First Chapter
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...chapters].reverse().map((chapter) => (
                    <div 
                      key={chapter.id}
                      className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200 hover:border-gray-400 transition-all hover:bg-gray-100"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-base md:text-lg font-bold text-white">{chapter.chapter_number}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm md:text-base font-bold text-gray-900 truncate">{chapter.title}</h3>
                              {chapter.is_published ? (
                                <span className="px-1.5 py-0.5 text-[8px] bg-gray-700 text-white rounded-full flex items-center gap-0.5">
                                  <Eye size={8} /> Pub
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[8px] bg-gray-400 text-white rounded-full flex items-center gap-0.5">
                                  <EyeOff size={8} /> Draft
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-[10px] md:text-xs">
                              {chapter.page_count} pages • {new Date(chapter.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 sm:overflow-visible">
                          <button
                            onClick={() => handleReadChapter(chapter.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-black text-white text-[10px] font-medium rounded-lg hover:opacity-90 transition-all whitespace-nowrap"
                          >
                            <BookOpen size={12} />
                            <span>Read</span>
                          </button>
                          
                          <button
                            onClick={() => handlePublishChapter(chapter.id, !chapter.is_published)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition-all whitespace-nowrap ${
                              chapter.is_published 
                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                : 'bg-gray-800 text-white hover:bg-gray-700'
                            }`}
                          >
                            {chapter.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                            <span>{chapter.is_published ? 'Unpub' : 'Publish'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-[10px] font-medium rounded-lg hover:bg-red-700 transition-all whitespace-nowrap"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-300">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Reads', value: work.views?.toString() || '0' },
                  { label: 'Total Likes', value: work.likes?.toString() || '0' },
                  { label: 'Chapters', value: chapters.length.toString() }
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-gray-100 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-6">
                Analytics data will appear once readers start engaging with your work.
              </p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-300">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Work Settings</h3>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-gray-600 mb-2 text-xs">Status</label>
                  <select 
                    defaultValue={work.status}
                    className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-xs"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="hiatus">Hiatus</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-600 mb-2 text-xs">Visibility</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input type="radio" name="visibility" defaultChecked className="mr-2" />
                      <span className="text-gray-900 text-xs">Public</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="visibility" className="mr-2" />
                      <span className="text-gray-900 text-xs">Private</span>
                    </label>
                  </div>
                </div>
                
                <button 
                  onClick={handleEditWork}
                  className="px-6 py-2.5 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-all"
                >
                  Edit Work Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}