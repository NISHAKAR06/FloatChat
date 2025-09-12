import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

const AlertProvider = ({ error }) => {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Alert variant="destructive" className="m-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertProvider;