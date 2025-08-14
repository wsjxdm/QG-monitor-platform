import apiClient from "..";

//获取信息
export const getInfoAPI = async (userId: string) => {
  try {
    const response = await apiClient.get(`/messages/getMessages`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("获取信息失败:", error);
    throw error;
  }
};

//组件卸载后提交信息
//传递的参数为一个对象数组，对象中有sendId，receiverId，context
export const submitInfoAPI = async (messages: any[]) => {
  try {
    const response = await apiClient.post("/messages/submitMessages", {
      messages,
    });
    return response.data;
  } catch (error) {
    console.error("提交信息失败:", error);
    throw error;
  }
};

//和ai通信
export const chatAPI = async (message: string) => {
  try {
    const response = await apiClient.post("/messages/chat", {
      message,
    });
    return response.data;
  } catch (error) {
    console.error("与AI通信失败:", error);
    throw error;
  }
};
