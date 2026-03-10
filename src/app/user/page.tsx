'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Clock, 
  Bookmark, 
  Star,
  History,
  Settings,
  User
} from 'lucide-react'

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('reading')

  const readingList = [
    { id: 1, title: 'Attack on Titan', chapter: 139, progress: 100 },
    { id: 2, title: 'One Piece', chapter: 1098, progress: 85 },
    { id: 3, title: 'Jujutsu Kaisen', chapter: 250, progress: 45 },
  ]

  const bookmarks = [
    { id: 1, title: 'Demon Slayer', chapter: 205, date: '2 days ago' },
    { id: 2, title: 'My Hero Academia', chapter: 420, date: '1 week ago' },
    { id: 3, title: 'Chainsaw Man', chapter: 150, date: '2 weeks ago' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">My</span>{' '}
            <span className="text-purple-400">Dashboard</span>
          </h1>
          <p className="text-gray-400">Track your reading progress and collections</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Main Content */}
          <div className="col-span-4 lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">12</div>
                <div className="text-gray-400 text-sm">Reading Now</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-pink-400">48</div>
                <div className="text-gray-400 text-sm">Bookmarks</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-blue-400">156</div>
                <div className="text-gray-400 text-sm">Completed</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-green-400">4.2★</div>
                <div className="text-gray-400 text-sm">Avg Rating</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'reading', label: 'Currently Reading', icon: BookOpen },
                { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
                { id: 'history', label: 'History', icon: History },
                { id: 'rated', label: 'Rated', icon: Star },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
           