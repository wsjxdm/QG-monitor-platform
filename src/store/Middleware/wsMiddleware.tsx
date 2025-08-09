import { type Middleware } from 'redux';
import { setConnected, setError, messageReceived } from '../slice/websocketSlice';
import { message, notification } from 'antd';
import '@ant-design/v5-patch-for-react-19';

export const wsMiddleware: Middleware<{}> = (store) => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null; // 重连定时器

    // 建立连接
    const connect = () => {
        const wsUrl = `ws://192.168.1.161:8080/ws`; // 后端WebSocket地址

        console.log("尝试建立连接");

        // 关闭已有连接并重新创建
        if (socket) {
            console.log(socket);
            socket.close();
            console.log("关闭了已有连接并重新创建");
        }

        socket = new WebSocket(wsUrl);

        // 连接成功
        socket.onopen = () => {
            console.log('WebSocket连接成功');
            message.success('WebSocket连接成功');
            store.dispatch(setConnected(true));
            store.dispatch(setError(null)); // 清除错误
            if (reconnectTimeout) clearTimeout(reconnectTimeout); // 清除重连定时器
        };

        // 接收消息
        socket.onmessage = (event: MessageEvent) => {
            try {
                const msg = JSON.parse(event.data); // 假设后端消息格式：{ type: 'xxx', data: {} }
                if (!msg.type) throw new Error('消息缺少type字段');
                // 如果消息类型是 notification，则显示全局通知
                if (msg.type === 'notifications') {
                    notification.info({
                        message: `指派通知`,
                        description: "您有新的消息"
                    });
                }
                if (msg.type === 'designate') {
                    notification.info({
                        message: `通知牛马`,
                        description: "您有新任务了哦~马上干活！"
                    });
                }
                store.dispatch(messageReceived(msg.data)); // 分发消息到Redux
                console.log('接收到消息:', msg.data);

            } catch (err: any) {
                console.error('解析消息失败:', err);
                store.dispatch(setError(`消息格式错误: ${err.message}`));
            }
        };

        // 连接关闭（自动重连）
        socket.onclose = (event: CloseEvent) => {
            console.log('WebSocket断开，准备重连...', event);
            store.dispatch(setConnected(false));
            // 3秒后重连（避免频繁重试）
            reconnectTimeout = setTimeout(connect, 3000);
        };

        // 错误处理
        socket.onerror = (err: Event) => {
            console.error('WebSocket错误:', err);
            store.dispatch(setError(`连接错误`)); // Event对象没有message属性
        };
    };

    // 断开连接（主动关闭，不重连）
    const disconnect = () => {
        if (socket) socket.close(1000, '主动断开'); // 1000表示正常关闭
        socket = null;
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        store.dispatch(setConnected(false));
    };

    // 中间件逻辑：拦截action并处理
    return (next) => (action: any) => {
        switch (action.type) {
            case 'ws/connect': // 触发连接
                connect();
                break;
            case 'ws/disconnect': // 触发断开
                disconnect();
                break;
            default:
                return next(action); // 其他action正常传递
        }
    };
};