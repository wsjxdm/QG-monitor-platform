//这是一个数据转换函数，把后台传输的数据变成自己需要的，提高抗bug能力
export const transformUserData = (apiData: any): User => ({
    id: apiData.id || apiData.user?.id || apiData.user?.id,
    name: apiData.username || apiData.name || apiData.user?.name || apiData.user?.username, // 统一字段映射
    avatar: apiData.avatar || apiData.avatarUrl || apiData.user?.avatar,
    email: apiData.email || apiData.user?.email,
    createdAt: apiData.createdAt || apiData.createdTime || apiData.user?.createdAt,
    phone: apiData.phone || apiData.user?.phone,
});
