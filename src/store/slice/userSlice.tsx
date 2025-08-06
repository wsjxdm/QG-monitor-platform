import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 定义用户信息的类型
export interface UserInfo {
    id: string | null;
    name: string | null;
    token: string | null;
    avater: string | null;
    email: string | null;
    createdAt: string | null;
}

// 定义初始状态
const initialState: UserInfo = {
    id: null,
    name: null,
    token: null,
    avater: null,
    email: null,
    createdAt: null,
};

// 创建 slice
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // 设置用户信息
        setUser: (state, action: PayloadAction<UserInfo>) => {
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.token = action.payload.token;
            state.avater = action.payload.avater;
            state.email = action.payload.email;
            state.createdAt = action.payload.createdAt;
        },
        // 更新用户名
        setUserName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        // 更新用户ID
        setUserId: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        // 更新用户token
        setUserToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        //更新用户头像
        setUserAvatar: (state, action: PayloadAction<string>) => {
            state.avater = action.payload;
        },
        // 清除用户信息（登出时使用）
        clearUser: (state) => {
            state.id = null;
            state.name = null;
            state.token = null;
            state.avater = null;
            state.email = null;
            state.createdAt = null;
        },
    },
});

// 导出 actions
export const { setUser, setUserName, setUserId, setUserToken, setUserAvatar, clearUser } = userSlice.actions;

// 导出 reducer
export default userSlice.reducer;