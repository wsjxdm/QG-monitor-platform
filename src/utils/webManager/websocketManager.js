import Reconnect from './reconnect';
import HeartBeat from './heartBeat';
import EventBus from './eventBus';
import Sync from './syncScheduler';
import MessageQueue from './messageQueue';


class WebSocketManager {
    static instance = null;
    constructor() {
        if (WebSocketManager.instance) {
            return WebSocketManager.instance;
        }
        this.socket = null;
        this.isConnected = false;
        WebSocketManager.instance = this;
    }

    connect() {
        this.socket = new WebSocket('ws://192.168.1.100:8080/ws/test');
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);

        MessageQueue.onRetry = (msg) => {
            if (this.socket && this.isConnected) {
                this.socket.send(JSON.stringify({ id: msg.id, ...msg.payload }));
            }
        };
        MessageQueue.onTimeout = (msg) => {
            EventBus.publish('messageTimeout', msg);
        };
    }

    handleError(error) {
        console.error('WebSocket 错误:', error);
        EventBus.publish('error', error);
    }

    handleOpen() {
        console.log('WebSocket 连接成功');
        this.isConnected = true;
        HeartBeat.startHeartBeat();
        EventBus.publish('connected');
    }

    handleMessage(event) {
        console.log('WebSocket 接收到消息');
        const data = JSON.parse(event.data);

        if (data.type === 'ack') {
            MessageQueue.ack(data.id);
            return;
        }

        if (data.type !== 'pong') {
            MessageQueue.ack(data.id);
            Sync.addUpdate(data.type);
        } else {
            HeartBeat.handlePong();
        }
    }

    handleClose() {
        console.log('WebSocket 连接已关闭');
        this.isConnected = false;
        EventBus.publish('disconnected');
        Reconnect.reconnect();
    }

    send(message, needAck = false) {
        if (!this.socket || !this.isConnected) {
            console.warn('WebSocket 未连接，消息无法发送');
            return null;
        }

        let messageWithId = message;
        if (needAck && typeof message === 'object') {
            const id = MessageQueue.add(message, message.type);
            messageWithId = { ...message, id };
        }

        this.socket.send(JSON.stringify(messageWithId));
        return messageWithId.id || null;
    }

    close() {
        if (this.socket) {
            this.socket.close();
        }
        this.isConnected = false;
    }
}


export default new WebSocketManager();