import type { PrefetchTasks } from "./scheduler";
export class TaskQueue {
    tasks: PrefetchTasks[] = [];

    addTask(task: PrefetchTasks) {
        this.tasks.push(task);
        this.tasks.sort((a, b) => a.priority - b.priority);
    }

    nextTask() {
        return this.tasks.shift();
    }
}