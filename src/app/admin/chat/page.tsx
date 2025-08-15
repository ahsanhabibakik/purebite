"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  RefreshCw,
  Phone,
  Mail,
  User,
  Settings,
  MoreVertical
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
  isRead: boolean;
}

interface ChatRoom {
  id: string;
  title?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  lastMessageAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  agent?: {
    id: string;
    name: string;
    image?: string;
  };
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface ChatStats {
  totalRooms: number;
  openRooms: number;
  inProgressRooms: number;
  todayMessages: number;
  unreadCount: number;
}

export default function AdminChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatRooms();
    fetchStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchChatRooms();
      fetchStats();
      if (selectedRoom) {
        fetchRoomDetails(selectedRoom.id);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/chat/rooms?${params}`);
      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/chat/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRoomDetails = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`);
      if (response.ok) {
        const room = await response.json();
        setSelectedRoom(room);
        setMessages(room.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch room details:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
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
      setNewMessage(messageText);
    }
  };

  const assignToMe = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assign',
          assignedTo: 'current-user', // This should be the current admin user ID
        }),
      });

      if (response.ok) {
        fetchChatRooms();
        if (selectedRoom?.id === roomId) {
          fetchRoomDetails(roomId);
        }
      }
    } catch (error) {
      console.error('Failed to assign room:', error);
    }
  };

  const updateRoomStatus = async (roomId: string, status: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'status',
          status,
        }),
      });

      if (response.ok) {
        fetchChatRooms();
        if (selectedRoom?.id === roomId) {
          fetchRoomDetails(roomId);
        }
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'NORMAL': return 'text-blue-600';
      case 'LOW': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.title && room.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Support Chat</h1>
        <p className="text-gray-600">Manage customer conversations and support requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Open Chats</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.openRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgressRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Today's Messages</p>
                  <p className="text-2xl font-bold text-green-600">{stats.todayMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-6 h-[600px]">
        {/* Chat Rooms List */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chat Rooms</CardTitle>
                <Button onClick={fetchChatRooms} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[450px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No chat rooms found</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      fetchRoomDetails(room.id);
                    }}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedRoom?.id === room.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{room.user.name}</p>
                          <p className="text-xs text-gray-500">{room.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(room.status)} text-white text-xs`}>
                          {room.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(room.lastMessageAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium ${getPriorityColor(room.priority)}`}>
                        {room.priority} Priority
                      </p>
                      <p className="text-xs text-gray-500">
                        {room._count.messages} messages
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          <Card className="h-full">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedRoom.user.name}</h3>
                        <p className="text-sm text-gray-500">{selectedRoom.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!selectedRoom.agent && (
                        <Button
                          onClick={() => assignToMe(selectedRoom.id)}
                          variant="outline"
                          size="sm"
                        >
                          Assign to Me
                        </Button>
                      )}
                      
                      <select
                        value={selectedRoom.status}
                        onChange={(e) => updateRoomStatus(selectedRoom.id, e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="h-[380px] overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === selectedRoom.user.id ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender.id === selectedRoom.user.id
                            ? 'bg-gray-100 text-gray-900'
                            : message.messageType === 'SYSTEM'
                            ? 'bg-blue-100 text-blue-800 text-center'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {message.messageType !== 'SYSTEM' && message.sender.id !== selectedRoom.user.id && (
                          <p className="text-xs font-medium mb-1">You</p>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.id === selectedRoom.user.id ? 'text-gray-500' : 
                          message.messageType === 'SYSTEM' ? 'text-blue-600' : 'text-green-100'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your reply..."
                      className="flex-1"
                      disabled={selectedRoom.status === 'CLOSED'}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || selectedRoom.status === 'CLOSED'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a chat to start messaging</p>
                  <p className="text-sm">Choose a conversation from the list to view and respond to messages</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}