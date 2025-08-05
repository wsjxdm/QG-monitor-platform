import apiClient from "../index";

//登录路由
export const login = async (email: string, password: string) => {
  const response = await apiClient.post("/api/login", {
    email,
    password,
  });
  return response.data;
};

//注册路由
export const registerAPI = async (
  email: string,
  password: string,
  verificationCode: string
) => {
  const response = await apiClient.post("/api/register", {
    email,
    password,
    verificationCode,
  });
  return response.data;
};

//获取验证码
export const getCodeAPI = async (email: string) => {
  const response = await apiClient.post("/api/getVerificationCode", {
    email,
  });
  return response.data;
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
