"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: Date;
  totalSold: number;
  revenue: number;
  imageUrl: string;
  description: string;
  expiryDate?: Date;
  batchNumber?: string;
  weight?: number;
  unit: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: Date;
  user: string;
  reference?: string;
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    
    // Mock data - replace with real API calls
    setTimeout(() => {
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'জৈব আম',
          sku: 'ORG-MAN-001',
          category: 'ফল',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          costPrice: 80,
          sellingPrice: 120,
          supplier: 'রাজশাহী অর্গানিক ফার্ম',
          location: 'A-01-01',
          status: 'in_stock',
          lastUpdated: new Date(),
          totalSold: 156,
          revenue: 18720,
          imageUrl: '/api/placeholder/150/150',
          description: 'তাজা জৈব আম, রাজশাহী থেকে',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          weight: 250,
          unit: 'গ্রাম'
        },
        {
          id: '2',
          name: 'তাজা গাজর',
          sku: 'VEG-CAR-001',
          category: 'সবজি',
          currentStock: 8,
          minStock: 15,
          maxStock: 80,
          costPrice: 60,
          sellingPrice: 80,
          supplier: 'দিনাজপুর কৃষি',
          location: 'B-02-01',
          status: 'low_stock',
          lastUpdated: new Date(),
          totalSold: 98,
          revenue: 7840,
          imageUrl: '/api/placeholder/150/150',
          description: 'তাজা গাজর, দিনাজপুর থেকে',
          weight: 500,
          unit: 'গ্রাম'
        },
        {
          id: '3',
          name: 'খেজুর বাদাম হালুয়া',
          sku: 'SWT-HAL-001',
          category: 'মিষ্টি',
          currentStock: 0,
          minStock: 10,
          maxStock: 50,
          costPrice: 200,
          sellingPrice: 350,
          supplier: 'পুরান ঢাকা মিষ্টান্ন',
          location: 'C-01-01',
          status: 'out_of_stock',
          lastUpdated: new Date(),
          totalSold: 67,
          revenue: 23450,
          imageUrl: '/api/placeholder/150/150',
          description: 'ঐতিহ্যবাহী খেজুর বাদাম হালুয়া',
          weight: 250,
          unit: 'গ্রাম'
        },
        {
          id: '4',
          name: 'কাঁচা হলুদ',
          sku: 'SPC-TUR-001',
          category: 'মসলা',
          currentStock: 25,
          minStock: 10,
          maxStock: 60,
          costPrice: 120,
          sellingPrice: 180,
          supplier: 'বগুড়া মসলা ভান্ডার',
          location: 'D-01-01',
          status: 'in_stock',
          lastUpdated: new Date(),
          totalSold: 43,
          revenue: 7740,
          imageUrl: '/api/placeholder/150/150',
          description: 'তাজা কাঁচা হলুদ',
          weight: 200,
          unit: 'গ্রাম'
        },
        {
          id: '5',
          name: 'দেশি মুরগির ডিম',
          sku: 'PRO-EGG-001',
          category: 'প্রোটিন',
          currentStock: 72,
          minStock: 24,
          maxStock: 120,
          costPrice: 12,
          sellingPrice: 18,
          supplier: 'গ্রামীণ পোল্ট্রি',
          location: 'E-01-01',
          status: 'in_stock',
          lastUpdated: new Date(),
          totalSold: 234,
          revenue: 4212,
          imageUrl: '/api/placeholder/150/150',
          description: 'দেশি মুরগির তাজা ডিম',
          unit: 'পিস'
        }
      ];

      const mockMovements: StockMovement[] = [
        {
          id: '1',
          productId: '1',
          productName: 'জৈব আম',
          type: 'in',
          quantity: 50,
          reason: 'নতুন স্টক পূরণ',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user: 'রহিম আহমেদ',
          reference: 'PO-2024-001'
        },
        {
          id: '2',
          productId: '2',
          productName: 'তাজা গাজর',
          type: 'out',
          quantity: 12,
          reason: 'বিক্রয়',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          user: 'সিস্টেম',
          reference: 'ORD-2024-156'
        },
        {
          id: '3',
          productId: '3',
          productName: 'খেজুর বাদাম হালুয়া',
          type: 'out',
          quantity: 8,
          reason: 'বিক্রয়',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          user: 'সিস্টেম',
          reference: 'ORD-2024-157'
        }
      ];

      setInventory(mockInventory);
      setStockMovements(mockMovements);
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="default" className="bg-green-100 text-green-800">স্টকে আছে</Badge>;
      case 'low_stock':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">কম স্টক</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">স্টক নেই</Badge>;
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out_of_stock':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(inventory.map(item => item.category))];
  
  const stockSummary = {
    total: inventory.length,
    inStock: inventory.filter(item => item.status === 'in_stock').length,
    lowStock: inventory.filter(item => item.status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0)
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">ইনভেন্টরি লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ইনভেন্টরি ম্যানেজমেন্ট</h1>
          <p className="text-gray-600">স্টক পরিচালনা ও ট্র্যাকিং</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            এক্সপোর্ট
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            ইমপোর্ট
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            নতুন পণ্য
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">মোট পণ্য</p>
              <p className="text-2xl font-bold text-gray-900">{stockSummary.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">স্টকে আছে</p>
              <p className="text-2xl font-bold text-green-600">{stockSummary.inStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">কম স্টক</p>
              <p className="text-2xl font-bold text-yellow-600">{stockSummary.lowStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">স্টক নেই</p>
              <p className="text-2xl font-bold text-red-600">{stockSummary.outOfStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">মোট মূল্য</p>
              <p className="text-2xl font-bold text-purple-600">৳{stockSummary.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="নাম বা SKU দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="in_stock">স্টকে আছে</option>
            <option value="low_stock">কম স্টক</option>
            <option value="out_of_stock">স্টক নেই</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            আরও ফিল্টার
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পণ্য
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্টক
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  মূল্য
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সাপ্লায়ার
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      মিন: {item.minStock}, ম্যাক্স: {item.maxStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">৳{item.sellingPrice}</div>
                    <div className="text-xs text-gray-500">খরচ: ৳{item.costPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {getStatusBadge(item.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsMovementModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">সাম্প্রতিক স্টক মুভমেন্ট</h2>
          <Button variant="outline" size="sm">
            সব দেখুন
          </Button>
        </div>
        
        <div className="space-y-3">
          {stockMovements.slice(0, 5).map((movement) => (
            <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getMovementIcon(movement.type)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {movement.productName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {movement.reason} - {movement.user}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                </div>
                <div className="text-xs text-gray-500">
                  {movement.timestamp.toLocaleTimeString('bn-BD')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals would go here */}
      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p>এখানে নতুন পণ্য যোগ করার ফর্ম থাকবে...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>পণ্য সম্পাদনা করুন</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p>এখানে পণ্য সম্পাদনার ফর্ম থাকবে...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Modal */}
      <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>স্টক মুভমেন্ট</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p>এখানে স্টক মুভমেন্টের বিস্তারিত তথ্য থাকবে...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}