"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Package, TrendingDown, Zap, Bell, X, Eye, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'high_demand' | 'expiring' | 'reorder_point';
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  maxStock?: number;
  velocity?: number; // Units sold per day
  daysUntilOutOfStock?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  actionRequired: boolean;
}

interface InventoryMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  totalStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  fastMovingProducts: { id: string; name: string; velocity: number }[];
  slowMovingProducts: { id: string; name: string; lastSaleDate: string }[];
}

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    fetchInventoryAlerts();
    fetchInventoryMetrics();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchInventoryAlerts();
      fetchInventoryMetrics();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const fetchInventoryAlerts = async () => {
    try {
      const response = await fetch('/api/inventory/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
    }
  };

  const fetchInventoryMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching inventory metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/alerts/${alertId}/dismiss`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const createReorderRequest = async (productId: string) => {
    try {
      const response = await fetch('/api/inventory/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId })
      });
      
      if (response.ok) {
        // Refresh alerts after creating reorder request
        fetchInventoryAlerts();
      }
    } catch (error) {
      console.error('Error creating reorder request:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'out_of_stock':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high_demand':
        return <TrendingDown className="h-5 w-5 text-blue-600" />;
      case 'expiring':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      case 'reorder_point':
        return <Zap className="h-5 w-5 text-purple-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-gray-600 text-white'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.low}>
        {priority === 'critical' ? 'জরুরি' :
         priority === 'high' ? 'উচ্চ' :
         priority === 'medium' ? 'মাঝারি' : 'কম'}
      </Badge>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedPriority !== 'all' && alert.priority !== selectedPriority) return false;
    if (selectedType !== 'all' && alert.type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ইনভেন্টরি সতর্কতা</h1>
          <p className="text-gray-600">স্টক পরিস্থিতি ও পুনঃপূরণের প্রয়োজনীয়তা</p>
        </div>
        <Button onClick={() => {
          fetchInventoryAlerts();
          fetchInventoryMetrics();
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">জরুরি সতর্কতা</p>
                <p className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">কম স্টক</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.lowStockProducts}</p>
              </div>
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">স্টক শেষ</p>
                <p className="text-2xl font-bold text-red-600">{metrics.outOfStockProducts}</p>
              </div>
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">মোট সতর্কতা</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.totalAlerts}</p>
              </div>
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">স্টক মূল্য</p>
                <p className="text-lg font-bold text-green-600">৳{metrics.totalStockValue.toLocaleString()}</p>
              </div>
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">অগ্রাধিকার</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">সব</option>
            <option value="critical">জরুরি</option>
            <option value="high">উচ্চ</option>
            <option value="medium">মাঝারি</option>
            <option value="low">কম</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ধরন</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">সব</option>
            <option value="low_stock">কম স্টক</option>
            <option value="out_of_stock">স্টক শেষ</option>
            <option value="high_demand">উচ্চ চাহিদা</option>
            <option value="expiring">মেয়াদ শেষ</option>
            <option value="reorder_point">পুনঃঅর্ডার পয়েন্ট</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">কোন সতর্কতা নেই</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{alert.productName}</h4>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>বর্তমান স্টক: {alert.currentStock}</span>
                      {alert.reorderLevel && (
                        <span>পুনঃঅর্ডার লেভেল: {alert.reorderLevel}</span>
                      )}
                      {alert.daysUntilOutOfStock && (
                        <span>স্টক শেষ হবে: {alert.daysUntilOutOfStock} দিনে</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/products/${alert.productId}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      দেখুন
                    </Link>
                  </Button>

                  {alert.actionRequired && (
                    <Button
                      size="sm"
                      onClick={() => createReorderRequest(alert.productId)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      রিঅর্ডার
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fast and Slow Moving Products */}
      {metrics && (metrics.fastMovingProducts.length > 0 || metrics.slowMovingProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving Products */}
          {metrics.fastMovingProducts.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-900">দ্রুত বিক্রি হওয়া পণ্য</h3>
              <div className="space-y-3">
                {metrics.fastMovingProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="font-medium">{product.name}</span>
                    <Badge variant="default" className="bg-green-600">
                      {product.velocity.toFixed(1)} ইউনিট/দিন
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slow Moving Products */}
          {metrics.slowMovingProducts.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-orange-900">ধীর বিক্রি হওয়া পণ্য</h3>
              <div className="space-y-3">
                {metrics.slowMovingProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-orange-700">
                      শেষ বিক্রি: {new Date(product.lastSaleDate).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}