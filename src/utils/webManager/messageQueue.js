class MessageQueue {
    constructor() {
        this.queue = new Map();
        this.retryTimer = null;
        this.maxRetries = 5;
        this.baseDelay = 1000;
        this.checkInterval = 1000;
        this.onRetry = null;
        this.onTimeout = null;
        this.isStarted = false;
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

        if (!this.isStarted && this.queue.size === 1) {
            this.startRetryCheck();
        }
        return id;
    }

    ack(id) {
        const deleted = this.queue.delete(id);

        if (deleted && this.queue.size === 0 && this.isStarted) {
            this.stopRetryCheck();
        }

        return deleted;
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
        if (this.isStarted) return; // 防止重复启动

        this.isStarted = true;
        this.retryTimer = setInterval(() => {
            const now = Date.now();
            for (const [id, message] of this.queue) {
                if (now - message.timestamp > message.timeout) {
                    this.retry(id);
                }
            }

            if (this.queue.size === 0) {
                this.stopRetryCheck();
            }
        }, this.checkInterval);
    }

    stopRetryCheck() {
        if (this.retryTimer) {
            clearInterval(this.retryTimer);
            this.retryTimer = null;
            this.isStarted = false;
        }
    }

    clear() {
        this.queue.clear();
        this.stopRetryCheck();
    }
}

export default new MessageQueue();