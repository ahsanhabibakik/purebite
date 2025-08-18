import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cartItemSchema, validateInput } from '@/lib/validation';
import { z } from 'zod';

// Schema for cart operations
const addToCartSchema = z.object({
  productId: z.string().min(1, "পণ্য ID প্রয়োজন"),
  quantity: z.number().int().min(1, "সংখ্যা কমপক্ষে ১ হতে হবে").max(100, "সংখ্যা খুব বেশি"),
});

const updateCartSchema = z.object({
  cartItemId: z.string().min(1, "কার্ট আইটেম ID প্রয়োজন"),
  quantity: z.number().int().min(0, "সংখ্যা ০ বা তার চেয়ে বেশি হতে হবে").max(100, "সংখ্যা খুব বেশি"),
});

const syncCartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, "পণ্য ID প্রয়োজন"),
    quantity: z.number().int().min(1, "সংখ্যা কমপক্ষে ১ হতে হবে"),
  })).max(50, "খুব বেশি পণ্য"),
});

// GET - Retrieve user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'অননুমোদিত অ্যাক্সেস',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'ব্যবহারকারী পাওয়া যায়নি',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Get user's cart items with product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            image: true,
            images: true,
            stockCount: true,
            inStock: true,
            unit: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate cart totals
    const items = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      subtotal: (item.product.salePrice || item.product.price) * item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      items,
      subtotal,
      itemCount,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'কার্ট লোড করতে সমস্যা হয়েছে', code: 'FETCH_ERROR' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'অননুমোদিত অ্যাক্সেস',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'ব্যবহারকারী পাওয়া যায়নি',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    const data = await request.json();
    const validation = validateInput(addToCartSchema, data);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const { productId, quantity } = validation.data;

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        stockCount: true,
        inStock: true,
      }
    });

    if (!product) {
      return NextResponse.json({ 
        error: 'পণ্য পাওয়া যায়নি',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    if (!product.inStock || (product.stockCount && product.stockCount < quantity)) {
      return NextResponse.json({ 
        error: 'পর্যাপ্ত স্টক নেই',
        code: 'INSUFFICIENT_STOCK'
      }, { status: 400 });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stockCount && product.stockCount < newQuantity) {
        return NextResponse.json({ 
          error: 'পর্যাপ্ত স্টক নেই',
          code: 'INSUFFICIENT_STOCK'
        }, { status: 400 });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              salePrice: true,
              image: true,
              unit: true,
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: productId,
          quantity: quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              salePrice: true,
              image: true,
              unit: true,
            }
          }
        }
      });
    }

    return NextResponse.json({
      message: 'পণ্য কার্টে যোগ করা হয়েছে',
      cartItem: {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        product: cartItem.product,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'কার্টে যোগ করতে সমস্যা হয়েছে', code: 'ADD_ERROR' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'অননুমোদিত অ্যাক্সেস',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'ব্যবহারকারী পাওয়া যায়নি',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    const data = await request.json();
    const validation = validateInput(updateCartSchema, data);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const { cartItemId, quantity } = validation.data;

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: user.id,
      },
      include: {
        product: {
          select: {
            stockCount: true,
            inStock: true,
          }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json({ 
        error: 'কার্ট আইটেম পাওয়া যায়নি',
        code: 'CART_ITEM_NOT_FOUND'
      }, { status: 404 });
    }

    if (quantity === 0) {
      // Remove item from cart
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });

      return NextResponse.json({
        message: 'পণ্য কার্ট থেকে সরানো হয়েছে'
      });
    } else {
      // Check stock availability
      if (!cartItem.product.inStock || (cartItem.product.stockCount && cartItem.product.stockCount < quantity)) {
        return NextResponse.json({ 
          error: 'পর্যাপ্ত স্টক নেই',
          code: 'INSUFFICIENT_STOCK'
        }, { status: 400 });
      }

      // Update quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              salePrice: true,
              image: true,
              unit: true,
            }
          }
        }
      });

      return NextResponse.json({
        message: 'কার্ট আপডেট করা হয়েছে',
        cartItem: {
          id: updatedCartItem.id,
          productId: updatedCartItem.productId,
          quantity: updatedCartItem.quantity,
          product: updatedCartItem.product,
        }
      });
    }

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'কার্ট আপডেট করতে সমস্যা হয়েছে', code: 'UPDATE_ERROR' },
      { status: 500 }
    );
  }
}

// DELETE - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'অননুমোদিত অ্যাক্সেস',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'ব্যবহারকারী পাওয়া যায়নি',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Clear all cart items for user
    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({
      message: 'কার্ট সাফ করা হয়েছে'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'কার্ট সাফ করতে সমস্যা হয়েছে', code: 'CLEAR_ERROR' },
      { status: 500 }
    );
  }
}