"use client";

import { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "order" | "inventory" | "customer";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

interface NotificationSystemProps {
  className?: string;
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "order",
        title: "নতুন অর্ডার",
        message: "অর্ডার #PB-2024-003 এসেছে। মোট: ৳৮৫০",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: "high",
        actionUrl: "/admin/orders"
      },
      {
        id: "2",
        type: "inventory",
        title: "স্টক কম",
        message: "আমের স্টক ৫টির নিচে নেমে গেছে",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: "medium",
        actionUrl: "/admin/inventory"
      },
      {
        id: "3",
        type: "customer",
        title: "নতুন রিভিউ",
        message: "খেজুর বাদাম হালুয়া - ৫ স্টার রিভিউ পেয়েছে",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        priority: "low",
        actionUrl: "/admin/reviews"
      },
      {
        id: "4",
        type: "success",
        title: "পেমেন্ট সফল",
        message: "অর্ডার #PB-2024-002 এর পেমেন্ট সম্পন্ন হয়েছে",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        priority: "medium"
      },
      {
        id: "5",
        type: "warning",
        title: "ডেলিভারি বিলম্ব",
        message: "৩টি অর্ডারের ডেলিভারি সময়সীমা অতিক্রম করেছে",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
        priority: "high",
        actionUrl: "/admin/orders/tracking"
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info": return <Info className="h-4 w-4 text-blue-600" />;
      case "order": return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      case "inventory": return <Package className="h-4 w-4 text-orange-600" />;
      case "customer": return <Users className="h-4 w-4 text-indigo-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification["type"], priority: Notification["priority"]) => {
    if (priority === "high") return "border-l-red-500 bg-red-50";
    if (priority === "medium") return "border-l-yellow-500 bg-yellow-50";
    return "border-l-blue-500 bg-blue-50";
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "এইমাত্র";
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    return `${days} দিন আগে`;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  নোটিফিকেশন ({unreadCount})
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      সব পড়েছি
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                    className="p-1 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>কোন নোটিফিকেশন নেই</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 transition-colors hover:bg-gray-50",
                        getNotificationColor(notification.type, notification.priority),
                        !notification.read && "bg-opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={cn(
                                "text-sm font-medium text-gray-900",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0 text-xs"
                                  title="পড়েছি"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearNotification(notification.id)}
                                className="h-6 w-6 p-0"
                                title="মুছে ফেলুন"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {notification.actionUrl && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-xs mt-2"
                              onClick={() => {
                                window.location.href = notification.actionUrl!;
                                setIsOpen(false);
                              }}
                            >
                              বিস্তারিত দেখুন →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => {
                    // Navigate to full notifications page
                    window.location.href = "/admin/notifications";
                    setIsOpen(false);
                  }}
                >
                  সব নোটিফিকেশন দেখুন
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Notification Context Provider
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      {/* Toast notifications could go here */}
    </div>
  );
}