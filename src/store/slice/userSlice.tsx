import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getUserInfoAPI } from "../../api/service/userService";
import { updateUserInfoAPI } from "../../api/service/userService";
import { updateUserAvatarAPI } from "../../api/service/userService";
import { useEncryption } from "../../hooks/encrypt";
import { transformUserData } from "../../utils/transform.tsx";

// 定义用户信息的类型
export interface User {
  id: string | null;
  name: string | null;
  avatar: string | null;
  email: string | null;
  createdAt: string | null;
  phone: string | null;
}

export interface UserInfo {
  token: string | null;
  user: User;
}

// 定义初始状态
const initialState: UserInfo = {
  token: null,
  user: {
    id: null,
    name: null,
    avatar: null,
    email: null,
    createdAt: null,
    phone: null,
  },
};

const { encryptData, decryptData } = useEncryption();

// 异步获取用户信息的 thunk
export const fetchUserInfo = createAsyncThunk(
  "user/fetchUserInfo",
  async (userId: number) => {
    try {
      // 调用 API 获取用户信息
      const response = await getUserInfoAPI(userId);
      const decryptedData = await decryptData(
        response.data.encryptedData,
        response.data.encryptedKey,
      );
      console.log("解密的数据", decryptedData);

      return JSON.parse(decryptedData); // 假设用户数据在 response.data 中
    },
);

//更新用户信息的thunk
export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (userData: any) => {
    try {
      const { encryptedData, encryptedKey } = encryptData(
        userData,
      );
      // 发送更新用户信息请求
      const response = await updateUserInfoAPI(encryptedData, encryptedKey);
      const decryptedData = decryptData(
        response.data.encryptedData,
        response.data.encryptedKey,
      );
      console.log("这是dispatch更新后返回的用户信息(这里检查有没有返回头像)", decryptedData);

      return JSON.parse(decryptedData);
    } catch (error: unknown) {
      throw new Error((error as { message: string }).message);
    }
  },
);

export const updateUserAvatar = createAsyncThunk(
  "user/updateUserAvatar",
  async (avatar: string) => {
    try {
      // 创建用户数据对象
      const userData = {
        avatar: avatar,
      };
      // 获取用户信息
      const response = await updateUserAvatarAPI(userData);

      return response; // 假设更新成功返回的数据在 response.data 中
    } catch (error: unknown) {
      throw new Error((error as { message: string }).message);
    }
  },
);



// 创建 slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 设置用户信息
    setUser: (state, action: PayloadAction<UserInfo>) => {

      // state.user.id = action.payload.user.id;
      // state.token = action.payload.token;
      // state.user.name = action.payload.user.username;
      // state.user.avatar = action.payload.user.avatar;
      // state.user.createdAt = action.payload.user.createdTime;
      // state.user.phone = action.payload.user.phone;

      state.user = transformUserData(action.payload);
      state.token = action.payload.token;
      const { encryptedData, encryptedKey } = encryptData(
        state.token,
      );
      console.log("登录成功后获取的id", action.payload.user.id);


      localStorage.setItem(
        "user",
        JSON.stringify({
          id: action.payload.user.id,
          token: encryptedData,
          key: encryptedKey,
        })
      );
    },
    setAvatar: (state, action) => {
      state.user.avatar = action.payload;
      console.log("使用了setAvatar后是否储存了呢", state.user.avatar);
    },
    // 清除用户信息（登出时使用）
    clearUser: (state, action) => {
      state.user.id = null;
      state.token = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取用户信息的异步操作
      .addCase(fetchUserInfo.pending, (state) => {
        // 可以在这里设置加载状态（如果需要的话）
        console.log("正在获取用户信息...");
      })
      .addCase(
        fetchUserInfo.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          // 成功获取用户信息后更新 state
          // state.user.id = action.payload.id;
          // state.user.name = action.payload.username;
          // state.token = action.payload.token;
          // console.log("这里是fetchUserInfo检查有没有正确传递action头像", state.user.avatar);

          // state.user.avatar = action.payload.avatar;
          // console.log("这里是fetchUserInfo检查redux有没有正确存储头像", state.user.avatar);

          // state.user.email = action.payload.email;
          // state.user.createdAt = action.payload.createdTime;
          // state.user.phone = action.payload.phone;
          // 成功获取用户信息后更新 state
          // state.user.id = action.payload.id;
          // state.user.name = action.payload.username;
          // console.log("这里是fetchUserInfo检查有没有正确传递action头像", state.user.avatar);

          // state.user.avatar = action.payload.avatar;
          // console.log("这里是fetchUserInfo检查redux有没有正确存储头像", state.user.avatar);

          // state.user.email = action.payload.email;
          // state.user.createdAt = action.payload.createdTime;
          // state.user.phone = action.payload.phone;
          state.token = action.payload.token;
          state.user = transformUserData(action.payload);
        }
      )
      .addCase(fetchUserInfo.rejected, (state, action) => {
        // 处理获取用户信息失败的情况
        console.error("获取用户信息失败:", action.payload);
        // 可以根据需要添加错误处理逻辑
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.user.name = action.payload.username;
        state.user.email = action.payload.email;
        // state.user.avatar = action.payload.avatar;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        console.error("更新用户信息失败:", action.payload);
      })
      .addCase(updateUserInfo.pending, (state) => {
        console.log("正在更新用户信息...");
      });
  },
  // 清除用户信息（登出时使用）
  clearUser: (state) => {
    state.user.id = null;
    state.token = null;
    localStorage.removeItem("user");
  },
},
  extraReducers: (builder) => {
    builder
      // 处理获取用户信息的异步操作
      .addCase(fetchUserInfo.pending, () => {
        // 可以在这里设置加载状态（如果需要的话）
        console.log("正在获取用户信息...");
      })
      .addCase(
        fetchUserInfo.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          // 成功获取用户信息后更新 state
          state.user.id = action.payload.user.id;
          state.user.name = action.payload.user.name;
          state.token = action.payload.token;
          console.log(
            "这里是fetchUserInfo检查有没有正确传递action头像",
            state.user.avatar,
          );

          state.user.avatar = action.payload.user.avatar;
          console.log(
            "这里是fetchUserInfo检查redux有没有正确存储头像",
            state.user.avatar,
          );

          state.user.email = action.payload.user.email;
          state.user.createdAt = action.payload.user.createdAt;
          state.user.phone = action.payload.user.phone;
        },
      )
      .addCase(fetchUserInfo.rejected, () => {
        // 处理获取用户信息失败的情况
        // console.error("获取用户信息失败:", action.payload);
        // 可以根据需要添加错误处理逻辑
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.user.name = action.payload.username;
        state.user.email = action.payload.email;
        // state.user.avatar = action.payload.avatar;
      })
      .addCase(updateUserInfo.rejected, () => {
        // console.error("更新用户信息失败:", action.payload);
      })
      .addCase(updateUserInfo.pending, () => {
        console.log("正在更新用户信息...");
      });
  },
});

// 导出 actions
export const { setUser, clearUser, setAvatar } = userSlice.actions;

// 导出 reducer
export default userSlice.reducer;
