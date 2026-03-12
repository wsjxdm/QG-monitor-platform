import Mock from 'mockjs'; // 使用默认导入

export default [
    {
        url: "/api/message/list",
        method: "get",
        response: () => {
            // 使用 Mock.mock() 而不是 mock()
            const data = Mock.mock({
                'list|10': [{
                    'errorId|+1': 1,
                    'projectName': '项目@integer(1,100000)',
                    'errorType': '@pick(["JavaScript错误", "网络错误", "资源加载失败", "API异常", "性能问题"])',
                    'timestamp': '@datetime',
                    'isRead': '@boolean',
                    'avatar': '@image("50x50")',
                    'senderName': '@cname',
                    'isSenderExist|0-1': 1
                }]
            });

            return {
                code: 200,
                data: data.list
            };
        }
    }
];