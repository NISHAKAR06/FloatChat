import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Bot, Settings, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import useChatStore from '../store/chatStore';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import QuickTemplates from '../components/QuickTemplates';
import LoadingIndicator from '../components/LoadingIndicator';
import useSidebarStore from '../store/sidebarStore';

const ChatAssistant = () => {
  const { collapsed } = useSidebarStore();
  const { 
    messages, 
    sendMessage,
    isLoading,
    error,
    initializeChat,
    clearCurrentChat
  } = useChatStore();

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the current chat?')) {
      clearCurrentChat();
    }
  };
  
  const handleDownloadChat = () => {
    // Create chat transcript
    const transcript = messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}\n`;
    }).join('\n');

    // Create download
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `chat-transcript-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  const scrollRef = React.useRef(null);

  // Initialize chat if needed
  React.useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <Bot className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mr-3" />
                Chat Assistant
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Interact with ocean data through natural conversation
              </p>
            </div>

            {/* Chat Interface */}
            <div className="w-full max-w-5xl mx-auto">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/95 dark:hover:bg-slate-800/95 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Bot className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                    Conversation
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-200/60 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-600/60 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300 transition-colors"
                      onClick={handleClearChat}
                      title="Clear current chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-colors"
                      onClick={handleDownloadChat}
                      title="Download chat transcript"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-600/60 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Messages Area */}
                  <div ref={scrollRef} className="h-[600px] overflow-y-auto mb-4">
                    <div className="space-y-4 p-4">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          onSuggestionClick={(suggestion) => sendMessage(suggestion)}
                        />
                      ))}
                      {isLoading && <LoadingIndicator />}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
                    <ChatInput 
                      onSubmit={sendMessage}
                      placeholder="Ask about ocean data..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ChatAssistant;