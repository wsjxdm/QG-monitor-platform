import apiClient from "../index";

//获取消息信息 
export const getMessagesAPI = async (receiverId: number, isSenderExist: number) => {
    try {
        const response = await apiClient.get(`notifications/selectByReceiverId`, {
            params: {
                receiverId,
                isSenderExist
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching messages:", error);
        throw error; // 重新抛出错误以便上层处理
    }
}

//更改消息已读状态
export const updateStatusAPI = async (id: number) => {
    try {
        const response = await apiClient.put(`notifications/updateIsReadById/${id}`);
        return response.data;
    } catch (error: any) {
        console.error("Error updating status:", error);
        throw error; // 重新抛出错误以便上层处理
    }
};

//删除所有信息
//这个id就是userId
export const deleteAllAPI = async (id: number) => {
    try {
        const response = await apiClient.delete(`notifications/deleteById/${id}`);
        return response.data;
    } catch (error: any) {
        console.error("Error deleting all:", error);
        throw error; // 重新抛出错误以便上层处理
    }
};


//删除单条信息
export const deleteByIdAPI = async (id: number) => {
    try {
        const response = await apiClient.delete(`notifications/deleteByReceiverId/${id}`);
        return response.data;
    } catch (error: any) {
        console.error("Error deleting message:", error);
        throw error; // 重新抛出错误以便上层处理
    }
}