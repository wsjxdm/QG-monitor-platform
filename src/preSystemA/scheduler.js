let maxConcurrency = 5;
let running = 0;

const highQueue = [];
const normalQueue = [];
const lowQueue = [];

function getNextTask() {
    if (highQueue.length) return highQueue.shift();
    if (normalQueue.length) return normalQueue.shift();
    if (lowQueue.length) return lowQueue.shift();
}

function runNext() {
    if (running >= maxConcurrency) return;

    const task = getNextTask();
    if (!task) return;

    running++;

    task().finally(() => {
        running--;
        runNext();
    });

    // 尽量填满并发池
    runNext();
}

export function schedule(task, priority) {
    if (priority === 'high') {
        highQueue.push(task);
    } else if (priority === 'normal') {
        normalQueue.push(task);
    } else if (priority === 'idle') {
        lowQueue.push(() => scheduleIdle(task));
    }
    runNext();
}

function scheduleIdle(task) {
    return new Promise((resolve, reject) => {
        requestIdleCallback(() => {
            task().then(resolve).catch(reject);
        }, { timeout: 2000 });
    })
}

