"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  Minus, 
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Edit,
  BarChart3,
  History
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  image?: string;
  stockCount: number;
  reservedStock: number;
  lowStockThreshold: number;
  reorderLevel: number;
  inStock: boolean;
  price: number;
}

interface StockAlert {
  id: string;
  productId: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT';
  currentStock: number;
  threshold: number;
  createdAt: string;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    productId: '',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch low stock products
      const lowStockResponse = await fetch('/api/inventory/stock?type=low-stock');
      if (lowStockResponse.ok) {
        const lowStockData = await lowStockResponse.json();
        setLowStockProducts(lowStockData);
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/inventory/stock?type=alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }

      // Fetch all products for export (you might want a separate endpoint for this)
      const exportResponse = await fetch('/api/inventory/bulk');
      if (exportResponse.ok) {
        const exportData = await exportResponse.json();
        setProducts(exportData.products || []);
      }

    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    try {
      const response = await fetch('/api/inventory/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: adjustmentData.productId,
          type: 'adjust',
          quantity: adjustmentData.quantity,
          reason: adjustmentData.reason,
        }),
      });

      if (response.ok) {
        setShowAdjustModal(false);
        setAdjustmentData({ productId: '', quantity: 0, reason: '' });
        await fetchInventoryData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Stock adjustment error:', error);
      alert('Failed to adjust stock');
    }
  };

  const openAdjustModal = (product: Product) => {
    setAdjustmentData({
      productId: product.id,
      quantity: 0,
      reason: '',
    });
    setShowAdjustModal(true);
  };

  const viewStockHistory = async (product: Product) => {
    try {
      const response = await fetch(`/api/inventory/stock?productId=${product.id}&type=history`);
      if (response.ok) {
        const history = await response.json();
        setStockHistory(history);
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    }
  };

  const exportStockData = async (format: 'json' | 'csv' = 'csv') => {
    try {
      const response = await fetch(`/api/inventory/bulk?format=${format}`);
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `stock-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `stock-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK': return 'destructive';
      case 'LOW_STOCK': return 'destructive';
      case 'REORDER_POINT': return 'default';
      default: return 'secondary';
    }
  };

  const getStockStatusColor = (product: Product) => {
    if (product.stockCount === 0) return 'text-red-600';
    if (product.stockCount <= product.lowStockThreshold) return 'text-orange-600';
    return 'text-green-600';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Monitor stock levels, alerts, and manage inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stockCount === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={() => exportStockData('csv')} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button onClick={() => exportStockData('json')} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button onClick={fetchInventoryData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getAlertBadgeColor(alert.type) as any}>
                      {alert.type.replace('_', ' ')}
                    </Badge>
                    <span className="font-medium">Product ID: {alert.productId}</span>
                    <span className="text-sm text-gray-600">
                      Current: {alert.currentStock} | Threshold: {alert.threshold}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    <Badge variant="destructive">
                      {product.stockCount === 0 ? 'Out of Stock' : 'Low Stock'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Current: <span className={getStockStatusColor(product)}>{product.stockCount}</span></div>
                    <div>Reserved: {product.reservedStock}</div>
                    <div>Available: {product.stockCount - product.reservedStock}</div>
                    <div>Threshold: {product.lowStockThreshold}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => openAdjustModal(product)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Adjust
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => viewStockHistory(product)}>
                      <History className="h-3 w-3 mr-1" />
                      History
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">৳{product.price}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${getStockStatusColor(product)}`}>
                        {product.stockCount}
                      </span>
                    </td>
                    <td className="px-4 py-4">{product.reservedStock}</td>
                    <td className="px-4 py-4">{product.stockCount - product.reservedStock}</td>
                    <td className="px-4 py-4">
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAdjustModal(product)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => viewStockHistory(product)}>
                          <History className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adjust Stock</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Adjustment
                </label>
                <Input
                  type="number"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    quantity: parseInt(e.target.value) || 0
                  })}
                  placeholder="Enter positive or negative number"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Positive numbers add stock, negative numbers remove stock
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <Input
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    reason: e.target.value
                  })}
                  placeholder="Reason for adjustment"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleStockAdjustment} className="flex-1">
                Apply Adjustment
              </Button>
              <Button variant="outline" onClick={() => setShowAdjustModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stock History - {selectedProduct.name}</h3>
              <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
                ×
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockHistory.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-4 py-4 text-sm">
                        {new Date(movement.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{movement.type}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4">{movement.previousStock}</td>
                      <td className="px-4 py-4">{movement.newStock}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{movement.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}