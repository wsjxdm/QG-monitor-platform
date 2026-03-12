class WebsocketManager {
    static instance = null;

    constructor() {
        if (WebsocketManager.instance) {
            return WebsocketManager.instance;
        }
        WebsocketManager.instance = this;
        this.socket = null;
        this.isConnected = false;
        this.messageQueue = [];
        this.subscribers = [];
        this.heartbeatInterval = null;
        //最大重连数
        this.maxReconnectCount = 5;
        this.reconnectCount = 0;
        this.messageInterval = null;
    }

    //建立连接
    connect() {
        this.socket = new WebSocket('ws://localhost:8080/ws/user/1');
        //监听是否连接成功
        this.socket.onopen = () => {
            console.log('WebSocket 连接成功');
            this.isConnected = true;
            this.heartbeat();
        }
        //如果失败，则重新连接
        this.socket.onerror = () => {
            console.error('WebSocket 连接失败，正在重新连接...');
            this.reconnect();
        }

        this.socket.onclose = () => {
            console.log('WebSocket 连接已关闭');
            this.isConnected = false;
            this.stopHeartbeat();
            this.reconnect();
        }

        this.socket.onmessage = (event) => {
            console.log('收到 WebSocket 消息:', event.data);
            const message = JSON.parse(event.data);
            this.messageQueue.push(message);
            //超过某个时间没有新的消息，就触发下面的代码
            if (this.messageQueue.length > 0 && this.messageInterval == null) {
                this.messageInterval = setTimeout(() => {
                    this.responseMessage()
                }, 2000);
            }
        };
    }

    //手动断开连接
    disconnect() {
        this.socket.close();
        this.isConnected = false;
    }

    //发送消息
    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(message);
        }
    }

    //订阅消息
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    //取消订阅消息
    unsubscribe(event, callback) {
        if (this.subscribers[event]) {
            const index = this.subscribers[event].indexOf(callback);
            if (index !== -1) {
                this.subscribers[event].splice(index, 1);
            }
        }
    }

    //处理消息队列
    responseMessage() {
        //把消息队列按照type分组然后一次性传递给回调函数
        const groupedMessages = this.messageQueue.reduce((acc, message) => {
            const type = message.type;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(message);
            return acc;
        }, {});
        //遍历分组后的消息，调用对应的回调函数
        for (const type in groupedMessages) {
            if (groupedMessages.hasOwnProperty(type)) {
                const messages = groupedMessages[type];
                this.subscribers[type].forEach(callback => callback(messages));
            }
        }
        //清空消息队列
        this.messageQueue = [];
        //清空定时器
        clearTimeout(this.messageInterval);
        this.messageInterval = null;
    }

    //实现心跳机制
    heartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 5000);
    }

    //停止心跳
    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
    }

    //实现重连机制
    reconnect() {
        if (this.reconnectCount >= this.maxReconnectCount) {
            console.error('已超过最大重连次数，无法重新连接');
            return;
        }
        this.reconnectCount++;
        this.connect();
    }

}