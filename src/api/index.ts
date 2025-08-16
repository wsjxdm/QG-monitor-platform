import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";


// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  // baseURL: "http://47.113.224.195:32406",
  // baseURL: "http://192.168.1.161:8080",
  baseURL: "http://47.113.224.195:30422/api",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前带上token
    //这里应该使用对token进行加密
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const key = JSON.parse(localStorage.getItem("user"))?.key;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.RSAKey = `${key}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    return response.data;
  },

  (error) => {
    const navigate = useNavigate();
    //处理token过期
    if (error.response?.code === 401) {
      message.error("登录已过期，请重新登录");
      localStorage.removeItem("user");
      navigate("/"); // 重定向到登录页面
    }
    if (error.response?.code === 500) {
      // 处理服务器错误
      message.error("服务器内部错误");
    }

    //和后台对再写
    return Promise.reject(error);
  }
);

export default apiClient;
