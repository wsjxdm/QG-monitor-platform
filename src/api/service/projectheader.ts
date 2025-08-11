import apiClient from "../index";

//搜索
export const searchProjects = async (query: string) => {
  try {
    const response = await apiClient.get("projects/selectProjectByName", {
      params: { name: query },
    });
    console.log("Search projects response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error searching projects:", error);
  }
};

//加入项目
export const joinProject = async (
  invitedCode: string,
  userId: string | number
) => {
  console.log("Invited code:", invitedCode);
  try {
    const response = await apiClient.post("/projects/joinProject", {
      invitedCode,
      userId,
    });
    console.log("Join project response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error joining project:", error);
  }
};

//创建项目
export const createProject = async (
  name: string,
  description: string,
  isPublic: boolean,
  userId: string | number
) => {
  try {
    const response = await apiClient.post("/projects", {
      name,
      description,
      isPublic,
      userId,
    });
    console.log("Create project response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error creating project:", error);
  }
};
