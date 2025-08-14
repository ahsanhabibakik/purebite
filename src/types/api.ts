// API Types for request/response handling

export interface CartItemData {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export interface CheckoutData {
  items: CartItemData[];
  shippingAddress: ShippingAddress;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  items: OrderItemData[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

export interface ReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface UserProfileData {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AnalyticsEventData {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface WishlistData {
  productId: string;
}