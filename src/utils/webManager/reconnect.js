class Reconnect {
    constructor(connectFn) {
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.maxReconnectAttempts = 5;
        this.reconnectMaxDelay = 5000;
        this.connectFn = connectFn;
    }

    //实现逐级延迟重连
    reconnect() {
        const delay = Math.min(this.reconnectMaxDelay, Math.pow(2, this.reconnectAttempts) * 1000);

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectTimer = setTimeout(() => {
                console.log(`正在尝试重新连接... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                this.reconnectAttempts++;
                this.connectFn();
            }, delay);
        }
    }
}

export default new Reconnect();
