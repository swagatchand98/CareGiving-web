import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
  sendEmailVerification,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import api from '@/lib/axios';

// Types
export interface UserData {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verificationStatus: string;
  token: string;
  // Added for compatibility with existing code
  name: string;
  avatar?: string;
}

// Helper function to get Firebase ID token
const getIdToken = async (user: FirebaseUser): Promise<string> => {
  return await user.getIdToken(true);
};

// Helper function to extract name parts from a full name
const extractNameParts = (displayName: string | null): { firstName: string; lastName: string } => {
  if (!displayName) {
    return { firstName: 'User', lastName: 'Account' };
  }
  
  const nameParts = displayName.trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Account';
  
  return { firstName, lastName };
};

// Register with email and password
export const registerWithEmailPassword = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<UserData> => {
  try {
    // 1. Register with Firebase
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // 2. Update profile in Firebase
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // 3. Send email verification
    await sendEmailVerification(userCredential.user);
    
    // 4. Get Firebase ID token
    const idToken = await getIdToken(userCredential.user);
    
    // 5. Register with backend
    const response = await api.post('/auth/register', 
      { firstName, lastName },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    
    const userData = response.data;
    
    // Add name property for compatibility with existing code
    return {
      ...userData,
      name: `${userData.firstName} ${userData.lastName}`,
      avatar: userData.avatar || undefined
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
};

// Login with email and password
export const loginWithEmailPassword = async (
  email: string,
  password: string
): Promise<UserData> => {
  try {
    // 1. Login with Firebase
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // 2. Get Firebase ID token
    const idToken = await getIdToken(userCredential.user);
    
    // 3. Login with backend
    const response = await api.post('/auth/login', 
      {}, // Empty body
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    
    const userData = response.data;
    
    // Add name property for compatibility with existing code
    return {
      ...userData,
      name: `${userData.firstName} ${userData.lastName}`,
      avatar: userData.avatar || undefined
    };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw error;
  }
};

// Login with Google
export const loginWithGoogle = async (): Promise<UserData> => {
  try {
    // 1. Login with Firebase using Google provider
    const userCredential: UserCredential = await signInWithPopup(auth, googleProvider);
    
    // 2. Get Firebase ID token
    const idToken = await getIdToken(userCredential.user);
    
    // 3. Extract name parts from Google profile
    const { displayName, email, photoURL } = userCredential.user;
    const { firstName, lastName } = extractNameParts(displayName);
    
    // 4. Try to register first (if user doesn't exist, this will create them)
    try {
      const registerResponse = await api.post('/auth/register', 
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const userData = registerResponse.data;
      
      // Add name property for compatibility with existing code
      return {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        avatar: userData.avatar || photoURL || undefined
      };
    } catch (registerError: any) {
      // If registration fails because user already exists, try login instead
      if (registerError.response && registerError.response.status === 400) {
        const loginResponse = await api.post('/auth/login',
          {}, // Empty body
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        
        const userData = loginResponse.data;
        
        // Add name property for compatibility with existing code
        return {
          ...userData,
          name: `${userData.firstName} ${userData.lastName}`,
          avatar: userData.avatar || photoURL || undefined
        };
      }
      
      // If it's another error, rethrow it
      throw registerError;
    }
  } catch (error: any) {
    console.error('Google login error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Google login failed');
    }
    throw error;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    // Clear any local storage or cookies if needed
    localStorage.removeItem('user');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (token: string): Promise<UserData> => {
  try {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userData = response.data;
    
    // Add name property for compatibility with existing code
    return {
      ...userData,
      name: `${userData.firstName} ${userData.lastName}`,
      avatar: userData.avatar || undefined
    };
  } catch (error: any) {
    console.error('Get profile error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get user profile');
    }
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  token: string,
  profileData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
  }
): Promise<UserData> => {
  try {
    const response = await api.put('/auth/profile', 
      profileData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const userData = response.data;
    
    // Add name property for compatibility with existing code
    return {
      ...userData,
      name: `${userData.firstName} ${userData.lastName}`,
      avatar: userData.avatar || undefined
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update profile');
    }
    throw error;
  }
};

// Verify email
export const verifyEmail = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    // 1. Send verification email
    await sendEmailVerification(currentUser);
    
    // 2. Get Firebase ID token
    const idToken = await getIdToken(currentUser);
    
    // 3. Notify backend
    await api.post('/auth/verify-email', 
      {}, // Empty body
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
  } catch (error: any) {
    console.error('Verify email error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to verify email');
    }
    throw error;
  }
};
