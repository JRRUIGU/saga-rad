'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Calendar, Edit, Save, X, Upload, Shield, BookOpen, Heart, Camera } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState({ profile: false, banner: false })
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    profile_image: '',
    banner_image: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const profileFileInput = useRef<HTMLInputElement>(null)
  const bannerFileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    const userRole = localStorage.getItem('userRole')
    
    if (!userData || !userRole) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({
        display_name: parsedUser.display_name || parsedUser.username,
        bio: parsedUser.bio || '',
        profile_image: parsedUser.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.username}`,
        banner_image: parsedUser.banner_image || `https://picsum.photos/seed/${parsedUser.username}/1200/300`
      })
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleImageUpload = async (file: File, type: 'profile' | 'banner') => {
    if (!file) return

    setUploading(prev => ({ ...prev, [type]: true }))
    setMessage({ type: '', text: '' })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'ml_default')
      formData.append('cloud_name', 'djroowd5j')

      const response = await fetch(`https://api.cloudinary.com/v1_1/djroowd5j/image/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          [type === 'profile' ? 'profile_image' : 'banner_image']: data.secure_url
        }))
        setMessage({ type: 'success', text: 'Image uploaded successfully!' })
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' })
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'File size should be less than 5MB' })
        return
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file' })
        return
      }
      handleImageUpload(file, type)
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.display_name.trim()) {
      setMessage({ type: 'error', text: 'Display name is required' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        // Update localStorage
        const updatedUser = { ...user, ...data.user }
        localStorage.setItem('userData', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setEditing(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16 transition-colors duration-300 font-sans">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-900 dark:to-gray-800">
        {editing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="relative w-full h-full">
              <img 
                src={formData.banner_image} 
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <input
                  type="file"
                  ref={bannerFileInput}
                  onChange={(e) => handleFileChange(e, 'banner')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => bannerFileInput.current?.click()}
                  disabled={uploading.banner}
                  className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg flex items-center border border-gray-300 dark:border-gray-800 hover:border-gray-700 text-sm font-semibold"
                >
                  {uploading.banner ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Change Banner
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${user.banner_image})` }}
          />
        )}
        
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-black overflow-hidden bg-gray-200 dark:bg-gray-900">
              <img 
                src={formData.profile_image} 
                alt={user.display_name || user.username}
                className="w-full h-full object-cover"
              />
              {editing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <input
                    type="file"
                    ref={profileFileInput}
                    onChange={(e) => handleFileChange(e, 'profile')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => profileFileInput.current?.click()}
                    disabled={uploading.profile}
                    className="p-2 bg-white dark:bg-gray-900 rounded-full"
                  >
                    {uploading.profile ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
                    ) : (
                      <Camera size={20} className="text-gray-900 dark:text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>
            {user.role === 'admin' && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Shield size={12} className="mr-1" />
                Admin
              </div>
            )}
          </div>
        </div>

        {/* Edit/Save Button */}
        <div className="absolute top-4 right-4">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg flex items-center border border-gray-300 dark:border-gray-800 hover:border-gray-700 dark:hover:border-gray-700 text-sm font-semibold"
              >
                <X size={18} className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || uploading.profile || uploading.banner}
                className="px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg flex items-center hover:bg-gray-800 dark:hover:bg-gray-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg flex items-center hover:bg-gray-800 dark:hover:bg-gray-800 text-sm font-semibold"
            >
              <Edit size={18} className="mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="text-2xl md:text-3xl font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded w-full border border-gray-300 dark:border-gray-800"
                    placeholder="Display name"
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {user.display_name || user.username}
                  </h1>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">@{user.username}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h3>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-800 text-sm"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {user.bio || 'No bio yet. Click "Edit Profile" to add one!'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <BookOpen size={16} className="mr-2" />
                      Reading
                    </div>
                    <span className="text-gray-900 dark:text-white font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Heart size={16} className="mr-2" />
                      Favorites
                    </div>
                    <span className="text-gray-900 dark:text-white font-semibold">24</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {user.role === 'creator' && (
                    <Link
                      href="/creator/upload"
                      className="block w-full px-4 py-3 bg-gray-900 dark:bg-gray-900 text-white rounded-lg text-center hover:bg-gray-800 dark:hover:bg-gray-800 text-sm font-semibold"
                    >
                      Upload New Manga
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block w-full px-4 py-3 bg-red-600 text-white rounded-lg text-center hover:bg-red-700 text-sm font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-800 text-sm font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Avatar URLs - Only show in edit mode */}
              {editing && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Avatar Styles</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Click to try different avatar styles</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'adventurer', 'avataaars', 'bottts', 'croodles', 'micah', 'pixel-art'
                    ].map((style) => (
                      <button
                        key={style}
                        onClick={() => setFormData({
                          ...formData,
                          profile_image: `https://api.dicebear.com/7.x/${style}/svg?seed=${user.username}`
                        })}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
                      >
                        <img 
                          src={`https://api.dicebear.com/7.x/${style}/svg?seed=${user.username}`}
                          alt={style}
                          className="w-full h-auto rounded"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}