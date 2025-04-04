export interface CacheOptions {
  expiryInMinutes?: number;
  debug?: boolean;
}
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private debugMode: boolean = false;
  private constructor() {}
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  public enableDebug(enable: boolean = true): void {
    this.debugMode = enable;
  }
  private log(...args: any[]): void {
    if (this.debugMode) {
      console.log('[CacheService]', ...args);
    }
  }
  public set(key: string, data: any, options: CacheOptions = {}): void {
    this.log(`Setting cache for key: ${key}`);
    const expiryInMinutes = options.expiryInMinutes || 5;
    const expiry = Date.now() + expiryInMinutes * 60 * 1000;
    this.cache.set(key, { data, expiry });
    try {
      localStorage.setItem(
        `cache_${key}`, 
        JSON.stringify({ data, expiry })
      );
      this.log(`Saved cache to localStorage: ${key}`);
    } catch (error) {
      console.warn('Failed to store in localStorage', error);
    }
  }
  public get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      this.log(`Cache hit (memory): ${key}`);
      return cached.data as T;
    }
    this.log(`Cache miss (memory): ${key}`);
    try {
      const storedItem = localStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const parsed = JSON.parse(storedItem);
        if (parsed.expiry > Date.now()) {
          this.log(`Cache hit (localStorage): ${key}`);
          this.cache.set(key, parsed);
          return parsed.data as T;
        } else {
          this.log(`Cache expired (localStorage): ${key}`);
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage', error);
    }
    return null;
  }
  public invalidate(key: string): void {
    this.log(`Invalidating cache for key: ${key}`);
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
      this.log(`Removed cache from localStorage: ${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage', error);
    }
  }
  public clear(): void {
    this.log('Clearing all caches');
    this.cache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        this.log(`Removed key from localStorage: ${key}`);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
    }
  }
  public getKeys(): string[] {
    const memoryKeys = Array.from(this.cache.keys());
    const localStorageKeys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          localStorageKeys.push(key.substring(6)); 
        }
      }
    } catch (error) {
      console.warn('Failed to get localStorage keys', error);
    }
    return [...new Set([...memoryKeys, ...localStorageKeys])];
  }
}
const cacheServiceInstance = CacheService.getInstance();
if (process.env.NODE_ENV === 'development') {
  cacheServiceInstance.enableDebug(true);
}
export default cacheServiceInstance;