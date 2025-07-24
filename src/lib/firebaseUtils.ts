import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  Query,
  DocumentReference,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { cache, firestoreRateLimiter } from './cache';

// Error types
export class FirestoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

// Retry utility with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'permission-denied' || 
          error.code === 'unauthenticated' ||
          error.code === 'invalid-argument') {
        throw new FirestoreError(
          `Firestore error: ${error.message}`,
          error.code,
          error
        );
      }
      
      // If quota exceeded, wait longer
      if (error.code === 'resource-exhausted') {
        console.warn('Firebase quota exceeded, implementing longer delay...');
        const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Last attempt, throw error
      if (attempt === maxRetries) {
        throw new FirestoreError(
          `Firestore operation failed after ${maxRetries} retries: ${error.message}`,
          error.code,
          error
        );
      }
      
      // Wait before retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Rate-limited and cached get operation
export async function getCachedDoc<T = DocumentData>(
  docPath: string,
  forceRefresh: boolean = false
): Promise<T | null> {
  const cacheKey = `doc:${docPath}`;
  
  // Check cache first
  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<T>(cacheKey);
  }
  
  // Check rate limit
  if (!firestoreRateLimiter.isAllowed(docPath)) {
    console.warn('Rate limit exceeded for document:', docPath);
    // Return cached data if available, even if expired
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    throw new FirestoreError('Rate limit exceeded and no cached data available');
  }
  
  try {
    const result = await withRetry(async () => {
      const docRef = doc(db, docPath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        cache.set(cacheKey, data);
        return data;
      }
      
      return null;
    });
    
    return result;
  } catch (error: any) {
    console.error('Error getting document:', error);
    
    // Try to return cached data as fallback
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData) {
      console.warn('Returning cached data due to error');
      return cachedData;
    }
    
    throw error;
  }
}

// Rate-limited and cached collection query
export async function getCachedCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  forceRefresh: boolean = false
): Promise<T[]> {
  const cacheKey = `collection:${collectionPath}:${JSON.stringify(constraints)}`;
  
  // Check cache first
  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<T[]>(cacheKey) || [];
  }
  
  // Check rate limit
  if (!firestoreRateLimiter.isAllowed(collectionPath)) {
    console.warn('Rate limit exceeded for collection:', collectionPath);
    // Return cached data if available
    const cachedData = cache.get<T[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    throw new FirestoreError('Rate limit exceeded and no cached data available');
  }
  
  try {
    const result = await withRetry(async () => {
      const collectionRef = collection(db, collectionPath);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);
      
      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as T);
      });
      
      cache.set(cacheKey, data);
      return data;
    });
    
    return result;
  } catch (error: any) {
    console.error('Error getting collection:', error);
    
    // Try to return cached data as fallback
    const cachedData = cache.get<T[]>(cacheKey);
    if (cachedData) {
      console.warn('Returning cached data due to error');
      return cachedData;
    }
    
    return [];
  }
}

// Safe document write with rate limiting
export async function safeSetDoc<T extends DocumentData = DocumentData>(
  docPath: string,
  data: T,
  merge: boolean = false
): Promise<void> {
  // Check rate limit
  if (!firestoreRateLimiter.isAllowed(`write:${docPath}`)) {
    throw new FirestoreError('Write rate limit exceeded');
  }
  
  try {
    await withRetry(async () => {
      const docRef = doc(db, docPath);
      await setDoc(docRef, data, { merge });
      
      // Update cache
      cache.set(`doc:${docPath}`, { id: docRef.id, ...data });
    });
  } catch (error: any) {
    console.error('Error setting document:', error);
    throw new FirestoreError(`Failed to set document: ${error.message}`, error.code, error);
  }
}

// Safe document update with rate limiting
export async function safeUpdateDoc(
  docPath: string,
  data: Partial<DocumentData>
): Promise<void> {
  // Check rate limit
  if (!firestoreRateLimiter.isAllowed(`update:${docPath}`)) {
    throw new FirestoreError('Update rate limit exceeded');
  }
  
  try {
    await withRetry(async () => {
      const docRef = doc(db, docPath);
      await updateDoc(docRef, data);
      
      // Update cache if exists
      const cacheKey = `doc:${docPath}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        cache.set(cacheKey, { ...cachedData, ...data });
      }
    });
  } catch (error: any) {
    console.error('Error updating document:', error);
    throw new FirestoreError(`Failed to update document: ${error.message}`, error.code, error);
  }
}

// Batch operations helper
export async function batchOperation<T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 5,
  delayMs: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(op => op())
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch operation failed:', result.reason);
      }
    }
    
    // Add delay between batches to avoid overwhelming Firebase
    if (i + batchSize < operations.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

// Helper to check if Firebase is available
export function isFirebaseAvailable(): boolean {
  try {
    return !!db;
  } catch {
    return false;
  }
}

// Helper to handle Firebase errors gracefully
export function handleFirebaseError(error: any, fallbackMessage: string = 'Operation failed'): string {
  if (error.code === 'resource-exhausted') {
    return 'Service temporarily unavailable due to high traffic. Please try again in a few minutes.';
  }
  
  if (error.code === 'permission-denied') {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.code === 'unauthenticated') {
    return 'Please sign in to continue.';
  }
  
  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please check your internet connection.';
  }
  
  return error.message || fallbackMessage;
}