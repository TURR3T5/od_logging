import cacheService from '../lib/CacheService';
import { handleApiError } from './appUtils';

interface FetchOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  expiryInMinutes?: number;
  invalidateCacheKeys?: string[];
}

interface ApiResult<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Make an API request with caching
 */
export async function apiRequest<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  const {
    useCache = false,
    cacheKey,
    expiryInMinutes = 15,
    invalidateCacheKeys = [],
    ...fetchOptions
  } = options;
  
  // Default headers
  const headers = new Headers(fetchOptions.headers);
  
  if (!headers.has('Content-Type') && fetchOptions.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  
  // Generate a cache key if not provided
  const actualCacheKey = cacheKey || `api_${url}_${JSON.stringify(fetchOptions)}`;
  
  // Check cache for GET requests
  if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cachedData = cacheService.get<T>(actualCacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200
      };
    }
  }
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage: string;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`;
      } catch {
        errorMessage = `API Error: ${response.status} ${response.statusText}`;
      }
      
      return {
        data: null,
        error: new Error(errorMessage),
        status: response.status
      };
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return {
        data: null,
        error: null,
        status: 204
      };
    }
    
    const data = await response.json();
    
    // Cache successful GET responses
    if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      cacheService.set(actualCacheKey, data, { expiryInMinutes });
    }
    
    // Invalidate caches for non-GET requests
    if (fetchOptions.method && fetchOptions.method !== 'GET' && invalidateCacheKeys.length > 0) {
      invalidateCacheKeys.forEach(key => {
        cacheService.invalidate(key);
      });
    }
    
    return {
      data,
      error: null,
      status: response.status
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      status: 0 // Network error or other client-side error
    };
  }
}

/**
 * GET request with error handling
 */
export async function apiGet<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const result = await apiRequest<T>(url, {
      ...options,
      method: 'GET'
    });
    
    if (result.error) {
      handleApiError(result.error, 'fetching data');
      return null;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'fetching data');
    return null;
  }
}

/**
 * POST request with error handling
 */
export async function apiPost<T>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const result = await apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (result.error) {
      handleApiError(result.error, 'saving data');
      return null;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'saving data');
    return null;
  }
}

/**
 * PUT request with error handling
 */
export async function apiPut<T>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const result = await apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (result.error) {
      handleApiError(result.error, 'updating data');
      return null;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'updating data');
    return null;
  }
}

/**
 * PATCH request with error handling
 */
export async function apiPatch<T>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const result = await apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    
    if (result.error) {
      handleApiError(result.error, 'patching data');
      return null;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'patching data');
    return null;
  }
}

/**
 * DELETE request with error handling
 */
export async function apiDelete<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const result = await apiRequest<T>(url, {
      ...options,
      method: 'DELETE'
    });
    
    if (result.error) {
      handleApiError(result.error, 'deleting data');
      return null;
    }
    
    return result.data;
  } catch (error) {
    handleApiError(error, 'deleting data');
    return null;
  }
}

/**
 * Invalidate multiple cache keys at once
 */
export function invalidateCaches(cacheKeys: string[]): void {
  cacheKeys.forEach(key => {
    cacheService.invalidate(key);
  });
}

/**
 * Invalidate all API caches using pattern
 */
export function invalidateApiCaches(pattern?: string): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('cache_api_')) {
        if (!pattern || key.includes(pattern)) {
          keysToRemove.push(key.replace('cache_', ''));
        }
      }
    }
    
    keysToRemove.forEach(key => {
      cacheService.invalidate(key);
    });
  } catch (error) {
    console.error('Error invalidating API caches:', error);
  }
}