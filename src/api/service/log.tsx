import apiClient from "..";

// 获取日志数据
export const getLogDataAPI = async (projectId: string | number) => {
  console.log("获取日志数据参数:", projectId);
  try {
    const response = await apiClient.get(`logs/selectByCondition`, {
      params: {
        projectId,
      },
    });
    console.log("获取日志数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取日志数据失败:", error);
    throw error;
  }
};
