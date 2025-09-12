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
    initializeChat
  } = useChatStore();
  
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Chat Panel */}
              <div className="lg:col-span-3">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                      <Bot className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                      Conversation
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        <Download className="h-4 w-4" />
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
                    <div ref={scrollRef} className="h-[500px] overflow-y-auto mb-4">
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

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickTemplates
                      onTemplateSelect={sendMessage}
                      variant="vertical"
                      className="space-y-2"
                    />
                  </CardContent>
                </Card>

                {/* Chat Statistics */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Messages:</span>
                      <Badge variant="secondary">{messages.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Response Time:</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        ~2s
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ChatAssistant;