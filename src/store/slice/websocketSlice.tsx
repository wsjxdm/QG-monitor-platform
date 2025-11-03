import { createSlice } from '@reduxjs/toolkit';

// 定义消息类型
interface MessageData {
    [key: string]: any;
}

const initialState = {
    connected: false, // 连接状态
    messageByType: {} as Record<string, MessageData>, // 按type存储最新消息，这里每一种type的消息只会存储最新的
    error: null, // 错误信息
};

const wsSlice = createSlice({
    name: 'ws',
    initialState,
    reducers: {
        // 更新连接状态
        setConnected: (state, action) => {
            state.connected = action.payload;
        },
        // 接收消息并按type存储（覆盖旧消息，只保留最新）
        messageReceived: (state, action) => {
            const { type, data } = action.payload;
            console.log("类别", type, data);

            // 存储最新消息
            state.messageByType[type] = {
                ...data,
            };
        },
        // 记录错误
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setConnected, messageReceived, setError } = wsSlice.actions;
export default wsSlice.reducer;