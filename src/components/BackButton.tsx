'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
  showText?: boolean;
}

export default function BackButton({ 
  fallbackUrl = '/', 
  className = '',
  showText = true 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if we have browser history
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to fallback URL
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      title="Go back"
    >
      <ArrowLeft size={20} />
      {showText && <span className="text-sm font-medium">Back</span>}
    </button>
  );
}