import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import useChatStore from '../store/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickTemplates from './QuickTemplates';
import LoadingIndicator from './LoadingIndicator';
import { useToast } from '../hooks/use-toast';

const FloatingChatButton = () => {
  const { 
    isOpen, 
    toggleChat, 
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
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Button
          onClick={() => toggleChat()}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        
        {/* Notification Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <Badge className="bg-orange-500 text-white h-6 w-6 p-0 flex items-center justify-center">
            <Sparkles className="h-3 w-3" />
          </Badge>
        </motion.div>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px]"
          >
            <Card className="h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
              <CardHeader className="border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-lg">Ocean AI Assistant</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleChat()}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-cyan-100">Online & Ready</span>
                </div>
              </CardHeader>

              <CardContent className="p-0 h-[calc(100%-140px)] flex flex-col bg-white dark:bg-slate-800">
                {error && (
                  <Alert variant="destructive" className="m-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Messages */}
                <ScrollArea ref={scrollRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onSuggestionClick={(suggestion) => sendMessage(suggestion)}
                      />
                    ))}
                    {isLoading && <LoadingIndicator />}
                  </div>
                </ScrollArea>

                {/* Quick Templates */}
                <QuickTemplates
                  onTemplateSelect={sendMessage}
                  className="p-3 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-700/50"
                />

                {/* Input */}
                <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <ChatInput onSubmit={sendMessage} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButton;