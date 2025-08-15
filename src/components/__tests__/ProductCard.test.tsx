import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types/product'

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  ShoppingCart: () => <div data-testid="cart-icon">Cart</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
}))

const mockProduct: Product = {
  id: '1',
  name: 'Organic Apples',
  description: 'Fresh organic apples from local farms',
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
}

describe('ProductCard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Organic Apples')).toBeInTheDocument()
    expect(screen.getByText('৳299')).toBeInTheDocument()
    expect(screen.getByText('৳399')).toBeInTheDocument()
    expect(screen.getByText('25% OFF')).toBeInTheDocument()
    expect(screen.getByAltText('Organic Apples')).toBeInTheDocument()
  })

  it('shows out of stock state when product is not in stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText('স্টকে নেই')).toBeInTheDocument()
  })

  it('shows low stock warning when stock is low', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 }
    render(<ProductCard product={lowStockProduct} />)
    
    expect(screen.getByText('মাত্র ৩টি বাকি!')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn()
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(mockOnClick).toHaveBeenCalledWith(mockProduct)
  })

  it('handles add to cart button click', async () => {
    const mockOnAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />)
    
    const addToCartButton = screen.getByRole('button', { name: /কার্টে যোগ করুন/i })
    fireEvent.click(addToCartButton)
    
    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct, 1)
    })
  })

  it('handles wishlist toggle', async () => {
    const mockOnWishlistToggle = jest.fn()
    render(<ProductCard product={mockProduct} onWishlistToggle={mockOnWishlistToggle} />)
    
    const wishlistButton = screen.getByRole('button', { name: /উইশলিস্টে যোগ করুন/i })
    fireEvent.click(wishlistButton)
    
    await waitFor(() => {
      expect(mockOnWishlistToggle).toHaveBeenCalledWith(mockProduct)
    })
  })

  it('shows product rating when available', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(25 রিভিউ)')).toBeInTheDocument()
  })

  it('handles quick view action', async () => {
    const mockOnQuickView = jest.fn()
    render(<ProductCard product={mockProduct} onQuickView={mockOnQuickView} />)
    
    const quickViewButton = screen.getByRole('button', { name: /দ্রুত দেখুন/i })
    fireEvent.click(quickViewButton)
    
    await waitFor(() => {
      expect(mockOnQuickView).toHaveBeenCalledWith(mockProduct)
    })
  })

  it('renders in compact mode when specified', () => {
    render(<ProductCard product={mockProduct} variant="compact" />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('compact')
  })

  it('shows discount badge when product has discount', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('25% OFF')).toBeInTheDocument()
  })

  it('does not show discount badge when no discount', () => {
    const noDiscountProduct = { ...mockProduct, discount: 0, originalPrice: undefined }
    render(<ProductCard product={noDiscountProduct} />)
    
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(<ProductCard product={mockProduct} loading />)
    
    // Check for skeleton loading indicators
    expect(screen.getByTestId('product-card-skeleton')).toBeInTheDocument()
  })

  it('is accessible with proper ARIA labels', () => {
    render(<ProductCard product={mockProduct} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Organic Apples'))
    
    const addToCartButton = screen.getByRole('button', { name: /কার্টে যোগ করুন/i })
    expect(addToCartButton).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    const mockOnClick = jest.fn()
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />)
    
    const card = screen.getByRole('article')
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' })
    
    expect(mockOnClick).toHaveBeenCalledWith(mockProduct)
  })

  it('prevents add to cart when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    const mockOnAddToCart = jest.fn()
    render(<ProductCard product={outOfStockProduct} onAddToCart={mockOnAddToCart} />)
    
    const addToCartButton = screen.getByRole('button', { name: /স্টকে নেই/i })
    expect(addToCartButton).toBeDisabled()
    
    fireEvent.click(addToCartButton)
    expect(mockOnAddToCart).not.toHaveBeenCalled()
  })

  it('formats price correctly with Bangladeshi currency', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('৳299')).toBeInTheDocument()
    expect(screen.getByText('৳399')).toBeInTheDocument()
  })

  it('truncates long product names', () => {
    const longNameProduct = {
      ...mockProduct,
      name: 'This is a very long product name that should be truncated'
    }
    render(<ProductCard product={longNameProduct} />)
    
    const productName = screen.getByText(longNameProduct.name)
    expect(productName).toHaveClass('truncate')
  })
})