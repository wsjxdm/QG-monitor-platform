import apiClient from "..";

//获取页面停留时间和页面进入次数
export const getPageDataAPI = async (
  projectId: string | number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get("/graph/pageStateAndEnterCount", {
      params: { projectId, startTime, endTime },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//获取访问量
export const getPlatformDataAPI = async (
  projectId: string | number,
  timeType: string
) => {
  console.log("获取访问量参数:", projectId, timeType);
  try {
    const response = await apiClient.get("/graph/getVisits", {
      params: { projectId, timeType },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//埋点统计
export const getBuryPointDataAPI = async (
  projectId: string | number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get("/graph/getManualTrackingStats", {
      params: { projectId, startTime, endTime },
    });
    return response.data;
  } catch (error) {
    console.error("获取埋点数据失败:", error);
    throw error;
  }
};

//按钮点击统计
export const getButtonClickDataAPI = async (projectId: string | number) => {
  try {
    const response = await apiClient.get("/graph/getFrontendButton", {
      params: { projectId },
    });
    return response.data;
  } catch (error) {
    console.error("获取按钮点击数据失败:", error);
    throw error;
  }
};
