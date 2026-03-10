'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Page {
  id: number;
  page_number: number;
  image_url: string;
  storage_path?: string;
}

type ReadingMode = 'normal' | 'ltr' | 'webtoon';

export default function ReadChapterPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.workId as string;
  const chapterId = params.chapterId as string;
  
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chapterInfo, setChapterInfo] = useState<any>(null);
  const [workInfo, setWorkInfo] = useState<any>(null);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [readingMode, setReadingMode] = useState<ReadingMode>('normal');
  const [showControls, setShowControls] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const [userRole, setUserRole] = useState<string | null>(null);

  // Touch handling state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  // Hide universal navbar ONLY on this page
  useEffect(() => {
    // Store original display values to restore later
    const originalDisplays = new Map<Element, string>();
    
    const navbarSelectors = [
      'nav', '.navbar', '[class*="navbar"]', 'header[class*="nav"]', 
      '.universal-nav', 'header', '[class*="Navbar"]', '#navbar'
    ];
    
    // Hide all navbar elements
    navbarSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Store original display
        originalDisplays.set(el, (el as HTMLElement).style.display);
        // Hide element
        (el as HTMLElement).style.display = 'none';
      });
    });
    
    // Add class to body
    document.body.classList.add('reader-mode-active');
    
    // Cleanup function to restore navbar when leaving this page
    return () => {
      // Restore all navbar elements
      originalDisplays.forEach((originalDisplay, el) => {
        (el as HTMLElement).style.display = originalDisplay;
      });
      document.body.classList.remove('reader-mode-active');
    };
  }, []); // Empty dependency array means this runs only on mount/unmount

  // Fetch all data in parallel for speed
  useEffect(() => {
    if (chapterId) {
      fetchAllData();
    }
  }, [chapterId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [chapterRes, pagesRes] = await Promise.all([
        fetch(`/api/creator/chapters/${chapterId}`),
        fetch(`/api/creator/chapters/${chapterId}/pages`)
      ]);
      
      const chapterData = await chapterRes.json();
      const pagesData = await pagesRes.json();
      
      if (chapterData.success) {
        setChapterInfo(chapterData.chapter);
        
        // Fetch work data if we have workId
        if (workId) {
          const workRes = await fetch(`/api/creator/works/${workId}`);
          const workData = await workRes.json();
          if (workData.success) {
            setWorkInfo(workData.work);
          }
        }
      }
      
      if (pagesData.success) {
        setPages(pagesData.pages);
        // Start preloading images immediately
        preloadImages(pagesData.pages);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preload images for faster navigation
  const preloadImages = (pagesList: Page[]) => {
    pagesList.forEach(page => {
      const img = new window.Image();
      img.src = getOptimizedImageUrl(page.image_url);
      img.onload = () => {
        setPreloadedImages(prev => new Set(prev).add(page.page_number));
      };
    });
  };

  // Auto-scroll for webtoon mode
  useEffect(() => {
    if (!autoScroll || readingMode !== 'webtoon') return;

    const interval = setInterval(() => {
      window.scrollBy({ top: scrollSpeed / 10, behavior: 'smooth' });
    }, 100);

    return () => clearInterval(interval);
  }, [autoScroll, readingMode, scrollSpeed]);

  // Preload next and previous images
  useEffect(() => {
    if (pages.length === 0) return;
    
    // Preload next image
    if (currentPage < pages.length) {
      const nextPage = pages.find(p => p.page_number === currentPage + 1);
      if (nextPage && !preloadedImages.has(nextPage.page_number)) {
        const img = new window.Image();
        img.src = getOptimizedImageUrl(nextPage.image_url);
      }
    }
    
    // Preload previous image
    if (currentPage > 1) {
      const prevPage = pages.find(p => p.page_number === currentPage - 1);
      if (prevPage && !preloadedImages.has(prevPage.page_number)) {
        const img = new window.Image();
        img.src = getOptimizedImageUrl(prevPage.image_url);
      }
    }
  }, [currentPage, pages, preloadedImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'ArrowDown' && readingMode === 'webtoon') {
        e.preventDefault();
        window.scrollBy({ top: 100, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' && readingMode === 'webtoon') {
        e.preventDefault();
        window.scrollBy({ top: -100, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(pages.length);
      } else if (e.key === 'Escape') {
        setShowSettings(false);
        setShowControls(prev => !prev);
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleReadingMode();
      } else if (e.key === 'a') {
        e.preventDefault();
        setAutoScroll(!autoScroll);
      } else if (e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, readingMode, autoScroll]);

  // Click navigation
  const handleScreenClick = useCallback((e: React.MouseEvent) => {
    if (readingMode === 'webtoon') return;
    if ((e.target as HTMLElement).closest('.control-element')) return;
    
    const clickPosition = e.clientX / window.innerWidth;
    
    if (clickPosition < 0.2) {
      prevPage();
    } else if (clickPosition > 0.8) {
      nextPage();
    } else {
      setShowControls(!showControls);
    }
  }, [readingMode, showControls]);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) {
      const touch = e.changedTouches[0];
      const touchPosition = touch.clientX / window.innerWidth;
      
      if (readingMode !== 'webtoon') {
        if (touchPosition < 0.3) prevPage();
        else if (touchPosition > 0.7) nextPage();
        else setShowControls(!showControls);
      } else {
        setShowControls(!showControls);
      }
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) prevPage();
      else nextPage();
    } else if (Math.abs(deltaY) > 50 && readingMode !== 'webtoon') {
      if (deltaY > 0) prevPage();
      else nextPage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const nextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(prev => prev + 1);
      setImageError(prev => ({ ...prev, [currentPage + 1]: false }));
    } else if (currentPage === pages.length) {
      if (confirm('Last page. Go to next chapter?')) {
        // Handle next chapter
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setImageError(prev => ({ ...prev, [currentPage - 1]: false }));
    } else if (currentPage === 1) {
      // FIXED: Go to different places based on user role
      if (userRole === 'creator' || userRole === 'admin') {
        // Creator goes to their work page
        router.push(`/creator/works/${workId}`);
      } else {
        // Regular user goes to public manga page
        router.push(`/manga/${workId}`);
      }
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setImageError(prev => ({ ...prev, [pageNumber]: false }));
  };

  const toggleReadingMode = () => {
    const modes: ReadingMode[] = ['normal', 'ltr', 'webtoon'];
    const currentIndex = modes.indexOf(readingMode);
    setReadingMode(modes[(currentIndex + 1) % modes.length]);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Optimized image URL with size parameters
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return '/placeholder-page.jpg';
    
    if (url.includes('cloudinary.com')) {
      // Add size optimization for faster loading
      const quality = readingMode === 'webtoon' ? 'q_auto:good' : 'q_auto';
      const size = isMobile ? 'w_800' : 'w_1200';
      return url.replace('/upload/', `/upload/${quality},${size},f_auto/`);
    }
    
    return url;
  };

  const handleImageError = (pageNumber: number) => {
    setImageError(prev => ({ ...prev, [pageNumber]: true }));
  };

  // Memoized current page data
  const currentPageData = useMemo(() => 
    pages.find(p => p.page_number === currentPage), 
    [pages, currentPage]
  );

  const optimizedImageUrl = useMemo(() => 
    currentPageData ? getOptimizedImageUrl(currentPageData.image_url) : '',
    [currentPageData, readingMode, isMobile]
  );

  // Theme classes
  const bgClass = darkMode ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const panelBgClass = darkMode ? 'bg-[#141414]/95' : 'bg-white/95';
  const buttonBgClass = darkMode ? 'bg-gray-800/80' : 'bg-gray-200/80';
  const activeButtonClass = darkMode ? 'bg-gray-200 text-black' : 'bg-gray-900 text-white';
  const borderClass = darkMode ? 'border-gray-800' : 'border-gray-300';
  const arrowButtonClass = darkMode 
    ? 'bg-gray-900/50 hover:bg-gray-800/70 text-white' 
    : 'bg-gray-200/50 hover:bg-gray-300/70 text-black';

  // Get back link based on user role
  const getBackLink = () => {
    if (userRole === 'creator' || userRole === 'admin') {
      return `/creator/works/${workId}`;
    }
    return `/manga/${workId}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-8 w-8 border-2 ${darkMode ? 'border-gray-400 border-t-transparent' : 'border-gray-600 border-t-transparent'} mb-4`} />
          <p className={mutedTextClass}>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-5xl mb-4">☁️</div>
          <h2 className={`text-xl font-bold ${textClass} mb-4`}>No Pages Available</h2>
          <Link href={getBackLink()} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (readingMode === 'webtoon') {
      return (
        <div className="w-full max-w-3xl mx-auto pt-16">
          {pages.map((page) => (
            <div key={page.id} id={`page-${page.page_number}`} className="relative mb-4">
              <img 
                src={getOptimizedImageUrl(page.image_url)}
                alt={`Page ${page.page_number}`}
                className="w-full h-auto"
                onError={() => handleImageError(page.page_number)}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center">
        {currentPageData ? (
          <div className="relative flex items-center justify-center w-full h-full p-2">
            {imageError[currentPage] ? (
              <div className={`w-full max-w-2xl aspect-[2/3] flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} rounded-lg`}>
                <div className="text-5xl mb-4">☁️❌</div>
                <p className={`${mutedTextClass} mb-4`}>Image failed to load</p>
                <button onClick={() => setImageError(prev => ({ ...prev, [currentPage]: false }))} className="px-6 py-2 bg-gray-900 text-white rounded-lg">
                  Retry
                </button>
              </div>
            ) : (
              <img 
                src={optimizedImageUrl}
                alt={`Page ${currentPage}`}
                className="max-h-[90vh] max-w-[95vw] object-contain"
                style={readingMode === 'ltr' ? { transform: 'scaleX(-1)' } : {}}
                onError={() => handleImageError(currentPage)}
              />
            )}
          </div>
        ) : (
          <div className={`w-full max-w-2xl aspect-[2/3] flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} rounded-lg`}>
            <p className={mutedTextClass}>Page not found</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`h-screen ${bgClass} relative ${readingMode === 'webtoon' ? 'overflow-y-auto' : 'overflow-hidden'}`}
      onClick={isMobile ? undefined : handleScreenClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      {showControls && (
        <div className="fixed top-3 left-3 right-3 z-50 control-element h-12">
          <div className={`${panelBgClass} backdrop-blur-md rounded-2xl px-4 h-full border ${borderClass} shadow-2xl flex items-center justify-between`}>
            <Link href={getBackLink()} className={`px-3 py-1.5 rounded-xl ${buttonBgClass} ${textClass} hover:scale-105 text-xs font-medium`}>
              ← Back
            </Link>

            <div className="flex-1 mx-4 text-center">
              <h1 className={`text-sm font-semibold ${textClass} truncate`}>{workInfo?.title}</h1>
              <p className={`text-[10px] ${mutedTextClass} mt-0.5`}>
                Ch.{chapterInfo?.chapter_number}: {chapterInfo?.title} • {currentPage}/{pages.length}
              </p>
            </div>

            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl ${showSettings ? activeButtonClass : buttonBgClass} ${textClass} hover:scale-105 text-sm`}>
              ⚙️
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && showControls && (
        <div className="fixed top-16 right-4 z-50 control-element w-56">
          <div className={`${panelBgClass} backdrop-blur-md rounded-xl p-3 border ${borderClass} shadow-2xl`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textClass}`}>Dark Mode</span>
                <button onClick={toggleDarkMode} className={`w-10 h-5 rounded-full transition-all ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} relative`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${darkMode ? 'left-5 bg-white' : 'left-0.5 bg-white'}`} />
                </button>
              </div>

              <div>
                <span className={`text-[10px] ${mutedTextClass} block mb-1.5`}>Reading Mode</span>
                <div className="flex gap-1.5">
                  {(['normal', 'ltr', 'webtoon'] as const).map((mode) => (
                    <button key={mode} onClick={() => setReadingMode(mode)} className={`flex-1 py-1.5 text-xs rounded-lg ${readingMode === mode ? activeButtonClass : buttonBgClass} ${textClass}`}>
                      {mode === 'normal' ? '📖' : mode === 'ltr' ? '🇯🇵' : '🇰🇷'}
                    </button>
                  ))}
                </div>
              </div>

              {readingMode === 'webtoon' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs ${textClass}`}>Auto Scroll</span>
                    <button onClick={() => setAutoScroll(!autoScroll)} className={`px-2.5 py-1 text-[10px] rounded-lg ${autoScroll ? activeButtonClass : buttonBgClass} ${textClass}`}>
                      {autoScroll ? 'On' : 'Off'}
                    </button>
                  </div>
                  {autoScroll && (
                    <input type="range" min="10" max="100" value={scrollSpeed} onChange={(e) => setScrollSpeed(parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg" />
                  )}
                </div>
              )}

              {readingMode !== 'webtoon' && (
                <div>
                  <span className={`text-[10px] ${mutedTextClass} block mb-1.5`}>Jump to Page</span>
                  <div className="grid grid-cols-6 gap-1 max-h-28 overflow-y-auto">
                    {pages.map((page) => (
                      <button key={page.id} onClick={() => goToPage(page.page_number)} className={`p-1 text-[10px] rounded ${currentPage === page.page_number ? activeButtonClass : buttonBgClass} ${textClass}`}>
                        {page.page_number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {renderContent()}

      {/* Desktop Arrows */}
      {!isMobile && showControls && readingMode !== 'webtoon' && (
        <>
          <button onClick={prevPage} disabled={currentPage === 1} className={`fixed left-2 top-1/2 -translate-y-1/2 z-40 control-element w-10 h-10 rounded-full ${arrowButtonClass} backdrop-blur-sm disabled:opacity-0 text-lg shadow-lg`}>
            ←
          </button>
          <button onClick={nextPage} disabled={currentPage === pages.length} className={`fixed right-2 top-1/2 -translate-y-1/2 z-40 control-element w-10 h-10 rounded-full ${arrowButtonClass} backdrop-blur-sm disabled:opacity-0 text-lg shadow-lg`}>
            →
          </button>
        </>
      )}

      {/* Instructions */}
      {showControls && readingMode !== 'webtoon' && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 ${panelBgClass} backdrop-blur-md rounded-full px-4 py-1.5 border ${borderClass} shadow-lg z-40 pointer-events-none`}>
          <p className={`text-[10px] ${mutedTextClass}`}>
            {isMobile ? 'Tap left/right • Swipe to navigate' : 'Tap edges to navigate • Center to hide UI'}
          </p>
        </div>
      )}

      {/* Show UI Button */}
      {!showControls && (
        <button onClick={() => setShowControls(true)} className={`fixed top-3 right-3 z-50 ${panelBgClass} backdrop-blur-md rounded-full p-2 border ${borderClass} shadow-2xl hover:scale-110`}>
          👁️
        </button>
      )}
    </div>
  );
}