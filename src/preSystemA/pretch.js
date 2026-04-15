import { getCache, setCache, deleteCache } from './cache';
import { schedule } from './scheduler';

export function preload(loader, options = {}) {
    const priority = options.priority || 'low';

    const cached = getCache(loader);
    if (cached) {
        return cached;
    }

    let resolvePromise;
    let rejectPromise;

    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    setCache(loader, promise);

    const task = () => loader()
        .then((res) => {
            resolvePromise(res);
            return res;
        })
        .catch((err) => {
            deleteCache(loader);
            rejectPromise(err);
            throw err;
        });

    // 5. 调度执行
    schedule(task, priority);

    return promise;
}