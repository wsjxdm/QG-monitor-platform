// 这个文件中的接口对应着监控的类别中的具体项目
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
  plateform: string,
  responsibleId: string | number
) => {
  console.log("指派错误参数:", errorId, delegatorId, plateform, responsibleId);
  try {
    const response = await apiClient.put("/api/projects/alertIssueNumber", {
      errorId,
      plateform,
      delegatorId,
      responsibleId,
    });
    console.log("指派错误响应:", response);
    return response.data;
  } catch (error) {
    console.error("指派错误失败:", error);
    throw error;
  }
};
