const cache = new Map();

export function getCache(loader) {
    return cache.get(loader);
}

export function setCache(loader, promise) {
    cache.set(loader, promise);
}

export function deleteCache(loader) {
    cache.delete(loader);
}