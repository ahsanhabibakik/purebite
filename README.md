# PureBite - Healthy Snacks E-commerce Platform

A complete e-commerce website for healthy Bangladeshi snacks and food products built with Next.js 15, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core E-commerce Functionality
- **Product Catalog**: Browse products by categories (Homemade Snacks, Dry Foods, Fresh Products, Gift Combos)
- **Product Details**: Detailed product pages with images, nutrition info, ingredients, and customer reviews
- **Shopping Cart**: Add to cart functionality with persistent storage using Zustand
- **Checkout Process**: Complete checkout flow with customer information and order placement
- **Search**: Real-time search functionality with product filtering

### Product Categories
1. **হোমমেড স্ন্যাক্স** (Homemade Snacks)
   - খেজুর বাদাম হালুয়া (Date Almond Halwa)
   - পুষ্টিকর লাড্ডু (Nutritious Laddu)
   - এনার্জি বল (Energy Balls)

2. **শুকনা খাবার** (Dry Foods)
   - প্রিমিয়াম বাদাম (Premium Nuts)
   - খাঁটি খেজুর গুড় (Pure Date Jaggery)

3. **তাজা পণ্য** (Fresh Products)
   - তাজা ইলিশ মাছ (Fresh Hilsa Fish)
   - দেশি মুরগির ডিম (Local Chicken Eggs)

4. **গিফট কম্বো** (Gift Combos)
   - হেলদি স্ন্যাক্স কম্বো (Healthy Snacks Combo)

### Technical Features
- **Responsive Design**: Mobile-first design approach
- **TypeScript**: Full type safety with comprehensive type definitions
- **State Management**: Zustand for cart and application state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components built with Radix UI primitives
- **Styling**: Tailwind CSS with custom utility classes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd purebite
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm run dev
   ```

4. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── about/             # About page
│   ├── categories/        # Categories listing
│   ├── checkout/          # Checkout process
│   ├── contact/           # Contact page
│   ├── products/[id]/     # Dynamic product pages
│   ├── shop/              # Shop/catalog page
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── CartSidebar.tsx    # Shopping cart sidebar
│   ├── Header.tsx         # Site header with navigation
│   ├── ProductCard.tsx    # Product display card
│   └── SearchModal.tsx    # Search functionality
├── data/                  # Static data and mock content
│   └── products.ts        # Product catalog data
├── lib/                   # Utilities and configurations
│   └── utils.ts           # Utility functions
├── store/                 # State management
│   └── cart.ts            # Cart state with Zustand
└── types/                 # TypeScript type definitions
    └── product.ts         # Product and order types
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: Zustand with persistence

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Package Manager**: pnpm
- **Build Tool**: Turbopack (Next.js 15)

## 📋 Available Scripts

```bash
# Development
pnpm run dev          # Start development server with Turbopack
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint

# Dependencies
pnpm install          # Install all dependencies
```

## 🎨 Design Features

### Bangladeshi Localization
- **Bengali Language**: All UI text in Bengali (বাংলা)
- **Local Currency**: Prices in Bangladeshi Taka (৳)
- **Local Products**: Traditional Bangladeshi foods and snacks
- **Cultural Elements**: Product names and descriptions in Bengali

### E-commerce UX
- **Product Grid/List Views**: Toggle between grid and list display
- **Advanced Filtering**: Category, price range, stock status filters
- **Cart Persistence**: Shopping cart data persists across sessions
- **Responsive Images**: Optimized image loading with Next.js Image component
- **Loading States**: Smooth transitions and loading indicators

## 🚧 Future Enhancements

### Pending Features (Ready for Implementation)
- **Authentication**: NextAuth.js integration for user accounts
- **User Dashboard**: Order history and profile management  
- **Admin Panel**: Product and order management system
- **Payment Integration**: bKash, Nagad, Rocket payment gateways
- **Database**: PostgreSQL with Prisma ORM
- **Order Management**: Real-time order tracking
- **Reviews System**: Customer product reviews and ratings

### Potential Additions
- **Push Notifications**: Order updates and promotions
- **Analytics**: Google Analytics and user behavior tracking
- **SEO Optimization**: Enhanced meta tags and structured data
- **Progressive Web App**: Offline functionality and app-like experience
- **Multi-language**: Support for both Bengali and English

## 📞 Contact & Support

For questions, suggestions, or support:
- **Email**: info@purebite.com
- **Phone**: +880 1711-123456
- **Address**: ১২৩, পুরানা পল্টন, ঢাকা - ১০০০

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**PureBite** - পিউর ও স্বাস্থ্যকর খাবারের ঠিকানা 🌱
