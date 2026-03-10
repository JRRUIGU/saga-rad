'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, Smartphone, Palette, BookText, LogOut, Heart, Search, Menu, X, User } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') setDarkMode(true)
  }, [])

  const updateUserData = () => {
    const role = localStorage.getItem('userRole')
    const userData = localStorage.getItem('userData')
    setUserRole(role)

    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    updateUserData()

    const handleLogin = () => updateUserData()
    const handleLogout = () => {
      setUser(null)
      setUserRole(null)
    }

    window.addEventListener('userLogin', handleLogin)
    window.addEventListener('userLogout', handleLogout)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData' || e.key === 'userRole') updateUserData()
    }

    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(updateUserData, 1000)

    return () => {
      window.removeEventListener('userLogin', handleLogin)
      window.removeEventListener('userLogout', handleLogout)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

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

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userData')
    localStorage.removeItem('authToken')
    window.dispatchEvent(new Event('userLogout'))
    setUser(null)
    setUserRole(null)
    setIsMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const mainNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Manga', href: '/manga', icon: BookOpen },
    { name: 'Webtoons', href: '/webtoons', icon: Smartphone },
    { name: 'Comics', href: '/comics', icon: Palette },
    { name: 'Novels', href: '/novels', icon: BookText },
  ]

  const isAdminPage = pathname.startsWith('/admin')
  const isCreatorPage = pathname.startsWith('/creator')
  const isLoginPage = pathname === '/login'
  const isRegisterPage = pathname === '/register'

  return (
    <>
      {/* Desktop Navbar - NOW WHITE/SEMI-TRANSPARENT */}
      <nav className="fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center">
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg px-4 py-3 w-[95%] max-w-7xl border border-gray-200/50 dark:border-white/10">
          <div className="flex items-center justify-between">
            <Link
              href={userRole === 'admin' ? '/admin' : userRole === 'creator' ? '/creator' : '/'}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">SR</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Saga<span className="text-gray-700 dark:text-gray-400">Read</span>
              </span>
            </Link>

            {!isAdminPage && !isCreatorPage && !isLoginPage && !isRegisterPage && (
              <div className="flex items-center space-x-1 bg-white/60 dark:bg-white/5 px-2 py-1 rounded-xl">
                {mainNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                        isActive
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}

            <div className="flex items-center space-x-3">
              {!isAdminPage && !isCreatorPage && !isLoginPage && !isRegisterPage && (
                <Link
                  href="/favorites"
                  className={`p-2 rounded-lg transition ${
                    pathname === '/favorites'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-white/80 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  <Heart size={18} className={pathname === '/favorites' ? 'fill-current' : ''} />
                </Link>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 bg-white/80 dark:bg-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>

              {user ? (
                <>
                  <Link href="/profile">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                      <img
                        src={user.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                !isLoginPage &&
                !isRegisterPage && (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-4 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      Register
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* FIXED: Mobile Navbar - NOW WHITE/SEMI-TRANSPARENT */}
      <nav className="fixed top-4 left-0 right-0 z-50 md:hidden flex justify-center px-4">
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg px-4 py-3 w-full border border-gray-200/50 dark:border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition"
            >
              <Menu size={24} />
            </button>

            <Link
              href={userRole === 'admin' ? '/admin' : userRole === 'creator' ? '/creator' : '/'}
              className="flex items-center space-x-2"
            >
              <div className="w-7 h-7 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">SR</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Saga<span className="text-gray-700 dark:text-gray-400">Read</span>
              </span>
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 -mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition"
            >
              <Search size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-black md:hidden">
          <div className="flex items-center px-4 h-14 border-b border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <Search size={20} className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none text-base"
                autoFocus
              />
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="ml-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
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
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {user ? (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <Link 
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                    <img
                      src={user.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
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
                    className="flex-1 py-2 text-center text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            <div className="py-2">
              {!isAdminPage && !isCreatorPage && !isLoginPage && !isRegisterPage && (
                <>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
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
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                  <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
                  <Link
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition ${
                      pathname === '/favorites'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Heart size={20} className={pathname === '/favorites' ? 'fill-current' : ''} />
                    <span>Favorites</span>
                  </Link>
                </>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <span className="flex items-center space-x-2">
                  <span>{darkMode ? '🌞' : '🌙'}</span>
                  <span className="text-sm font-medium">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </span>
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 mt-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Spacer for mobile fixed navbar */}
      <div className="h-16 md:hidden" />
    </>
  )
}