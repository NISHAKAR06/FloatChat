import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  MessageSquare,
  Send,
  Trash2,
  Star,
  Loader2,
  Volume2,
  VolumeX,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Bot,
  Menu,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Rectangle,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";
import { useIsMobile, useIsTablet, useDeviceType } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
  profiles?: any[];
  statistics?: any;
  visualizations?: { [key: string]: string };
  pipeline_used?: string;
  data_source?: string;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  isFavorite: boolean;
}

const Chatbot = () => {
  const { t, isLoading: isTranslationLoading } = useLanguage();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const deviceType = useDeviceType();

  // State declarations
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [isPaused, setIsPaused] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  // Mobile-specific state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);

  // Auto-collapse sidebar on mobile when chat is selected
  useEffect(() => {
    if (isMobile && activeChat && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [activeChat, isMobile, sidebarCollapsed]);

  // Set initial sidebar state based on device type
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  // Function to analyze chat content and generate meaningful names
  const analyzeAndRenameChat = (messages: Message[], chatId: string) => {
    if (messages.length < 2) return; // Need at least user message + AI response

    const allContent = messages
      .map((msg) => msg.content)
      .join(" ")
      .toLowerCase();

    // Define keywords and their corresponding chat names
    const topicKeywords = {
      temperature: "Temperature Analysis",
      salinity: "Salinity Study",
      oxygen: "Oxygen Levels",
      depth: "Depth Profiles",
      "indian ocean": "Indian Ocean Study",
      atlantic: "Atlantic Ocean",
      pacific: "Pacific Ocean",
      argo: "ARGO Float Data",
      float: "Float Analysis",
      seasonal: "Seasonal Variations",
      trend: "Trend Analysis",
      comparison: "Comparative Study",
      profile: "Profile Analysis",
      cycle: "Cycle Data",
      latitude: "Latitudinal Study",
      longitude: "Longitudinal Study",
      equator: "Equatorial Analysis",
      southern: "Southern Ocean",
      arabian: "Arabian Sea",
      bengal: "Bay of Bengal",
    };

    // Find the most relevant topic
    let bestMatch = "";
    let maxMatches = 0;

    for (const [keyword, name] of Object.entries(topicKeywords)) {
      const matches = (allContent.match(new RegExp(keyword, "g")) || []).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = name;
      }
    }

    // Generate name based on content analysis
    let newName = bestMatch;

    if (!newName) {
      // Fallback: analyze message content for common patterns
      if (allContent.includes("temperature") && allContent.includes("indian")) {
        newName = "Indian Ocean Temperature";
      } else if (
        allContent.includes("salinity") &&
        allContent.includes("comparison")
      ) {
        newName = "Salinity Comparison";
      } else if (
        allContent.includes("float") &&
        allContent.includes("location")
      ) {
        newName = "Float Locations";
      } else if (
        allContent.includes("trend") ||
        allContent.includes("variation")
      ) {
        newName = "Ocean Trends";
      } else if (
        allContent.includes("depth") ||
        allContent.includes("profile")
      ) {
        newName = "Depth Analysis";
      } else {
        // Generic naming based on message count and content
        const userMessages = messages.filter((msg) => msg.type === "user");
        if (userMessages.length > 0) {
          const firstUserMessage = userMessages[0].content.substring(0, 50);
          newName =
            firstUserMessage.length > 40
              ? firstUserMessage.substring(0, 40) + "..."
              : firstUserMessage;
        }
      }
    }

    // Update chat name if it's still generic
    if (newName && !newName.startsWith("Chat ")) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, name: newName } : chat
        )
      );
    }
  };

  // WebSocket connection management
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Django RAG endpoint for ARGO chat
  const handleHttpQuery = async (
    query: string,
    chatId?: string
  ): Promise<void> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
      const endpoint = `${API_BASE_URL}/chat/argo/query/`;

      console.log("🔗 Making HTTP request to Django endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
        }),
      });

      console.log("📡 HTTP Response received, status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HTTP Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("📦 Django Response data:", data);

      // Map Django response to WebSocket response format
      const simulatedData = {
        type: "response",
        message: data.answer || data.response || "Response not available",
        sources: [],
        profiles: data.data?.profiles_count > 0 ? [] : [], // Django doesn't provide individual profiles
        statistics: data.data?.stats || {},
        visualizations: data.visualizations || {},
        metadata: {
          pipeline_used: data.metadata?.pipeline || "rag_pipeline",
          data_source: data.metadata?.data_quality || "indian_ocean_db",
        },
      };

      console.log("🔄 Processed simulated data for frontend:", simulatedData);

      // Process the response as if it came from WebSocket
      processResponse(simulatedData, chatId);
    } catch (error) {
      console.error("❌ HTTP query error:", error);
      processResponse({
        type: "error",
        message: `HTTP request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  const processResponse = (data: any, chatId?: string) => {
    const targetChat = chatId || activeChat;
    if (data.type === "response") {
      console.log("Processing HTTP response message:", data.message);

      const aiResponse: Message = {
        id: Date.now().toString(),
        content: data.message,
        type: "assistant",
        timestamp: new Date(),
        profiles: data.profiles || [],
        statistics: data.statistics || {},
        visualizations: data.visualizations || {},
        pipeline_used: data.metadata?.pipeline_used || "http_fallback",
        data_source: data.metadata?.data_source || "indian_ocean_db",
      };

      setChats((prev) => {
        const updatedChats = prev.map((chat) =>
          chat.id === targetChat
            ? { ...chat, messages: [...chat.messages, aiResponse] }
            : chat
        );
        return updatedChats;
      });

      // Analyze and rename chat after AI response
      setTimeout(() => {
        const updatedChat = chats.find((chat) => chat.id === targetChat);
        if (updatedChat) {
          const newMessages = [...updatedChat.messages, aiResponse];
          analyzeAndRenameChat(newMessages, targetChat);
        }
      }, 100);
    } else if (data.type === "error") {
      const errorResponse: Message = {
        id: Date.now().toString(),
        content: `Error: ${data.message}`,
        type: "assistant",
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === targetChat
            ? { ...chat, messages: [...chat.messages, errorResponse] }
            : chat
        )
      );
    }

    setIsRequestLoading(false);
    setStreamingMessage("");
    setStreamingMessageId(null);
  };

  // Simplified connection - always simulate as connected for HTTP
  const connectWebSocket = () => {
    console.log("Using HTTP fallback mode");
    setIsConnected(true); // HTTP is always "connected"
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) {
      console.warn("Cannot send message: HTTP fallback not available");
      return;
    }

    // Determine the target chat and create it if needed
    let targetChatId = activeChat;

    if (!targetChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        name: `Chat ${chats.length + 1}`,
        messages: [],
        isFavorite: false,
      };

      // Update state synchronously
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
      targetChatId = newChat.id;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: "user",
      timestamp: new Date(),
    };

    // Add user message synchronously to the correct chat
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === targetChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    const currentMessage = message;
    const currentChatId = targetChatId; // Store the chat ID for the async operation

    setMessage("");
    setIsRequestLoading(true);
    console.log("🗣️ Sending message to chat:", currentChatId);

    try {
      // Use HTTP API instead of WebSocket, pass the chat ID for response processing
      await handleHttpQuery(currentMessage, currentChatId);
    } catch (error) {
      console.error("❌ Error sending message via HTTP:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm currently unable to connect to the chatbot service. Please ensure the Django backend is running and accessible.`,
        type: "assistant",
        timestamp: new Date(),
      };

      // Add error message to the correct chat
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );

      setIsRequestLoading(false);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      isFavorite: false,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChat === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setActiveChat(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const toggleFavorite = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isFavorite: !chat.isFavorite } : chat
      )
    );
  };

  const speakMessage = (msg: Message) => {
    if (msg.type !== "assistant") return;

    if (speechSynthesis.speaking) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPaused(false);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(msg.content);
    utterance.onstart = () => {
      setSpeakingMessageId(msg.id);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsPaused(false);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setIsPaused(false);
    };

    const voices = speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => voice.lang.startsWith("en")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    speechSynthesis.speak(utterance);
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const activeChatData = chats.find((chat) => chat.id === activeChat);
  const activeMessages = activeChatData?.messages || [];

  // Auto-scroll to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChat]);

  // Enhanced welcome screen with improved UI
  const WelcomeScreen = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            AI Ocean Analyst
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Explore ARGO float data with natural language queries
          </p>
        </div>

        {/* Indian Ocean Data Summary */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 mb-12 border border-blue-200/50 dark:border-blue-800/50 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Indian Ocean ARGO Data Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="group">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                    127
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active Floats
                  </div>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                    24.8°C
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Avg Temperature
                  </div>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    34.7 PSU
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Avg Salinity
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                Real-time data from 127 active ARGO floats monitoring the Indian
                Ocean basin
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Try these example queries:
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Click any prompt to start exploring ocean data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Show me temperature profiles in the Indian Ocean",
              "Compare salinity between Arabian Sea and Bay of Bengal",
              "Find ARGO floats near the equator in Indian Ocean",
              "What are the latest ocean temperature trends in Indian Ocean?",
              "Show me dissolved oxygen levels at 1000m depth in Indian Ocean",
              "Analyze seasonal variations in the Indian Ocean",
            ].map((prompt, index) => (
              <button
                key={index}
                className="group p-5 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                onClick={() => {
                  setMessage(prompt);
                  setTimeout(() => {
                    handleSendMessage();
                  }, 50);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 leading-relaxed">
                    {prompt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started Tip */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="text-2xl">💡</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Pro Tip
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ask me anything about ARGO float data, temperature profiles,
                salinity measurements, or oceanographic trends in the Indian
                Ocean and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div
        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 shadow-xl ${
          sidebarCollapsed
            ? isMobile
              ? "-translate-x-full"
              : "w-0 overflow-hidden"
            : "w-80"
        } ${isMobile ? "fixed left-0 top-0 h-full z-40" : ""}`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={createNewChat}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
            </div>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    activeChat === chat.id
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-700 shadow-lg"
                      : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block truncate">
                        {chat.name}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {chat.messages.length} messages
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(chat.id);
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            chat.isFavorite
                              ? "fill-current text-yellow-500"
                              : "text-slate-400"
                          }`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm min-w-0">
        {/* Top Bar - Only show when sidebar is collapsed */}
        {sidebarCollapsed && (
          <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                ARGO Float Data Chatbot
              </CardTitle>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        )}

        {/* Chat Header - Only show when sidebar is open */}
        {!sidebarCollapsed && (
          <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                ARGO Float Data Chatbot
              </CardTitle>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          {(() => {
            // Show welcome screen if no chat is active OR if active chat has no messages
            const shouldShowWelcome =
              !activeChat || (activeChatData && activeMessages.length === 0);

            if (shouldShowWelcome) {
              return (
                <ScrollArea className="h-full p-6">
                  <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                          <MessageSquare className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        AI Ocean Analyst
                      </h1>
                      <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                        Explore ARGO float data with natural language queries
                      </p>
                    </div>

                    {/* Indian Ocean Data Summary */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 mb-12 border border-blue-200/50 dark:border-blue-800/50 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          Indian Ocean ARGO Data Summary
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="group">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                                127
                              </div>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Active Floats
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="group">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                                24.8°C
                              </div>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Avg Temperature
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="group">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                34.7 PSU
                              </div>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Avg Salinity
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full backdrop-blur-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            Real-time data from 127 active ARGO floats
                            monitoring the Indian Ocean basin
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Prompts */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                          Try these example queries:
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Click any prompt to start exploring ocean data
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Show me temperature profiles in the Indian Ocean",
                          "Compare salinity between Arabian Sea and Bay of Bengal",
                          "Find ARGO floats near the equator in Indian Ocean",
                          "What are the latest ocean temperature trends in Indian Ocean?",
                          "Show me dissolved oxygen levels at 1000m depth in Indian Ocean",
                          "Analyze seasonal variations in the Indian Ocean",
                        ].map((prompt, index) => (
                          <button
                            key={index}
                            className="group p-5 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                            onClick={() => {
                              setMessage(prompt);
                              setTimeout(() => {
                                handleSendMessage();
                              }, 50);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 leading-relaxed">
                                {prompt}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Getting Started Tip */}
                    <div className="text-center mt-12">
                      <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                        <div className="text-2xl">💡</div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            Pro Tip
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Ask me anything about ARGO float data, temperature
                            profiles, salinity measurements, or oceanographic
                            trends in the Indian Ocean and beyond.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              );
            }

            return (
              <ScrollArea className="h-full p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {activeMessages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      } animate-in slide-in-from-bottom-4 duration-500 gap-3`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Bot avatar for assistant messages */}
                      {msg.type === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] group ${
                          msg.type === "user"
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl"
                        } rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        {/* Enhanced content for assistant messages */}
                        {msg.type === "assistant" && (
                          <>
                            {/* Pipeline info removed - cleaner user experience */}

                            {/* Enhanced Professional Visualizations */}
                            {msg.visualizations &&
                              Object.keys(msg.visualizations).length > 0 && (
                                <div className="mt-6 space-y-4">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                                    </div>
                                    <h4 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                                      Data Visualizations
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.entries(msg.visualizations).map(
                                      ([key, imageUrl]) => (
                                        <div
                                          key={key}
                                          className="group relative overflow-hidden"
                                        >
                                          <div className="bg-gradient-to-br from-white/90 via-white/80 to-slate-50/70 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-cyan-400/5 rounded-2xl"></div>
                                            <div className="relative z-10">
                                              <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                                                  {key.replace(/_/g, " ")}
                                                </h5>
                                                <div className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                                                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                    Scientific Plot
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="relative rounded-xl overflow-hidden shadow-lg bg-white/50 dark:bg-slate-900/50">
                                                <img
                                                  src={imageUrl}
                                                  alt={key}
                                                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                                  onError={(e) => {
                                                    console.warn(
                                                      `Failed to load visualization: ${key}`
                                                    );
                                                    e.currentTarget.style.display =
                                                      "none";
                                                  }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none"></div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Statistics with Professional Charts */}
                            {msg.statistics &&
                              Object.keys(msg.statistics).length > 0 && (
                                <div className="mt-6 p-6 bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40 dark:from-slate-800/80 dark:via-slate-900/60 dark:to-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl backdrop-blur-sm">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <h4 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                                      Data Analysis & Insights
                                    </h4>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Total Profiles Chart - Professional Design */}
                                    {msg.statistics.total_profiles && (
                                      <div className="group">
                                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                          <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                              Total ARGO Profiles
                                            </h5>
                                            <div className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                                              <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {msg.statistics.total_profiles.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="h-36">
                                            <ChartContainer
                                              config={{
                                                value: {
                                                  label: "Profiles",
                                                  color: "hsl(220, 70%, 50%)",
                                                },
                                              }}
                                              className="h-full w-full"
                                            >
                                              <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                              >
                                                <BarChart
                                                  data={[
                                                    {
                                                      name: "Total Profiles",
                                                      value:
                                                        msg.statistics
                                                          .total_profiles,
                                                    },
                                                  ]}
                                                  margin={{
                                                    top: 10,
                                                    right: 10,
                                                    left: 10,
                                                    bottom: 10,
                                                  }}
                                                >
                                                  <defs>
                                                    <linearGradient
                                                      id="profileGradient"
                                                      x1="0"
                                                      y1="0"
                                                      x2="0"
                                                      y2="1"
                                                    >
                                                      <stop
                                                        offset="0%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0.9}
                                                      />
                                                      <stop
                                                        offset="50%"
                                                        stopColor="#6366f1"
                                                        stopOpacity={0.7}
                                                      />
                                                      <stop
                                                        offset="100%"
                                                        stopColor="#8b5cf6"
                                                        stopOpacity={0.5}
                                                      />
                                                    </linearGradient>
                                                    <filter id="glow">
                                                      <feGaussianBlur
                                                        stdDeviation="3"
                                                        result="coloredBlur"
                                                      />
                                                      <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                      </feMerge>
                                                    </filter>
                                                  </defs>
                                                  <CartesianGrid
                                                    strokeDasharray="2 4"
                                                    stroke="rgba(148, 163, 184, 0.2)"
                                                    strokeWidth={1}
                                                  />
                                                  <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                      fontSize: 11,
                                                      fill: "rgb(100, 116, 139)",
                                                      fontWeight: 500,
                                                    }}
                                                    dy={10}
                                                  />
                                                  <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                      fontSize: 10,
                                                      fill: "rgb(100, 116, 139)",
                                                    }}
                                                    dx={-5}
                                                  />
                                                  <ChartTooltip
                                                    content={
                                                      <ChartTooltipContent />
                                                    }
                                                    cursor={{
                                                      fill: "rgba(59, 130, 246, 0.1)",
                                                    }}
                                                  />
                                                  <Bar
                                                    dataKey="value"
                                                    fill="url(#profileGradient)"
                                                    radius={[6, 6, 0, 0]}
                                                    stroke="rgba(59, 130, 246, 0.3)"
                                                    strokeWidth={1}
                                                    filter="url(#glow)"
                                                  />
                                                </BarChart>
                                              </ResponsiveContainer>
                                            </ChartContainer>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Enhanced Geographic Coverage with Professional World Map */}
                                    {msg.statistics.geographic_coverage && (
                                      <div className="group">
                                        <div className="bg-gradient-to-br from-white/90 via-white/80 to-slate-50/70 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-teal-400/5 to-cyan-400/5 rounded-2xl"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                                                Geographic Coverage
                                              </h5>
                                              <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                                                <span className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                  Indian Ocean
                                                </span>
                                              </div>
                                            </div>

                                            <div className="relative h-48 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60 overflow-hidden shadow-inner">
                                              {/* Professional World Map with Ocean Emphasis */}
                                              <div className="absolute inset-0">
                                                <svg
                                                  viewBox="0 0 1000 500"
                                                  className="w-full h-full"
                                                >
                                                  <defs>
                                                    <linearGradient
                                                      id="oceanGradient"
                                                      x1="0%"
                                                      y1="0%"
                                                      x2="100%"
                                                      y2="100%"
                                                    >
                                                      <stop
                                                        offset="0%"
                                                        stopColor="#0ea5e9"
                                                        stopOpacity={0.1}
                                                      />
                                                      <stop
                                                        offset="50%"
                                                        stopColor="#06b6d4"
                                                        stopOpacity={0.15}
                                                      />
                                                      <stop
                                                        offset="100%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0.1}
                                                      />
                                                    </linearGradient>
                                                    <pattern
                                                      id="gridPattern"
                                                      x="0"
                                                      y="0"
                                                      width="50"
                                                      height="50"
                                                      patternUnits="userSpaceOnUse"
                                                    >
                                                      <path
                                                        d="M 50 0 L 0 0 0 50"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="0.5"
                                                        opacity="0.1"
                                                      />
                                                    </pattern>
                                                  </defs>

                                                  {/* Ocean Background */}
                                                  <rect
                                                    width="100%"
                                                    height="100%"
                                                    fill="url(#oceanGradient)"
                                                  />

                                                  {/* Grid Lines */}
                                                  <rect
                                                    width="100%"
                                                    height="100%"
                                                    fill="url(#gridPattern)"
                                                  />

                                                  {/* Continental Outlines - Simplified */}
                                                  {/* Africa */}
                                                  <path
                                                    d="M 500 150 Q 520 120 540 150 Q 580 180 590 220 Q 580 280 540 320 Q 520 340 500 320 Q 480 280 480 220 Q 480 180 500 150 Z"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.3"
                                                  />

                                                  {/* Asia */}
                                                  <path
                                                    d="M 650 100 Q 700 90 750 120 Q 800 140 820 180 Q 800 200 750 190 Q 700 180 650 190 Q 620 160 650 100 Z"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.3"
                                                  />

                                                  {/* Australia */}
                                                  <path
                                                    d="M 750 350 Q 800 340 850 360 Q 870 380 850 400 Q 800 410 750 400 Q 730 380 750 350 Z"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    opacity="0.3"
                                                  />
                                                </svg>
                                              </div>

                                              {/* Indian Ocean Data Coverage Highlight */}
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                  {/* Pulsing Coverage Area */}
                                                  <div className="absolute w-32 h-24 bg-gradient-to-br from-emerald-400/30 via-teal-400/25 to-cyan-400/20 rounded-full animate-pulse blur-sm"></div>
                                                  <div className="absolute w-28 h-20 bg-gradient-to-br from-emerald-500/40 via-teal-500/30 to-cyan-500/25 rounded-full animate-pulse delay-75"></div>
                                                  <div className="absolute w-24 h-16 bg-gradient-to-br from-emerald-600/50 via-teal-600/40 to-cyan-600/30 rounded-full animate-pulse delay-150"></div>

                                                  {/* Data Points */}
                                                  <div className="absolute w-20 h-12 flex items-center justify-center">
                                                    {[...Array(12)].map(
                                                      (_, i) => (
                                                        <div
                                                          key={i}
                                                          className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping"
                                                          style={{
                                                            left: `${
                                                              Math.random() *
                                                              100
                                                            }%`,
                                                            top: `${
                                                              Math.random() *
                                                              100
                                                            }%`,
                                                            animationDelay: `${
                                                              i * 0.2
                                                            }s`,
                                                          }}
                                                        ></div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Coverage Legend and Coordinates */}
                                              <div className="absolute bottom-2 left-2 right-2">
                                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 shadow-lg">
                                                  <div className="flex items-center justify-between text-xs mb-2">
                                                    <div className="flex items-center gap-2">
                                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                      <span className="font-bold text-slate-700 dark:text-slate-300">
                                                        ARGO Coverage Area
                                                      </span>
                                                    </div>
                                                    <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                        {msg.statistics
                                                          .total_profiles ||
                                                          0}{" "}
                                                        Profiles
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Professional Coordinate Display */}
                                                  {msg.statistics
                                                    .geographic_coverage
                                                    ?.lat_range &&
                                                    msg.statistics
                                                      .geographic_coverage
                                                      ?.lon_range && (
                                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-2 border border-blue-200/30 dark:border-blue-700/30">
                                                          <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                                                            Latitude Range
                                                          </div>
                                                          <div className="font-mono text-slate-600 dark:text-slate-400">
                                                            {msg.statistics.geographic_coverage.lat_range
                                                              .map(
                                                                (n: number) =>
                                                                  n.toFixed(1)
                                                              )
                                                              .join("° to ")}
                                                            °
                                                          </div>
                                                        </div>
                                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-2 border border-emerald-200/30 dark:border-emerald-700/30">
                                                          <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                                            Longitude Range
                                                          </div>
                                                          <div className="font-mono text-slate-600 dark:text-slate-400">
                                                            {msg.statistics.geographic_coverage.lon_range
                                                              .map(
                                                                (n: number) =>
                                                                  n.toFixed(1)
                                                              )
                                                              .join("° to ")}
                                                            °
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                              </div>

                                              {/* Coverage Area with Enhanced Styling */}
                                              {(() => {
                                                const coverage =
                                                  msg.statistics
                                                    .geographic_coverage;
                                                if (
                                                  coverage?.lat_range &&
                                                  coverage?.lon_range
                                                ) {
                                                  const [minLat, maxLat] =
                                                    coverage.lat_range;
                                                  const [minLon, maxLon] =
                                                    coverage.lon_range;
                                                  const centerLat =
                                                    (minLat + maxLat) / 2;
                                                  const centerLon =
                                                    (minLon + maxLon) / 2;
                                                  const latRange =
                                                    maxLat - minLat;
                                                  const lonRange =
                                                    maxLon - minLon;

                                                  const leftPos =
                                                    25 +
                                                    ((centerLon + 180) * 50) /
                                                      360;
                                                  const topPos =
                                                    25 +
                                                    ((90 - centerLat) * 50) /
                                                      180;
                                                  const width = Math.max(
                                                    Math.min(
                                                      ((lonRange * 50) / 360) *
                                                        100,
                                                      50
                                                    ),
                                                    15
                                                  );
                                                  const height = Math.max(
                                                    Math.min(
                                                      ((latRange * 50) / 180) *
                                                        100,
                                                      50
                                                    ),
                                                    15
                                                  );

                                                  return (
                                                    <div className="absolute animate-pulse">
                                                      <div
                                                        className="absolute bg-gradient-to-br from-emerald-400/70 via-teal-400/60 to-cyan-400/50 border-2 border-emerald-300/80 rounded-lg shadow-2xl backdrop-blur-sm"
                                                        style={{
                                                          left: `${leftPos}%`,
                                                          top: `${topPos}%`,
                                                          width: `${width}%`,
                                                          height: `${height}%`,
                                                          transform:
                                                            "translate(-50%, -50%)",
                                                          boxShadow:
                                                            "0 0 20px rgba(16, 185, 129, 0.3)",
                                                        }}
                                                      >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
                                                      </div>
                                                      {[...Array(4)].map(
                                                        (_, i) => (
                                                          <div
                                                            key={i}
                                                            className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping shadow-lg shadow-emerald-400/50"
                                                            style={{
                                                              animationDelay: `${
                                                                i * 0.5
                                                              }s`,
                                                            }}
                                                          ></div>
                                                        )
                                                      )}
                                                    </div>
                                                  );
                                                }
                                                return null;
                                              })()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Additional Statistics - Professional Cards */}
                                    {Object.entries(msg.statistics)
                                      .filter(
                                        ([key]) =>
                                          key !== "total_profiles" &&
                                          key !== "geographic_coverage"
                                      )
                                      .map(
                                        (
                                          [key, value]: [string, any],
                                          index: number
                                        ) => (
                                          <div
                                            key={key}
                                            className="group lg:col-span-2"
                                          >
                                            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                  <div
                                                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                                      index % 3 === 0
                                                        ? "from-orange-400 to-red-400"
                                                        : index % 3 === 1
                                                        ? "from-pink-400 to-purple-400"
                                                        : "from-cyan-400 to-blue-400"
                                                    } shadow-sm`}
                                                  ></div>
                                                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm capitalize">
                                                    {key.replace(/_/g, " ")}
                                                  </span>
                                                </div>
                                                <div
                                                  className={`px-3 py-1 rounded-full border ${
                                                    index % 3 === 0
                                                      ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700"
                                                      : index % 3 === 1
                                                      ? "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700"
                                                      : "bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700"
                                                  }`}
                                                >
                                                  <span
                                                    className={`text-sm font-bold ${
                                                      index % 3 === 0
                                                        ? "text-orange-700 dark:text-orange-300"
                                                        : index % 3 === 1
                                                        ? "text-pink-700 dark:text-pink-300"
                                                        : "text-cyan-700 dark:text-cyan-300"
                                                    }`}
                                                  >
                                                    {typeof value === "object"
                                                      ? JSON.stringify(value)
                                                      : value}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                  </div>

                                  {/* Professional Data Summary Card */}
                                  <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
                                      Analysis Summary
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          Data Points:{" "}
                                        </span>
                                        <span className="font-bold">
                                          {msg.statistics.total_profiles?.toLocaleString() ||
                                            "N/A"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          Region:{" "}
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                          Indian Ocean
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          Quality:{" "}
                                        </span>
                                        <span className="font-bold text-green-600">
                                          Verified
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          Source:{" "}
                                        </span>
                                        <span className="font-bold text-blue-600">
                                          ARGO Floats
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Profiles */}
                            {msg.profiles && msg.profiles.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  ARGO Profiles ({msg.profiles.length})
                                </h4>
                                <ScrollArea className="max-h-48">
                                  <div className="space-y-2">
                                    {msg.profiles
                                      .slice(0, 3)
                                      .map((profile: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="p-3 bg-slate-100/30 dark:bg-slate-700/30 rounded-lg border border-slate-200/30 dark:border-slate-600/30"
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                              Float {profile.float_id}
                                            </span>
                                            <span className="text-xs text-slate-600 dark:text-slate-400">
                                              {profile.latitude?.toFixed(2)},{" "}
                                              {profile.longitude?.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Cycle {profile.cycle_number} •{" "}
                                            {new Date(
                                              profile.profile_date
                                            ).toLocaleDateString()}
                                          </div>
                                        </div>
                                      ))}
                                    {msg.profiles.length > 3 && (
                                      <p className="text-xs text-center py-2 text-slate-500 dark:text-slate-400 bg-slate-100/20 dark:bg-slate-700/20 rounded-lg">
                                        ... and {msg.profiles.length - 3} more
                                        profiles
                                      </p>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}

                            <div className="flex justify-end mt-4">
                              <Button
                                size="icon"
                                variant="ghost"
                                className={`h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                                  speakingMessageId === msg.id
                                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                    : ""
                                }`}
                                onClick={() => speakMessage(msg)}
                                title="Read aloud"
                              >
                                {speakingMessageId === msg.id ? (
                                  <VolumeX className="h-4 w-4" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </>
                        )}

                        <p
                          className={`text-xs mt-3 ${
                            msg.type === "user"
                              ? "text-white/70"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isRequestLoading && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-500">
                      <div className="max-w-[80%] p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Analyzing ARGO data...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            );
          })()}
        </div>

        {/* Input Area */}
        <div
          className={`border-t border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm ${
            isMobile ? "p-4" : "p-6"
          }`}
        >
          <div className={`mx-auto ${isMobile ? "max-w-full" : "max-w-4xl"}`}>
            <div
              className={`flex gap-4 items-end ${
                isMobile ? "flex-col space-y-3" : ""
              }`}
            >
              <div className="flex-1 relative w-full">
                <Input
                  id="chatbot-message-input"
                  name="chatbot-message-input"
                  placeholder={
                    isMobile
                      ? "Ask about ocean data..."
                      : "Ask anything about ARGO ocean data..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                    isMobile
                      ? "py-4 pr-12 text-base min-h-[48px]" // Larger touch targets for mobile
                      : "py-3 pr-12"
                  }`}
                />
                {!isMobile && (
                  <div className="absolute right-3 bottom-3 text-xs text-slate-400">
                    Press Enter to send
                  </div>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMobile
                    ? "w-full py-4 text-base min-h-[48px] rounded-xl" // Full width and larger on mobile
                    : "px-6 py-3 rounded-xl"
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar - Hidden for chatbot page */}
      {/* Bottom navigation removed for mobile chatbot interface as requested */}
    </div>
  );
};

export default Chatbot;
