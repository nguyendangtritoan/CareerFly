import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { useStore } from '../lib/store';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { setSyncStatus } = useStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // User Logged In: Start Sync
                import('../lib/sync').then(({ syncEngine }) => {
                    syncEngine.userId = currentUser.uid;
                    syncEngine.start();
                    setSyncStatus('idle');
                });
            } else {
                // User Logged Out: Stop Sync
                import('../lib/sync').then(({ syncEngine }) => {
                    syncEngine.stop();
                    syncEngine.userId = null;
                });
            }
        });
        return () => unsubscribe();
    }, [setSyncStatus]);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return { user, loading, signInWithGoogle, signOut };
}
