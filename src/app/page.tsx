'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Search, Menu, X, User, Heart, LogOut, Home as HomeIcon, BookOpen, Smartphone, Palette, BookText, TrendingUp, Clock } from 'lucide-react'

interface HomepageSlide {
  id: number
  title: string
  description: string
  image_url: string
  button_text: string
  work_slug?: string
  work_title?: string
  work_type?: string
}

interface Work {
  id: number
  title: string
  type: string
  cover_url: string
  status: string
  chapter_count: number
  view_count?: number
  created_at: string
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [slides, setSlides] = useState<HomepageSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Data states
  const [trendingManga, setTrendingManga] = useState<Work[]>([])
  const [trendingWebtoons, setTrendingWebtoons] = useState<Work[]>([])
  const [trendingComics, setTrendingComics] = useState<Work[]>([])
  const [trendingNovels, setTrendingNovels] = useState<Work[]>([])
  const [newManga, setNewManga] = useState<Work[]>([])
  const [newWebtoons, setNewWebtoons] = useState<Work[]>([])
  const [newComics, setNewComics] = useState<Work[]>([])
  const [newNovels, setNewNovels] = useState<Work[]>([])

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        setDarkMode(true)
        document.documentElement.classList.add('dark')
      }
    }
    
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {}
    }
    
    fetchSlides()
    fetchAllContent()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/homepage/slides')
      const data = await res.json()
      setSlides(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching slides:', error)
      setSlides([])
    }
  }

  const fetchAllContent = async () => {
    try {
      // Fetch all types
      const [mangaRes, webtoonsRes, comicsRes, novelsRes] = await Promise.all([
        fetch('/api/manga'),
        fetch('/api/webtoons'),
        fetch('/api/comics'),
        fetch('/api/novels')
      ])

      const mangaData = await mangaRes.json()
      const webtoonsData = await webtoonsRes.json()
      const comicsData = await comicsRes.json()
      const novelsData = await novelsRes.json()

      if (mangaData.success) {
        // Sort by views for trending (highest first)
        const sortedByViews = [...mangaData.works].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        setTrendingManga(sortedByViews.slice(0, 10))
        
        // Sort by date for new (newest first)
        const sortedByDate = [...mangaData.works].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setNewManga(sortedByDate.slice(0, 10))
      }

      if (webtoonsData.success) {
        const sortedByViews = [...webtoonsData.works].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        setTrendingWebtoons(sortedByViews.slice(0, 10))
        
        const sortedByDate = [...webtoonsData.works].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setNewWebtoons(sortedByDate.slice(0, 10))
      }

      if (comicsData.success) {
        const sortedByViews = [...comicsData.works].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        setTrendingComics(sortedByViews.slice(0, 10))
        
        const sortedByDate = [...comicsData.works].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setNewComics(sortedByDate.slice(0, 10))
      }

      if (novelsData.success) {
        const sortedByViews = [...novelsData.works].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        setTrendingNovels(sortedByViews.slice(0, 10))
        
        const sortedByDate = [...novelsData.works].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setNewNovels(sortedByDate.slice(0, 10))
      }

    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const getWorkLink = (slide: HomepageSlide) => {
    if (!slide.work_slug) return '#'
    const typeMap: Record<string, string> = {
      'manga': '/manga',
      'webtoon': '/webtoons',
      'comic': '/comics',
      'novel': '/novels'
    }
    const basePath = typeMap[slide.work_type || 'manga'] || '/manga'
    return `${basePath}/${slide.work_slug}`
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userData')
    localStorage.removeItem('authToken')
    window.dispatchEvent(new Event('userLogout'))
    setUser(null)
    setIsMobileMenuOpen(false)
    window.location.href = '/'
  }

  const mainNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Manga', href: '/manga', icon: BookOpen },
    { name: 'Webtoons', href: '/webtoons', icon: Smartphone },
    { name: 'Comics', href: '/comics', icon: Palette },
    { name: 'Novels', href: '/novels', icon: BookText },
  ]

  // Work Card Component
  const WorkCard = ({ work, type }: { work: Work; type: string }) => {
    const typeEmoji = {
      manga: '🇯🇵',
      webtoon: '🇰🇷',
      comic: '🇺🇸',
      novel: '📚'
    }[type] || '📖'

    const typePath = {
      manga: '/manga',
      webtoon: '/webtoons',
      comic: '/comics',
      novel: '/novels'
    }[type] || '/'

    return (
      <Link 
        href={`${typePath}/${work.id}`}
        className="block w-20 sm:w-24 md:w-28 lg:w-32 flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:scale-[1.02] shadow-sm"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {work.cover_url && work.cover_url !== '/placeholder-cover.jpg' ? (
            <img 
              src={work.cover_url} 
              alt={work.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <span className="text-xl">{typeEmoji}</span>
            </div>
          )}
        </div>
        <div className="p-1">
          <h3 className="text-[8px] sm:text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
            {work.title}
          </h3>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[6px] sm:text-[10px] text-gray-500 dark:text-gray-400">
              #{work.chapter_count}
            </span>
            <span className="text-[6px] sm:text-[10px] text-gray-500 dark:text-gray-400">
              👁 {work.view_count || 0}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // Section Row Component with transparent rounded edge
  const SectionRow = ({ title, icon: Icon, items, type }: { title: string; icon: any; items: Work[]; type: string }) => {
    if (!items.length) return null

    return (
      <div className="mb-4 md:mb-6 last:mb-0">
        <div className="flex items-center gap-1.5 mb-2 px-2">
          <Icon size={14} className="text-gray-700 dark:text-gray-300" />
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
            <div className="flex gap-1.5 sm:gap-2 min-w-max">
              {items.map((work) => (
                <WorkCard key={work.id} work={work} type={type} />
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent dark:from-black pointer-events-none"></div>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-block w-32 h-3 bg-gray-200 rounded mb-4"></div>
            <div className="w-64 h-7 bg-gray-200 rounded mx-auto mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pt-16 font-sans">
      {/* Fixed white background for mobile */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black z-40 md:hidden" />
      
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-black md:hidden">
          <div className="flex items-center px-4 h-14 border-b border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none text-sm"
                autoFocus
              />
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="ml-3 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900 z-[70] shadow-2xl md:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {user ? (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <Link 
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                    <img
                      src={user.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            <div className="py-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = item.name === 'Home'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              <Link
                href="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 transition text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <Heart size={18} />
                <span className="text-sm">Favorites</span>
              </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <span className="flex items-center space-x-2">
                  <span className="text-sm">{darkMode ? '🌞' : '🌙'}</span>
                  <span className="text-xs font-medium">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </span>
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 mt-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <LogOut size={16} />
                  <span className="text-xs font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Spacer for mobile */}
      <div className="h-0.005 w-full bg-white dark:bg-black md:hidden" />

      {/* Dark Mode Toggle - Desktop */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors shadow-sm"
        >
          {darkMode ? '🌞' : '🌙'}
        </button>
      </div>

      {/* Slider */}
      {slides.length > 0 ? (
        <>
          {/* Mobile Slider */}
          <div className="relative h-[200px] overflow-hidden mt-0.5 mb-3 rounded-xl shadow-lg mx-3 md:hidden">
            <div className="absolute inset-0">
              <img
                src={slides[currentSlide].image_url}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>

            <div className="relative h-full flex items-end pb-4 px-3">
              <div className="text-white">
                <h1 className="text-base font-bold mb-1 leading-tight">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xs mb-2 text-gray-200 line-clamp-2">
                  {slides[currentSlide].description}
                </p>
                <Link
                  href={getWorkLink(slides[currentSlide])}
                  className="inline-block px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {slides[currentSlide].button_text}
                </Link>
              </div>
            </div>

            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white w-3' : 'bg-white/50 w-1'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop Slider */}
          <div className="hidden md:block relative h-[450px] overflow-hidden mt-12 mb-8 rounded-3xl shadow-xl max-w-6xl mx-auto">
            <div className="absolute inset-0">
              <img
                src={slides[currentSlide].image_url}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>

            <div className="relative container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg mb-6 text-gray-200">
                  {slides[currentSlide].description}
                </p>
                <div className="flex gap-3">
                  <Link
                    href={getWorkLink(slides[currentSlide])}
                    className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
                  >
                    {slides[currentSlide].button_text}
                  </Link>
                  {slides[currentSlide].work_title && (
                    <div className="px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-xl">
                      <span className="text-sm text-gray-300">
                        From: {slides[currentSlide].work_title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronRight size={28} />
                </button>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="h-[200px] md:h-[400px] bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4 md:mb-8 mx-3 md:mx-0 rounded-xl md:rounded-3xl">
          <p className="text-sm md:text-xl text-gray-500 dark:text-gray-400">No featured content available</p>
        </div>
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Explore Categories - Centered on Mobile */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-3xl font-bold text-center text-gray-900 mb-3 md:mb-4 dark:text-gray-100">
            Explore <span className="text-gray-800 dark:text-gray-400">Categories</span>
          </h2>
          
          {/* Mobile: Centered Horizontal Scroll, Desktop: Grid */}
          <div className="relative">
            {/* Mobile Horizontal Scroll - Centered */}
            <div className="md:hidden overflow-x-auto scrollbar-hide pb-2">
              <div className="flex justify-center">
                <div className="flex gap-1.5">
                  <Link 
                    href="/manga"
                    className="group relative overflow-hidden rounded-lg bg-white border border-gray-300 p-1.5 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 w-14 flex-shrink-0"
                  >
                    <div className="text-base mb-0">🇯🇵</div>
                    <h3 className="text-[8px] font-bold text-gray-900 dark:text-gray-100">Manga</h3>
                  </Link>

                  <Link 
                    href="/webtoons"
                    className="group relative overflow-hidden rounded-lg bg-white border border-gray-300 p-1.5 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 w-14 flex-shrink-0"
                  >
                    <div className="text-base mb-0">🇰🇷</div>
                    <h3 className="text-[8px] font-bold text-gray-900 dark:text-gray-100">Webtoons</h3>
                  </Link>

                  <Link 
                    href="/comics"
                    className="group relative overflow-hidden rounded-lg bg-white border border-gray-300 p-1.5 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 w-14 flex-shrink-0"
                  >
                    <div className="text-base mb-0">🇺🇸</div>
                    <h3 className="text-[8px] font-bold text-gray-900 dark:text-gray-100">Comics</h3>
                  </Link>

                  <Link 
                    href="/novels"
                    className="group relative overflow-hidden rounded-lg bg-white border border-gray-300 p-1.5 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 w-14 flex-shrink-0"
                  >
                    <div className="text-base mb-0">📚</div>
                    <h3 className="text-[8px] font-bold text-gray-900 dark:text-gray-100">Novels</h3>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <Link 
                href="/manga"
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-300 p-4 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
              >
                <div className="text-3xl mb-2">🇯🇵</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Manga</h3>
              </Link>

              <Link 
                href="/webtoons"
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-300 p-4 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
              >
                <div className="text-3xl mb-2">🇰🇷</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Webtoons</h3>
              </Link>

              <Link 
                href="/comics"
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-300 p-4 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
              >
                <div className="text-3xl mb-2">🇺🇸</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Comics</h3>
              </Link>

              <Link 
                href="/novels"
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-300 p-4 hover:border-gray-700 transition-all hover:scale-[1.02] text-center shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
              >
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Novels</h3>
              </Link>
            </div>
          </div>
        </div>

        {/* Trending Now Section - Centered with transparent rounded edge */}
        <div className="mb-8 md:mb-12 max-w-6xl mx-auto">
          <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
            <h2 className="text-base md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 dark:text-gray-100 flex items-center gap-1 md:gap-2 px-2">
              <TrendingUp className="text-red-500" size={20} />
              <span>Trending <span className="text-gray-800 dark:text-gray-400">Now</span></span>
            </h2>

            {/* Trending Manga */}
            <SectionRow title="Manga" icon={BookOpen} items={trendingManga} type="manga" />
            
            {/* Trending Webtoons */}
            <SectionRow title="Webtoons" icon={Smartphone} items={trendingWebtoons} type="webtoon" />
            
            {/* Trending Comics */}
            <SectionRow title="Comics" icon={Palette} items={trendingComics} type="comic" />
            
            {/* Trending Novels */}
            <SectionRow title="Novels" icon={BookText} items={trendingNovels} type="novel" />
          </div>
        </div>

        {/* New Serialization Section - Centered with transparent rounded edge */}
        <div className="mb-8 md:mb-12 max-w-6xl mx-auto">
          <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
            <h2 className="text-base md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 dark:text-gray-100 flex items-center gap-1 md:gap-2 px-2">
              <Clock className="text-blue-500" size={20} />
              <span>New <span className="text-gray-800 dark:text-gray-400">Serialization</span></span>
            </h2>

            {/* New Manga */}
            <SectionRow title="Manga" icon={BookOpen} items={newManga} type="manga" />
            
            {/* New Webtoons */}
            <SectionRow title="Webtoons" icon={Smartphone} items={newWebtoons} type="webtoon" />
            
            {/* New Comics */}
            <SectionRow title="Comics" icon={Palette} items={newComics} type="comic" />
            
            {/* New Novels */}
            <SectionRow title="Novels" icon={BookText} items={newNovels} type="novel" />
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 md:mt-16 text-center">
          <h2 className="text-base md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 dark:text-gray-100">
            Ready to Start <span className="text-gray-800 dark:text-gray-400">Reading</span>?
          </h2>
          <p className="text-xs md:text-base text-gray-700 mb-4 md:mb-8 dark:text-gray-400">Join thousands of readers today</p>
          
          <div className="max-w-md mx-auto">
            <Link
              href="/register"
              className="block w-full py-2 md:py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm md:text-lg rounded-lg md:rounded-xl transition-all shadow-sm dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              Create Free Account
            </Link>
            <p className="text-gray-600 text-[10px] md:text-xs mt-2 md:mt-3 dark:text-gray-500">
              No credit card required • Start reading in seconds
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-300 mt-8 md:mt-16 py-3 md:py-6 dark:border-gray-900">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <p className="text-[10px] md:text-sm text-gray-700 dark:text-gray-500">
            © 2024 <span className="text-gray-900 font-semibold dark:text-gray-400">SagaRead</span>. All rights reserved.
          </p>
          <p className="text-[8px] md:text-xs text-gray-600 mt-0.5 md:mt-1 dark:text-gray-600">
            Your ultimate destination for manga, webtoons, comics, and novels.
          </p>
        </div>
      </footer>
    </div>
  )
}