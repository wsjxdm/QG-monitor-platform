import { scheduler } from "./scheduler";
import { Priority } from "./priority";

export function prefetch(
    loader: () => Promise<any>,
    priority: Priority = Priority.LOW
) {
    scheduler.addTask({
        loader,
        priority
    });
}