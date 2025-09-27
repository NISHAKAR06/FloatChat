import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Mic, Send, Trash2, Edit2, Star } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  isFavorite: boolean;
}

const Chatbot = () => {
  const { t } = useLanguage();
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'ARGO Float Analysis',
      messages: [
        { id: '1-1', content: 'Show me temperature data for floats in the Pacific Ocean', type: 'user', timestamp: new Date() },
        { id: '1-2', content: 'I found 15 active ARGO floats in the Pacific Ocean. Here\'s the temperature analysis...', type: 'assistant', timestamp: new Date() }
      ],
      isFavorite: true
    }
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    ));
    
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m analyzing the ARGO float data for your query. Here are the key insights...',
        type: 'assistant',
        timestamp: new Date()
      };
      
      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, aiResponse] }
          : chat
      ));
    }, 1000);
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
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

  const activeMessages = chats.find(chat => chat.id === activeChat)?.messages || [];

  return (
    <div className="h-full flex">
      <div className="flex h-full w-full">
        {/* Chat History Sidebar */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat History
              </CardTitle>
              <Button size="sm" onClick={createNewChat}>
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
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
                      {chat.messages.length} messages
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              {chats.find(chat => chat.id === activeChat)?.name || 'Select a chat'}
            </CardTitle>
          </CardHeader>
          <Separator />
          
          {/* Messages */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

          <Separator />
          
          {/* Input */}
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about ARGO float data..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={() => setIsListening(!isListening)}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage}>
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
