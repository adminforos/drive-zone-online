import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, testConnection } from '../lib/firebase';
import { UserProfile } from '../types';

const ADMIN_EMAIL = 'adminforos777@gmail.com';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  registerUser: (data: {
    email: string;
    pass: string;
    fullName: string;
    whatsApp: string;
    gamingId: string;
    photoURL?: string;
  }) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Prepare initial fallback profile in case of missing document
        const isDefaultAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
        const initialProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || user.email?.split('@')[0] || 'Gamer',
          email: user.email || '',
          whatsApp: '01625174905',
          gamingId: 'DZO-' + Math.floor(100000 + Math.random() * 900000),
          photoURL: user.photoURL || '/src/assets/images/gaming_avatar_default_1793627363341.jpg',
          role: isDefaultAdmin ? 'admin' : 'user',
          balance: isDefaultAdmin ? 5000 : 0,
          totalDeposits: 0,
          totalSpending: 0,
          totalTransfers: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        const userRef = doc(db, 'users', user.uid);
        
        // Listen to Firestore profile document in real-time
        const unsubscribeProfile = onSnapshot(
          userRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              if (user.email?.toLowerCase() === ADMIN_EMAIL && data.role !== 'admin') {
                try {
                  await updateDoc(userRef, { role: 'admin' });
                  data.role = 'admin';
                } catch (e) {
                  // Ignore if update delayed
                }
              }
              setUserProfile(data);
            } else {
              // Create default profile if snapshot does not exist
              try {
                await setDoc(userRef, initialProfile);
              } catch (e) {
                console.log('Error creating user profile doc:', e);
              }
              setUserProfile(initialProfile);
            }
            setLoading(false);
          },
          (error) => {
            console.log('User profile snapshot fallback active:', error?.message);
            // Fallback to initial local profile if snapshot has permission delay
            setUserProfile(initialProfile);
            setLoading(false);
          }
        );

        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const registerUser = async (data: {
    email: string;
    pass: string;
    fullName: string;
    whatsApp: string;
    gamingId: string;
    photoURL?: string;
  }) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    const isDefaultAdmin = data.email.toLowerCase() === ADMIN_EMAIL;

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      fullName: data.fullName,
      email: data.email,
      whatsApp: data.whatsApp || '01625174905',
      gamingId: data.gamingId || 'DZO-' + Math.floor(100000 + Math.random() * 900000),
      photoURL: data.photoURL || '/src/assets/images/gaming_avatar_default_1793627363341.jpg',
      role: isDefaultAdmin ? 'admin' : 'user',
      balance: isDefaultAdmin ? 5000 : 0,
      totalDeposits: 0,
      totalSpending: 0,
      totalTransfers: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
  };

  const loginUser = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const resetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
  };

  const isAdmin =
    userProfile?.role === 'admin' || currentUser?.email?.toLowerCase() === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        registerUser,
        loginUser,
        logoutUser,
        resetUserPassword,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
