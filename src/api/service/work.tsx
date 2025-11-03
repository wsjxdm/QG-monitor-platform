import apiClient from "..";

export const getWorkDataAPI = async (
  projectId: string | number,
  responsibleId: string | number,
  errorType?: string
) => {
  try {
    const response = await apiClient.get(
      "/responsibilities/selectResponsibleError",
      {
        params: { projectId, responsibleId },
      }
    );
    return response.data;
  } catch (error) {
    console.error("获取工作数据失败:", error);
    throw error;
  }
};
