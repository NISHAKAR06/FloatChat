import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, useEffect } from 'react';
import {
  Globe,
  Moon,
  Sun,
  Monitor,
  Settings,
  LogOut,
  User,
  Waves,
  MessageCircle,
  Send,
  Bot,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import UserSidebar from './UserSidebar';

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'bot', message: string}>>([
    { type: 'bot', message: 'Hello! I can help you analyze ARGO float data. Ask questions about temperature, salinity, or ocean regions!' }
  ]);

  // Refs for auto-scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Auto-scroll when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isChatOpen]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);

    // Mock AI response
    setTimeout(() => {
      const response = 'I found relevant ARGO float data for your query. Here\'s what I discovered about oceanographic patterns.';
      setChatHistory(prev => [...prev, { type: 'bot', message: response }]);
    }, 1000);

    setChatMessage('');
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-screen bg-gradient-surface flex overflow-hidden">
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset className="flex flex-col h-full">
          <header className={`flex shrink-0 items-center justify-between gap-4 border-b bg-glass backdrop-blur-md ${
            isMobile ? 'h-14 px-3' : 'h-16 px-4'
          }`}>
            {/* Left section: Sidebar trigger and logo */}
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Waves className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
                <span className={`font-bold bg-gradient-ocean bg-clip-text text-transparent ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  FloatChat
                </span>
              </div>
            </div>

            {/* Right section: Action buttons */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                    <Globe className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                    {!isMobile && <span className="ml-2 hidden sm:inline">{language.toUpperCase()}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`${language === lang.code ? 'bg-primary/20 text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300'}`}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                    {getThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTheme('light')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Sun className="h-4 w-4 mr-2" />
                    {t('settings.light')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Moon className="h-4 w-4 mr-2" />
                    {t('settings.dark')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Monitor className="h-4 w-4 mr-2" />
                    {t('settings.system')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                    <User className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('navigation.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    // Clear any stored authentication data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.clear();

                    // Redirect to login page
                    navigate('/login');
                  }} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navigation.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className={`h-full ${isMobile ? 'p-3' : 'p-4'}`}>
              {children}
            </div>
          </div>
        </SidebarInset>

        {/* Floating Chatbot Button - Only show on non-chatbot pages */}
        {location.pathname !== '/chatbot' && (
          <>
            <Button
              onClick={() => setIsChatOpen(true)}
              className={`fixed shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 hover-ocean-glow ocean-ripple ${
                isMobile
                  ? 'bottom-4 right-4 h-12 w-12 rounded-full'
                  : 'bottom-6 right-6 h-14 w-14 rounded-full'
              }`}
              size="sm"
            >
              <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
            </Button>

            {/* Background Overlay */}
            {isChatOpen && (
              <div
                className="fixed inset-0 bg-white/60 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setIsChatOpen(false)}
              />
            )}

            {/* Chatbot Side Panel */}
            <div className={`fixed top-1/2 bg-blue-500/20 dark:bg-blue-400/30 backdrop-blur-xl border border-blue-300/40 dark:border-blue-200/50 shadow-2xl z-50 transform transition-all duration-300 ease-in-out -translate-y-1/2 overflow-hidden flex flex-col ${
              isChatOpen ? 'translate-x-0' : 'translate-x-full'
            } ${
              isMobile
                ? 'right-0 h-[calc(100vh-6rem)] w-full max-w-[95vw] rounded-l-lg'
                : 'right-0 h-[calc(100vh-8rem)] w-80 sm:w-96 lg:w-[28rem] xl:w-[32rem] max-w-[90vw] rounded-l-lg sm:rounded-l-xl'
            }`}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Ocean Analyst</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-4 w-full pr-2">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg break-words ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-blue-300/40 dark:border-blue-200/50">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      id="chatbot-input"
                      name="chatbot-input"
                      placeholder="Ask about ocean data..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!chatMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </SidebarProvider>
    </div>
  );
};

export default UserDashboardLayout;
