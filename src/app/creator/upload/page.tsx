'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface PageFile {
  id: string;
  file: File;
  preview: string;
  order: number;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

// Sortable Page Item Component
function SortablePageItem({ page, index, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: { 
  page: PageFile; 
  index: number; 
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-50 dark:bg-black rounded-lg overflow-hidden border-2 ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-800'
      }`}
    >
      <div className="relative">
        <img 
          src={page.preview} 
          alt={`Page ${index + 1}`}
          className="w-full h-32 object-cover"
        />
        
        {/* Page Number Badge */}
        <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-full">
          #{index + 1}
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1 bg-gray-900/80 text-white rounded-full cursor-move hover:bg-gray-700 transition-colors"
        >
          <GripVertical size={14} />
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Page {index + 1}
          </div>
          <div className="flex items-center gap-1">
            {/* Move Up Button */}
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
              className={`p-1 rounded transition-colors ${
                isFirst 
                  ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <ArrowUp size={14} />
            </button>

            {/* Move Down Button */}
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              className={`p-1 rounded transition-colors ${
                isLast 
                  ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <ArrowDown size={14} />
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(page.id)}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingWorkId = searchParams.get('work');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [pages, setPages] = useState<PageFile[]>([]);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        // Update order numbers after reordering
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  // Move page up
  const movePageUp = (index: number) => {
    if (index <= 0) return;
    setPages((items) => {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      // Update order numbers
      return newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
  };

  // Move page down
  const movePageDown = (index: number) => {
    if (index >= pages.length - 1) return;
    setPages((items) => {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      // Update order numbers
      return newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
  };
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    genreId: '',
    chapterName: '',
    chapterNumber: 1,
    isFirstChapter: !existingWorkId,
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/creator/upload');
        const data = await response.json();
        if (data.success) {
          setGenres(data.genres);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      } finally {
        setLoadingGenres(false);
      }
    };
    
    fetchGenres();
  }, []);

  const handleTypeSelect = (type: string) => {
    setFormData({...formData, type});
    setStep(2);
    setPages([]);
  };

  const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPages = files.map((file, index) => ({
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      order: pages.length + index + 1,
    }));
    
    setPages([...pages, ...newPages]);
  };

  const removePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      alert('Please select a content type');
      setStep(1);
      return;
    }
    
    if (!formData.title || !formData.chapterName) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!coverPreview) {
      alert('Please upload a cover image');
      return;
    }
    
    if (pages.length === 0) {
      alert('Please upload at least one page/image');
      return;
    }
    
    setUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('type', formData.type);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('genreId', formData.genreId);
    formDataToSend.append('chapterName', formData.chapterName);
    formDataToSend.append('chapterNumber', formData.chapterNumber.toString());
    formDataToSend.append('isFirstChapter', formData.isFirstChapter.toString());
    
    // Add cover file
    const coverFile = coverInputRef.current?.files?.[0];
    if (coverFile) {
      formDataToSend.append('cover', coverFile);
    }
    
    // Add pages in correct order
    pages.sort((a, b) => a.order - b.order).forEach((page) => {
      formDataToSend.append('pages', page.file);
    });

    try {
      const response = await fetch('/api/creator/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Upload successful!\n${result.message}\nWork ID: ${result.workId}`);
        router.push('/creator');
      } else {
        alert('❌ Upload failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pt-16 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/creator"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-900 -z-10"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black' 
                  : 'bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-400'
              }`}>
                {s}
              </div>
              <div className={`text-xs mt-2 ${step >= s ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                {s === 1 && 'Select Type'}
                {s === 2 && 'Enter Details'}
                {s === 3 && 'Upload'}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Select Type */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What would you like to upload?</h2>
            <p className="text-gray-700 dark:text-gray-400 mb-8 text-sm">Choose the type of content</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'manga', label: 'Manga', icon: '🇯🇵' },
                { type: 'webtoon', label: 'Webtoon', icon: '🇰🇷' },
                { type: 'comic', label: 'Comic', icon: '🇺🇸' },
                { type: 'novel', label: 'Novel', icon: '📚' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => handleTypeSelect(item.type)}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-4 hover:border-gray-700 dark:hover:border-gray-600 transition-all hover:scale-[1.02] text-center shadow-sm"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white mb-1">{item.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-500">Click to select</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 & 3: Form */}
        {(step === 2 || step === 3) && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {formData.type ? `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Upload` : 'Work Details'}
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Change Type
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Work Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm"
                    placeholder="e.g., One Piece, Solo Leveling"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Genre *</label>
                  <select
                    required
                    value={formData.genreId}
                    onChange={(e) => setFormData({...formData, genreId: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm"
                    disabled={loadingGenres}
                  >
                    <option value="">Select a genre...</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                  {loadingGenres && (
                    <p className="text-xs text-gray-500 mt-1">Loading genres...</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm h-32"
                    placeholder="Describe your work... This will be used by the AI assistant to answer questions about your content."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Chapter Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.chapterName}
                      onChange={(e) => setFormData({...formData, chapterName: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm"
                      placeholder="e.g., The Beginning"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Chapter Number *</label>
                    <input
                      type="number"
                      required
                      value={formData.chapterNumber}
                      onChange={(e) => setFormData({...formData, chapterNumber: parseInt(e.target.value)})}
                      className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Upload */}
              <div className="pt-4 border-t border-gray-300 dark:border-gray-800">
                <label className="block text-gray-700 dark:text-gray-300 mb-4 text-sm">Cover Image *</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {coverPreview ? (
                    <div className="w-32 h-48 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => coverInputRef.current?.click()}
                      className="w-32 h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-700 dark:hover:border-gray-500 transition-all"
                    >
                      <span className="text-2xl mb-2">🖼️</span>
                      <span className="text-gray-500 dark:text-gray-500 text-xs">Click to upload</span>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverSelect}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all"
                    >
                      {coverPreview ? 'Change Cover' : 'Upload Cover'}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">JPG, PNG, or WEBP • Max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Content Upload with Drag and Drop Reordering */}
              <div className="pt-4 border-t border-gray-300 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm">
                      Upload Pages *
                    </label>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      Upload image files and drag to rearrange page order
                    </p>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all"
                  >
                    + Add Pages
                  </button>
                </div>
                
                {/* Pages Grid with Drag and Drop */}
                {pages.length > 0 ? (
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                      💡 Drag the cards or use the arrow buttons to reorder pages
                    </p>
                    
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={pages.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                          {pages.map((page, index) => (
                            <SortablePageItem
                              key={page.id}
                              page={page}
                              index={index}
                              onRemove={removePage}
                              onMoveUp={movePageUp}
                              onMoveDown={movePageDown}
                              isFirst={index === 0}
                              isLast={index === pages.length - 1}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      {pages.length} page{pages.length !== 1 ? 's' : ''} ready to upload
                    </p>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg p-8 text-center cursor-pointer hover:border-gray-700 dark:hover:border-gray-500 transition-all"
                  >
                    <div className="text-3xl mb-4">📄</div>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-2">
                      Click to upload pages
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">or drag and drop images here</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Supports JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-300 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <Link
                    href="/creator"
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={uploading || !coverPreview || pages.length === 0 || !formData.genreId}
                    className="px-8 py-2.5 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 font-semibold text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white dark:border-gray-300 mr-2"></span>
                        Uploading...
                      </span>
                    ) : (
                      `Upload (${pages.length} pages)`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg">
          <div className="flex items-start">
            <div className="text-gray-600 dark:text-gray-400 mr-3 text-sm">💡</div>
            <div>
              <p className="text-gray-700 dark:text-gray-400 text-xs">
                <strong className="text-gray-900 dark:text-white">Tip:</strong> You can drag and drop pages to rearrange them in any order. The page order you set here will be the reading order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}