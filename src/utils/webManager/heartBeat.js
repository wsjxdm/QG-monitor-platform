class HeartBeat {
    constructor(send) {
        this.send = send;
        this.heartbeatTimer = null;
        this.heartbeatInterval = 5000;
    }


    startHeartBeat() {
        this.heartbeatTimer = setInterval(() => {
            this.send(JSON.stringify({ type: 'ping' }));
        }, this.heartbeatInterval);
    }

    //当接收到服务端的pong，重置心跳定时器
    handlePong() {
        clearTimeout(this.heartbeatTimer);
        this.startHeartBeat();
    }
}
export default new HeartBeat();
