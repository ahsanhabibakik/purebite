"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Minimize2,
  Maximize2,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
  fileUrl?: string;
  fileName?: string;
}

interface ChatRoom {
  id: string;
  title?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: Message[];
  agent?: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing chat room on open
  useEffect(() => {
    if (isOpen && session?.user && !chatRoom) {
      loadChatRoom();
    }
  }, [isOpen, session]);

  // Setup typing indicator cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const loadChatRoom = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/rooms?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.rooms.length > 0) {
          const room = data.rooms[0];
          setChatRoom(room);
          loadMessages(room.id);
        }
      }
    } catch (error) {
      console.error('Failed to load chat room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`);
      if (response.ok) {
        const room = await response.json();
        setMessages(room.messages || []);
        setChatRoom(room);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createChatRoom = async (initialMessage: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Customer Support',
          initialMessage,
        }),
      });

      if (response.ok) {
        const room = await response.json();
        setChatRoom(room);
        loadMessages(room.id);
      } else {
        const error = await response.json();
        if (error.roomId) {
          // User already has an active room
          loadMessages(error.roomId);
        }
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: chatRoom.id,
          message: messageText,
          messageType: 'TEXT',
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Re-add message to input on error
      setNewMessage(messageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!chatRoom) {
        createChatRoom(newMessage);
      } else {
        sendMessage();
      }
    }
  };

  const handleTyping = () => {
    if (!chatRoom) return;

    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    // Send typing status to server
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: chatRoom.id,
        isTyping: true,
      }),
    }).catch(console.error);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-orange-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (!session?.user) {
    return null; // Don't show chat widget for unauthenticated users
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg relative"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border ${
          isMinimized ? 'w-80 h-16' : 'w-80 h-96'
        } transition-all duration-300`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">
                {chatRoom?.agent?.name ? `Chat with ${chatRoom.agent.name}` : 'Customer Support'}
              </span>
              {chatRoom && (
                <Badge className={`${getStatusColor(chatRoom.status)} text-white text-xs`}>
                  {chatRoom.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-green-700 p-1"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-700 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 h-64 overflow-y-auto space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 space-y-3">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-300" />
                    <div>
                      <p className="font-medium">Welcome to PureBite Support!</p>
                      <p className="text-sm">Send us a message and we'll get back to you soon.</p>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Usually replies in minutes</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === session.user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender.id === session.user?.id
                            ? 'bg-green-600 text-white'
                            : message.messageType === 'SYSTEM'
                            ? 'bg-gray-100 text-gray-600 text-center'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.messageType !== 'SYSTEM' && message.sender.id !== session.user?.id && (
                          <p className="text-xs font-medium mb-1">{message.sender.name}</p>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.id === session.user?.id ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => {
                      if (!chatRoom) {
                        createChatRoom(newMessage);
                      } else {
                        sendMessage();
                      }
                    }}
                    disabled={!newMessage.trim() || isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {chatRoom?.status === 'CLOSED' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This chat has been closed. Start a new conversation if you need help.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}