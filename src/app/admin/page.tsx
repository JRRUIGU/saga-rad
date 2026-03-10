'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Trash2, Eye, Search, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface HomepageSlide {
  id: number;
  title: string;
  description: string;
  image_url: string;
  button_text: string;
  is_active: boolean;
  display_order: number;
  work_id?: number;
  work_title?: string;
  work_slug?: string;
  work_type?: string;
  custom_link?: string;
}

interface PublishedWork {
  id: number;
  title: string;
  slug: string;
  type: string;
}

export default function AdminDashboard() {
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linkMethod, setLinkMethod] = useState<'search' | 'id' | 'url'>('search');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [buttonText, setButtonText] = useState('Read Now');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublishedWork[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('');
  const [selectedWorkTitle, setSelectedWorkTitle] = useState<string>('');
  const [workIdInput, setWorkIdInput] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [linkError, setLinkError] = useState<string>('');

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/slides');
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading slides:', error);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const searchWorks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/search-works?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      setImage(file);
    }
  };

  const validateWorkId = async (id: string) => {
    if (!id.trim()) {
      setLinkError('');
      return false;
    }
    
    try {
      const res = await fetch(`/api/works/${id}/check`);
      const data = await res.json();
      if (data.exists) {
        setLinkError('');
        setSelectedWorkTitle(data.title);
        return true;
      } else {
        setLinkError('Work ID not found');
        setSelectedWorkTitle('');
        return false;
      }
    } catch (error) {
      setLinkError('Error validating work ID');
      setSelectedWorkTitle('');
      return false;
    }
  };

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setLinkError('');
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      setLinkError('');
      return true;
    } catch {
      setLinkError('Invalid URL format');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image || !title || !description) {
      alert('Please fill all required fields');
      return;
    }

    // Validate based on selected method
    if (linkMethod === 'id' && workIdInput && !await validateWorkId(workIdInput)) {
      alert('Please enter a valid Work ID');
      return;
    }

    if (linkMethod === 'url' && customUrl && !validateUrl(customUrl)) {
      alert('Please enter a valid URL');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', image);
      formData.append('button_text', buttonText);
      
      // Add link based on selected method
      if (linkMethod === 'search' && selectedWorkId) {
        formData.append('work_id', selectedWorkId);
      } else if (linkMethod === 'id' && workIdInput) {
        formData.append('work_id', workIdInput);
      } else if (linkMethod === 'url' && customUrl) {
        formData.append('custom_link', customUrl);
      }
      
      const res = await fetch('/api/admin/slides', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        alert('Slide uploaded successfully!');
        resetForm();
        loadSlides();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Upload failed'}`);
      }
    } catch (error) {
      alert('Upload failed');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage(null);
    setButtonText('Read Now');
    setSelectedWorkId('');
    setSelectedWorkTitle('');
    setSearchQuery('');
    setWorkIdInput('');
    setCustomUrl('');
    setLinkError('');
    setShowForm(false);
  };

  const toggleSlideActive = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/slides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      loadSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  const deleteSlide = async (id: number) => {
    if (!confirm('Delete this slide?')) return;
    
    try {
      await fetch(`/api/admin/slides/${id}`, { method: 'DELETE' });
      loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload homepage slides</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Homepage Slides</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all font-semibold flex items-center gap-2"
              >
                <Upload size={16} />
                {showForm ? 'Cancel' : 'Upload New Slide'}
              </button>
            </div>

            {showForm && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Upload Slide</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Slide title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Description *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg h-32 text-gray-900 dark:text-white text-sm"
                      placeholder="Slide description"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Link Destination (Optional)</label>
                    
                    {/* Link Method Tabs */}
                    <div className="flex gap-2 mb-3 border-b border-gray-300 dark:border-gray-700 pb-2">
                      <button
                        type="button"
                        onClick={() => setLinkMethod('search')}
                        className={`px-3 py-1 text-xs rounded-t-lg transition-all ${
                          linkMethod === 'search' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkMethod('id')}
                        className={`px-3 py-1 text-xs rounded-t-lg transition-all ${
                          linkMethod === 'id' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Work ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkMethod('url')}
                        className={`px-3 py-1 text-xs rounded-t-lg transition-all ${
                          linkMethod === 'url' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Custom URL
                      </button>
                    </div>

                    {/* Search Method */}
                    {linkMethod === 'search' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              searchWorks(e.target.value);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                            placeholder="Search published works..."
                          />
                        </div>
                        
                        {searchResults.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                            {searchResults.map((work) => (
                              <div
                                key={work.id}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-300 dark:border-gray-700"
                                onClick={() => {
                                  setSelectedWorkId(work.id.toString());
                                  setSelectedWorkTitle(work.title);
                                  setSearchResults([]);
                                  setSearchQuery(work.title);
                                }}
                              >
                                <div className="font-medium text-gray-900 dark:text-white text-sm">{work.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{work.type}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedWorkTitle && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ Linked to: {selectedWorkTitle}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Work ID Method */}
                    {linkMethod === 'id' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={workIdInput}
                          onChange={async (e) => {
                            setWorkIdInput(e.target.value);
                            if (e.target.value) {
                              await validateWorkId(e.target.value);
                            } else {
                              setLinkError('');
                              setSelectedWorkTitle('');
                            }
                          }}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                          placeholder="Enter work ID (e.g., 123)"
                        />
                        {selectedWorkTitle && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ Found: {selectedWorkTitle}
                          </div>
                        )}
                        {linkError && linkMethod === 'id' && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            ❌ {linkError}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Enter the numeric ID of the work
                        </p>
                      </div>
                    )}

                    {/* Custom URL Method */}
                    {linkMethod === 'url' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={customUrl}
                          onChange={(e) => {
                            setCustomUrl(e.target.value);
                            validateUrl(e.target.value);
                          }}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                          placeholder="https://example.com/page"
                        />
                        {linkError && linkMethod === 'url' && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            ❌ {linkError}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Enter full URL including https://
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Read Now"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Image *</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center relative">
                      {image ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                            <ImageIcon size={20} />
                            <span className="text-sm">{image.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto mb-2 text-gray-500 dark:text-gray-500" size={24} />
                          <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">Upload image</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">PNG, JPG up to 5MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                          />
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 font-semibold text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Uploading...
                      </>
                    ) : (
                      'Upload Slide'
                    )}
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Current Slides ({slides.length})</h3>
              
              {slides.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center border border-gray-300 dark:border-gray-700">
                  <div className="text-5xl mb-4">🖼️</div>
                  <p className="text-gray-600 dark:text-gray-400">No slides uploaded yet</p>
                </div>
              ) : (
                slides.map((slide) => (
                  <div key={slide.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
                    <div className="flex gap-4">
                      <div className="w-32 h-20 flex-shrink-0">
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{slide.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{slide.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${slide.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                              {slide.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {slide.work_title && (
                              <span className="text-gray-700 dark:text-gray-300 text-xs flex items-center gap-1">
                                <LinkIcon size={10} />
                                Linked: {slide.work_title}
                              </span>
                            )}
                            {slide.custom_link && (
                              <span className="text-gray-700 dark:text-gray-300 text-xs flex items-center gap-1">
                                <LinkIcon size={10} />
                                Custom: {slide.custom_link.substring(0, 30)}...
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSlideActive(slide.id, slide.is_active)}
                              className={`px-3 py-1 rounded text-xs ${slide.is_active ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}
                            >
                              {slide.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteSlide(slide.id)}
                              className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Stats</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white text-sm">Slides</h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{slides.length}</div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {slides.filter(s => s.is_active).length} active
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
                <h3 className="font-bold mb-4 text-gray-900 dark:text-white text-sm">Link Methods</h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li>• <strong>Search:</strong> Find and select works</li>
                  <li>• <strong>Work ID:</strong> Enter numeric ID directly</li>
                  <li>• <strong>Custom URL:</strong> Any external link</li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
                <h3 className="font-bold mb-4 text-gray-900 dark:text-white text-sm">Info</h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Images auto-resize to 1920x1080px</li>
                  <li>• Max file size: 5MB</li>
                  <li>• Supported: PNG, JPG, JPEG</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}