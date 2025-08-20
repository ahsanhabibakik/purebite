"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Heart,
  CreditCard,
  MapPin,
  Bell,
  Settings,
  TrendingUp,
  Package,
  Clock,
  Star,
  Gift,
  Truck,
  Award,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Phone,
  Mail,
  Edit3,
  Camera,
  Download,
  Filter,
  Search,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Bookmark
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  AnimatedCounter, 
  StaggerContainer, 
  StaggerItem, 
  AnimatedBadge,
  LoadingDots 
} from "@/components/animations/InteractiveAnimations";
import { ChartSkeleton, DashboardStatsSkeleton } from "@/components/LoadingStates";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  loyaltyPoints: number;
  membershipTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalOrders: number;
  totalSpent: number;
  favoriteCategories: string[];
  addresses: Address[];
  preferences: UserPreferences;
}

interface Address {
  id: string;
  type: "home" | "office" | "other";
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  isDefault: boolean;
}

interface UserPreferences {
  language: "bn" | "en";
  currency: "BDT" | "USD";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  marketing: {
    offers: boolean;
    newsletter: boolean;
    recommendations: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    activityTracking: boolean;
    dataCollection: boolean;
  };
}

interface Order {
  id: string;
  date: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  tracking?: string;
  estimatedDelivery?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Analytics {
  monthlySpending: { month: string; amount: number }[];
  categorySpending: { category: string; amount: number; percentage: number }[];
  orderFrequency: { month: string; orders: number }[];
  savingsFromOffers: number;
  averageOrderValue: number;
  favoriteDeliveryTime: string;
}

export function AdvancedUserDashboard() {
  const t = useTranslations("dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-1",
    name: "মো. রহিম উদ্দিন",
    email: "rahim@example.com",
    phone: "+880 1711 123456",
    avatar: "/api/placeholder/100/100",
    memberSince: "2023-01-15",
    loyaltyPoints: 2450,
    membershipTier: "Gold",
    totalOrders: 45,
    totalSpent: 125000,
    favoriteCategories: ["ফল", "সবজি", "দুগ্ধজাত"],
    addresses: [
      {
        id: "addr-1",
        type: "home",
        name: "বাসার ঠিকানা",
        phone: "+880 1711 123456",
        address: "বাড়ি #৩৪, রোড #৭, ধানমন্ডি",
        area: "ধানমন্ডি",
        city: "ঢাকা",
        isDefault: true
      }
    ],
    preferences: {
      language: "bn",
      currency: "BDT",
      notifications: {
        email: true,
        sms: true,
        push: false
      },
      marketing: {
        offers: true,
        newsletter: false,
        recommendations: true
      },
      privacy: {
        profileVisibility: "private",
        activityTracking: true,
        dataCollection: false
      }
    }
  });

  const [recentOrders] = useState<Order[]>([
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      status: "delivered",
      total: 1250,
      items: [
        { id: "1", name: "তাজা আম", price: 300, quantity: 2, image: "/api/placeholder/60/60" },
        { id: "2", name: "দেশি মুরগির মাংস", price: 650, quantity: 1, image: "/api/placeholder/60/60" }
      ],
      tracking: "TRK123456789",
      estimatedDelivery: "2024-01-16"
    },
    {
      id: "ORD-2024-002", 
      date: "2024-01-10",
      status: "shipped",
      total: 850,
      items: [
        { id: "3", name: "কাঁচা দুধ", price: 120, quantity: 2, image: "/api/placeholder/60/60" },
        { id: "4", name: "দেশি মধু", price: 610, quantity: 1, image: "/api/placeholder/60/60" }
      ],
      tracking: "TRK123456788"
    }
  ]);

  const [analytics] = useState<Analytics>({
    monthlySpending: [
      { month: "Jan", amount: 12000 },
      { month: "Feb", amount: 15000 },
      { month: "Mar", amount: 18000 },
      { month: "Apr", amount: 14000 },
      { month: "May", amount: 20000 },
      { month: "Jun", amount: 22000 }
    ],
    categorySpending: [
      { category: "ফল", amount: 8000, percentage: 35 },
      { category: "সবজি", amount: 6000, percentage: 26 },
      { category: "দুগ্ধজাত", amount: 5000, percentage: 22 },
      { category: "মাংস", amount: 4000, percentage: 17 }
    ],
    orderFrequency: [
      { month: "Jan", orders: 6 },
      { month: "Feb", orders: 8 },
      { month: "Mar", orders: 12 },
      { month: "Apr", orders: 7 },
      { month: "May", orders: 9 },
      { month: "Jun", orders: 11 }
    ],
    savingsFromOffers: 3500,
    averageOrderValue: 1680,
    favoriteDeliveryTime: "সকাল ১০-১২টা"
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "confirmed": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "shipped": return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered": return <Package className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order["status"]) => {
    const statusMap = {
      pending: "অপেক্ষমান",
      confirmed: "নিশ্চিত",
      shipped: "পাঠানো হয়েছে", 
      delivered: "ডেলিভার হয়েছে",
      cancelled: "বাতিল"
    };
    return statusMap[status];
  };

  const getTierColor = (tier: UserProfile["membershipTier"]) => {
    switch (tier) {
      case "Bronze": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "Silver": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "Gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Platinum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    }
  };

  const nextTier = userProfile.membershipTier === "Bronze" ? "Silver" : 
                  userProfile.membershipTier === "Silver" ? "Gold" :
                  userProfile.membershipTier === "Gold" ? "Platinum" : null;
  
  const nextTierPoints = userProfile.membershipTier === "Bronze" ? 1000 : 
                        userProfile.membershipTier === "Silver" ? 2500 :
                        userProfile.membershipTier === "Gold" ? 5000 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <StaggerContainer className="mb-8">
        <StaggerItem>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ড্যাশবোর্ড
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                স্বাগতম, {userProfile.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AnimatedBadge variant="new" icon={Gift}>
                {userProfile.loyaltyPoints} পয়েন্ট
              </AnimatedBadge>
              <Badge className={getTierColor(userProfile.membershipTier)}>
                <Award className="h-3 w-3 mr-1" />
                {userProfile.membershipTier} সদস্য
              </Badge>
            </div>
          </div>
        </StaggerItem>

        {/* Quick Stats */}
        <StaggerItem>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div whileHover={{ y: -5 }}>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">মোট অর্ডার</p>
                      <p className="text-3xl font-bold">
                        <AnimatedCounter value={userProfile.totalOrders} />
                      </p>
                    </div>
                    <ShoppingBag className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }}>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">মোট খরচ</p>
                      <p className="text-3xl font-bold">
                        ৳<AnimatedCounter value={userProfile.totalSpent} />
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }}>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">সঞ্চিত টাকা</p>
                      <p className="text-3xl font-bold">
                        ৳<AnimatedCounter value={analytics.savingsFromOffers} />
                      </p>
                    </div>
                    <Target className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }}>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">গড় অর্ডার</p>
                      <p className="text-3xl font-bold">
                        ৳<AnimatedCounter value={analytics.averageOrderValue} />
                      </p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">ওভারভিউ</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">অর্ডার</span>
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">পছন্দের</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">ঠিকানা</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">প্রোফাইল</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">সেটিংস</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Membership Progress */}
            <StaggerItem className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    সদস্যপদ অগ্রগতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getTierColor(userProfile.membershipTier)}>
                      {userProfile.membershipTier}
                    </Badge>
                    {nextTier && (
                      <span className="text-sm text-gray-500">
                        পরবর্তী: {nextTier}
                      </span>
                    )}
                  </div>
                  
                  {nextTier && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{userProfile.loyaltyPoints} পয়েন্ট</span>
                        <span>{nextTierPoints} পয়েন্ট প্রয়োজন</span>
                      </div>
                      <Progress 
                        value={(userProfile.loyaltyPoints / nextTierPoints) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {nextTier} হতে আরও {nextTierPoints - userProfile.loyaltyPoints} পয়েন্ট প্রয়োজন
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Quick Actions */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    দ্রুত অ্যাকশন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    নতুন অর্ডার দিন
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    অর্ডার ট্র্যাক করুন
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    পছন্দের তালিকা দেখুন
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Gift className="h-4 w-4 mr-2" />
                    অফার দেখুন
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>

          {/* Recent Orders */}
          <StaggerItem>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  সাম্প্রতিক অর্ডার
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  সব দেখুন
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <motion.div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item) => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                            />
                          ))}
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="font-bold text-green-600">৳{order.total}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Category Spending */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  ক্যাটাগরি অনুযায়ী খরচ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categorySpending.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="font-medium">৳{category.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={category.percentage} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-gray-500 w-12">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">সকল অর্ডার</h2>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব অর্ডার</SelectItem>
                  <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{order.id}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <AnimatedBadge
                          variant={order.status === "delivered" ? "success" : 
                                 order.status === "cancelled" ? "danger" : "default"}
                        >
                          {getStatusText(order.status)}
                        </AnimatedBadge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">৳{order.total}</p>
                      {order.tracking && (
                        <p className="text-xs text-gray-500">
                          ট্র্যাকিং: {order.tracking}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-8 w-8 rounded object-cover"
                        />
                        <span className="flex-1">{item.name}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                        <span className="font-medium">৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          রিভিউ দিন
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        আবার অর্ডার করুন
                      </Button>
                    </div>
                    {order.status === "shipped" && (
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        ট্র্যাক করুন
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>প্রোফাইল তথ্য</CardTitle>
              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    সেইভ করুন
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    এডিট করুন
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback className="text-xl">
                      {userProfile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="sm"
                      className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-semibold">{userProfile.name}</h3>
                  <p className="text-gray-500">{userProfile.email}</p>
                  <Badge className={getTierColor(userProfile.membershipTier)}>
                    <Award className="h-3 w-3 mr-1" />
                    {userProfile.membershipTier} সদস্য
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">নাম</label>
                    {isEditing ? (
                      <Input 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{userProfile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">ইমেইল</label>
                    {isEditing ? (
                      <Input 
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{userProfile.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">মোবাইল</label>
                    {isEditing ? (
                      <Input 
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{userProfile.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">সদস্য হয়েছেন</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(userProfile.memberSince).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  নোটিফিকেশন সেটিংস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ইমেইল নোটিফিকেশন</p>
                    <p className="text-sm text-gray-500">অর্ডার আপডেট ইমেইলে পান</p>
                  </div>
                  <Switch 
                    checked={userProfile.preferences.notifications.email}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, email: checked }
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS নোটিফিকেশন</p>
                    <p className="text-sm text-gray-500">গুরুত্वপূর্ণ আপডেট SMS-এ পান</p>
                  </div>
                  <Switch 
                    checked={userProfile.preferences.notifications.sms}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, sms: checked }
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">পুশ নোটিফিকেশন</p>
                    <p className="text-sm text-gray-500">ব্রাউজারে নোটিফিকেশন পান</p>
                  </div>
                  <Switch 
                    checked={userProfile.preferences.notifications.push}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, push: checked }
                        }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  প্রাইভেসি সেটিংস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">প্রোফাইল দৃশ্যমানতা</p>
                    <p className="text-sm text-gray-500">কে আপনার প্রোফাইল দেখতে পারবে</p>
                  </div>
                  <Select
                    value={userProfile.preferences.privacy.profileVisibility}
                    onValueChange={(value: "public" | "private") =>
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          privacy: { ...prev.preferences.privacy, profileVisibility: value }
                        }
                      }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">সবার জন্য</SelectItem>
                      <SelectItem value="private">ব্যক্তিগত</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">অ্যাক্টিভিটি ট্র্যাকিং</p>
                    <p className="text-sm text-gray-500">আপনার কার্যকলাপ ট্র্যাক করতে দিন</p>
                  </div>
                  <Switch 
                    checked={userProfile.preferences.privacy.activityTracking}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          privacy: { ...prev.preferences.privacy, activityTracking: checked }
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ডেটা সংগ্রহ</p>
                    <p className="text-sm text-gray-500">উন্নতির জন্য ডেটা সংগ্রহ করতে দিন</p>
                  </div>
                  <Switch 
                    checked={userProfile.preferences.privacy.dataCollection}
                    onCheckedChange={(checked) => 
                      setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          privacy: { ...prev.preferences.privacy, dataCollection: checked }
                        }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                বিপজ্জনক এলাকা
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  অ্যাকাউন্ট ডিলিট করুন
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                  এই অ্যাকশনটি পূর্বাবস্থায় ফেরত যাওয়া যাবে না। আপনার সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে।
                </p>
                <Button variant="destructive" size="sm">
                  অ্যাকাউন্ট ডিলিট করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here... */}
      </Tabs>
    </div>
  );
}