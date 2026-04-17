// let data;
// const button = document.getElementById('button')
// //then写法
// // const prefetch = () => {
// //     fetch('https://test.com')
// //         .then(response => response.json())
// //         .then((res) => data = res)
// //         .catch(error => console.error(error))
// // }
// // async await写法
// const prefetch = async () => {
//     try {
//         const res = await fetch('https://test.com')
//         data = await res.json()
//     } catch (error) {
//         console.error(error)
//     }


// }
// button?.addEventListener('click', prefetch)
// const prefetchA = (url: string) => {
//     const link = document.createElement('link')
//     link.rel = 'prefetch'
//     link.href = url
//     document.head.appendChild(link)
// }

// const prefetchAll = (urls: string[]) => {
//     urls.forEach(prefetchA);
// }

// const prefetchBypriority = (options: { url: string, priority: number }[]) => {
//     //按照优先级排序
//     options.sort((a, b) => b?.priority - a?.priority);
//     options.forEach((item) => prefetchA(item.url));
// }


// function basePrefetch(urls: string[]) {
//     urls.forEach((url) => {
//         const link = document.createElement('link')
//         link.rel = 'prefetch'
//         link.href = url
//         document.head.appendChild(link)
//     });
// }

// function highPrefetch(url: string) {
//     const link = document.createElement('link')
//     link.rel = 'prefetch'
//     link.as = 'fetch'
//     link.href = url
//     document.head.appendChild(link)
// }

//link 的局限性是只能加载静态资源，图片，字体
// const preLoaded = new Set();
// const usePreload = () => {
//     const preload = useCallback((url: string) => {
//         if (preLoaded.has(url)) return;
//         requestIdleCallback(() => {
//             import(url);
//             preLoaded.add(url);
//         }, { timeout: 5000 })
//     }, [])

//     return preload;
// }

import { useCallback } from "react";

//map 相对于 set 可以存储键值对
const preloadedCache = new Map();

//====== 控制并发数 =======
let maxRequestCount = 5;
let running = 0;
let taskQueue = [];

export function runNextTask() {
    if (running >= maxRequestCount || taskQueue.length === 0) return;

    const task = taskQueue.shift();
    running++;
    task().finally(() => {
        running--;
        runNextTask();
    });
}
export function enterQueue(task) {
    taskQueue.push(task);
    runNextTask();
}

//=====调度系统========
function Scheduler(loader, priority) {
    if (priority === 'now') {
        loader();
    } else {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(loader, { timeout: 2000 });
        } else {
            setTimeout(loader, 2000);
        }
    }
}

export function usePreload() {
    const preload = useCallback((loaderFn, options) => {
        if (preloadedCache.has(loaderFn)) {
            return preloadedCache.get(loaderFn);
        }
        const priority = options?.priority || 'idle';
        let resolvePromise;
        let rejectPromise;
        const promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });
        preloadedCache.set(loaderFn, promise);
        const doLoad = () => {
            loaderFn()
                .then((res) => resolvePromise(res))
                .catch(
                    (err) => rejectPromise(err),
                    preloadedCache.delete(loaderFn)
                )
        };
        const task = () => {
            Scheduler(doLoad, priority);
        }

        enterQueue(task);

        return promise;
    }, []);

    return preload;
}