type CacheBackend = "memory" | "redis";

interface CacheConfig {
  backend: CacheBackend;
  ttl: number;
}

const config: CacheConfig = {
  backend: (process.env.CACHE_BACKEND as CacheBackend) || "memory",
  ttl: parseInt(process.env.CACHE_TTL || "300"),
};

const memoryStore = new Map<string, { data: any; expires: number }>();

function memoryGet<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryStore.delete(key);
    return null;
  }
  return entry.data as T;
}

function memorySet<T>(key: string, data: T, ttl: number): void {
  memoryStore.set(key, { data, expires: Date.now() + ttl * 1000 });
}

function memoryDel(key: string): void {
  memoryStore.delete(key);
}

function redisUrl(): string {
  return process.env.REDIS_URL || "redis://localhost:6379";
}

async function redisGet<T>(key: string): Promise<T | null> {
  try {
    // @ts-ignore - optional dependency
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl() });
    await client.connect();
    const val = await client.get(key);
    await client.quit();
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function redisSet<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    // @ts-ignore - optional dependency
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl() });
    await client.connect();
    await client.setEx(key, ttl, JSON.stringify(data));
    await client.quit();
  } catch {}
}

async function redisDel(key: string): Promise<void> {
  try {
    // @ts-ignore - optional dependency
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl() });
    await client.connect();
    await client.del(key);
    await client.quit();
  } catch {}
}

export function cacheKey(parts: string[]): string {
  return `ghrms:${parts.join(":")}`;
}

export async function get<T>(key: string): Promise<T | null> {
  if (config.backend === "redis") return redisGet<T>(key);
  return memoryGet<T>(key);
}

export async function set<T>(key: string, data: T, ttl?: number): Promise<void> {
  const t = ttl ?? config.ttl;
  if (config.backend === "redis") return redisSet(key, data, t);
  return memorySet(key, data, t);
}

export async function del(key: string): Promise<void> {
  if (config.backend === "redis") return redisDel(key);
  return memoryDel(key);
}

export async function remember<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = await get<T>(key);
  if (cached !== null) return cached;
  const data = await fn();
  await set(key, data, ttl);
  return data;
}

export function getCacheConfig() {
  return { ...config };
}
