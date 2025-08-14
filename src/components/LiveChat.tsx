"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Bot,
  Minimize2,
  Maximize2,
  Phone,
  Mail
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  isTyping?: boolean;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "হ্যালো! পিউর বাইটে আপনাকে স্বাগতম। আমি রিয়া, আপনার কাস্টমার সাপোর্ট এজেন্ট। কিভাবে সাহায্য করতে পারি?",
    sender: "agent",
    timestamp: new Date()
  }
];

const quickReplies = [
  "অর্ডার স্ট্যাটাস জানতে চাই",
  "ডেলিভারি সময় কত?",
  "পেমেন্ট মেথড কি কি?",
  "রিটার্ন পলিসি জানতে চাই"
];

const autoReplies: Record<string, string> = {
  "হ্যালো": "হ্যালো! কেমন আছেন? কিভাবে সাহায্য করতে পারি?",
  "অর্ডার": "আপনার অর্ডার নম্বর দিন, আমি চেক করে দেখি।",
  "ডেলিভারি": "ঢাকার ভিতরে ২৪ ঘন্টা, বাইরে ২-৩ দিন। ১০০০ টাকার উপরে ফ্রি ডেলিভারি।",
  "পেমেন্ট": "আমরা ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট এবং কার্ড পেমেন্ট নিয়ে থাকি।",
  "রিটার্ন": "২৪ ঘন্টার মধ্যে রিটার্ন করতে পারবেন। ১০০% মানি ব্যাক গ্যারান্টি।",
  "ধন্যবাদ": "আপনাকেও ধন্যবাদ! আর কোন সাহায্য লাগলে জানাবেন।"
};

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Auto-reply logic
    setTimeout(() => {
      const lowercaseMessage = newMessage.toLowerCase();
      let replyText = "আপনার বার্তার জন্য ধন্যবাদ! আমাদের একজন এজেন্ট শীঘ্রই উত্তর দেবেন।";
      
      // Check for keywords
      for (const [keyword, reply] of Object.entries(autoReplies)) {
        if (lowercaseMessage.includes(keyword.toLowerCase())) {
          replyText = reply;
          break;
        }
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "agent",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);

      // Add unread count if chat is minimized or closed
      if (isMinimized || !isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1500);
  };

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">লাইভ সাপোর্ট</h3>
                <p className="text-xs text-green-100">সাধারণত ২ মিনিটে উত্তর</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-8 w-8 p-0 text-white hover:bg-green-500"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-8 w-8 p-0 text-white hover:bg-green-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "user" 
                          ? "bg-blue-500 text-white" 
                          : "bg-green-100 text-green-600"
                      }`}>
                        {message.sender === "user" ? 
                          <User className="w-3 h-3" /> : 
                          <Bot className="w-3 h-3" />
                        }
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {message.timestamp.toLocaleTimeString("bn-BD", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs h-7 px-2"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="আপনার বার্তা লিখুন..."
                    className="flex-1 text-sm"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
                {/* Contact Options */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">অন্যান্য উপায়:</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}