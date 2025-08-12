import apiClient from "../index";

export const getPerformanceDataAPI = async (params: Record<string, any>) => {
  console.log("获取性能数据参数:", params);
  try {
    const response = await apiClient.get(`/performances/selectByCondition`, {
      params,
    });
    console.log("获取性能数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取性能数据失败:", error);
    throw error;
  }
};
