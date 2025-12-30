import { supabase } from '@/integrations/supabase/client';

export interface PendingMessage {
  id: string;
  sender: 'he' | 'she';
  content: string;
  message_type: 'text' | 'voice' | 'heartbeat';
  voice_url?: string;
  created_at: string;
  status: 'pending' | 'sending' | 'failed';
  retryCount: number;
}

const DB_NAME = 'loveChat';
const STORE_NAME = 'pendingMessages';
const MAX_RETRIES = 3;

// IndexedDB helpers
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const savePendingMessage = async (message: PendingMessage): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(message);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getPendingMessages = async (): Promise<PendingMessage[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const removePendingMessage = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const updateMessageStatus = async (id: string, status: PendingMessage['status'], retryCount?: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const message = getRequest.result;
      if (message) {
        message.status = status;
        if (retryCount !== undefined) {
          message.retryCount = retryCount;
        }
        store.put(message);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const sendMessageToSupabase = async (message: PendingMessage): Promise<boolean> => {
  try {
    const { error } = await supabase.from('messages').insert({
      sender: message.sender,
      content: message.content,
      message_type: message.message_type,
      voice_url: message.voice_url,
    });
    
    if (error) {
      console.error('Error sending message:', error);
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const processMessageQueue = async (): Promise<void> => {
  const pendingMessages = await getPendingMessages();
  
  for (const message of pendingMessages) {
    if (message.status === 'failed' && message.retryCount >= MAX_RETRIES) {
      continue; // Skip messages that have exceeded retries
    }
    
    await updateMessageStatus(message.id, 'sending');
    
    const success = await sendMessageToSupabase(message);
    
    if (success) {
      await removePendingMessage(message.id);
    } else {
      const newRetryCount = message.retryCount + 1;
      if (newRetryCount >= MAX_RETRIES) {
        await updateMessageStatus(message.id, 'failed', newRetryCount);
      } else {
        await updateMessageStatus(message.id, 'pending', newRetryCount);
      }
    }
  }
};

// Listen for online events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored, processing queue...');
    processMessageQueue();
  });
}
