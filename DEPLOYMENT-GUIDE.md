# 🚀 **PureBite Deployment Guide for Vercel**

## **📋 Pre-Deployment Checklist**

### **✅ Environment Setup Complete**
- [x] Local `.env.local` configured with database
- [x] Production `.env.production` file created
- [x] MongoDB Atlas database ready
- [x] Google Analytics & GTM configured
- [x] `.gitignore` updated for security

### **✅ Services Configuration Status**
- **Database**: HealthyFood MongoDB Atlas ✅
- **Site Name**: Healthyfood ✅
- **Domain**: https://purebite.vercel.app ✅
- **Admin Email**: syedmirhabib@gmail.com ✅

---

## **🔧 Step 1: Prepare for Production Deployment**

### **Database Setup (Complete ✅)**
Your MongoDB Atlas database is ready:
```
Database: HealthyFood
URL: healthyfood.7aepirq.mongodb.net
Collection: purebite
```

### **Generate Prisma Client**
```bash
# In your local project directory
pnpm db:generate
pnpm db:push
```

---

## **🌐 Step 2: Deploy to Vercel**

### **Option A: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **Option B: Deploy via GitHub (Recommended)**
1. **Push your code to GitHub** (already done)
2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure settings:**
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

---

## **⚙️ Step 3: Configure Environment Variables in Vercel**

### **Copy These Variables to Vercel Dashboard**

Go to: **Vercel Dashboard > Your Project > Settings > Environment Variables**

**Copy and paste each variable individually:**

```bash
# === ESSENTIAL VARIABLES (REQUIRED) ===
NEXTAUTH_URL=https://purebite.vercel.app
NEXTAUTH_SECRET=ddey psph genq faaa
DATABASE_URL=mongodb+srv://mirabidhasan7:cOG9Hvi0bgjWInvh@healthyfood.7aepirq.mongodb.net/purebite?retryWrites=true&w=majority&appName=HealthyFood
SITE_NAME=Healthyfood
ADMIN_EMAIL=syedmirhabib@gmail.com
NODE_ENV=production

# === GOOGLE ANALYTICS & GTM ===
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-D7CKE6Z48J
NEXT_PUBLIC_GTM_ID=GTM-PT74S7P4

# === PAYMENT URLS ===
NEXT_PUBLIC_SUCCESS_URL=https://purebite.vercel.app/payment/success
NEXT_PUBLIC_FAIL_URL=https://purebite.vercel.app/payment/failed
NEXT_PUBLIC_CANCEL_URL=https://purebite.vercel.app/payment/cancelled
NEXT_PUBLIC_IPN_URL=https://purebite.vercel.app/api/payment/ipn

# === GOOGLE OAUTH (UPDATE WITH PRODUCTION KEYS) ===
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# === STRIPE (ADD WHEN READY) ===
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SANDBOX_MODE=false

# === EMAIL CONFIGURATION (ADD WHEN READY) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=syedmirhabib@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM=noreply@purebite.vercel.app
```

---

## **🔐 Step 4: Update OAuth Settings**

### **Google OAuth Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 client
4. **Add to Authorized domains:**
   - `purebite.vercel.app`
5. **Update Redirect URIs:**
   - `https://purebite.vercel.app/api/auth/callback/google`

---

## **📊 Step 5: Verify Analytics Setup**

### **Google Analytics 4**
- **Property**: G-D7CKE6Z48J ✅
- **Domain**: https://purebite.vercel.app ✅
- **Status**: Ready for tracking ✅

### **Google Tag Manager**
- **Container**: GTM-PT74S7P4 ✅
- **Status**: Ready for tracking ✅

---

## **✅ Step 6: Post-Deployment Verification**

### **Test Your Deployed Site**
Visit: https://purebite.vercel.app

**Check these features:**
- [ ] Homepage loads correctly
- [ ] Google Analytics tracking works
- [ ] GTM events fire properly
- [ ] Database connection working
- [ ] Authentication flow works
- [ ] API endpoints respond

### **Development Testing Commands**
```bash
# Test local build
pnpm build
pnpm start

# Test database connection
pnpm db:push

# Run development server
pnpm dev
```

---

## **🔧 Step 7: Additional Services Setup**

### **When Ready to Add:**

**Stripe Payments (Later)**
1. Get live Stripe keys from dashboard
2. Update environment variables
3. Set up webhook endpoints

**Email Service (Later)**
1. Configure Gmail App Password or use SendGrid
2. Update SMTP environment variables
3. Test email sending

**Image Storage (Later)**
1. Set up Cloudinary account
2. Configure image upload endpoints
3. Update environment variables

---

## **🚨 Troubleshooting**

### **Common Issues & Solutions**

**Build Fails:**
```bash
# Check Node.js version (use Node 18+)
node --version

# Clear cache and rebuild
rm -rf .next
pnpm build
```

**Database Connection Issues:**
```bash
# Test database connection
pnpm db:push
```

**Environment Variables Not Working:**
1. Ensure variables are set in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly

**Analytics Not Tracking:**
1. Verify GA4 and GTM IDs are correct
2. Check browser network tab for tracking requests
3. Use browser console to test tracking

---

## **📱 Final Deployment Steps**

### **1. Push Final Changes**
```bash
git add .
git commit -m "feat: production ready deployment configuration"
git push origin main
```

### **2. Trigger Vercel Deployment**
- Push triggers automatic deployment
- Or manually trigger in Vercel dashboard

### **3. Verify Live Site**
- Visit https://purebite.vercel.app
- Test all functionality
- Check analytics dashboard

---

## **🎉 Your Site is Live!**

### **URLs:**
- **Production Site**: https://purebite.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Analytics**: https://analytics.google.com (G-D7CKE6Z48J)
- **GTM Container**: https://tagmanager.google.com (GTM-PT74S7P4)

### **Admin Access:**
- **Email**: syedmirhabib@gmail.com
- **Database**: HealthyFood MongoDB Atlas
- **Site Name**: Healthyfood

**Your PureBite ecommerce platform is now live and ready for customers!** 🚀

---

## **📞 Support**

If you encounter any issues during deployment:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Review error messages in browser console

**Happy deploying!** 🎯