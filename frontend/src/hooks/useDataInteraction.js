import React from 'react';

export const useVoiceInput = (onTranscript) => {
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState(null);
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript?.(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        setError('Error starting speech recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    error,
    startListening,
    stopListening,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  };
};

export const useDataExport = () => {
  const exportToCSV = (data, filename = 'export.csv') => {
    if (!data) return;

    let csvContent = '';

    // Handle array of objects
    if (Array.isArray(data) && data.length > 0) {
      // Headers
      const headers = Object.keys(data[0]);
      csvContent += headers.join(',') + '\n';

      // Rows
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
      });
    }
    // Handle object with arrays (e.g., time series data)
    else if (typeof data === 'object') {
      const keys = Object.keys(data);
      const length = Math.max(...keys.map(key => data[key].length));

      // Headers
      csvContent += keys.join(',') + '\n';

      // Rows
      for (let i = 0; i < length; i++) {
        const values = keys.map(key => {
          const value = data[key][i];
          return value !== undefined ? value : '';
        });
        csvContent += values.join(',') + '\n';
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToNetCDF = async (data, filename = 'export.nc') => {
    // This is a mock function - actual NetCDF export would require a backend service
    console.warn('NetCDF export requires backend implementation');
    // In real implementation, you would:
    // 1. Send data to backend
    // 2. Backend converts to NetCDF
    // 3. Backend sends file back
    // 4. Frontend triggers download
  };

  const exportToJSON = (data, filename = 'export.json') => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exportToCSV,
    exportToNetCDF,
    exportToJSON
  };
};