import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Trash2, Star, Loader2, Volume2, VolumeX, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  profiles?: any[];
  statistics?: any;
  visualizations?: { [key: string]: string };
  pipeline_used?: string;
  data_source?: string;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  isFavorite: boolean;
}

const Chatbot = () => {
  const { t, isLoading: isTranslationLoading } = useLanguage();

  // State declarations
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to analyze chat content and generate meaningful names
  const analyzeAndRenameChat = (messages: Message[], chatId: string) => {
    if (messages.length < 2) return; // Need at least user message + AI response

    const allContent = messages.map(msg => msg.content).join(' ').toLowerCase();

    // Define keywords and their corresponding chat names
    const topicKeywords = {
      'temperature': 'Temperature Analysis',
      'salinity': 'Salinity Study',
      'oxygen': 'Oxygen Levels',
      'depth': 'Depth Profiles',
      'indian ocean': 'Indian Ocean Study',
      'atlantic': 'Atlantic Ocean',
      'pacific': 'Pacific Ocean',
      'argo': 'ARGO Float Data',
      'float': 'Float Analysis',
      'seasonal': 'Seasonal Variations',
      'trend': 'Trend Analysis',
      'comparison': 'Comparative Study',
      'profile': 'Profile Analysis',
      'cycle': 'Cycle Data',
      'latitude': 'Latitudinal Study',
      'longitude': 'Longitudinal Study',
      'equator': 'Equatorial Analysis',
      'southern': 'Southern Ocean',
      'arabian': 'Arabian Sea',
      'bengal': 'Bay of Bengal'
    };

    // Find the most relevant topic
    let bestMatch = '';
    let maxMatches = 0;

    for (const [keyword, name] of Object.entries(topicKeywords)) {
      const matches = (allContent.match(new RegExp(keyword, 'g')) || []).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = name;
      }
    }

    // Generate name based on content analysis
    let newName = bestMatch;

    if (!newName) {
      // Fallback: analyze message content for common patterns
      if (allContent.includes('temperature') && allContent.includes('indian')) {
        newName = 'Indian Ocean Temperature';
      } else if (allContent.includes('salinity') && allContent.includes('comparison')) {
        newName = 'Salinity Comparison';
      } else if (allContent.includes('float') && allContent.includes('location')) {
        newName = 'Float Locations';
      } else if (allContent.includes('trend') || allContent.includes('variation')) {
        newName = 'Ocean Trends';
      } else if (allContent.includes('depth') || allContent.includes('profile')) {
        newName = 'Depth Analysis';
      } else {
        // Generic naming based on message count and content
        const userMessages = messages.filter(msg => msg.type === 'user');
        if (userMessages.length > 0) {
          const firstUserMessage = userMessages[0].content.substring(0, 50);
          newName = firstUserMessage.length > 40 ? firstUserMessage.substring(0, 40) + '...' : firstUserMessage;
        }
      }
    }

    // Update chat name if it's still generic
    if (newName && !newName.startsWith('Chat ')) {
      setChats(prev => prev.map(chat =>
        chat.id === chatId
          ? { ...chat, name: newName }
          : chat
      ));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    let currentActiveChat = activeChat;

    // If there's no active chat, create one for the first message
    if (!currentActiveChat) {
      const newChat: Chat = {
        id: Date.now().toString(),
        name: `Chat ${chats.length + 1}`,
        messages: [],
        isFavorite: false
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);
      currentActiveChat = newChat.id;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setChats(prev => prev.map(chat =>
      chat.id === currentActiveChat
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    ));

    const currentMessage = message;
    setMessage('');
    setIsRequestLoading(true);

    try {
      // Call the Django backend API
      const response = await fetch('http://localhost:8000/api/chat/argo/query/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage
        })
      });

      if (response.ok) {
        const data = await response.json();

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || data.answer || 'I received your query about ARGO data analysis. The system is processing your request.',
          type: 'assistant',
          timestamp: new Date(),
          profiles: data.profiles || [],
          statistics: data.statistics || {},
          visualizations: data.visualizations || {},
          pipeline_used: data.pipeline_used,
          data_source: data.data_source
        };

        setChats(prev => prev.map(chat =>
          chat.id === currentActiveChat
            ? { ...chat, messages: [...chat.messages, aiResponse] }
            : chat
        ));

        // Analyze and rename chat after AI response
        const updatedChat = chats.find(chat => chat.id === currentActiveChat);
        if (updatedChat) {
          const newMessages = [...updatedChat.messages, aiResponse];
          analyzeAndRenameChat(newMessages, currentActiveChat);
        }

        // Stop any ongoing speech when new response arrives
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          setSpeakingMessageId(null);
          setIsPaused(false);
        }
      } else {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error calling API:', error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm currently unable to connect to the ARGO data server. Please ensure the Django backend server is running and try again.`,
        type: 'assistant',
        timestamp: new Date()
      };

      setChats(prev => prev.map(chat =>
        chat.id === currentActiveChat
          ? { ...chat, messages: [...chat.messages, errorResponse] }
          : chat
      ));
    } finally {
      setIsRequestLoading(false);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      isFavorite: false
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setActiveChat(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const toggleFavorite = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, isFavorite: !chat.isFavorite }
        : chat
    ));
  };

  const speakMessage = (msg: Message) => {
    if (msg.type !== 'assistant') return;

    if (speechSynthesis.speaking) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPaused(false);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(msg.content);
    utterance.onstart = () => {
      setSpeakingMessageId(msg.id);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsPaused(false);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setIsPaused(false);
    };

    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    speechSynthesis.speak(utterance);
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const activeChatData = chats.find(chat => chat.id === activeChat);
  const activeMessages = activeChatData?.messages || [];

  // Auto-scroll to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChat]);

  // Enhanced welcome screen with improved UI
  const WelcomeScreen = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            AI Ocean Analyst
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Explore ARGO float data with natural language queries
          </p>
        </div>

        {/* Indian Ocean Data Summary */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 mb-12 border border-blue-200/50 dark:border-blue-800/50 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Indian Ocean ARGO Data Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="group">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">127</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Floats</div>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">24.8°C</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Temperature</div>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">34.7 PSU</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Salinity</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                Real-time data from 127 active ARGO floats monitoring the Indian Ocean basin
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Try these example queries:
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Click any prompt to start exploring ocean data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Show me temperature profiles in the Indian Ocean",
              "Compare salinity between Arabian Sea and Bay of Bengal",
              "Find ARGO floats near the equator in Indian Ocean",
              "What are the latest ocean temperature trends in Indian Ocean?",
              "Show me dissolved oxygen levels at 1000m depth in Indian Ocean",
              "Analyze seasonal variations in the Indian Ocean"
            ].map((prompt, index) => (
              <button
                key={index}
                className="group p-5 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                onClick={() => {
                  setMessage(prompt);
                  setTimeout(() => {
                    handleSendMessage();
                  }, 50);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                    <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 leading-relaxed">
                    {prompt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started Tip */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="text-2xl">💡</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Pro Tip
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ask me anything about ARGO float data, temperature profiles, salinity measurements, or oceanographic trends in the Indian Ocean and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 shadow-xl ${
        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={createNewChat}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
            </div>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    activeChat === chat.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-700 shadow-lg'
                      : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block truncate">
                        {chat.name}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {chat.messages.length} messages
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(chat.id);
                        }}
                      >
                        <Star className={`h-4 w-4 ${chat.isFavorite ? 'fill-current text-yellow-500' : 'text-slate-400'}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm min-w-0">
        {/* Top Bar - Only show when sidebar is collapsed */}
        {sidebarCollapsed && (
          <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                ARGO Float Data Chatbot
              </CardTitle>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        )}

        {/* Chat Header - Only show when sidebar is open */}
        {!sidebarCollapsed && (
          <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                ARGO Float Data Chatbot
              </CardTitle>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          {(() => {
            // Show welcome screen if no chat is active OR if active chat has no messages
            const shouldShowWelcome = !activeChat || (activeChatData && activeMessages.length === 0);

            if (shouldShowWelcome) {
              return (
                <ScrollArea className="h-full p-6">
                  <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                          <MessageCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        AI Ocean Analyst
                      </h1>
                      <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                        Explore ARGO float data with natural language queries
                      </p>
                    </div>

                    {/* Indian Ocean Data Summary */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 mb-12 border border-blue-200/50 dark:border-blue-800/50 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          Indian Ocean ARGO Data Summary
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="group">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">127</div>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Floats</div>
                            </div>
                          </div>
                        </div>
                        <div className="group">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">24.8°C</div>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Temperature</div>
                            </div>
                          </div>
                        </div>
                        <div className="group">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">34.7 PSU</div>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Salinity</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full backdrop-blur-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            Real-time data from 127 active ARGO floats monitoring the Indian Ocean basin
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Prompts */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                          Try these example queries:
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Click any prompt to start exploring ocean data
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Show me temperature profiles in the Indian Ocean",
                          "Compare salinity between Arabian Sea and Bay of Bengal",
                          "Find ARGO floats near the equator in Indian Ocean",
                          "What are the latest ocean temperature trends in Indian Ocean?",
                          "Show me dissolved oxygen levels at 1000m depth in Indian Ocean",
                          "Analyze seasonal variations in the Indian Ocean"
                        ].map((prompt, index) => (
                          <button
                            key={index}
                            className="group p-5 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                            onClick={() => {
                              setMessage(prompt);
                              setTimeout(() => {
                                handleSendMessage();
                              }, 50);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                                <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 leading-relaxed">
                                {prompt}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Getting Started Tip */}
                    <div className="text-center mt-12">
                      <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                        <div className="text-2xl">💡</div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            Pro Tip
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Ask me anything about ARGO float data, temperature profiles, salinity measurements, or oceanographic trends in the Indian Ocean and beyond.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              );
            }

            return (
              <ScrollArea className="h-full p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {activeMessages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`max-w-[85%] group ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl'
                        } rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* Enhanced content for assistant messages */}
                        {msg.type === 'assistant' && (
                          <>
                            {/* Pipeline info */}
                            {msg.pipeline_used && (
                              <div className="mt-4 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <strong>Pipeline:</strong> {msg.pipeline_used} |
                                  <strong>Data Source:</strong> {msg.data_source || 'cloud_db'}
                                </div>
                              </div>
                            )}

                            {/* Visualizations */}
                            {msg.visualizations && Object.keys(msg.visualizations).length > 0 && (
                              <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Visualizations
                                </h4>
                                {Object.entries(msg.visualizations).map(([key, imageUrl]) => (
                                  <div key={key} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-700/50">
                                    <h5 className="text-xs font-semibold mb-2 capitalize text-slate-700 dark:text-slate-300">
                                      {key.replace(/_/g, ' ')}
                                    </h5>
                                    <img
                                      src={imageUrl}
                                      alt={key}
                                      className="max-w-full h-auto rounded-lg shadow-md"
                                      onError={(e) => {
                                        console.warn(`Failed to load visualization: ${key}`);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Statistics */}
                            {msg.statistics && Object.keys(msg.statistics).length > 0 && (
                              <div className="mt-4 p-4 bg-slate-100/30 dark:bg-slate-700/30 rounded-lg border border-slate-200/30 dark:border-slate-600/30">
                                <h4 className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  Statistics
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  {Object.entries(msg.statistics).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                      <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{key.replace(/_/g, ' ')}:</span>
                                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                        {typeof value === 'object' ? JSON.stringify(value) : value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Profiles */}
                            {msg.profiles && msg.profiles.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  ARGO Profiles ({msg.profiles.length})
                                </h4>
                                <ScrollArea className="max-h-48">
                                  <div className="space-y-2">
                                    {msg.profiles.slice(0, 3).map((profile: any, idx: number) => (
                                      <div key={idx} className="p-3 bg-slate-100/30 dark:bg-slate-700/30 rounded-lg border border-slate-200/30 dark:border-slate-600/30">
                                        <div className="flex justify-between items-center">
                                          <span className="font-semibold text-slate-800 dark:text-slate-200">Float {profile.float_id}</span>
                                          <span className="text-xs text-slate-600 dark:text-slate-400">
                                            {profile.latitude?.toFixed(2)}, {profile.longitude?.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          Cycle {profile.cycle_number} • {new Date(profile.profile_date).toLocaleDateString()}
                                        </div>
                                      </div>
                                    ))}
                                    {msg.profiles.length > 3 && (
                                      <p className="text-xs text-center py-2 text-slate-500 dark:text-slate-400 bg-slate-100/20 dark:bg-slate-700/20 rounded-lg">
                                        ... and {msg.profiles.length - 3} more profiles
                                      </p>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}

                            <div className="flex justify-end mt-4">
                              <Button
                                size="icon"
                                variant="ghost"
                                className={`h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 ${speakingMessageId === msg.id ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                                onClick={() => speakMessage(msg)}
                                title="Read aloud"
                              >
                                {speakingMessageId === msg.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </>
                        )}

                        <p className={`text-xs mt-3 ${msg.type === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isRequestLoading && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-500">
                      <div className="max-w-[80%] p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Analyzing ARGO data...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            );
          })()}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-6 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask anything about ARGO ocean data..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
                <div className="absolute right-3 bottom-3 text-xs text-slate-400">
                  Press Enter to send
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
