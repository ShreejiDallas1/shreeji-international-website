# Shreeji International - Wholesale Indian Grocery E-commerce Platform

## 🏢 Business Overview

**Shreeji International LLC** is a family-owned wholesale Indian grocery business located in Dallas, Texas. The company specializes in authentic Indian groceries and specialty foods, serving restaurants, grocery stores, and businesses across the United States.

### Business Details
- **Company**: Shreeji International LLC
- **Location**: 1162 Security Drive, Dallas, TX 75207
- **Phone**: (214) 529-7974
- **Email**: shreejidallas1@gmail.com
- **Business Hours**: Monday-Friday, 10 AM - 5 PM
- **Market**: Wholesale B2B (restaurants, retailers, businesses)
- **Geographic Scope**: United States only

### Product Categories
- Premium Basmati Rice & Grains
- Authentic Spices & Seasonings
- Fresh Lentils & Pulses
- Traditional Flours
- Pure Cooking Oils
- Organic Grains
- Gourmet Snacks
- Food items, Stationary, Clothing, Electronics

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15.3.3 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather Icons)
- **Forms**: React Hook Form with Zod validation

### Backend & Database
- **Authentication**: Firebase Auth (Email/Password)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **API Routes**: Next.js API routes

### Third-Party Integrations
- **Inventory Management**: Square API (Primary)
- **Payment Processing**: Square API
- **AI Assistant**: Google Gemini API
- **Shipping**: USPS Web Tools API (see shipping section)
- **Product Management**: Google Sheets API (Deactivated - code preserved)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Deployment**: Vercel

## 🚚 Shipping Integration Status

### Current Implementation
The website has two shipping modules:
1. **Legacy**: `src/lib/shipping.ts` (deprecated)
2. **Modern**: `src/lib/shipping-new.ts` (current)

### USPS API Requirements
**✅ SIMPLE SETUP**: USPS Web Tools API uses a straightforward User ID authentication system.

#### Required USPS API Credentials:
```env
# USPS Web Tools API Credentials
USPS_USER_ID=your-usps-user-id
USPS_ENVIRONMENT=sandbox  # or 'production'
```

#### Steps to Get USPS API Access:
1. Register at USPS Web Tools: https://registration.shippingapis.com/
2. Fill out the registration form with business details
3. Receive User ID via email (usually within 1-2 business days)
4. Test in sandbox environment first
5. Request production access when ready

### Current Shipping Features
- Zone-based shipping calculation (Dallas, TX origin)
- Weight-based pricing
- Fallback rates when API unavailable
- Support for Ground Advantage, Priority Mail, and Priority Express shipping

## 🔧 Environment Variables Required

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google Sheets API (DEACTIVATED - kept for reference)
# GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
# GOOGLE_SHEET_ID=your-google-sheet-id

# USPS Shipping API (Web Tools - REQUIRED)
USPS_USER_ID=your-usps-user-id
USPS_ENVIRONMENT=sandbox

# Square Integration (Payment + Inventory)
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_LOCATION_ID=your-square-location-id
SQUARE_ENVIRONMENT=sandbox

# AI Assistant
GEMINI_API_KEY=your-gemini-api-key

# API Security
SYNC_API_KEY=your-sync-api-key
NEXT_PUBLIC_SYNC_API_KEY=your-sync-api-key
```

## 📋 Current Development Status

### ✅ Completed Features
- [x] Modern responsive design with dark mode
- [x] Product catalog with search and filtering
- [x] User authentication and account management
- [x] Shopping cart functionality
- [x] Square integration for inventory management
- [x] AI-powered product assistant
- [x] Admin dashboard
- [x] Basic shipping calculation
- [x] Firebase integration (Auth, Firestore, Storage)

### 🚧 Ready for Launch - Core Features Working
- [x] **Shipping System**: Smart calculated rates working perfectly
- [x] **Inventory Management**: Square integration functional
- [x] **User Authentication**: Firebase Auth working
- [x] **Shopping Cart**: Full functionality implemented
- [x] **Admin Dashboard**: Product and user management ready
- [x] **AI Assistant**: Google Gemini integration working

### 🔄 Future Enhancements (Post-Launch)
- [ ] **USPS Web Tools API Integration** (for real-time rates)
- [ ] **Square Payment Processing** (currently basic implementation)
- [ ] **Advanced Order Management** (tracking, notifications)
- [ ] **Inventory Automation** (low stock alerts)
- [ ] **Email Marketing** (customer notifications)
- [ ] **Analytics Dashboard** (sales reporting)

### 🎯 Current Status: READY FOR LAUNCH

#### ✅ What's Working Great:
1. **Shipping**: Calculated rates based on weight, distance, and value
2. **Inventory**: Square integration with real-time product sync
3. **Authentication**: User registration and login functional
4. **Cart**: Add to cart, quantity updates, checkout flow
5. **Admin**: Product management, user management, sync tools
6. **AI**: Product search and recommendations working

#### 🔧 Minor Improvements Needed:
1. **Environment Variables**: Set up proper .env.local file
2. **Payment Testing**: Test Square payment flow thoroughly
3. **Order Confirmation**: Enhance order confirmation emails

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- USPS Web Tools account (for shipping)
- Square Developer account (for inventory and payments)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd shreeji-international

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Development Commands
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run dev:with-db     # Start with database sync
npm run sync-products   # Sync products from Square
```

## 📊 Business Metrics & Goals

### Current Performance
- **Product Categories**: 8+ main categories
- **Service Area**: United States
- **Business Model**: B2B Wholesale
- **Minimum Order**: Varies by product


### Growth Objectives
- Expand product catalog
- Improve shipping efficiency
- Enhance customer experience
- Streamline order fulfillment
- Increase automation

## 🔒 Security Considerations

- Firebase security rules implemented
- API key protection
- User authentication required for orders
- Admin role-based access control
- Secure payment processing with Square

## 📞 Support & Contact

For technical issues or business inquiries:
- **Business**: shreejidallas1@gmail.com
- **Phone**: (214) 529-7974
- **Address**: 1162 Security Drive, Dallas, TX 75207

## 📝 Development Notes for AI Assistants

### Key Points for Future Development:
1. **Shipping is the #1 priority** - USPS Web Tools API implementation needed
2. **Inventory managed through Square** - real-time inventory tracking and POS integration
3. **B2B focus** - wholesale pricing, bulk orders, business accounts
4. **Dallas-based** - all shipping originates from Texas warehouse
5. **Family business** - established relationships, quality focus

### Common Tasks:
- Product sync from Square catalog
- Shipping rate calculations
- Order processing
- User account management
- Admin dashboard updates

### Architecture Decisions:
- Next.js for full-stack capabilities
- Firebase for rapid development and scaling
- Square for inventory and payment processing
- TypeScript for code reliability
- Tailwind for consistent UI

---

**Last Updated**: December 2024
**Version**: 0.1.0
**Status**: Active Development

*This README should be updated whenever significant changes are made to the codebase, business requirements, or technical architecture.*