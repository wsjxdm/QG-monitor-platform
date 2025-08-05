import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slice.tsx/userSlice';

// 配置 store
export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

// 导出 RootState 和 AppDispatch 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出 store 作为默认导出
export default store;