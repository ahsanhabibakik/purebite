export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: ProductCategory;
  subcategory?: string;
  inStock: boolean;
  stockQuantity: number;
  unit: string; // "kg", "piece", "gram", "liter"
  weight?: number;
  tags: string[];
  featured: boolean;
  nutritionInfo?: NutritionInfo;
  ingredients?: string[];
  origin?: string;
  expiryDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export enum ProductCategory {
  HOMEMADE_SNACKS = "homemade_snacks",
  DRY_FOODS = "dry_foods", 
  FRESH_PRODUCTS = "fresh_products",
  BEVERAGES = "beverages",
  GIFT_COMBOS = "gift_combos",
  SEASONAL = "seasonal"
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedUnit?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  billingAddress?: Address;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  deliveryDate?: Date;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  area: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded"
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}