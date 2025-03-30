import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import cacheService from '../lib/CacheService';

// Type for database operation result
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
  status: 'success' | 'error';
}

/**
 * Execute a database operation with error handling
 */
export async function executeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage = 'Database operation failed'
): Promise<DbResult<T>> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error(errorMessage, error);
      return { 
        data: null, 
        error: new Error(`${errorMessage}: ${error.message}`),
        status: 'error'
      };
    }
    
    return { 
      data, 
      error: null,
      status: 'success'
    };
  } catch (err) {
    console.error(errorMessage, err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(String(err)),
      status: 'error'
    };
  }
}

/**
 * Get data with caching
 */
export async function getDataWithCache<T>(
  tableName: string,
  query: any,
  cacheKey: string,
  expiryInMinutes = 15
): Promise<DbResult<T>> {
  // Try to get from cache first
  const cachedData = cacheService.get<T>(cacheKey);
  if (cachedData) {
    return { 
      data: cachedData, 
      error: null,
      status: 'success'
    };
  }
  
  // If not in cache, fetch from database
  const result = await executeDbOperation<T>(
    () => query,
    `Failed to fetch ${tableName}`
  );
  
  // If successful, store in cache
  if (result.status === 'success' && result.data) {
    cacheService.set(cacheKey, result.data, { expiryInMinutes });
  }
  
  return result;
}

/**
 * Fetch a single record by ID
 */
export async function getById<T>(
  tableName: string,
  id: string,
  options: {
    columns?: string;
    cacheKey?: string;
    expiryInMinutes?: number;
  } = {}
): Promise<DbResult<T>> {
  const { columns = '*', cacheKey, expiryInMinutes = 30 } = options;
  
  // Use custom cache key if provided, or generate one
  const actualCacheKey = cacheKey || `${tableName}_${id}`;
  
  if (cacheKey) {
    return getDataWithCache<T>(
      tableName,
      supabase.from(tableName).select(columns).eq('id', id).single(),
      actualCacheKey,
      expiryInMinutes
    );
  }
  
  return executeDbOperation<T>(
    () => supabase.from(tableName).select(columns).eq('id', id).single(),
    `Failed to fetch ${tableName} with ID ${id}`
  );
}

/**
 * Fetch multiple records with optional filters
 */
export async function getMany<T>(
  tableName: string,
  options: {
    columns?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    page?: number;
    pageSize?: number;
    cacheKey?: string;
    expiryInMinutes?: number;
  } = {}
): Promise<DbResult<T[]>> {
  const { 
    columns = '*', 
    filters = {}, 
    order,
    limit,
    page,
    pageSize = 20,
    cacheKey,
    expiryInMinutes = 15
  } = options;
  
  // Start building the query
  let query = supabase.from(tableName).select(columns);
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  // Apply ordering
  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? false });
  }
  
  // Apply pagination or limit
  if (page !== undefined) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);
  } else if (limit) {
    query = query.limit(limit);
  }
  
  // Use caching if cache key is provided
  if (cacheKey) {
    return getDataWithCache<T[]>(
      tableName,
      query,
      cacheKey,
      expiryInMinutes
    );
  }
  
  return executeDbOperation<T[]>(
    () => query,
    `Failed to fetch ${tableName} records`
  );
}

/**
 * Insert a new record
 */
export async function insertRecord<T>(
  tableName: string,
  data: any,
  cacheKeysToInvalidate: string[] = []
): Promise<DbResult<T>> {
  const result = await executeDbOperation<T>(
    () => supabase.from(tableName).insert(data).select().single(),
    `Failed to insert into ${tableName}`
  );
  
  // Invalidate relevant caches
  if (result.status === 'success') {
    cacheKeysToInvalidate.forEach(key => {
      cacheService.invalidate(key);
    });
  }
  
  return result;
}

/**
 * Update an existing record
 */
export async function updateRecord<T>(
  tableName: string,
  id: string,
  data: any,
  cacheKeysToInvalidate: string[] = []
): Promise<DbResult<T>> {
  const result = await executeDbOperation<T>(
    () => supabase.from(tableName).update(data).eq('id', id).select().single(),
    `Failed to update ${tableName} with ID ${id}`
  );
  
  // Invalidate relevant caches
  if (result.status === 'success') {
    // Always invalidate the single record cache
    cacheService.invalidate(`${tableName}_${id}`);
    
    // Invalidate other specified caches
    cacheKeysToInvalidate.forEach(key => {
      cacheService.invalidate(key);
    });
  }
  
  return result;
}

/**
 * Delete an existing record
 */
export async function deleteRecord(
  tableName: string,
  id: string,
  cacheKeysToInvalidate: string[] = []
): Promise<DbResult<null>> {
  const result = await executeDbOperation<null>(
    async () => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      return { data: null, error };
    },
    `Failed to delete ${tableName} with ID ${id}`
  );
  
  // Invalidate relevant caches
  if (result.status === 'success') {
    // Always invalidate the single record cache
    cacheService.invalidate(`${tableName}_${id}`);
    
    // Invalidate other specified caches
    cacheKeysToInvalidate.forEach(key => {
      cacheService.invalidate(key);
    });
  }
  
  return result;
}

/**
 * Count records in a table with optional filters
 */
export async function countRecords(
  tableName: string,
  filters: Record<string, any> = {}
): Promise<DbResult<number>> {
  let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  try {
    const { count, error } = await query;
    
    if (error) {
      console.error(`Failed to count ${tableName} records:`, error);
      return { 
        data: null, 
        error: new Error(`Failed to count ${tableName} records: ${error.message}`),
        status: 'error'
      };
    }
    
    return { 
      data: count || 0, 
      error: null,
      status: 'success'
    };
  } catch (err) {
    console.error(`Failed to count ${tableName} records:`, err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(String(err)),
      status: 'error'
    };
  }
}