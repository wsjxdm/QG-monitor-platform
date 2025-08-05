import axios from "axios";
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.108:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token');
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
        // 对响应错误做点什么
        if (error.response?.status === 401) {
            // 处理未授权错误
            localStorage.removeItem('token');
            // 可以跳转到登录页
            // window.location.href = '/login';
        }

        if (error.response?.status === 500) {
            // 处理服务器错误
            message.error('服务器内部错误');
        }

        //和后台对再写
        return Promise.reject(error);
    }
);

export default apiClient;