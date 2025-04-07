# Caregiving Web Application

This is the frontend for the Caregiving Platform, built with Next.js and Firebase Authentication.

## Hybrid Authentication Approach

This project uses a hybrid authentication approach:

1. **Client-side Firebase Authentication**: Users authenticate directly with Firebase on the client side.
2. **Backend Token Verification**: The Firebase ID token is sent to the backend for verification.
3. **Custom Token System**: The backend issues a custom token for subsequent API requests.

This approach provides several benefits:
- Secure authentication with Firebase's battle-tested system
- Consistent authentication flow across web and mobile clients
- Backend control over user sessions and permissions

## Setup Instructions

### 1. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Email/Password and Google authentication methods
3. Add a web app to your Firebase project
4. Copy the Firebase configuration values

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Replace the placeholder values with your actual Firebase configuration.

### 3. Backend Setup

Make sure your backend is set up to handle the hybrid authentication approach:

1. Verify Firebase ID tokens
2. Create or update users in your database
3. Issue custom tokens for subsequent requests

See the backend repository for detailed setup instructions.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### Registration

1. User fills out the registration form
2. Firebase creates a new user account
3. Firebase ID token is sent to the backend
4. Backend creates a user record and returns a custom token
5. Frontend stores the custom token for subsequent API requests

### Login

1. User enters email and password
2. Firebase authenticates the user
3. Firebase ID token is sent to the backend
4. Backend verifies the token and returns a custom token
5. Frontend stores the custom token for subsequent API requests

### Google Sign-In

1. User clicks "Sign in with Google"
2. Firebase handles the OAuth flow
3. Firebase ID token is sent to the backend
4. Backend verifies the token and returns a custom token
5. Frontend stores the custom token for subsequent API requests

### Protected Routes

1. Frontend checks if the user is authenticated
2. If not, redirects to the login page
3. If yes, includes the custom token in API requests

## Folder Structure

- `src/config/firebase.ts`: Firebase configuration
- `src/contexts/AuthContext.tsx`: Authentication context provider
- `src/services/authService.ts`: Authentication service functions
- `src/components/auth/`: Authentication-related components

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Next.js Documentation](https://nextjs.org/docs)
