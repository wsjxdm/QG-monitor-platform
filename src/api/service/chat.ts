import apiClient, { chatApiClient } from ".."; // 只添加chatApiClient导入
//获取信息
export const getInfoAPI = async (userId: string) => {
  try {
    const response = await apiClient.get(`/messages/getMessages`, {
      params: { userId },
    });

    // 关键修复：响应拦截器已经返回了response.data，所以这里直接返回response
    // 不要再访问response.data，因为response本身就是原来的response.data
    console.log("🔍 API收到的response:", response);
    return response;
  } catch (error) {
    console.error("获取信息失败:", error);
    throw error;
  }
};

//组件卸载后提交信息
//传递的参数为一个对象数组，对象中有sendId，receiverId，context
export const submitInfoAPI = async (messages: any[]) => {
  try {
    const response = await apiClient.post("/messages/submitMessages", messages);
    // 同样的修复
    return response;
  } catch (error) {
    console.error("提交信息失败:", error);
    throw error;
  }
};

//和ai通信
// 只修改chatAPI使用新实例
export const chatAPI = async (message: string, projectId: string) => {
  try {
    const response = await chatApiClient.post("/messages/chat", {
      message,
      projectId
    });
    return response;
  } catch (error) {
    console.error("与AI通信失败:", error);
    throw error;
  }
};