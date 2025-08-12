import apiClient from "..";

// 获取日志数据
export const getLogDataAPI = async (params: Record<string, any>) => {
  console.log("获取日志数据参数:", params);
  try {
    const response = await apiClient.get(`logs/selectByCondition`, {
      params,
    });
    console.log("获取日志数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取日志数据失败:", error);
    throw error;
  }
};
