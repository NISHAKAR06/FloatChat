import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const ChatMessage = ({ message, onSuggestionClick }) => {
  const isUser = message.type === 'user';

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
          'max-w-[80%] p-3 rounded-lg',
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
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
                  "w-full justify-start text-xs",
                  isUser
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-white/50 dark:bg-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                )}
              >
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}
        <div className="mt-1 text-xs opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;