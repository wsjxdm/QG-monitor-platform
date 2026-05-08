import React from 'react';
import { getCache, setCache } from './cache';
import { getModule } from './module';

export function lazyModule(key) {
    return React.lazy(() => {
        const cached = getCache(key);
        if (cached) return cached;

        const loader = getModule(key);
        if (!loader) {
            throw new Error(`Module ${key} not defined`);
        }

        const promise = loader();
        setCache(key, promise);

        return promise;
    });
}