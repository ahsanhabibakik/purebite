import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://purebite.com.bd';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ];

  try {
    // Get all products that are in stock
    const products = await prisma.product.findMany({
      where: {
        inStock: true
      },
      select: {
        id: true,
        updatedAt: true,
        createdAt: true
      }
    });

    // Get unique categories
    const categories = await prisma.product.findMany({
      where: {
        inStock: true
      },
      select: {
        category: true
      },
      distinct: ['category']
    });

    // Product pages
    const productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt || product.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Category pages
    const categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(cat.category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Blog posts (if any)
    // const blogPosts = await getBlogPosts(); // Implement if you have blog posts
    // const blogPages = blogPosts.map(post => ({
    //   url: `${baseUrl}/blog/${post.slug}`,
    //   lastModified: post.updatedAt,
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.6,
    // }));

    return [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      // ...blogPages
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages if database query fails
    return staticPages;
  }
}