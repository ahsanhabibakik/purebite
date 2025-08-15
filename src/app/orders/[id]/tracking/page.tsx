"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Phone,
  User,
  Calendar,
  Navigation,
  RefreshCw,
  Home,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  details?: string;
}

interface OrderTracking {
  id: string;
  trackingNumber: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  isDelivered: boolean;
  trackingEvents: TrackingEvent[];
  recipientName?: string;
  recipientPhone?: string;
  carrier?: {
    id: string;
    name: string;
    code: string;
  };
  order: {
    orderNumber: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
    statusHistory: Array<{
      id: string;
      status: string;
      description?: string;
      location?: string;
      estimatedDelivery?: string;
      createdAt: string;
    }>;
  };
  trackingUrl?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrackingInfo();
  }, [orderId]);

  const fetchTrackingInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders/tracking?orderId=${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTracking(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load tracking information');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching tracking info:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered')) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (statusLower.includes('shipped') || statusLower.includes('transit')) return <Truck className="h-5 w-5 text-blue-600" />;
    if (statusLower.includes('picked') || statusLower.includes('collected')) return <Package className="h-5 w-5 text-orange-600" />;
    if (statusLower.includes('failed') || statusLower.includes('exception')) return <AlertCircle className="h-5 w-5 text-red-600" />;
    
    return <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('picked') || statusLower.includes('collected')) return 'bg-orange-100 text-orange-800';
    if (statusLower.includes('failed') || statusLower.includes('exception')) return 'bg-red-100 text-red-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading tracking information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Tracking Information Not Available</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={fetchTrackingInfo} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/orders">
                  <Button variant="outline">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Tracking Information</h2>
              <p className="text-gray-600 mb-4">
                Tracking information will be available once your order has been shipped.
              </p>
              <Link href="/orders">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Track your order status and delivery progress</p>
          </div>
          <Button onClick={fetchTrackingInfo} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/orders" className="hover:text-green-600">Orders</Link>
          <span>/</span>
          <span>{tracking.order.orderNumber}</span>
          <span>/</span>
          <span>Tracking</span>
        </nav>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Order Number</p>
              <p className="text-lg font-semibold">{tracking.order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tracking Number</p>
              <p className="text-lg font-semibold font-mono">{tracking.trackingNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Carrier</p>
              <p className="text-lg font-semibold">{tracking.carrier?.name || 'Standard Delivery'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge className={getStatusColor(tracking.order.status)}>
                {tracking.order.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Tracking URL */}
          {tracking.trackingUrl && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={tracking.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-600 hover:text-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Track on {tracking.carrier?.name} website
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tracking.currentLocation && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Current Location</p>
                    <p className="text-sm text-gray-600">{tracking.currentLocation}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {tracking.isDelivered ? 'Delivered' : 'Estimated Delivery'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {tracking.isDelivered && tracking.actualDelivery
                      ? formatDateTime(tracking.actualDelivery).date
                      : tracking.estimatedDelivery
                      ? formatDateTime(tracking.estimatedDelivery).date
                      : 'TBD'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Info */}
        {(tracking.recipientName || tracking.recipientPhone) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Recipient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tracking.recipientName && (
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-sm text-gray-600">{tracking.recipientName}</p>
                  </div>
                )}
                {tracking.recipientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">{tracking.recipientPhone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href={`/orders/${orderId}`}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Order Details
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tracking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Carrier Events */}
            {tracking.trackingEvents && tracking.trackingEvents.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Carrier Updates</h3>
                <div className="space-y-4">
                  {tracking.trackingEvents.map((event, index) => {
                    const dateTime = formatDateTime(event.timestamp);
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(event.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{event.status}</h4>
                            <time className="text-sm text-gray-500">
                              {dateTime.date} at {dateTime.time}
                            </time>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          {event.location && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </p>
                          )}
                          {event.details && (
                            <p className="text-xs text-gray-500 mt-1">{event.details}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Status History */}
            {tracking.order.statusHistory && tracking.order.statusHistory.length > 0 && (
              <div className={tracking.trackingEvents.length > 0 ? 'pt-6 border-t' : ''}>
                <h3 className="font-medium text-gray-900 mb-4">Order Status Updates</h3>
                <div className="space-y-4">
                  {tracking.order.statusHistory.map((status) => {
                    const dateTime = formatDateTime(status.createdAt);
                    return (
                      <div key={status.id} className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {status.status.replace('_', ' ')}
                            </h4>
                            <time className="text-sm text-gray-500">
                              {dateTime.date} at {dateTime.time}
                            </time>
                          </div>
                          {status.description && (
                            <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                          )}
                          {status.location && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {status.location}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No tracking events */}
            {(!tracking.trackingEvents || tracking.trackingEvents.length === 0) &&
             (!tracking.order.statusHistory || tracking.order.statusHistory.length === 0) && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tracking events available yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tracking information will appear here once your package is picked up by the carrier.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}