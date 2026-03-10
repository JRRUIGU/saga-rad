'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, BookOpen, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: any[];
  action?: string;
  data?: any;
}

// Get route path based on content type
function getContentPath(type: string, id: number): string {
  const typeRoutes: { [key: string]: string } = {
    'manga': '/manga',
    'webtoon': '/webtoon',
    'comic': '/comic',
    'novel': '/novel'
  };
  
  const basePath = typeRoutes[type] || '/manga';
  return `${basePath}/${id}`;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hey there! 👋 Welcome to SAGA Read! I can help you find manga, novels, webtoons, or answer questions about the platform. What are you looking for?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: { currentPath: window.location.pathname },
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        attachments: data.attachments,
        action: data.action,
        data: data.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <>
      {/* Floating Button - Smaller */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-gray-600 text-white hover:bg-black hover:border-gray-400 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Chat Popup - Smaller width and height */}
      <div
        className={`fixed bottom-4 right-4 z-50 w-80 transition-all duration-300 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-black/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[450px]">
          {/* Header - Grey/Black */}
          <div className="bg-gray-900/80 border-b border-gray-700 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">SAGA Assistant</h3>
                <p className="text-[10px] text-gray-400">Custom knowledge base</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 bg-black/50" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === 'assistant' 
                        ? 'bg-gray-700' 
                        : 'bg-gray-600'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="h-3.5 w-3.5 text-gray-300" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-gray-300" />
                      )}
                    </div>
                    
                    <div
                      className={`rounded-xl px-3 py-2 max-w-[80%] text-xs ${
                        message.role === 'user'
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-800/80 text-gray-200 border border-gray-700'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                    </div>
                  </div>

                  {/* Content Cards - Smaller */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="ml-9 mt-2 space-y-2">
                      {message.attachments.map((attachment: any, idx: number) => (
                        <ContentCard 
                          key={idx} 
                          content={attachment.data} 
                          onClick={() => {
                            const path = getContentPath(attachment.data.type, attachment.data.id);
                            navigateTo(path);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {message.action === 'navigate' && message.data?.path && (
                    <div className="ml-9 mt-2">
                      <button
                        onClick={() => navigateTo(message.data!.path)}
                        className="text-[10px] bg-gray-700/50 text-gray-300 px-2.5 py-1 rounded-full hover:bg-gray-600 transition-colors flex items-center gap-1 border border-gray-600"
                      >
                        Read Now <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-700 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-gray-300" />
                  </div>
                  <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input - Compact */}
          <div className="p-3 border-t border-gray-700 bg-gray-900/80">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about manga, novels..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="h-8 w-8 rounded-lg bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 text-center">
              Custom SAGA Bot • No AI fees
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Content Card Component - Compact
function ContentCard({ content, onClick }: { content: any; onClick: () => void }) {
  const title = content?.title || 'Unknown Title';
  const type = content?.type || 'manga';
  const status = content?.status || 'ongoing';
  const coverUrl = content?.cover_url || '';
  const genreName = content?.genre_name || null;

  return (
    <div 
      onClick={onClick}
      className="bg-gray-800/60 border border-gray-700 rounded-lg p-2 hover:bg-gray-700/60 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-2">
        <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center shrink-0 overflow-hidden">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <BookOpen className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs text-gray-200 group-hover:text-white transition-colors truncate">
            {title}
          </h4>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded capitalize">
              {type}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
              status?.toLowerCase() === 'completed' 
                ? 'bg-gray-600 text-gray-300' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {status}
            </span>
          </div>

          {genreName && (
            <div className="mt-1">
              <span className="text-[9px] text-gray-500">
                #{genreName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}