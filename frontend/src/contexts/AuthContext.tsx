import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { toast } from 'sonner';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher';
  createdAt: Date;
  lastLoginAt: Date;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  preferences?: {
    language: string;
    notifications: boolean;
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  academicInfo?: {
    grade?: string;
    subjects?: string[];
    institution?: string;
    teacherId?: string;
  };
  stats?: {
    totalLoginDays: number;
    lastActiveDate: Date;
    coursesCompleted: number;
    exercisesCompleted: number;
    streakDays: number;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName: string, role: 'student' | 'teacher') => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user: User, role: 'student' | 'teacher' = 'student') => {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      role,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        language: 'en',
        notifications: true,
        theme: 'light',
        emailNotifications: true,
        smsNotifications: false
      },
      stats: {
        totalLoginDays: 1,
        lastActiveDate: new Date(),
        coursesCompleted: 0,
        exercisesCompleted: 0,
        streakDays: 1
      }
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          dateOfBirth: data.dateOfBirth?.toDate(),
          preferences: {
            language: 'en',
            notifications: true,
            theme: 'light',
            emailNotifications: true,
            smsNotifications: false,
            ...data.preferences
          },
          stats: {
            totalLoginDays: 1,
            lastActiveDate: new Date(),
            coursesCompleted: 0,
            exercisesCompleted: 0,
            streakDays: 1,
            ...data.stats,
            lastActiveDate: data.stats?.lastActiveDate?.toDate() || new Date()
          }
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Update user password
  const updateUserPassword = async (newPassword: string) => {
    if (!user) return;

    try {
      await updatePassword(user, newPassword);
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update user email
  const updateUserEmail = async (newEmail: string) => {
    if (!user) return;

    try {
      await updateEmail(user, newEmail);
      await updateUserProfile({ email: newEmail });
      toast.success('Email updated successfully');
    } catch (error: any) {
      console.error('Error updating email:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Get Firebase ID token
  const getIdToken = async (): Promise<string> => {
    if (!user) throw new Error('No user logged in');
    return await user.getIdToken();
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time and stats
      const userRef = doc(db, 'users', result.user.uid);
      const today = new Date();
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastActive = userData.stats?.lastActiveDate?.toDate() || new Date(0);
        const isNewDay = lastActive.toDateString() !== today.toDateString();
        
        await updateDoc(userRef, {
          lastLoginAt: today,
          'stats.lastActiveDate': today,
          'stats.totalLoginDays': isNewDay ? (userData.stats?.totalLoginDays || 0) + 1 : userData.stats?.totalLoginDays || 1,
          'stats.streakDays': isNewDay ? (userData.stats?.streakDays || 0) + 1 : userData.stats?.streakDays || 1
        });
      }
      
      toast.success('Welcome back!');
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'student' | 'teacher'
  ): Promise<UserCredential> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(result.user, role);
      
      toast.success('Account created successfully!');
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user profile exists, if not create one
      const existingProfile = await fetchUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user, 'student');
      } else {
        // Update last login time and stats
        const userRef = doc(db, 'users', result.user.uid);
        const today = new Date();
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const lastActive = userData.stats?.lastActiveDate?.toDate() || new Date(0);
          const isNewDay = lastActive.toDateString() !== today.toDateString();
          
          await updateDoc(userRef, {
            lastLoginAt: today,
            'stats.lastActiveDate': today,
            'stats.totalLoginDays': isNewDay ? (userData.stats?.totalLoginDays || 0) + 1 : userData.stats?.totalLoginDays || 1,
            'stats.streakDays': isNewDay ? (userData.stats?.streakDays || 0) + 1 : userData.stats?.streakDays || 1
          });
        }
      }
      
      toast.success('Welcome!');
      return result;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Get user-friendly error messages
  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled';
      case 'auth/requires-recent-login':
        return 'Please sign in again to perform this action';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password';
      default:
        return 'An error occurred. Please try again';
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    updateUserEmail,
    refreshUserProfile,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};