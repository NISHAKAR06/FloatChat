import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  BarChart3, 
  Map, 
  FileText,
  Sparkles,
  Bot
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI ocean data assistant. I can help you explore datasets, create visualizations, and answer questions about oceanographic data. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Show me temperature data for the Gulf Stream",
        "Create a chart of salinity changes",
        "Find anomalies in current data",
        "Export recent measurements"
      ]
    }
  ]);

  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Mock AI response
    setTimeout(() => {
      const responses = [
        {
          content: "I found 15 temperature datasets for the Gulf Stream region. The average temperature has increased by 0.8°C over the last month. Would you like me to create a visualization?",
          suggestions: ["Create temperature chart", "Show detailed data", "Compare with historical", "Export as CSV"]
        },
        {
          content: "Here's what I found about current patterns in that region. The data shows unusual velocity changes that might indicate a seasonal shift. Let me generate a map for you.",
          suggestions: ["View on map", "Get more details", "Set up alert", "Compare regions"]
        },
        {
          content: "I've analyzed the salinity data and found some interesting patterns. There's a 0.3 PSU decrease in the northern regions. This could be related to recent precipitation patterns.",
          suggestions: ["Show salinity map", "Historical comparison", "Related datasets", "Create report"]
        }
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Voice input stopped" : "Voice input started",
      description: isListening ? "Processing your voice input..." : "Speak now to ask your question",
    });

    if (!isListening) {
      // Mock voice input
      setTimeout(() => {
        setMessage("Show me the latest temperature data for the Atlantic Ocean");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
  };

  const quickTemplates = [
    { icon: <BarChart3 className="h-4 w-4" />, label: "Temperature Analysis", query: "Analyze temperature trends in the Pacific Ocean" },
    { icon: <Map className="h-4 w-4" />, label: "Current Mapping", query: "Show current patterns in the Atlantic" },
    { icon: <FileText className="h-4 w-4" />, label: "Data Export", query: "Export salinity data for the last month" },
    { icon: <Sparkles className="h-4 w-4" />, label: "Anomaly Detection", query: "Find unusual patterns in recent data" }
  ];

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
          onClick={() => setIsOpen(true)}
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
                    onClick={() => setIsOpen(false)}
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
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          {msg.suggestions && (
                            <div className="mt-3 space-y-1">
                              {msg.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="w-full justify-start text-xs bg-white/20 hover:bg-white/30 text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 dark:bg-slate-600/50 dark:hover:bg-slate-600"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Quick Templates */}
                <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-700/50">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickTemplates.map((template, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(template.query)}
                        className="justify-start text-xs hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400 dark:text-slate-400"
                      >
                        {template.icon}
                        <span className="ml-1 truncate">{template.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about ocean data..."
                        className="pr-10 border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-700 dark:text-slate-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVoiceInput}
                        className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                          isListening ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
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