class EventBus {
    constructor() {
        this.subscribers = new Map();

    }

    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    unsubscribe(eventName, callback) {
        if (!this.subscribers.has(eventName)) return;
        const callbacks = this.subscribers.get(eventName);
        if (callback) {
            const originLength = callbacks.length;
            const filtered = callbacks.filter(cb => cb !== callback);
            if (filtered.length !== originLength) {
                this.subscribers.set(eventName, filtered);
            }
        } else {
            this.subscribers.delete(eventName);
        }
    }

    publish(eventName, data) {
        if (!this.subscribers.has(eventName)) return;
        this.subscribers.get(eventName).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(` 事件 ${eventName} 回调执行失败:`, error);
            }
        });
    }
}


export default new EventBus();