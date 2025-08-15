/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/products/route'

// Mock the database
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  },
}))

// Mock authentication
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

const mockProducts = [
  {
    id: '1',
    name: 'Organic Apples',
    description: 'Fresh organic apples',
    price: 299,
    originalPrice: 399,
    image: '/images/apple.jpg',
    category: 'Fruits',
    inStock: true,
    stock: 50,
    rating: 4.5,
    reviewCount: 25,
    discount: 25,
    tags: ['organic', 'fresh'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Organic Bananas',
    description: 'Fresh organic bananas',
    price: 199,
    originalPrice: null,
    image: '/images/banana.jpg',
    category: 'Fruits',
    inStock: true,
    stock: 30,
    rating: 4.2,
    reviewCount: 15,
    discount: 0,
    tags: ['organic', 'potassium'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products with default pagination', async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)
      mockPrisma.product.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toEqual(mockProducts)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
    })

    it('should handle search query', async () => {
      const searchResults = [mockProducts[0]]
      mockPrisma.product.findMany.mockResolvedValue(searchResults)
      mockPrisma.product.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/products?search=apple')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toEqual(searchResults)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({
                  contains: 'apple',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        })
      )
    })

    it('should handle category filter', async () => {
      const fruitProducts = mockProducts
      mockPrisma.product.findMany.mockResolvedValue(fruitProducts)
      mockPrisma.product.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products?category=Fruits')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Fruits',
          }),
        })
      )
    })

    it('should handle price range filter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProducts[1]])
      mockPrisma.product.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/products?minPrice=100&maxPrice=250')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 100,
              lte: 250,
            },
          }),
        })
      )
    })

    it('should handle sorting', async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)
      mockPrisma.product.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products?sortBy=price&sortOrder=desc')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        })
      )
    })

    it('should handle pagination', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProducts[1]])
      mockPrisma.product.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products?page=2&limit=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination).toEqual({
        page: 2,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      })
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          take: 1,
        })
      )
    })

    it('should handle inStock filter', async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)
      mockPrisma.product.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products?inStock=true')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            inStock: true,
          }),
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch products')
    })
  })

  describe('POST /api/products', () => {
    const mockSession = {
      user: { email: 'admin@example.com' },
    }

    const mockAdmin = {
      id: '1',
      email: 'admin@example.com',
      role: 'ADMIN',
    }

    const newProductData = {
      name: 'New Product',
      description: 'A new product',
      price: 500,
      category: 'Electronics',
      image: '/images/new-product.jpg',
      stock: 10,
    }

    it('should create a new product when authenticated as admin', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin as any)
      mockPrisma.product.create.mockResolvedValue({
        id: '3',
        ...newProductData,
        inStock: true,
        rating: 0,
        reviewCount: 0,
        discount: 0,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProductData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.product.name).toBe(newProductData.name)
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining(newProductData),
      })
    })

    it('should reject unauthorized requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProductData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      const regularUser = { ...mockAdmin, role: 'USER' }
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.user.findUnique.mockResolvedValue(regularUser as any)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProductData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Admin access required')
    })

    it('should validate required fields', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin as any)

      const invalidData = { name: '' } // Missing required fields

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('validation')
    })

    it('should handle database errors during creation', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin as any)
      mockPrisma.product.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProductData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create product')
    })
  })
})