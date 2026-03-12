import Reconnect from './reconnect';
import HeartBeat from './heartBeat';
import EventBus from './eventBus';
import Sync from './syncScheduler';


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
        //!! 注意this绑定问题，这里如果不绑定，this指向这个socket实例，而不是WebSocketManager实例
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
    }

    handleOpen() {
        console.log('WebSocket 连接成功');
        this.isConnected = true;
        HeartBeat.startHeartBeat();
        EventBus.publish('connected');
    }

    handleMessage(event) {
        console.log('WebSocket 接收到消息');
        if (event.data.type !== 'pong') {
            Sync.addUpdate(event.data.type);
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

    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(message);
        }
    }

    close() {
        if (this.socket) {
            this.socket.close();
        }
        this.isConnected = false;
    }
}


export default new WebSocketManager();