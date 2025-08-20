"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, Info, AlertCircle, CheckCircle, ShoppingCart, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  type: 'order' | 'product' | 'review' | 'promotion' | 'system' | 'inventory';
  title: string;
  message: string;
  icon?: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
}

export function RealTimeNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'product':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'promotion':
        return <Info className="h-5 w-5 text-purple-600" />;
      case 'inventory':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">নোটিফিকেশন</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  সব পড়া হয়েছে
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>কোন নোটিফিকেশন নেই</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 border-b border-gray-100 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Action Button */}
                          {notification.actionUrl && notification.actionText && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                window.location.href = notification.actionUrl!;
                                markAsRead(notification.id);
                              }}
                            >
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1"
                              title="পড়া হয়েছে চিহ্নিত করুন"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="মুছে ফেলুন"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString('bn-BD')}
                        </span>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = '/notifications';
                  setShowNotifications(false);
                }}
                className="text-sm"
              >
                সব নোটিফিকেশন দেখুন
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for creating notifications
export function useNotifications() {
  const createNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const createOrderNotification = (orderId: string, status: string) => {
    const statusMessages = {
      confirmed: 'আপনার অর্ডার নিশ্চিত হয়েছে',
      processing: 'আপনার অর্ডার প্রস্তুত করা হচ্ছে',
      shipped: 'আপনার অর্ডার পাঠানো হয়েছে',
      delivered: 'আপনার অর্ডার ডেলিভার হয়েছে'
    };

    return createNotification({
      type: 'order',
      title: 'অর্ডার আপডেট',
      message: statusMessages[status as keyof typeof statusMessages] || 'আপনার অর্ডারে আপডেট আছে',
      priority: 'medium',
      actionUrl: `/orders/${orderId}`,
      actionText: 'অর্ডার দেখুন'
    });
  };

  const createInventoryAlert = (productName: string, stock: number) => {
    return createNotification({
      type: 'inventory',
      title: 'স্টক কম',
      message: `${productName} এর স্টক কম আছে (${stock} টি বাকি)`,
      priority: 'high',
      actionUrl: '/admin/inventory',
      actionText: 'ইনভেন্টরি দেখুন'
    });
  };

  const createPromoNotification = (title: string, message: string, actionUrl?: string) => {
    return createNotification({
      type: 'promotion',
      title,
      message,
      priority: 'low',
      actionUrl,
      actionText: actionUrl ? 'দেখুন' : undefined
    });
  };

  return {
    createNotification,
    createOrderNotification,
    createInventoryAlert,
    createPromoNotification
  };
}