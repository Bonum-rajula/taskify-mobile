// src/utils/storagePersister.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * Enterprise Caching Engine (Bonus 3)
 * Automatically throttles disk writes to once per second to prevent high CPU usage.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'TASKIFY_OFFLINE_STATE_V1',
  throttleTime: 1000,
});