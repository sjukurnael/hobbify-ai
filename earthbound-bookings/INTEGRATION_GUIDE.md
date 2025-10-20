# Backend Integration Guide

This frontend is now fully structured to support your yoga booking backend API. Here's everything you need to know to integrate it.

## 🏗️ What's Been Set Up

### 1. TypeScript Types (`src/types/index.ts`)
- Full TypeScript interfaces matching your backend schema
- Types for User, Class, Booking, and all DTOs

### 2. API Service Layer (`src/services/api.ts`)
- Complete API client with all endpoint functions
- Organized by resource (auth, users, classes, bookings)
- Token management and authentication headers
- Ready for your backend URL

### 3. Authentication Context (`src/contexts/AuthContext.tsx`)
- Google OAuth integration ready
- JWT token handling
- User state management
- Role-based access helpers (isAdmin, isInstructor, isMember)

### 4. Pages Created
- `/` - Home page
- `/classes` - Browse and book classes
- `/my-bookings` - User's booking management
- `/admin` - Admin dashboard for instructors/admins
- Fully integrated with your backend types

### 5. Components Updated
- **Navbar** - Role-based navigation, user dropdown
- **ClassCard** - Shows instructor, capacity, pricing
- **BookingModal** - Real booking flow with API integration

## 🔧 How to Integrate

### Step 1: Set Your Backend URL

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=https://your-backend-url.com
```

Or update it directly in `src/services/api.ts`:

```typescript
const API_BASE_URL = "https://your-backend-url.com";
```

### Step 2: Configure OAuth Callback

In your backend, set the Google OAuth redirect URL to:
```
https://your-frontend-url.com/
```

The frontend automatically:
1. Captures the `?token=xxx` from the callback URL
2. Stores it in localStorage
3. Removes the token from the URL
4. Loads the user data

### Step 3: Test the Flow

1. **Authentication**:
   - Click "Sign in with Google" button
   - User redirects to your backend `/auth/google`
   - Backend redirects back with `?token=xxx`
   - Frontend stores token and loads user

2. **Browse Classes**:
   - Navigate to `/classes`
   - Classes automatically load from `GET /api/classes/upcoming`
   - Search and filter work client-side

3. **Book a Class**:
   - Click "Book Class" on any class card
   - If not authenticated, prompts to sign in
   - If authenticated, sends `POST /api/bookings` with classId
   - Shows success/error toast
   - Refreshes class data to show updated capacity

4. **View Bookings**:
   - Navigate to `/my-bookings`
   - Loads from `GET /api/bookings/user/:userId`
   - Shows upcoming and past classes
   - Can cancel bookings with `PATCH /api/bookings/:id/cancel`

5. **Admin Dashboard**:
   - Only visible to admin/instructor roles
   - Shows all classes and bookings
   - Stats: total classes, bookings, revenue
   - Ready for "Create Class" functionality

## 🎨 What's Already Working

### ✅ Without Backend Integration
- Beautiful UI with warm, earthy colors
- Responsive design for all screen sizes
- Client-side search and filtering
- Component architecture ready

### ✅ With Backend Integration (Just add your URL!)
- Google OAuth authentication
- Real-time class listings with capacity
- Booking creation and cancellation
- User role-based access control
- Admin dashboard with analytics
- User booking history
- Instructor information display

## 📋 API Integration Checklist

The frontend is calling these endpoints (all implemented in `src/services/api.ts`):

**Auth**
- [x] `GET /auth/google` - OAuth initiation
- [x] `GET /auth/google/callback` - OAuth callback
- [x] `GET /auth/me` - Get current user

**Classes**
- [x] `GET /api/classes` - All classes
- [x] `GET /api/classes/upcoming` - Upcoming classes
- [x] `GET /api/classes/:id` - Single class
- [x] `POST /api/classes` - Create class (admin/instructor)

**Bookings**
- [x] `GET /api/bookings/user/:userId` - User's bookings
- [x] `GET /api/bookings` - All bookings (admin)
- [x] `POST /api/bookings` - Create booking
- [x] `PATCH /api/bookings/:id/cancel` - Cancel booking

**Users**
- [x] `GET /api/users` - All users (admin)
- [x] `GET /api/users/:id` - Single user

## 🔐 Authentication Flow

```
1. User clicks "Sign in with Google"
   └─> Frontend: authApi.initiateGoogleLogin()
       └─> Redirects to: {BACKEND}/auth/google

2. User signs in with Google
   └─> Backend handles OAuth
       └─> Redirects to: {FRONTEND}/?token={JWT}

3. Frontend detects token in URL
   └─> AuthContext saves token to localStorage
   └─> Calls GET /auth/me to load user data
   └─> Removes token from URL
   └─> User is now authenticated
```

## 🎯 Role-Based Features

The frontend automatically shows/hides features based on user role:

| Feature | Member | Instructor | Admin |
|---------|--------|------------|-------|
| Browse Classes | ✅ | ✅ | ✅ |
| Book Classes | ✅ | ✅ | ✅ |
| View Own Bookings | ✅ | ✅ | ✅ |
| Cancel Bookings | ✅ | ✅ | ✅ |
| Admin Dashboard | ❌ | ✅ | ✅ |
| View All Bookings | ❌ | ✅ | ✅ |
| Create Classes | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |

## 🚀 Next Steps for You

1. **Set Backend URL**: Add your backend URL to `.env`
2. **Configure CORS**: Make sure your backend allows requests from your frontend domain
3. **Test OAuth**: Ensure Google OAuth redirects work correctly
4. **Test Endpoints**: All API calls are ready - just make sure your backend is running
5. **Add Create Class Form**: The admin page has a button ready - just add the form modal

## 💡 Tips

- All error handling is built-in with toast notifications
- Token is automatically included in all authenticated requests
- Loading states are handled on all data-fetching pages
- The UI automatically updates after successful bookings
- Protected routes redirect to home if user lacks permissions

## 🎨 Design System

The app uses a warm, earthy color palette perfect for a yoga studio:
- Cream background (#FAF8F5)
- Terracotta accent (#E07856)
- Sage green highlights (#9CAF88)
- Rounded corners and soft shadows
- Playfair Display (serif) + Inter (sans-serif) fonts

All colors are defined as CSS variables in `src/index.css` and can be easily customized!
