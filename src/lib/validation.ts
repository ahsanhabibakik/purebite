import { z } from "zod";

// ============================================================================
// User & Authentication Schemas
// ============================================================================

export const registerSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে").max(100, "নাম ১০০ অক্ষরের বেশি হতে পারবে না"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে").max(100, "পাসওয়ার্ড খুব বড়"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  password: z.string().min(1, "পাসওয়ার্ড প্রয়োজন"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
});

export const updatePasswordSchema = z.object({
  token: z.string().min(1, "টোকেন প্রয়োজন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"),
});

// ============================================================================
// Address Schema
// ============================================================================

export const addressSchema = z.object({
  fullName: z.string().min(2, "সম্পূর্ণ নাম প্রয়োজন").max(100, "নাম খুব বড়"),
  phone: z.string().min(11, "সঠিক মোবাইল নম্বর দিন").max(15, "মোবাইল নম্বর খুব বড়"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন").optional().or(z.literal("")),
  street: z.string().min(5, "সম্পূর্ণ ঠিকানা প্রয়োজন").max(500, "ঠিকানা খুব বড়"),
  area: z.string().max(100, "এলাকার নাম খুব বড়").optional().or(z.literal("")),
  city: z.string().max(50, "শহরের নাম খুব বড়").optional().or(z.literal("")),
  district: z.string().max(50, "জেলার নাম খুব বড়").optional().or(z.literal("")),
  postalCode: z.string().max(10, "পোস্টাল কোড খুব বড়").optional().or(z.literal("")),
  specialInstructions: z.string().max(500, "বিশেষ নির্দেশনা খুব বড়").optional().or(z.literal("")),
});

// ============================================================================
// Product Schemas
// ============================================================================

export const productSchema = z.object({
  name: z.string().min(2, "পণ্যের নাম কমপক্ষে ২ অক্ষর হতে হবে").max(200, "পণ্যের নাম খুব বড়"),
  description: z.string().min(10, "বিবরণ কমপক্ষে ১০ অক্ষর হতে হবে").max(2000, "বিবরণ খুব বড়"),
  price: z.number().min(0.01, "দাম ০.০১ এর চেয়ে বেশি হতে হবে").max(1000000, "দাম খুব বেশি"),
  salePrice: z.number().min(0, "বিক্রয়ের দাম ০ বা তার চেয়ে বেশি হতে হবে").optional(),
  category: z.string().min(1, "ক্যাটেগরি প্রয়োজন").max(100, "ক্যাটেগরি নাম খুব বড়"),
  stockCount: z.number().int().min(0, "স্টক সংখ্যা ০ বা তার চেয়ে বেশি হতে হবে").max(100000, "স্টক সংখ্যা খুব বেশি"),
  weight: z.string().max(50, "ওজন তথ্য খুব বড়").optional(),
  unit: z.string().max(20, "একক তথ্য খুব বড়").optional(),
  tags: z.array(z.string().max(50, "ট্যাগ খুব বড়")).max(20, "খুব বেশি ট্যাগ").optional(),
  images: z.array(z.string().url("সঠিক ছবির URL দিন")).max(10, "খুব বেশি ছবি").optional(),
});

export const productUpdateSchema = productSchema.partial();

// ============================================================================
// Order & Cart Schemas
// ============================================================================

export const cartItemSchema = z.object({
  productId: z.string().min(1, "পণ্য ID প্রয়োজন"),
  quantity: z.number().int().min(1, "সংখ্যা কমপক্ষে ১ হতে হবে").max(100, "সংখ্যা খুব বেশি"),
  price: z.number().min(0, "দাম ০ বা তার চেয়ে বেশি হতে হবে"),
  productName: z.string().min(1, "পণ্যের নাম প্রয়োজন").max(200, "পণ্যের নাম খুব বড়"),
});

export const orderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "কার্টে কোন পণ্য নেই").max(50, "খুব বেশি পণ্য"),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'MOBILE_BANKING', 'BANK_TRANSFER', 'ONLINE_PAYMENT'], {
    errorMap: () => ({ message: "সঠিক পেমেন্ট পদ্ধতি নির্বাচন করুন" })
  }),
  total: z.number().min(0.01, "মোট দাম ০.০১ এর চেয়ে বেশি হতে হবে"),
  subtotal: z.number().min(0, "উপমোট ০ বা তার চেয়ে বেশি হতে হবে"),
  tax: z.number().min(0, "ট্যাক্স ০ বা তার চেয়ে বেশি হতে হবে"),
  shipping: z.number().min(0, "ডেলিভারি চার্জ ০ বা তার চেয়ে বেশি হতে হবে"),
  couponCode: z.string().max(50, "কুপন কোড খুব বড়").optional(),
});

// ============================================================================
// Review Schema
// ============================================================================

export const reviewSchema = z.object({
  productId: z.string().min(1, "পণ্য ID প্রয়োজন"),
  rating: z.number().int().min(1, "রেটিং কমপক্ষে ১ হতে হবে").max(5, "রেটিং সর্বোচ্চ ৫ হতে পারে"),
  comment: z.string().min(5, "মন্তব্য কমপক্ষে ৫ অক্ষর হতে হবে").max(1000, "মন্তব্য খুব বড়"),
  title: z.string().max(200, "শিরোনাম খুব বড়").optional(),
});

// ============================================================================
// Coupon Schema
// ============================================================================

export const couponSchema = z.object({
  code: z.string().min(3, "কুপন কোড কমপক্ষে ৩ অক্ষর হতে হবে").max(50, "কুপন কোড খুব বড়"),
  discount: z.number().min(0.01, "ছাড় ০.০১ এর চেয়ে বেশি হতে হবে"),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    errorMap: () => ({ message: "সঠিক ছাড়ের ধরন নির্বাচন করুন" })
  }),
  minOrderAmount: z.number().min(0, "ন্যূনতম অর্ডার পরিমাণ ০ বা তার চেয়ে বেশি হতে হবে").optional(),
  maxDiscount: z.number().min(0, "সর্বোচ্চ ছাড় ০ বা তার চেয়ে বেশি হতে হবে").optional(),
  expiresAt: z.string().datetime("সঠিক মেয়াদ উত্তীর্ণের তারিখ দিন"),
  usageLimit: z.number().int().min(1, "ব্যবহার সীমা কমপক্ষে ১ হতে হবে").optional(),
});

// ============================================================================
// Contact & Newsletter Schemas
// ============================================================================

export const contactSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে").max(100, "নাম খুব বড়"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  phone: z.string().min(11, "সঠিক মোবাইল নম্বর দিন").max(15, "মোবাইল নম্বর খুব বড়").optional(),
  subject: z.string().min(5, "বিষয় কমপক্ষে ৫ অক্ষর হতে হবে").max(200, "বিষয় খুব বড়"),
  message: z.string().min(10, "বার্তা কমপক্ষে ১০ অক্ষর হতে হবে").max(2000, "বার্তা খুব বড়"),
});

export const newsletterSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে").max(100, "নাম খুব বড়").optional(),
});

// ============================================================================
// Search & Filter Schemas
// ============================================================================

export const searchSchema = z.object({
  q: z.string().max(200, "অনুসন্ধান শব্দ খুব বড়").optional(),
  category: z.string().max(100, "ক্যাটেগরি নাম খুব বড়").optional(),
  minPrice: z.number().min(0, "ন্যূনতম দাম ০ বা তার চেয়ে বেশি হতে হবে").optional(),
  maxPrice: z.number().min(0, "সর্বোচ্চ দাম ০ বা তার চেয়ে বেশি হতে হবে").optional(),
  sortBy: z.enum(['price', 'name', 'rating', 'createdAt', 'popularity'], {
    errorMap: () => ({ message: "সঠিক সাজানোর ক্রম নির্বাচন করুন" })
  }).optional(),
  sortOrder: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: "সঠিক ক্রম নির্বাচন করুন" })
  }).optional(),
  page: z.number().int().min(1, "পৃষ্ঠা নম্বর কমপক্ষে ১ হতে হবে").optional(),
  limit: z.number().int().min(1, "সীমা কমপক্ষে ১ হতে হবে").max(100, "সীমা সর্বোচ্চ ১০০ হতে পারে").optional(),
});

// ============================================================================
// File Upload Schema
// ============================================================================

export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, "ফাইলের নাম প্রয়োজন"),
    type: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, "শুধুমাত্র JPEG, PNG, WebP ছবি গ্রহণযোগ্য"),
    size: z.number().max(5 * 1024 * 1024, "ফাইলের আকার ৫MB এর চেয়ে বেশি হতে পারবে না"),
  }),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
  errors?: z.ZodError;
} {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error.errors[0]?.message || "তথ্য যাচাইকরণে সমস্যা হয়েছে",
        errors: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "তথ্য যাচাইকরণে অপ্রত্যাশিত সমস্যা হয়েছে",
    };
  }
}

export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateInput(schema, data);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data!;
  };
}

// Export all schemas for easy access
export const schemas = {
  register: registerSchema,
  login: loginSchema,
  resetPassword: resetPasswordSchema,
  updatePassword: updatePasswordSchema,
  address: addressSchema,
  product: productSchema,
  productUpdate: productUpdateSchema,
  cartItem: cartItemSchema,
  order: orderSchema,
  review: reviewSchema,
  coupon: couponSchema,
  contact: contactSchema,
  newsletter: newsletterSchema,
  search: searchSchema,
  fileUpload: fileUploadSchema,
};