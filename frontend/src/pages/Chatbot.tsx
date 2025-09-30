import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Mic, Send, Trash2, Edit2, Star, Loader2, Volume2, VolumeX } from 'lucide-react';

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
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (chats.length === 0 && !isTranslationLoading) {
      setChats([
        {
          id: '1',
          name: t('chatbot.argoFloatAnalysis'),
          messages: [
            { id: '1-1', content: t('chatbot.showMeTempData'), type: 'user', timestamp: new Date() },
            { id: '1-2', content: t('chatbot.found15Floats'), type: 'assistant', timestamp: new Date() }
          ],
          isFavorite: true
        }
      ]);
      setActiveChat('1');
    }
  }, [t, isTranslationLoading]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setChats(prev => prev.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    ));

    const currentMessage = message;
    setMessage('');
    setIsRequestLoading(true); // Start loading

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
          content: data.response || data.answer || 'Response received',
          type: 'assistant',
          timestamp: new Date(),
          profiles: data.profiles || [],
          statistics: data.statistics || {},
          visualizations: data.visualizations || {},
          pipeline_used: data.pipeline_used,
          data_source: data.data_source
        };

        setChats(prev => prev.map(chat =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, aiResponse] }
            : chat
        ));
        // Stop any ongoing speech when new response arrives
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          setSpeakingMessageId(null);
          setIsPaused(false);
        }
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error calling API:', error);

      // Fallback response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: t('chatbot.errorResponse') || 'Sorry, I encountered an error. Please try again.',
        type: 'assistant',
        timestamp: new Date()
      };

      setChats(prev => prev.map(chat =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, errorResponse] }
          : chat
      ));
    } finally {
      setIsRequestLoading(false); // Stop loading (both success and error cases)
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `${t('chatbot.newChatPrefix')} ${chats.length + 1}`,
      messages: [],
      isFavorite: false
    };
    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId && chats.length > 1) {
      setActiveChat(chats.find(chat => chat.id !== chatId)?.id || '');
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

    // Start new speech
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
    // Set voice if available
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

  const activeMessages = chats.find(chat => chat.id === activeChat)?.messages || [];

  // Auto-scroll to the latest message within the chat area only
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChat]);

  return (
    <div className="h-full flex min-h-0">
      <div className="flex h-full w-full min-h-0">
        {/* Chat History Sidebar */}
        <Card className="w-80 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('chatbot.history')}
              </CardTitle>
              <Button size="sm" onClick={createNewChat}>
                {t('chatbot.newChat')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 min-h-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      activeChat === chat.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{chat.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(chat.id);
                          }}
                        >
                          <Star className={`h-3 w-3 ${chat.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {chat.messages.length} {t('chatbot.messages')}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              {chats.find(chat => chat.id === activeChat)?.name || t('chatbot.selectChat')}
            </CardTitle>
          </CardHeader>
          <Separator />
          
          {/* Messages */}
          <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 pr-2">
                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg break-words ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                      {/* Enhanced content for assistant messages */}
                      {msg.type === 'assistant' && (
                        <>
                          {/* Pipeline info */}
                          {msg.pipeline_used && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <strong>Pipeline:</strong> {msg.pipeline_used} |
                              <strong>Data Source:</strong> {msg.data_source || 'cloud_db'}
                            </div>
                          )}

                          {/* Visualizations */}
                          {msg.visualizations && Object.keys(msg.visualizations).length > 0 && (
                            <div className="mt-3 space-y-2">
                              <h4 className="text-sm font-semibold">Visualizations:</h4>
                              {Object.entries(msg.visualizations).map(([key, imageUrl]) => (
                                <div key={key} className="border rounded p-2">
                                  <h5 className="text-xs font-medium mb-1 capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </h5>
                                  <img
                                    src={imageUrl}
                                    alt={key}
                                    className="max-w-full h-auto rounded"
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
                            <div className="mt-3 p-3 bg-muted/30 rounded">
                              <h4 className="text-sm font-semibold mb-2">Statistics:</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(msg.statistics).map(([key, value]: [string, any]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span className="font-mono">
                                      {typeof value === 'object' ? JSON.stringify(value) : value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Profiles */}
                          {msg.profiles && msg.profiles.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-semibold mb-2">ARGO Profiles ({msg.profiles.length}):</h4>
                              <ScrollArea className="max-h-40">
                                <div className="space-y-1">
                                  {msg.profiles.slice(0, 3).map((profile: any, idx: number) => (
                                    <div key={idx} className="p-2 bg-muted/20 rounded text-xs">
                                      <div className="flex justify-between">
                                        <span>Float {profile.float_id}</span>
                                        <span>{profile.latitude?.toFixed(2)}, {profile.longitude?.toFixed(2)}</span>
                                      </div>
                                      <div className="text-muted-foreground mt-1">
                                        Cycle {profile.cycle_number} • {new Date(profile.profile_date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ))}
                                  {msg.profiles.length > 3 && (
                                    <p className="text-xs text-muted-foreground text-center py-1">
                                      ... and {msg.profiles.length - 3} more profiles
                                    </p>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                          <div className="flex justify-end mt-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-6 w-6 ${speakingMessageId === msg.id ? 'text-red-500' : ''}`}
                              onClick={() => speakMessage(msg)}
                              title="Read aloud"
                            >
                              {speakingMessageId === msg.id ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </Button>
                          </div>
                        </>
                      )}

                      <p className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Loading indicator */}
                {isRequestLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg break-words bg-background border">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Analyzing ARGO data ...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <Separator />
          
          {/* Input */}
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('chatbot.placeholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={() => setIsListening(!isListening)}
                title={t('chatbot.voiceInput')}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage} title={t('chatbot.sendMessage')}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
