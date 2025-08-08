import apiClient from "../index";

// 修复私有项目获取函数
export const getPrivateProjects = async () => {
  try {
    //todo 带上用户id
    const response = await apiClient.get("/api/project/private");
    console.log("Private projects response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching private projects:", error);
  }
};

// 添加公开项目获取函数
export const getPublicProjects = async () => {
  try {
    const response = await apiClient.get("/api/project/public");
    console.log("Public projects response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching public projects:", error);
  }
};

//获取项目信息
export const getProjectInfo = async (projectId: string, role: number) => {
  try {
    const response = await apiClient.get(`/api/project/info`, {
      params: { projectId, role },
    });
    console.log("Project info response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching project info:", error);
  }
};

//获取项目成员信息
export const getProjectMembers = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/api/project/GroupNumber`, {
      params: { projectId },
    });
    console.log("Project members response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching project members:", error);
  }
};

//修改项目信息
export const updateProjectInfo = async (projectId: string, data: any) => {
  console.log("Updating project info with data:", projectId, data);
  try {
    const response = await apiClient.put(`/api/project/updateProjectData`, {
      projectId,
      data,
    });
    console.log("Update project info response:", response);
    return response;
  } catch (error: any) {
    console.error("Error updating project info:", error);
  }
};

//删除项目
export const deleteProjectAPI = async (projectId: string) => {
  try {
    const response = await apiClient.delete(`/api/project/deleteProject`, {
      params: { projectId },
    });
    console.log("Delete project response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting project:", error);
  }
};

//退出项目
export const exitProjectAPI = async (
  projectId: string,
  userId: string | number
) => {
  try {
    const response = await apiClient.post(`/api/project/exitProject`, {
      projectId,
      userId,
    });
    console.log("Exit project response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error exiting project:", error);
  }
};

//踢除用户
export const kickUserAPI = async (
  projectId: string,
  userId: string | number
) => {
  try {
    const response = await apiClient.delete(`/api/project/kickUser`, {
      params: { projectId, userId },
    });
    console.log("Kick user response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error kicking user:", error);
  }
};

//修改用户层级
export const changeUserLevelAPI = async (
  projectId: string,
  userId: string | number,
  level: string
) => {
  try {
    const response = await apiClient.put(`/api/project/changeUserLevel`, {
      projectId,
      userId,
      level,
    });
    console.log("Change user level response:", response);
    return response.data;
  } catch (error: any) {}
};

//获取教程md文件
export const getTutorialMarkdown = async () => {
  try {
    const response = await apiClient.get("/api/project/tutorial");
    console.log("Tutorial markdown response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching tutorial markdown:", error);
  }
};
