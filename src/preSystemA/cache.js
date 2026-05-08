const cache = new Map();

export function getCache(key) {
    return cache.get(key);
}

export function setCache(key, promise) {
    cache.set(key, promise);
}

export function deleteCache(key) {
    cache.delete(key);
}