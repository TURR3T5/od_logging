export interface CacheOptions {
    expiryInMinutes?: number;
  }
  
  export class CacheService {
    private static instance: CacheService;
    private cache: Map<string, { data: any; expiry: number }> = new Map();
  
    private constructor() {}
  
    public static getInstance(): CacheService {
      if (!CacheService.instance) {
        CacheService.instance = new CacheService();
      }
      return CacheService.instance;
    }
  
    public set(key: string, data: any, options: CacheOptions = {}): void {
      const expiryInMinutes = options.expiryInMinutes || 5;
      const expiry = Date.now() + expiryInMinutes * 60 * 1000;
      
      this.cache.set(key, { data, expiry });
      
      try {
        localStorage.setItem(
          `cache_${key}`, 
          JSON.stringify({ data, expiry })
        );
      } catch (error) {
        console.warn('Failed to store in localStorage', error);
      }
    }
  
    public get<T>(key: string): T | null {
      const cached = this.cache.get(key);
      
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
      }
      
      try {
        const storedItem = localStorage.getItem(`cache_${key}`);
        if (storedItem) {
          const parsed = JSON.parse(storedItem);
          if (parsed.expiry > Date.now()) {
            this.cache.set(key, parsed);
            return parsed.data as T;
          } else {
            localStorage.removeItem(`cache_${key}`);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage', error);
      }
      
      return null;
    }
  
    public invalidate(key: string): void {
      this.cache.delete(key);
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
      }
    }
  
    public clear(): void {
      this.cache.clear();
      
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('cache_')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
      }
    }
  }
  
  export default CacheService.getInstance();