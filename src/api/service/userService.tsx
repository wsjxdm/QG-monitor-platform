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