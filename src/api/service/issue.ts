import apiClient from "../index";

//获取错误
export const getErrorDataAPI = async (params: Record<string, any>) => {
  console.log("获取错误数据参数:", params);
  try {
    const response = await apiClient.get(`/errors/selectByCondition`, {
      params,
    });
    console.log("获取错误数据响应:", response);
    return response.data;
  } catch (error) {
    console.error("获取错误数据失败:", error);
    throw error;
  }
};

// 获取项目普通成员
export const getProjectMembersAPI = async (projectId: string | undefined) => {
  try {
    const response = await apiClient.get("/roles/getMemberList", {
      params: { projectId },
    });
    return response.data;
  } catch (error) {
    console.error("获取项目成员失败:", error);
    throw error;
  }
};

//指派错误
export const assignErrorAPI = async (
  errorId: string | number,
  delegatorId: string | number,
  platform: string,
  responsibleId: string | number,
  projectId: string | number
) => {
  console.log("指派错误参数:", delegatorId, platform, responsibleId);
  try {
    const response = await apiClient.post("responsibilities", {
      errorId: Number(errorId),
      platform,
      delegatorId,
      responsibleId: Number(responsibleId),
      projectId,
    });
    console.log("指派错误响应:", response);
    return response.data;
  } catch (error) {
    console.error("指派错误失败:", error);
    throw error;
  }
};

//按时间（允许按照时间筛选）以及错误类别（前端/后端/移动）展示错误量
export const getPlatformDataAPI = async (
  projectId: string | number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get("/graph/getErrorTrend", {
      params: { projectId, startTime, endTime },
    });
    return response.data;
  } catch (error) {
    console.error("获取平台数据失败:", error);
    throw error;
  }
};

//每一个平台展示近一周次数前十的错误(前端)
export const getPlatformTenAPI = async (projectId: string | number) => {
  try {
    const response = await apiClient.get("graph/getFrontendErrorStats", {
      params: { projectId },
    });
    return response.data;
  } catch (error) {
    console.error("获取平台数据失败:", error);
    throw error;
  }
};

//非法访问
export const getIllegalAccessAPI = async (
  projectId: string | number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get("/graph/getIpInterceptionCount", {
      params: { projectId, startTime, endTime },
    });
    return response.data;
  } catch (error) {
    console.error("获取非法访问数据失败:", error);
    throw error;
  }
};

//根据错误id和plateform来获取错误详情
export const getErrorDetailAPI = async (
  errorId: string | number,
  platform: string
) => {
  try {
    const response = await apiClient.get("/errors/selectErrorDetail", {
      params: { errorId, platform },
    });
    return response.data;
  } catch (error) {
    console.error("获取错误详情失败:", error);
    throw error;
  }
};

//设置阈值
export const setIssueThresholdAPI = async (
  projectId: string | number,
  errorType: string | number,
  platform: string,
  threshold: number
) => {
  try {
    const response = await apiClient.put("alertRules/updateThreshold", {
      projectId,
      errorType,
      platform,
      threshold,
    });
    return response.data;
  } catch (error) {
    console.error("设置错误阈值失败:", error);
    throw error;
  }
};

//获取阈值
export const getIssueThresholdAPI = async (
  projectId: string | number,
  errorType: string | number,
  platform: string
) => {
  try {
    const response = await apiClient.get(
      "/alertRules/selectByTypeEnvProjectId",
      {
        params: { projectId, errorType, platform },
      }
    );
    return response.data;
  } catch (error) {
    console.error("获取错误阈值失败:", error);
    throw error;
  }
};

//标记解决
export const markIssueResolvedAPI = async (
  platform: string,
  projectId: string | number,
  errorType: string | number
) => {
  try {
    const response = await apiClient.put("errors/markResolved", {
      projectId,
      platform,
      errorType,
    });
    return response.data;
  } catch (error) {
    console.error("标记错误为已解决失败:", error);
    throw error;
  }
};

//查询处理情况以及处理人
export const getIssueStatusAPI = async (
  projectId: string | number,
  errorType: string | number,
  platform: string
) => {
  try {
    const response = await apiClient.get(
      "/responsibilities/selectHandleStatus",
      {
        params: { projectId, errorType, platform },
      }
    );
    return response.data;
  } catch (error) {
    console.error("获取错误处理情况失败:", error);
    throw error;
  }
};
