import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      toast.success(`Welcome ${result.user.displayName || result.user.email}!`);
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      // Send email verification
      if (result.user) {
        await sendEmailVerification(result.user);
        toast.success('Account created! Please check your email for verification.');
      }
    } catch (error: unknown) {
      console.error('Email signup error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'Email address is already in use';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back ${result.user.displayName || result.user.email}!`);
    } catch (error: unknown) {
      console.error('Email sign-in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Invalid email or password';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      toast.success('Verification code sent to your phone');
      return confirmationResult;
    } catch (error: unknown) {
      console.error('Phone sign-in error:', error);
      let errorMessage = 'Failed to send verification code';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/invalid-phone-number') {
          errorMessage = 'Invalid phone number';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later.';
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signInWithPhone,
    signOut,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};