"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MessageCircle,
  Star,
  TrendingUp,
  Award,
  Clock,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    area: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  registrationDate: Date;
  lastOrderDate: Date;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  segment: 'new' | 'regular' | 'vip' | 'inactive';
  status: 'active' | 'inactive' | 'blocked';
  preferences: string[];
  notes: string;
  loyaltyPoints: number;
  avatar?: string;
}

interface CustomerSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    setLoading(true);
    
    // Mock data - replace with real API calls
    setTimeout(() => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'মোহাম্মদ করিম',
          email: 'karim@example.com',
          phone: '০১৭১১১২৩৪৫৬',
          address: {
            street: '১২৩, গ্রীন রোড',
            area: 'ধানমন্ডি',
            city: 'ঢাকা',
            district: 'ঢাকা',
            postalCode: '১২০৫'
          },
          registrationDate: new Date('2023-06-15'),
          lastOrderDate: new Date('2024-01-20'),
          totalOrders: 15,
          totalSpent: 12500,
          averageOrderValue: 833,
          segment: 'regular',
          status: 'active',
          preferences: ['জৈব খাবার', 'তাজা সবজি'],
          notes: 'নিয়মিত গ্রাহক, সময়মতো পেমেন্ট করেন',
          loyaltyPoints: 1250
        },
        {
          id: '2',
          name: 'ফাতেমা খাতুন',
          email: 'fatema@example.com',
          phone: '০১৮১১১২৩৪৫৬',
          address: {
            street: '৪৫৬, নিউ ইস্কাটন',
            area: 'রমনা',
            city: 'ঢাকা',
            district: 'ঢাকা',
            postalCode: '১০০০'
          },
          registrationDate: new Date('2024-01-10'),
          lastOrderDate: new Date('2024-01-18'),
          totalOrders: 3,
          totalSpent: 2800,
          averageOrderValue: 933,
          segment: 'new',
          status: 'active',
          preferences: ['মিষ্টি', 'ফল'],
          notes: 'নতুন গ্রাহক, উচ্চ অর্ডার ভ্যালু',
          loyaltyPoints: 280
        },
        {
          id: '3',
          name: 'আব্দুল রহমান',
          email: 'rahman@example.com',
          phone: '০১৯১১১২৩৪৫৬',
          address: {
            street: '৭৮৯, গুলশান এভিনিউ',
            area: 'গুলশান-২',
            city: 'ঢাকা',
            district: 'ঢাকা',
            postalCode: '১২১২'
          },
          registrationDate: new Date('2022-03-20'),
          lastOrderDate: new Date('2024-01-22'),
          totalOrders: 45,
          totalSpent: 45000,
          averageOrderValue: 1000,
          segment: 'vip',
          status: 'active',
          preferences: ['প্রিমিয়াম পণ্য', 'অর্গানিক'],
          notes: 'VIP গ্রাহক, বড় অর্ডার করেন',
          loyaltyPoints: 4500
        },
        {
          id: '4',
          name: 'রাশিদা বেগম',
          email: 'rashida@example.com',
          phone: '০১৫১১১২৩৪৫৬',
          address: {
            street: '৩২১, মিরপুর রোড',
            area: 'মিরপুর-১০',
            city: 'ঢাকা',
            district: 'ঢাকা'
          },
          registrationDate: new Date('2023-08-05'),
          lastOrderDate: new Date('2023-11-15'),
          totalOrders: 8,
          totalSpent: 4200,
          averageOrderValue: 525,
          segment: 'inactive',
          status: 'inactive',
          preferences: ['সবজি', 'মসলা'],
          notes: 'দীর্ঘদিন অর্ডার দেননি',
          loyaltyPoints: 420
        },
        {
          id: '5',
          name: 'নাসির উদ্দিন',
          email: 'nasir@example.com',
          phone: '০১৬১১১২৩৪৫৬',
          address: {
            street: '৬৫৪, উত্তরা সেক্টর ৩',
            area: 'উত্তরা',
            city: 'ঢাকা',
            district: 'ঢাকা',
            postalCode: '১২৩০'
          },
          registrationDate: new Date('2023-12-01'),
          lastOrderDate: new Date('2024-01-19'),
          totalOrders: 12,
          totalSpent: 8900,
          averageOrderValue: 742,
          segment: 'regular',
          status: 'active',
          preferences: ['প্রোটিন', 'ডেইরি'],
          notes: 'নিয়মিত মাসিক অর্ডার',
          loyaltyPoints: 890
        }
      ];

      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  };

  const getSegmentBadge = (segment: Customer['segment']) => {
    switch (segment) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">নতুন</Badge>;
      case 'regular':
        return <Badge className="bg-green-100 text-green-800">নিয়মিত</Badge>;
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>;
      case 'inactive':
        return <Badge variant="secondary">নিষ্ক্রিয়</Badge>;
    }
  };

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">সক্রিয়</Badge>;
      case 'inactive':
        return <Badge variant="secondary">নিষ্ক্রিয়</Badge>;
      case 'blocked':
        return <Badge variant="destructive">ব্লক</Badge>;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const customerSegments: CustomerSegment[] = [
    {
      name: 'নতুন গ্রাহক',
      count: customers.filter(c => c.segment === 'new').length,
      percentage: (customers.filter(c => c.segment === 'new').length / customers.length) * 100,
      color: '#3B82F6',
      description: 'গত ৩০ দিনে নিবন্ধিত'
    },
    {
      name: 'নিয়মিত গ্রাহক',
      count: customers.filter(c => c.segment === 'regular').length,
      percentage: (customers.filter(c => c.segment === 'regular').length / customers.length) * 100,
      color: '#10B981',
      description: '৫+ অর্ডার সম্পন্ন'
    },
    {
      name: 'VIP গ্রাহক',
      count: customers.filter(c => c.segment === 'vip').length,
      percentage: (customers.filter(c => c.segment === 'vip').length / customers.length) * 100,
      color: '#8B5CF6',
      description: '২০+ অর্ডার বা ২০,০০০+ খরচ'
    },
    {
      name: 'নিষ্ক্রিয় গ্রাহক',
      count: customers.filter(c => c.segment === 'inactive').length,
      percentage: (customers.filter(c => c.segment === 'inactive').length / customers.length) * 100,
      color: '#EF4444',
      description: 'গত ৯০ দিনে কোন অর্ডার নেই'
    }
  ];

  const customerStats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length,
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0)
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">গ্রাহক তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">গ্রাহক ব্যবস্থাপনা</h1>
          <p className="text-gray-600">গ্রাহক তথ্য ও বিশ্লেষণ</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            এক্সপোর্ট
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            নতুন গ্রাহক
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">মোট গ্রাহক</p>
              <p className="text-2xl font-bold text-gray-900">{customerStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">সক্রিয় গ্রাহক</p>
              <p className="text-2xl font-bold text-green-600">{customerStats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">মোট রেভিনিউ</p>
              <p className="text-2xl font-bold text-purple-600">৳{customerStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">গড় অর্ডার</p>
              <p className="text-2xl font-bold text-orange-600">৳{Math.round(customerStats.averageOrderValue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">মোট অর্ডার</p>
              <p className="text-2xl font-bold text-indigo-600">{customerStats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">গ্রাহক বিভাগ</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {customerSegments.map((segment, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{segment.name}</h3>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: segment.color }}>
                {segment.count}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {segment.percentage.toFixed(1)}% মোট গ্রাহকের
              </div>
              <div className="text-xs text-gray-500">
                {segment.description}
              </div>
            </div>
          ))}
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
                placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">সব বিভাগ</option>
            <option value="new">নতুন</option>
            <option value="regular">নিয়মিত</option>
            <option value="vip">VIP</option>
            <option value="inactive">নিষ্ক্রিয়</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="active">সক্রিয়</option>
            <option value="inactive">নিষ্ক্রিয়</option>
            <option value="blocked">ব্লক</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            আরও ফিল্টার
          </Button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গ্রাহক
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  যোগাযোগ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অর্ডার
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  খরচ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিভাগ
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {customer.loyaltyPoints} পয়েন্ট
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.totalOrders} টি</div>
                    <div className="text-sm text-gray-500">
                      শেষ: {customer.lastOrderDate.toLocaleDateString('bn-BD')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">৳{customer.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">গড়: ৳{customer.averageOrderValue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSegmentBadge(customer.segment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>গ্রাহকের বিস্তারিত তথ্য</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getSegmentBadge(selectedCustomer.segment)}
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">যোগাযোগের তথ্য</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {selectedCustomer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {selectedCustomer.phone}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        {selectedCustomer.address.street}, {selectedCustomer.address.area}<br />
                        {selectedCustomer.address.city}, {selectedCustomer.address.district}
                        {selectedCustomer.address.postalCode && ` - ${selectedCustomer.address.postalCode}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">অর্ডার পরিসংখ্যান</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>মোট অর্ডার:</span>
                      <span className="font-medium">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>মোট খরচ:</span>
                      <span className="font-medium">৳{selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>গড় অর্ডার:</span>
                      <span className="font-medium">৳{selectedCustomer.averageOrderValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>লয়্যালটি পয়েন্ট:</span>
                      <span className="font-medium">{selectedCustomer.loyaltyPoints}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">পছন্দ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.preferences.map((pref, index) => (
                    <Badge key={index} variant="secondary">{pref}</Badge>
                  ))}
                </div>
              </div>

              {selectedCustomer.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">নোট</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>গ্রাহক সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p>এখানে গ্রাহক সম্পাদনার ফর্ম থাকবে...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}