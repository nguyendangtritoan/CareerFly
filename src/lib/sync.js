import { db as firestore } from './firebase';
import { db as localDb } from './db';
import { collection, doc, setDoc, getDocs, onSnapshot, query, where, Timestamp } from 'firebase/firestore';

export class SyncEngine {
    constructor(userId) {
        this.userId = userId;
        this.unsubscribe = null;
    }

    start() {
        if (!this.userId) return;

        // 1. Initial Pull (Shadow Merge)
        this.pullRemoteChanges();

        // 2. Listen for Remote Changes
        const q = query(collection(firestore, 'users', this.userId, 'logs'));
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const data = change.doc.data();
                    this.mergeToLocal(data);
                }
                // Handle deletions...
            });
        });

        // 3. Listen for Local Changes (Using Dexie hook if needed, or manual trigger)
        // For simplicity v1, we assume specific actions call pushLog
    }

    stop() {
        if (this.unsubscribe) this.unsubscribe();
    }

    async pushLog(log) {
        if (!this.userId || !log.id) return;
        try {
            const docRef = doc(firestore, 'users', this.userId, 'logs', log.id);
            // Convert dateIso strings to Timestamps if preferred, or keep as string
            await setDoc(docRef, { ...log, updatedAt: Timestamp.now() }, { merge: true });

            // Update local sync state
            await localDb.logs.update(log.id, { 'syncState.isSynced': true });
            console.log(`Pushed log ${log.id} to cloud`);
        } catch (error) {
            console.error("Sync Push Error", error);
        }
    }

    async pullRemoteChanges() {
        // Fetch all remote logs and upsert local
    }

    async mergeToLocal(remoteLog) {
        // "Newer wins" logic or "Cloud wins"
        const localLog = await localDb.logs.get(remoteLog.id);
        if (!localLog) {
            await localDb.logs.add({ ...remoteLog, syncState: { isSynced: true } });
        } else {
            // Compare timestamps if available
            // For now, overwrite local with remote
            await localDb.logs.put({ ...remoteLog, syncState: { isSynced: true } });
        }
    }

    retrySync() {
        // Retry syncing by restarting the sync process
        this.stop();
        this.start();
    }

}

export const syncEngine = new SyncEngine(); // Singleton instance (ID will be set on login)
