import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Search in products, categories, and brands
    const [products, categories] = await Promise.all([
      // Search products
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ],
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: true,
          tags: true
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),

      // Get unique categories that match
      prisma.product.findMany({
        where: {
          category: { contains: query, mode: 'insensitive' },
          status: 'ACTIVE'
        },
        select: { category: true },
        distinct: ['category'],
        take: 3
      })
    ]);

    const suggestions = [
      // Product suggestions
      ...products.map(product => ({
        id: product.id,
        type: 'product' as const,
        title: product.name,
        subtitle: product.description.slice(0, 100) + '...',
        price: product.price,
        image: product.images?.[0] || '/placeholder-product.jpg',
        category: product.category
      })),

      // Category suggestions
      ...categories.map(cat => ({
        id: `category-${cat.category}`,
        type: 'category' as const,
        title: cat.category,
        subtitle: `${cat.category} ক্যাটেগরিতে দেখুন`
      }))
    ];

    // Add popular search terms if no results
    if (suggestions.length === 0) {
      const popularTerms = [
        { id: 'pop-1', type: 'category' as const, title: 'জৈব ফল', subtitle: 'জনপ্রিয় খোঁজ' },
        { id: 'pop-2', type: 'category' as const, title: 'তাজা সবজি', subtitle: 'জনপ্রিয় খোঁজ' },
        { id: 'pop-3', type: 'category' as const, title: 'দুগ্ধজাত পণ্য', subtitle: 'জনপ্রিয় খোঁজ' }
      ];
      
      suggestions.push(...popularTerms.filter(term => 
        term.title.toLowerCase().includes(query.toLowerCase())
      ));
    }

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 8),
      query 
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}