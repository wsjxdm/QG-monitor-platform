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

//Fp，fcp
export const getFpDataAPI = async (
  projectId: string | number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get(
      `/graph/getAverageFrontendPerformanceTime`,
      {
        params: { projectId, startTime, endTime },
      }
    );
    console.log("获取FP数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取FP数据失败:", error);
    throw error;
  }
};

//平均时间
export const getAverageTimeDataAPI = async (
  projectId: string | number,
  platform: string,
  timeType: string
) => {
  try {
    const response = await apiClient.get("/graph/getAverageTime", {
      params: { projectId, platform, timeType },
    });
    return response.data;
  } catch (error) {
    console.error("获取平均时间数据失败:", error);
    throw error;
  }
};
