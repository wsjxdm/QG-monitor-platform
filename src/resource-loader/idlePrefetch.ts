import { runWhenIdle } from "./idle";
import { prefetch } from "./prefetch";
import { Priority } from "./priority";

export function idlePrefetch(loaders: (() => Promise<any>)[]) {
    runWhenIdle(() => {
        loaders.forEach(loader => {
            prefetch(loader, Priority.LOW);
        });
    });
} 