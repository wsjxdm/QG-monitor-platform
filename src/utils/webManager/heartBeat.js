import EventBus from './eventBus';

class HeartBeat {
    constructor(send) {
        this.send = send;
        this.heartbeatTimer = null;
        this.lastPongTime = Date.now();
        this.heartbeatInterval = 5000;
        this.timeoutThreshold = 10000;
        this.timeoutTimer = null;
    }


    startHeartBeat() {
        this.lastPongTime = Date.now();
        this.heartbeatTimer = setInterval(() => {
            if (this.send) {
                this.send(JSON.stringify({ type: 'ping' }));
            }
        }, this.heartbeatInterval);

        this.timeoutTimer = setInterval(() => {
            if (Date.now() - this.lastPongTime > this.timeoutThreshold) {
                console.error('心跳超时，触发重连');
                this.stop();
                EventBus.publish('heartbeatTimeout');
            }
        }, this.heartbeatInterval);
    }

    handlePong() {
        this.lastPongTime = Date.now();
    }

    stop() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        if (this.timeoutTimer) {
            clearInterval(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }
}
export default new HeartBeat();
