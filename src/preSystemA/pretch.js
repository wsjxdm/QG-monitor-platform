import { getCache, setCache, deleteCache } from './cache';
import { getModule } from './module';
import { schedule } from './scheduler';

export function preload(key, options = {}) {
    const priority = options.priority || 'low';

    const cached = getCache(key);
    if (cached) {
        return cached;
    }

    const loader = getModule(key);
    if (!loader) {
        throw new Error(`Module ${key} not found`);
    }

    let resolvePromise;
    let rejectPromise;

    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    setCache(key, promise);

    const task = () => loader()
        .then((res) => {
            resolvePromise(res);
            return res;
        })
        .catch((err) => {
            deleteCache(key);
            rejectPromise(err);
            throw err;
        });

    // 5. 调度执行
    schedule(task, priority);

    return promise;
}