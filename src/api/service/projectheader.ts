import apiClient from "../index";

//搜索
export const searchProjects = async (query: string) => {
  try {
    const response = await apiClient.get("/api/project/search", {
      params: { query },
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
  try {
    const response = await apiClient.post("/api/project/join", {
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
    const response = await apiClient.post("/api/project/create", {
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
