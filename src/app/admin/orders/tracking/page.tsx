"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  Play,
  Eye,
  User,
  Calendar
} from 'lucide-react';

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
  lastUpdated: string;
  carrier?: {
    id: string;
    name: string;
    code: string;
  };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
  };
}

interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface TrackingStats {
  totalShipments: number;
  inTransitShipments: number;
  deliveredToday: number;
  pendingDeliveries: number;
  failedDeliveries: number;
}

export default function AdminOrderTrackingPage() {
  const [trackings, setTrackings] = useState<OrderTracking[]>([]);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [newTracking, setNewTracking] = useState({
    orderId: '',
    trackingNumber: '',
    carrierId: '',
    currentLocation: '',
    estimatedDelivery: '',
    recipientName: '',
    recipientPhone: '',
  });
  const [simulationData, setSimulationData] = useState({
    trackingNumber: '',
    status: '',
    location: '',
    description: '',
    details: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, carrierFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tracking data, carriers, and stats in parallel
      const [trackingsRes, carriersRes] = await Promise.all([
        fetch('/api/orders/tracking/admin'),
        fetch('/api/orders/tracking/carriers'),
      ]);

      if (trackingsRes.ok) {
        const trackingsData = await trackingsRes.json();
        setTrackings(trackingsData.trackings || []);
      }

      if (carriersRes.ok) {
        const carriersData = await carriersRes.json();
        setCarriers(carriersData);
      }

      // Fetch stats
      const statsRes = await fetch('/api/orders/tracking/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTracking = async () => {
    try {
      const response = await fetch('/api/orders/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTracking),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTracking({
          orderId: '',
          trackingNumber: '',
          carrierId: '',
          currentLocation: '',
          estimatedDelivery: '',
          recipientName: '',
          recipientPhone: '',
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create tracking');
      }
    } catch (error) {
      console.error('Error creating tracking:', error);
      alert('Failed to create tracking');
    }
  };

  const simulateTrackingUpdate = async () => {
    try {
      const response = await fetch('/api/orders/tracking/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: simulationData.trackingNumber,
          event: {
            timestamp: new Date().toISOString(),
            status: simulationData.status,
            location: simulationData.location,
            description: simulationData.description,
            details: simulationData.details,
          },
        }),
      });

      if (response.ok) {
        setShowSimulateModal(false);
        setSimulationData({
          trackingNumber: '',
          status: '',
          location: '',
          description: '',
          details: '',
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to simulate tracking update');
      }
    } catch (error) {
      console.error('Error simulating tracking:', error);
      alert('Failed to simulate tracking update');
    }
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
    return new Date(dateString).toLocaleString();
  };

  const filteredTrackings = trackings.filter(tracking => {
    const matchesSearch = 
      tracking.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracking.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracking.order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracking.order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || tracking.order.status === statusFilter;
    const matchesCarrier = !carrierFilter || tracking.carrier?.id === carrierFilter;
    
    return matchesSearch && matchesStatus && matchesCarrier;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading tracking data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking Management</h1>
        <p className="text-gray-600">Manage shipping and delivery tracking for all orders</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">In Transit</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inTransitShipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Delivered Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tracking
        </Button>
        <Button onClick={() => setShowSimulateModal(true)} variant="outline">
          <Play className="h-4 w-4 mr-2" />
          Simulate Update
        </Button>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders, tracking numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Carriers</option>
              {carriers.map(carrier => (
                <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tracking List */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrackings.map((tracking) => (
                  <tr key={tracking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{tracking.order.orderNumber}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono text-sm">{tracking.trackingNumber}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{tracking.order.user.name}</div>
                        <div className="text-sm text-gray-500">{tracking.order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{tracking.carrier?.name || 'Standard'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={getStatusColor(tracking.order.status)}>
                        {tracking.order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 flex items-center">
                        {tracking.currentLocation && (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            {tracking.currentLocation}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">
                        {formatDateTime(tracking.lastUpdated)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTracking(tracking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSimulationData({
                              ...simulationData,
                              trackingNumber: tracking.trackingNumber,
                            });
                            setShowSimulateModal(true);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrackings.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tracking records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tracking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Tracking Information</h3>
            <div className="space-y-4">
              <Input
                placeholder="Order ID"
                value={newTracking.orderId}
                onChange={(e) => setNewTracking({...newTracking, orderId: e.target.value})}
              />
              <Input
                placeholder="Tracking Number"
                value={newTracking.trackingNumber}
                onChange={(e) => setNewTracking({...newTracking, trackingNumber: e.target.value})}
              />
              <select
                value={newTracking.carrierId}
                onChange={(e) => setNewTracking({...newTracking, carrierId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Carrier</option>
                {carriers.map(carrier => (
                  <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                ))}
              </select>
              <Input
                placeholder="Current Location"
                value={newTracking.currentLocation}
                onChange={(e) => setNewTracking({...newTracking, currentLocation: e.target.value})}
              />
              <Input
                type="datetime-local"
                placeholder="Estimated Delivery"
                value={newTracking.estimatedDelivery}
                onChange={(e) => setNewTracking({...newTracking, estimatedDelivery: e.target.value})}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={createTracking} className="flex-1">
                Create Tracking
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Tracking Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Simulate Tracking Update</h3>
            <div className="space-y-4">
              <Input
                placeholder="Tracking Number"
                value={simulationData.trackingNumber}
                onChange={(e) => setSimulationData({...simulationData, trackingNumber: e.target.value})}
              />
              <Input
                placeholder="Status (e.g., In Transit, Delivered)"
                value={simulationData.status}
                onChange={(e) => setSimulationData({...simulationData, status: e.target.value})}
              />
              <Input
                placeholder="Location"
                value={simulationData.location}
                onChange={(e) => setSimulationData({...simulationData, location: e.target.value})}
              />
              <Input
                placeholder="Description"
                value={simulationData.description}
                onChange={(e) => setSimulationData({...simulationData, description: e.target.value})}
              />
              <Input
                placeholder="Additional Details"
                value={simulationData.details}
                onChange={(e) => setSimulationData({...simulationData, details: e.target.value})}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={simulateTrackingUpdate} className="flex-1">
                Simulate Update
              </Button>
              <Button variant="outline" onClick={() => setShowSimulateModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}