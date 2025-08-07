// 这个文件中的接口对应着监控的类别中的具体项目
import apiClient from "../index";

//获取错误
export const getErrorDataAPI = async (params: Record<string, any>) => {
  console.log("获取错误数据参数:", params);
  try {
    const response = await apiClient.get(`/api/error/getErrorData`, {
      params,
    });
    console.log("获取错误数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取错误数据失败:", error);
    throw error;
  }
};
