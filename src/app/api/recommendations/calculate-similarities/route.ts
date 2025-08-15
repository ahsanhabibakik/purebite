import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { SimilarityType } from '@prisma/client';

// This endpoint calculates product similarities for the recommendation engine
// Should be called periodically (e.g., daily via cron job)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to trigger similarity calculations
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you might want to implement proper role checking)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { type = 'all' } = await request.json();

    let calculatedCount = 0;

    if (type === 'all' || type === 'content_based') {
      calculatedCount += await calculateContentBasedSimilarities();
    }

    if (type === 'all' || type === 'collaborative') {
      calculatedCount += await calculateCollaborativeSimilarities();
    }

    if (type === 'all' || type === 'category') {
      calculatedCount += await calculateCategorySimilarities();
    }

    return NextResponse.json({
      success: true,
      message: `Calculated ${calculatedCount} product similarities`,
      calculatedCount
    });

  } catch (error) {
    console.error('Error calculating similarities:', error);
    return NextResponse.json(
      { error: 'Failed to calculate similarities' },
      { status: 500 }
    );
  }
}

async function calculateContentBasedSimilarities(): Promise<number> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      tags: true,
      price: true
    }
  });

  let count = 0;
  const similarities: Array<{
    productId: string;
    similarProductId: string;
    similarityScore: number;
    similarityType: SimilarityType;
  }> = [];

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const product1 = products[i];
      const product2 = products[j];
      
      const similarity = calculateContentSimilarity(product1, product2);
      
      if (similarity > 0.3) { // Only store meaningful similarities
        similarities.push({
          productId: product1.id,
          similarProductId: product2.id,
          similarityScore: similarity,
          similarityType: 'CONTENT_BASED'
        });

        // Add reverse similarity
        similarities.push({
          productId: product2.id,
          similarProductId: product1.id,
          similarityScore: similarity,
          similarityType: 'CONTENT_BASED'
        });
        
        count += 2;
      }
    }
  }

  // Batch insert similarities
  if (similarities.length > 0) {
    await prisma.productSimilarity.deleteMany({
      where: { similarityType: 'CONTENT_BASED' }
    });

    await prisma.productSimilarity.createMany({
      data: similarities,
      skipDuplicates: true
    });
  }

  return count;
}

async function calculateCollaborativeSimilarities(): Promise<number> {
  // Get user purchase/view patterns
  const userBehavior = await prisma.userBehavior.groupBy({
    by: ['userId', 'productId'],
    where: {
      actionType: { in: ['PURCHASE', 'VIEW', 'ADD_TO_CART'] }
    },
    _count: { actionType: true }
  });

  // Create user-product interaction matrix
  const userProductMatrix: Record<string, Record<string, number>> = {};
  
  userBehavior.forEach(behavior => {
    if (!userProductMatrix[behavior.userId]) {
      userProductMatrix[behavior.userId] = {};
    }
    userProductMatrix[behavior.userId][behavior.productId] = behavior._count.actionType;
  });

  const products = Object.keys(
    Object.values(userProductMatrix).reduce((acc, userProducts) => {
      Object.keys(userProducts).forEach(productId => {
        acc[productId] = true;
      });
      return acc;
    }, {} as Record<string, boolean>)
  );

  let count = 0;
  const similarities: Array<{
    productId: string;
    similarProductId: string;
    similarityScore: number;
    similarityType: SimilarityType;
  }> = [];

  // Calculate product-product similarities using cosine similarity
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const product1Id = products[i];
      const product2Id = products[j];
      
      const similarity = calculateCollaborativeSimilarity(
        product1Id, 
        product2Id, 
        userProductMatrix
      );
      
      if (similarity > 0.2) {
        similarities.push({
          productId: product1Id,
          similarProductId: product2Id,
          similarityScore: similarity,
          similarityType: 'COLLABORATIVE'
        });

        similarities.push({
          productId: product2Id,
          similarProductId: product1Id,
          similarityScore: similarity,
          similarityType: 'COLLABORATIVE'
        });
        
        count += 2;
      }
    }
  }

  if (similarities.length > 0) {
    await prisma.productSimilarity.deleteMany({
      where: { similarityType: 'COLLABORATIVE' }
    });

    await prisma.productSimilarity.createMany({
      data: similarities,
      skipDuplicates: true
    });
  }

  return count;
}

async function calculateCategorySimilarities(): Promise<number> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      category: true,
      rating: true,
      reviewCount: true,
      price: true
    }
  });

  // Group products by category
  const categoryGroups: Record<string, typeof products> = {};
  products.forEach(product => {
    if (!categoryGroups[product.category]) {
      categoryGroups[product.category] = [];
    }
    categoryGroups[product.category].push(product);
  });

  let count = 0;
  const similarities: Array<{
    productId: string;
    similarProductId: string;
    similarityScore: number;
    similarityType: SimilarityType;
  }> = [];

  // Calculate similarities within each category
  Object.values(categoryGroups).forEach(categoryProducts => {
    for (let i = 0; i < categoryProducts.length; i++) {
      for (let j = i + 1; j < categoryProducts.length; j++) {
        const product1 = categoryProducts[i];
        const product2 = categoryProducts[j];
        
        // Calculate similarity based on rating and price range
        const ratingSimilarity = 1 - Math.abs(product1.rating - product2.rating) / 5;
        const priceSimilarity = 1 - Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
        
        const similarity = (ratingSimilarity + priceSimilarity) / 2;
        
        if (similarity > 0.4) {
          similarities.push({
            productId: product1.id,
            similarProductId: product2.id,
            similarityScore: similarity,
            similarityType: 'CATEGORY'
          });

          similarities.push({
            productId: product2.id,
            similarProductId: product1.id,
            similarityScore: similarity,
            similarityType: 'CATEGORY'
          });
          
          count += 2;
        }
      }
    }
  });

  if (similarities.length > 0) {
    await prisma.productSimilarity.deleteMany({
      where: { similarityType: 'CATEGORY' }
    });

    await prisma.productSimilarity.createMany({
      data: similarities,
      skipDuplicates: true
    });
  }

  return count;
}

function calculateContentSimilarity(product1: any, product2: any): number {
  let similarity = 0;
  
  // Category similarity (high weight)
  if (product1.category === product2.category) {
    similarity += 0.4;
  }
  
  // Tag similarity
  const commonTags = product1.tags.filter((tag: string) => 
    product2.tags.includes(tag)
  ).length;
  const totalTags = new Set([...product1.tags, ...product2.tags]).size;
  if (totalTags > 0) {
    similarity += (commonTags / totalTags) * 0.3;
  }
  
  // Price similarity
  const priceDiff = Math.abs(product1.price - product2.price);
  const maxPrice = Math.max(product1.price, product2.price);
  const priceSimilarity = maxPrice > 0 ? 1 - (priceDiff / maxPrice) : 1;
  similarity += priceSimilarity * 0.2;
  
  // Name/description similarity (simple keyword matching)
  const product1Words = new Set([
    ...product1.name.toLowerCase().split(' '),
    ...product1.description.toLowerCase().split(' ')
  ].filter(word => word.length > 2));
  
  const product2Words = new Set([
    ...product2.name.toLowerCase().split(' '),
    ...product2.description.toLowerCase().split(' ')
  ].filter(word => word.length > 2));
  
  const commonWords = [...product1Words].filter(word => product2Words.has(word)).length;
  const totalWords = new Set([...product1Words, ...product2Words]).size;
  
  if (totalWords > 0) {
    similarity += (commonWords / totalWords) * 0.1;
  }
  
  return Math.min(similarity, 1);
}

function calculateCollaborativeSimilarity(
  product1Id: string,
  product2Id: string,
  userProductMatrix: Record<string, Record<string, number>>
): number {
  const users = Object.keys(userProductMatrix);
  
  // Get users who interacted with both products
  const commonUsers = users.filter(userId => 
    userProductMatrix[userId][product1Id] && userProductMatrix[userId][product2Id]
  );
  
  if (commonUsers.length < 2) return 0; // Need at least 2 common users
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  commonUsers.forEach(userId => {
    const rating1 = userProductMatrix[userId][product1Id] || 0;
    const rating2 = userProductMatrix[userId][product2Id] || 0;
    
    dotProduct += rating1 * rating2;
    norm1 += rating1 * rating1;
    norm2 += rating2 * rating2;
  });
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}