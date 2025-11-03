import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getUserInfoAPI } from "../../api/service/userService";
import { updateUserInfoAPI } from "../../api/service/userService";
import { updateUserAvatarAPI } from "../../api/service/userService";
import { encryptWithAESAndRSA } from "../../utils/encrypt";
import { decryptWithAESAndRSA } from "../../utils/encrypt";

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
//解密私钥
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1AZj7Ik201dBfzZ9eP3rJCsdt9Hy7RP9KR+xTWnI+VGrW+fDUAzYyFzegXemaXpgePTchdbeioow+JkUPkWQWOmOlmgg+aXMymqgvkix1e3MrepRJkRNVXJJ5KvSJt7OPR5K5B8QTyLXEP8sOLaVpfTJxOmrbe5EwLf1iF63JmL+JoM3vxFZX/kroirb9fYCsWfaZG8IIil5SXlgS7UPd5mpy+pXn0QrhwP2Gw23nG8pX+AwTuL65dJC8DSZMfvFdWZeTQnw6AVS8StMmvXazMNWgOzA65kCJlQB62T69/CYttAjGGXzbWZ6Koe0/TOtpADIdLDOPIe++lxm6Rrn9AgMBAAECggEASPwDbOPIlG2Qb0jQhWawQkc74cyuzK4GCDQXCQcTwKk2SUePwVUoMatl7R5g9rNEwBCr3ayDJqtHRDoXJ69WvZW+n0QMJepMHm/49/GHRrnH1xS+nSlHs+g3UW8uGie92byg30XP3LBWBnM4k5d5Np9aSwiklKpvAQ/SNw7YLsxgG3tjmMgzbzQnNtTdW81BV+A4KIaYVUZnoSEVSzHN3T7WZgG9TLiCm7AowQ8qFTK0Sxu0kO3JGc6G3GkQmR77J4YDIv8O+Da+ITmyVEwxtzuIKNa/VDCtV3Anxit+Hk0xBNsT9Vvdv3upMyjOggjXnWbQYUXN4zbv1IoWlwqOiwKBgQDlzIUZHQPY5t1BWOOXr1w7KRVfxtqm9fKy1x4v+T7f1SPOmFpmAg3Qfv6c1dpON8d6NJS01kuymFW/iPVdvjpoGWqYBSEn0mbz9iBU9quNaU4WhqmlU8OdfqCch0jOK/l+3WCl4BshShpis2mvXPa8HtygkRqQfMVGML2nGttb+wKBgQDJpOTiJSRlcRgj27qXsQjXwrJsEAoZ0cA/UaUlWed/qHBsLE9yk+Y3bxlFc8Sf0wLJejaaCOQ4IS6e81bl7AOT/VBqU77zzBS1uZ4L1dMlJipELgtQcsv06CblDhnRJLAAJ0/xtX6HUqu2v8pGqaLyqsESZXn8TdwxyBKfbnioZwKBgQCIgQ7nNhcc9zajJLw9VIvDEMqDlEo6N4sttR9XfAVfTOryRAoe4kV2fpmcbGQ7ZmL2MtnK+ikJM/hryF2IjAGB6Ocq2pExaIiDjsbx8X1CiTU7qE6JyNJAcgHSOYKEBhc0xygsII29HpnB27WB2AUxBlwkfU18WsGMylM+OnPnlQKBgQC7MtQyhlzVuDq6/4Co1vfopp3R6MoX0jxyDDAPDvn177//DNvs+RVfHUsOyT0fS1xpA4axVdPZsCSB+FMSPRvNRfxj2b+Kwknvs5TgU/AjqtzOUxi55PkoMmX5fC/HlBG48sYrFV2T79HuZPs6wr2+H3wCwiaPbxEfPijbzklBvQKBgBFCAippRBOSX6gol9VJSwzB61Ak9U2vYKucWia4GrEtS/faEUmNKj220qksTEjiACnbTrWojZFKEWx30s+mrkwXdXmNbuq2so5fEvjGQ8rKXCcJNp5/pInPMvhCvw4tUuJ9lEH8EXkDFFRlTVoUnlWofHdTcQreOs/tkHlfrC5M
-----END PRIVATE KEY-----`;

// 异步获取用户信息的 thunk
export const fetchUserInfo = createAsyncThunk(
  "user/fetchUserInfo",
  async (userId: number) => {
    // 调用 API 获取用户信息
    const response = await getUserInfoAPI(userId);
    const decryptedData = decryptWithAESAndRSA(
      response.data.encryptedData,
      response.data.encryptedKey,
      privateKey,
    );
    console.log("解密的数据", decryptedData);

    return JSON.parse(decryptedData); // 假设用户数据在 response.data 中
  },
);

//更新用户信息的thunk
export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (userData: unknown) => {
    try {
      const { encryptedData, encryptedKey } = encryptWithAESAndRSA(
        JSON.stringify(userData),
        publicKey,
      );
      // 发送更新用户信息请求
      const response = await updateUserInfoAPI(encryptedData, encryptedKey);
      //   if (response.status !== 200) {
      //     throw new Error(response.message);
      //   }
      const decryptedData = decryptWithAESAndRSA(
        response.data.encryptedData,
        response.data.encryptedKey,
        privateKey,
      );
      console.log(
        "这是dispatch更新后返回的用户信息(这里检查有没有返回头像)",
        decryptedData,
      );

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

//加密token的公钥
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsQBfHrU7NYVB8l0kmD79ayRbS2Nmu0gOKIg177flG/MiZd5TIYuH+eOINrFFgu6K1jmTqeUDw5Lm2SPofC1fV++V6yhJu8Vveaa0WhFElSrp5F4vsZ34HB7kpZmH6Vp/u9tdohDrXe+cVdO74ILxsw9CLpEpFrFHmgThVSKtNfwCExZeOT5lN6UKgsxp+HIFbhKWF9NMpmeYw5ie10YevN9Fq9x11aeg+ZgKct1GzF9RfOcX0h6Mz4xu45q5bWRQS+djvprBS5tvYOCVZj9KEanltbFFq71PmiQLdkH7imCFtwHPZzK5TAYeknH+raSjlGDMsijs+I8tR8XpuQcXtwIDAQAB
-----END PUBLIC KEY-----`;

// 创建 slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 设置用户信息
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user.id = action.payload.user.id;
      state.token = action.payload.token;
      state.user.name = action.payload.user.name;
      state.user.avatar = action.payload.user.avatar;
      state.user.createdAt = action.payload.user.createdAt;
      state.user.phone = action.payload.user.phone;

      const { encryptedData, encryptedKey } = encryptWithAESAndRSA(
        state.token,
        publicKey,
      );
      console.log("登录成功后获取的id", action.payload.user.id);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: action.payload.user.id,
          token: encryptedData,
          key: encryptedKey,
        }),
      );
    },
    setAvatar: (state, action) => {
      state.user.avatar = action.payload;
      console.log("使用了setAvatar后是否储存了呢", state.user.avatar);
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
