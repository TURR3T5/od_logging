import { supabase } from './supabase';
import cacheService from './CacheService';

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface ApiClientOptions {
  cacheKey?: string;
  expiryInMinutes?: number;
  skipCache?: boolean;
}

export const apiClient = {
  async get<T>(
    table: string, 
    query: any, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    const { cacheKey, expiryInMinutes = 15, skipCache = false } = options;

    if (cacheKey && !skipCache) {
      const cached = cacheService.get<T>(cacheKey);
      if (cached) return cached;
    }

    try {
      const { data, error, count } = await query;

      if (error) {
        throw new ApiError(error.message, error.code, error);
      }

      const result = { data, count } as T;

      if (cacheKey) {
        cacheService.set(cacheKey, result, { expiryInMinutes });
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error fetching data from ${table}`, undefined, error);
    }
  },

  async create<T>(
    table: string, 
    data: any
  ): Promise<T> {
    try {
      const { data: createdData, error } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (error) {
        throw new ApiError(error.message, Number(error.code), error);
      }

      return createdData as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error creating data in ${table}`, undefined, error);
    }
  },

  async update<T>(
    table: string, 
    id: string, 
    data: any, 
    idField: string = 'id'
  ): Promise<T> {
    try {
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq(idField, id)
        .select();

      if (error) {
        throw new ApiError(error.message, Number(error.code), error);
      }

      return updatedData as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error updating data in ${table}`, undefined, error);
    }
  },

  async delete(
    table: string, 
    id: string, 
    idField: string = 'id'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idField, id);

      if (error) {
        throw new ApiError(error.message, Number(error.code), error);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error deleting data from ${table}`, undefined, error);
    }
  },

  invalidateCache(key: string): void {
    cacheService.invalidate(key);
  }
};