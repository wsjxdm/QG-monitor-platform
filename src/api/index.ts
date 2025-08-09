import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { message } from "antd";

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://192.168.1.156:8080",
  // baseURL: "http://192.168.1.161:8080",
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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 500) {
      // 处理服务器错误
      message.error("服务器内部错误");
    }

    //和后台对再写
    return Promise.reject(error);
  }
);

export default apiClient;
