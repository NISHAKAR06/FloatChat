import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isOpen: false,
      isLoading: false,
      error: null,
      currentSuggestions: [],
      isDarkMode: false,
      isVoiceInputActive: false,

      // Message Actions
      addMessage: (message) => 
        set((state) => ({
          messages: [...state.messages, { ...message, id: Date.now() }],
        })),

      clearMessages: () => set({ messages: [] }),

      // UI Actions
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setVoiceInputActive: (isActive) => set({ isVoiceInputActive: isActive }),
      setSuggestions: (suggestions) => set({ currentSuggestions: suggestions }),

      // Async Message Handler with Loading State
      sendMessage: async (content) => {
        const addMessage = get().addMessage;
        const setLoading = get().setLoading;
        const setError = get().setError;
        
        try {
          setLoading(true);
          setError(null);
          
          // Add user message immediately
          addMessage({
            type: 'user',
            content,
            timestamp: new Date(),
          });

          // Simulate AI response (replace with actual API call)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
          
          addMessage({
            type: 'assistant',
            content: response.content,
            timestamp: new Date(),
            suggestions: response.suggestions
          });
          
        } catch (error) {
          setError('Failed to send message. Please try again.');
          console.error('Chat error:', error);
        } finally {
          setLoading(false);
        }
      },

      // Initialize chat with welcome message if empty
      initializeChat: () => {
        const state = get();
        if (state.messages.length === 0) {
          state.addMessage({
            type: 'assistant',
            content: "Hello! I'm your AI ocean data assistant. I can help you explore datasets, create visualizations, and answer questions about oceanographic data. What would you like to know?",
            timestamp: new Date(),
            suggestions: [
              "Show me temperature data for the Gulf Stream",
              "Create a chart of salinity changes",
              "Find anomalies in current data",
              "Export recent measurements"
            ]
          });
        }
      },
    }),
    {
      name: 'chat-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useChatStore;