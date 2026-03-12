import EventBus from "./eventBus";


class SyncScheduler {
    constructor() {
        this.scheduleQueue = [];
        this.throttleTimer = null;
        this.throttleTDuration = 1000;
    }


    addUpdate(updateMessage) {
        this.scheduleQueue.push(updateMessage.version);
        if (!this.throttleTimer) {
            this.throttleTimer = setTimeout(() => {
                this.throttleTimer = null;
                this.processQueue();
            }, this.throttleTDuration);
        }
    }


    async processQueue() {
        //队列中是放入的版本号，我只需要用里面最小的版本号进行http请求就好
        const minVersion = Math.min(...this.scheduleQueue);
        try {
            const response = await fetch('api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: minVersion,
                }),
            });
            if (!response.ok) {
                throw new Error('Error fetching data');
            }
            const data = await response.json();
            EventBus.publish('updateVersion', data);

        } catch (error) {
            console.error('同步请求失败:', error);
        }
    }
}

export default new SyncScheduler();
