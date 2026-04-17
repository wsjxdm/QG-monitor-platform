import { Priority } from "./priority";
import { TaskQueue } from "./taskQueue";

export type PrefetchTasks = {
    loader: () => Promise<any>;
    priority: Priority;
}

export class PrefetchScheduler {
    maxConcurent = 5;
    running = 0;
    taskQueue = new TaskQueue();

    addTask(task: PrefetchTasks) {
        this.taskQueue.addTask(task);
        this.run();
    }
    async run() {
        if (this.running >= this.maxConcurent) return;
        const task = this.taskQueue.nextTask();
        if (!task) return;
        this.running++;
        try {
            await task.loader()
        } catch (error) {
            console.error(error);
        }
        this.running--;
        this.run();
    }
}

export const scheduler = new PrefetchScheduler();