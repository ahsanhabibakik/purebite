# 🚀 PureBite Deployment Guide

Welcome to PureBite - A comprehensive e-commerce platform for organic and fresh food products in Bangladesh!

## 🌟 Repository Information

- **Repository**: https://github.com/ahsanhabibakik/purebite.git
- **Technology Stack**: Next.js 15, TypeScript, MongoDB, Prisma, Tailwind CSS
- **Language Support**: Bengali (bn) & English (en)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/ahsanhabibakik/purebite.git
cd purebite
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Environment Setup
Create `.env.local` file with the following variables:
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/purebite"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# SSLCommerz (Payment Gateway)
SSLCOMMERZ_STORE_ID="your-store-id"
SSLCOMMERZ_STORE_PASSWORD="your-store-password"
SSLCOMMERZ_IS_LIVE=false

# Email (NodeMailer)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# OpenAI (for AI features)
OPENAI_API_KEY="your-openai-api-key"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Create admin user (optional)
node scripts/create-admin.js
```

### 5. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Features Implemented

### ✅ Core E-commerce Features
- Product catalog with advanced filtering
- Shopping cart with real-time updates
- User authentication and profiles
- Order management system
- Payment integration (SSLCommerz)

### ✅ Advanced UI/UX Enhancements
- **Modern Design System**: Clean, responsive interface with Bengali support
- **Dark Mode**: Complete theme system with user preferences
- **Interactive Animations**: Framer Motion powered micro-interactions
- **Advanced Filtering**: Collapsible filters with price ranges, categories, ratings
- **Product Zoom**: 360-degree product views with zoom capabilities

### ✅ Smart Features
- **Voice Search**: Speech recognition with Bengali support
- **AI Recommendations**: Personalized product suggestions
- **Real-time Notifications**: Live updates for orders and inventory
- **Advanced Cart**: Promo codes, delivery options, gift wrapping

### ✅ Admin Features
- **Comprehensive Dashboard**: Analytics and inventory management
- **Product Management**: CRUD operations with image uploads
- **Order Tracking**: Real-time order status updates
- **User Management**: Customer profiles and preferences

## 📱 Mobile & PWA Support
- Fully responsive design
- Progressive Web App (PWA) ready
- Touch-friendly interactions
- Offline capability (coming soon)

## 🛠 Build & Deploy

### Production Build
```bash
pnpm build
pnpm start
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms
The application is platform-agnostic and can be deployed to:
- Netlify
- Railway
- DigitalOcean
- AWS
- Any Node.js hosting provider

## 🔧 Configuration

### Internationalization
- Default locale: Bengali (bn)
- Supported locales: Bengali (bn), English (en)
- Route structure: `/[locale]/path` (e.g., `/bn/shop`, `/en/shop`)

### Payment Gateway
Configured for SSLCommerz (Bangladesh's leading payment gateway):
- Sandbox mode for development
- Production ready configuration
- Multiple payment methods support

### Database Schema
MongoDB with Prisma ORM:
- User management with roles
- Product catalog with inventory tracking
- Order management with status tracking
- Review and rating system
- Wishlist and comparison features

## 📚 Documentation

- [Project Completion Summary](./PROJECT_COMPLETION_SUMMARY.md)
- [Comprehensive Feature List](./COMPREHENSIVE_PROJECT_COMPLETION.md)
- [Testing Guide](./TESTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Animations powered by [Framer Motion](https://framer.com/motion)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**PureBite** - Bringing fresh, organic food to your doorstep with cutting-edge technology! 🌱✨