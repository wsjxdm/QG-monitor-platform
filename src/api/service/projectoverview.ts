import apiClient from "../index";

// 私有项目获取函数
export const getPrivateProjects = async (userId: string | number) => {
  try {
    const response = await apiClient.get("projects/getPersonalProject", {
      params: { userId },
    });
    console.log("Private projects response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching private projects:", error);
  }
};

// 公开项目获取函数
export const getPublicProjects = async () => {
  try {
    const response = await apiClient.get("/projects/getPublicProjectList");
    console.log("Public projects response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching public projects:", error);
  }
};

//获取用户在项目中的权限
export const getUserResponsibility = async (
  projectId: string,
  userId: number | string
) => {
  const response = await apiClient.get("/roles/getRole", {
    params: { projectId, userId },
  });
  return response.data;
};

//获取项目信息
export const getProjectInfo = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/projects/getProject`, {
      params: { uuid: projectId },
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
    const response = await apiClient.get(`/roles/getMemberList`, {
      params: { projectId },
    });
    console.log("Project members response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching project members:", error);
  }
};

//修改项目信息
export const updateProjectInfo = async (data: any) => {
  console.log("Updating project info with data:", data);
  try {
    const response = await apiClient.put(`/projects/update`, {
      ...data,
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
    const response = await apiClient.delete(`projects`, {
      params: { uuid: projectId },
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
    const response = await apiClient.delete(`/roles`, {
      params: {
        projectId,
        userId,
      },
    });
    console.log("Exit project response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error exiting project:", error);
  }
};

//todo踢除用户
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
  newRole: string | number
) => {
  try {
    const response = await apiClient.put(`/roles`, {
      projectId,
      userId,
      userRole: newRole,
    });
    console.log("Change user level response:", response);
    return response.data;
  } catch (error: any) { }
};

//获取邀请码
export const getInviteCodeAPI = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/projects/getInviteCode`, {
      params: { projectId },
    });
    return response.data;
  } catch (error) {
    console.error("获取邀请码失败:", error);
    throw error;
  }
};

//todo获取教程md文件
export const getTutorialMarkdown = async () => {
  try {
    const response = await apiClient.get("/markdownContents/select");
    console.log("Tutorial markdown response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching tutorial markdown:", error);
  }
};
