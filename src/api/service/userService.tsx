import apiClient from "../index";

//登录路由
export const login = async (email: string, password: string) => {
  const response = await apiClient.get("/users/password", {
    params: {
      email,
      password
    }
  });
  return response.data;
};


//找回密码
export const findPassword = async (email: string, code: string, password: string) => {
  const body = {
    email,
    password
  }
  const response = await apiClient.put(`/users/findPassword/${code}`, body);
  return response;
};

//注册路由
export const registerAPI = async (
  email: string,
  password: string,
  code: string
) => {
  console.log("我的code", code);

  const body = {
    users: {
      email,
      password
    },
    code
  }
  const response = await apiClient.post("/users/register", body);
  return response.data;
};

//获取验证码
export const getCodeAPI = async (email: string) => {
  const response = await apiClient.get("/users/sendCodeByEmail", {
    params: {
      email
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
