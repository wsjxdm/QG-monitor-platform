import apiClient from "../index";

//登录路由
export const login = async (encryptedData: string, encryptedKey: string) => {
  const body = {
    encryptedData,
    encryptedKey
  };
  const response = await apiClient.post("/users/password", body);
  return response;
};


//找回密码
export const findPassword = async (encryptedData: string, encryptedKey: string) => {
  const body = {
    encryptedData,
    encryptedKey
  }
  const response = await apiClient.put(`/users/findPassword`, body);
  return response;
};

//注册路由
export const registerAPI = async (
  encryptedData: string, encryptedKey: string
) => {
  const body = {
    encryptedData,
    encryptedKey
  }
  const response = await apiClient.post("/users/register", body);
  return response;
};

//获取验证码
export const getCodeAPI = async (encryptedData: string, encryptedKey: string) => {
  const response = await apiClient.get("/users/sendCodeByEmail", {
    params: {
      encryptedData,
      encryptedKey
    }
  });
  return response;
};

//修改用户信息，需要在redux中同步
export const updateUserAPI = async (userData: any) => {
  const response = await apiClient.post("/api/updateUser", userData);
  return response.data;
};

//注销用户
export const deleteUserAPI = async () => {
  const response = await apiClient.post("/api/deleteUser");
  //判断是否成功,在这里进行退出登录等操作
  return response.data;
};


//刷新的时候获取用户信息
export const getUserInfoAPI = async (id: number) => {
  const response = await apiClient.get(`users/${id}`);
  //对返回的数据进行解密
  return response;
};

//修改用户信息
export const updateUserInfoAPI = async (encryptedData: string, encryptedKey: string) => {
  const response = await apiClient.put("/api/updateUserInfo", { encryptedData, encryptedKey });
};