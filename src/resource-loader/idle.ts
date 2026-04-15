export function runWhenIdle(fn: () => void) {
    requestIdleCallback(fn);
}