import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mic, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { motion } from 'framer-motion';
import useChatStore from '../store/chatStore';

const ChatInput = ({ onSubmit }) => {
  const [input, setInput] = React.useState('');
  const { isVoiceInputActive, setVoiceInputActive } = useChatStore();
  const { toast } = useToast();
  const inputRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  const handleVoiceInput = () => {
    if (!isVoiceInputActive) {
      // Start voice recognition
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceInputActive(true);
        toast({
          title: "Voice input started",
          description: "Speak now to ask your question",
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast({
          title: "Voice input received",
          description: "Your question was captured successfully",
        });
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice input error",
          description: "There was an error with voice recognition. Please try again.",
          variant: "destructive",
        });
        setVoiceInputActive(false);
      };

      recognition.onend = () => {
        setVoiceInputActive(false);
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast({
          title: "Voice input error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive",
        });
        setVoiceInputActive(false);
      }
    } else {
      // Stop voice recognition
      setVoiceInputActive(false);
      toast({
        title: "Voice input stopped",
        description: "Voice input has been cancelled",
      });
    }
  };

  // Focus input when voice input is activated
  React.useEffect(() => {
    if (isVoiceInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVoiceInputActive]);

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about ocean data..."
          className="pr-10 bg-white/95 dark:bg-slate-700/95 border-slate-200/60 hover:border-cyan-300 focus:border-cyan-400 dark:border-slate-600/60 dark:hover:border-cyan-600 dark:focus:border-cyan-500 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
        />
        <motion.div
          animate={isVoiceInputActive ? { scale: 1.2 } : { scale: 1 }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 ${
              isVoiceInputActive ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      <Button
        type="submit"
        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white hover:shadow-md dark:from-cyan-600/90 dark:to-blue-700/90 dark:hover:from-cyan-700/90 dark:hover:to-blue-800/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        disabled={!input.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;