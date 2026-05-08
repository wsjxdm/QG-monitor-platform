const moduleMap = new Map();
export function defineModule(key, loader) {
    moduleMap.set(key, loader);
}

export function getModule(key) {
    return moduleMap.get(key);
}


defineModule('A', () => import('./A'));
defineModule('B', () => import('./B'));