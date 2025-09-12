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
    setVoiceInputActive(!isVoiceInputActive);
    toast({
      title: isVoiceInputActive ? "Voice input stopped" : "Voice input started",
      description: isVoiceInputActive ? "Processing your voice input..." : "Speak now to ask your question",
    });

    if (!isVoiceInputActive) {
      // Mock voice input - replace with actual voice recognition
      setTimeout(() => {
        setInput("Show me the latest temperature data for the Atlantic Ocean");
        setVoiceInputActive(false);
      }, 2000);
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
          className="pr-10 border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-700 dark:text-slate-200"
        />
        <motion.div
          animate={isVoiceInputActive ? { scale: 1.2 } : { scale: 1 }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
              isVoiceInputActive ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      <Button
        type="submit"
        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white"
        disabled={!input.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;