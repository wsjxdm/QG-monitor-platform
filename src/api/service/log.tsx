import apiClient from "..";

// 获取日志数据
export const getLogDataAPI = async (projectId: string | number) => {
  console.log("获取日志数据参数:", projectId);
  try {
    const response = await apiClient.get(`/graph/selectLogsByCondition`, {
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

//获取方法调用统计表
export const getMethodCallDataAPI = async (
  projectId: string | number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get(`/graph/getMethodInvocationStats`, {
      params: { projectId, startTime, endTime },
    });
    console.log("获取方法调用统计数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取方法调用统计数据失败:", error);
    throw error;
  }
};
