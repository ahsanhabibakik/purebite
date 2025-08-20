"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  Brain,
  TrendingUp,
  Star,
  Filter,
  X,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  ShoppingCart,
  Eye,
  Wand2,
  Robot,
  MessageSquare,
  Lightbulb,
  Target,
  Clock,
  MapPin,
  Tag,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FloatingActionButton, 
  AnimatedBadge, 
  LoadingDots,
  AnimatedNotification 
} from "@/components/animations/InteractiveAnimations";

interface VoiceSearchResult {
  transcript: string;
  confidence: number;
  suggestions: string[];
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  inStock: boolean;
  discount?: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  products: Product[];
  reason: string;
  confidence: number;
  type: "trending" | "personal" | "seasonal" | "similar" | "bundle";
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  products?: Product[];
}

export function VoiceSearchAndAI() {
  const t = useTranslations("search");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceResults, setVoiceResults] = useState<VoiceSearchResult | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({ show: false, type: "info", title: "", message: "" });

  const recognitionRef = useRef<any>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  // Mock data for AI recommendations
  const mockRecommendations: AIRecommendation[] = [
    {
      id: "rec-1",
      title: "আপনার জন্য বিশেষ নির্বাচন",
      description: "আপনার পূর্বের কেনাকাটার ভিত্তিতে এই পণ্যগুলো পছন্দ হতে পারে",
      products: [
        {
          id: "p1",
          name: "জৈব কাঁচা আম",
          price: 280,
          originalPrice: 320,
          image: "/api/placeholder/200/200",
          rating: 4.8,
          reviewCount: 124,
          category: "ফল",
          tags: ["জৈব", "তাজা", "মৌসুমী"],
          inStock: true,
          discount: 12
        },
        {
          id: "p2", 
          name: "দেশি মধু",
          price: 650,
          image: "/api/placeholder/200/200",
          rating: 4.9,
          reviewCount: 89,
          category: "মধু",
          tags: ["খাঁটি", "প্রাকৃতিক"],
          inStock: true
        }
      ],
      reason: "আপনি সাধারণত জৈব এবং প্রাকৃতিক পণ্য পছন্দ করেন",
      confidence: 92,
      type: "personal"
    },
    {
      id: "rec-2",
      title: "এই মাসের জনপ্রিয় পণ্য",
      description: "অন্যান্য ক্রেতারা যা সবচেয়ে বেশি কিনছেন",
      products: [
        {
          id: "p3",
          name: "তাজা মাছ - রুই",
          price: 420,
          image: "/api/placeholder/200/200",
          rating: 4.6,
          reviewCount: 156,
          category: "মাছ",
          tags: ["তাজা", "নদীর"],
          inStock: true
        }
      ],
      reason: "গত সপ্তাহে ৮৫% বৃদ্ধি পেয়েছে",
      confidence: 87,
      type: "trending"
    }
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'bn-BD';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        setTranscript(transcript);
        setIsProcessing(true);
        
        // Simulate AI processing
        setTimeout(() => {
          setVoiceResults({
            transcript,
            confidence,
            suggestions: [
              transcript + " জৈব",
              transcript + " তাজা",
              transcript + " সেরা দাম",
            ],
            products: mockRecommendations[0].products.slice(0, 2)
          });
          setIsProcessing(false);
          
          setNotification({
            show: true,
            type: "success",
            title: "ভয়েস সার্চ সফল!",
            message: `"${transcript}" এর জন্য ${mockRecommendations[0].products.length}টি পণ্য পাওয়া গেছে`
          });
        }, 2000);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setIsProcessing(false);
        setNotification({
          show: true,
          type: "error",
          title: "ভয়েস সার্চ ব্যর্থ",
          message: "দয়া করে আবার চেষ্টা করুন"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    speechSynthesis.current = window.speechSynthesis;

    // Load AI recommendations
    setAIRecommendations(mockRecommendations);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setVoiceResults(null);
      recognitionRef.current.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if (speechSynthesis.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      speechSynthesis.current.speak(utterance);
    }
  };

  const handleAiChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: "ai",
        content: `আমি "${chatInput}" সম্পর্কে আপনাকে সাহায্য করতে পারি। আমাদের কাছে বেশ কিছু ভালো অপশন রয়েছে।`,
        timestamp: new Date().toISOString(),
        products: mockRecommendations[0].products.slice(0, 2)
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Voice Search Interface */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">ভয়েস সার্চ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                মাইক্রোফোনে বলুন কী খুঁজছেন
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FloatingActionButton
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                variant={isListening ? "danger" : "primary"}
                size="lg"
                className={`${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </FloatingActionButton>
            </motion.div>

            <div className="flex-1">
              <Input
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="অথবা এখানে টাইপ করুন..."
                className="text-lg"
                disabled={isListening}
              />
            </div>

            <Button
              onClick={() => speakText(transcript)}
              variant="outline"
              size="sm"
              disabled={!transcript}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice Status */}
          <AnimatePresence>
            {(isListening || isProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {isListening ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1 bg-blue-500 rounded-full"
                          animate={{
                            height: [8, 20, 8],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-blue-600 font-medium">শুনছি...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingDots />
                    <span className="text-purple-600 font-medium">প্রসেসিং...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Results */}
          <AnimatePresence>
            {voiceResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">সার্চ রেজাল্ট</h4>
                    <AnimatedBadge variant="success">
                      {Math.round(voiceResults.confidence * 100)}% নিশ্চিত
                    </AnimatedBadge>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    "{voiceResults.transcript}"
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {voiceResults.products.map(product => (
                      <div key={product.id} className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <h5 className="font-medium text-sm">{product.name}</h5>
                          <p className="text-green-600 font-bold">৳{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI সুপারিশ
          </h2>
          <Button
            variant="outline"
            onClick={() => setIsAiChatOpen(true)}
            className="flex items-center gap-2"
          >
            <Robot className="h-4 w-4" />
            AI চ্যাট
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiRecommendations.map((recommendation) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {recommendation.type === "trending" && <TrendingUp className="h-5 w-5 text-orange-500" />}
                        {recommendation.type === "personal" && <Target className="h-5 w-5 text-blue-500" />}
                        {recommendation.type === "seasonal" && <Clock className="h-5 w-5 text-green-500" />}
                        {recommendation.type === "similar" && <Eye className="h-5 w-5 text-purple-500" />}
                        {recommendation.type === "bundle" && <Package className="h-5 w-5 text-red-500" />}
                        {recommendation.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {recommendation.description}
                      </p>
                    </div>
                    <AnimatedBadge variant="default">
                      <Brain className="h-3 w-3 mr-1" />
                      {recommendation.confidence}%
                    </AnimatedBadge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {recommendation.products.map(product => (
                      <motion.div
                        key={product.id}
                        className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              ({product.reviewCount})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-green-600">৳{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ৳{product.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Heart className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {recommendation.reason}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isAiChatOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsAiChatOpen(false)}
            />
            
            {/* Chat Window */}
            <motion.div
              className="relative w-full max-w-md h-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      <Robot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">PureBite AI</h3>
                    <p className="text-xs text-green-500">অনলাইন</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAiChatOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <Robot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">আমি আপনাকে সাহায্য করতে এখানে আছি!</p>
                    <p className="text-xs">কী খুঁজছেন জিজ্ঞেস করুন</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.type === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {message.products && (
                          <div className="mt-2 space-y-2">
                            {message.products.slice(0, 2).map(product => (
                              <div key={product.id} className="bg-white/10 rounded p-2 text-xs">
                                <div className="flex gap-2">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-green-300">৳{product.price}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <LoadingDots size="sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="আপনার প্রশ্ন লিখুন..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAiChatSubmit()}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleAiChatSubmit}
                    disabled={!chatInput.trim() || isAiTyping}
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatedNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        duration={5000}
      />
    </div>
  );
}