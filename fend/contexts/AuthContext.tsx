'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { auth, googleAuthProvider } from '@/lib/firebase';

export interface User {
  id: number | string;
  uid?: string | null;
  email: string;
  name?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  role: string;
  age?: number | null;
  bloodGroup?: string | null;
  cycleLengthAvg?: number | null;
  periodLengthAvg?: number | null;
  conditions?: string[];
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  workspaceAccessToken: string | null;
  workspaceUserEmail: string | null;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  connectGoogleWorkspace: () => Promise<string | null>;
  clearWorkspaceToken: () => void;
  logout: () => Promise<void>;
}

// In-memory cache only (never persisted to localStorage or sessionStorage)
let cachedWorkspaceAccessToken: string | null = null;
let isSigningInWithGoogle = false;

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  workspaceAccessToken: null,
  workspaceUserEmail: null,
  refreshUser: async () => {},
  signInWithGoogle: async () => {},
  connectGoogleWorkspace: async () => null,
  clearWorkspaceToken: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceAccessToken, setWorkspaceAccessToken] = useState<string | null>(null);
  const [workspaceUserEmail, setWorkspaceUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/auth/me');
      if (response && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        cachedWorkspaceAccessToken = null;
        setWorkspaceAccessToken(null);
        setWorkspaceUserEmail(null);
      } else if (cachedWorkspaceAccessToken) {
        setWorkspaceAccessToken(cachedWorkspaceAccessToken);
        setWorkspaceUserEmail(firebaseUser.email || null);
      } else if (!isSigningInWithGoogle) {
        cachedWorkspaceAccessToken = null;
        setWorkspaceAccessToken(null);
        setWorkspaceUserEmail(firebaseUser.email || null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      isSigningInWithGoogle = true;
      const result = await signInWithPopup(auth, googleAuthProvider);
      const oauthCredential = GoogleAuthProvider.credentialFromResult(result);
      if (oauthCredential?.accessToken) {
        cachedWorkspaceAccessToken = oauthCredential.accessToken;
        setWorkspaceAccessToken(oauthCredential.accessToken);
        setWorkspaceUserEmail(result.user.email || null);
      }
      const idToken = await result.user.getIdToken();
      await apiClient.post('/api/auth/google', { idToken });
      await refreshUser();
      toast.success('Signed in with Google');
      router.push('/');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      toast.error(err?.message || 'Google Sign-In failed');
    } finally {
      isSigningInWithGoogle = false;
    }
  };

  const connectGoogleWorkspace = async (): Promise<string | null> => {
    try {
      isSigningInWithGoogle = true;
      const result = await signInWithPopup(auth, googleAuthProvider);
      const oauthCredential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = oauthCredential?.accessToken || null;
      if (!accessToken) {
        throw new Error('Could not obtain Google Workspace access token.');
      }
      cachedWorkspaceAccessToken = accessToken;
      setWorkspaceAccessToken(accessToken);
      setWorkspaceUserEmail(result.user.email || null);
      toast.success('Connected Gmail, Google Calendar, and Google Tasks');
      return accessToken;
    } catch (err: any) {
      console.error('Workspace OAuth connect error:', err);
      toast.error(err?.message || 'Google Workspace sign-in cancelled or failed');
      return null;
    } finally {
      isSigningInWithGoogle = false;
    }
  };

  const clearWorkspaceToken = () => {
    cachedWorkspaceAccessToken = null;
    setWorkspaceAccessToken(null);
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
      await signOut(auth).catch(() => {});
      cachedWorkspaceAccessToken = null;
      setWorkspaceAccessToken(null);
      setWorkspaceUserEmail(null);
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        workspaceAccessToken,
        workspaceUserEmail,
        refreshUser,
        signInWithGoogle,
        connectGoogleWorkspace,
        clearWorkspaceToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
