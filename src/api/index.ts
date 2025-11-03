import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { message } from "antd";

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  // baseURL: "http://47.113.224.195:32406",
  // baseURL: "http://47.113.224.195:32406",
  // baseURL: "http://47.113.224.195:32402",
  baseURL: "http://192.168.1.161:8082",
  // baseURL: "http://47.113.224.195:30422/api",
  // baseURL: "http://47.113.224.195:32400",
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
  },
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    console.log("检查token", response.data);

    if (response.data.code === 401) {
      message.error("登录已过期，请重新登录");
      localStorage.removeItem("user");
      window.location.href = "/";
      return;
    }

    if (response.data.code === 403) {
      console.log(
        "%c [  ]-59",
        "font-size:13px; background:pink; color:#bf2c9f;",
      );
      throw new Error("权限不足");
    }
    // if (response.data.code < 200 || response.data.code >= 300) {
    //   message.error(response.data.message || "请求出错");
    //   throw new Error(response.data.message || "请求出错");
    // }
    return response.data;
  },

  (error) => {
    if (error.response?.code === 500) {
      // 处理服务器错误
      message.error("服务器内部错误");
    }

    //和后台对再写
    return Promise.reject(error);
  },
);

// 创建chatAPI专用实例（新增）
const chatApiClient: AxiosInstance = axios.create({
  baseURL: "http://47.113.224.195:32408", // 替换为AI服务地址
  timeout: 10000000,
  headers: {
    "Content-Type": "application/json",
  },
});

// chatAPI专用拦截器（新增）
chatApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

chatApiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error),
);

// 导出新实例（新增）
export { chatApiClient };

export default apiClient;
