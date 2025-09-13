import React, { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Volume2, Square } from 'lucide-react';

const ChatMessage = ({ message, onSuggestionClick }) => {
  const isUser = message.type === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState(null);

  // Initialize voices
  const [voices, setVoices] = useState([]);

  React.useEffect(() => {
    // Load voices and update when they change
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechUtterance(null);
    } else {
      // Start speaking
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to find the best voice for the assistant
      if (voices.length > 0) {
        // Priority order: Microsoft Zira > Any female en-US voice > Any English voice
        const preferredVoice = voices.find(
          voice => voice.name === 'Microsoft Zira Desktop'
        ) || voices.find(
          voice => voice.name.includes('female') && voice.lang.startsWith('en')
        ) || voices.find(
          voice => voice.lang.startsWith('en')
        ) || voices[0];
        
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeechUtterance(null);
      };

      setSpeechUtterance(utterance);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  React.useEffect(() => {
    return () => {
      // Cleanup: stop speaking when component unmounts
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] p-3 rounded-lg shadow-sm',
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white dark:from-cyan-600/90 dark:to-blue-700/90'
            : 'bg-slate-100/90 hover:bg-slate-100 dark:bg-slate-700/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.suggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 space-y-1"
          >
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className={cn(
                  "w-full justify-start text-xs font-medium transition-all",
                  isUser
                    ? "bg-white/20 hover:bg-white/30 hover:shadow-sm text-white"
                    : "bg-white/60 hover:bg-white/80 dark:bg-slate-600/60 dark:hover:bg-slate-600/80 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:shadow-sm"
                )}
              >
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}
        <div className="flex items-center justify-between mt-2 border-t border-slate-200/20 dark:border-slate-700/20 pt-2">
          <span className="text-xs opacity-50">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {!isUser && ( // Only show speak button for assistant messages
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSpeak}
              className="h-6 w-6 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              title={isSpeaking ? "Stop speaking" : "Listen to assistant's message"}
            >
              {isSpeaking ? (
                <Square className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;