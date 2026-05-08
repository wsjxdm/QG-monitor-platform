class MessageQueue {
    constructor() {
        this.queue = new Map();
        this.retryTimer = null;
        this.maxRetries = 5;
        this.baseDelay = 1000;
        this.checkInterval = 1000;
        this.onRetry = null;
        this.onTimeout = null;
        this.startRetryCheck();
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    add(payload, type = 'command') {
        const id = this.generateId();
        const message = {
            id,
            payload,
            type,
            timestamp: Date.now(),
            retryCount: 0,
            timeout: 5000
        };
        this.queue.set(id, message);
        return id;
    }

    ack(id) {
        return this.queue.delete(id);
    }

    get(id) {
        return this.queue.get(id);
    }

    getAll() {
        return Array.from(this.queue.values());
    }

    getPendingCount() {
        return this.queue.size;
    }

    retry(id) {
        const message = this.queue.get(id);
        if (!message) return false;

        message.retryCount++;
        message.timestamp = Date.now();

        if (message.retryCount >= this.maxRetries) {
            console.error(`消息 ${id} 重试次数超限，放弃发送`);
            this.queue.delete(id);
            this.onTimeout?.(message);
            return false;
        }

        const delay = this.baseDelay * Math.pow(2, message.retryCount - 1);
        console.log(`消息 ${id} 等待 ${delay}ms 后重试 (${message.retryCount}/${this.maxRetries})`);

        setTimeout(() => {
            this.onRetry?.(message);
        }, delay);

        return true;
    }

    startRetryCheck() {
        this.retryTimer = setInterval(() => {
            const now = Date.now();
            for (const [id, message] of this.queue) {
                if (now - message.timestamp > message.timeout) {
                    this.retry(id);
                }
            }
        }, this.checkInterval);
    }

    stopRetryCheck() {
        if (this.retryTimer) {
            clearInterval(this.retryTimer);
            this.retryTimer = null;
        }
    }

    clear() {
        this.queue.clear();
    }
}

export default new MessageQueue();