import type { MockMethod } from "vite-plugin-mock";

export default [
  {
    url: "/api/error/getErrorData",
    method: "get",
    response: ({ query }) => {
      console.log("获取错误数据:", query);
      // 模拟错误数据
      const allData = [
        {
          id: 1,
          platform: "项目A",
          type: "空指针",
          timestamp: "2023-01-01",
        },
        {
          id: 2,
          platform: "项目B",
          type: "网络错误",
          timestamp: "2023-01-02",
        },
        {
          id: 3,
          platform: "项目C",
          type: "SQL注入",
          timestamp: "2023-01-03",
        },
        {
          id: 4,
          platform: "项目D",
          type: "XSS漏洞",
          timestamp: "2023-01-04",
        },
        {
          id: 5,
          platform: "项目E",
          type: "命令注入",
          timestamp: "2023-01-05",
        },
        {
          id: 6,
          platform: "项目F",
          type: "资源泄露",
          timestamp: "2023-01-06",
        },
        {
          id: 7,
          platform: "项目G",
          type: "权限绕过",
          timestamp: "2023-01-07",
        },
        {
          id: 8,
          platform: "项目H",
          type: "数据篡改",
          timestamp: "2023-01-08",
        },
        {
          id: 9,
          platform: "项目I",
          type: "拒绝服务",
          timestamp: "2023-01-09",
        },
        {
          id: 10,
          platform: "项目J",
          type: "信息泄露",
          timestamp: "2023-01-10",
        },
        {
          id: 11,
          platform: "项目K",
          type: "跨站脚本",
          timestamp: "2023-01-11",
        },
      ];
      const filteredData = allData.filter((item) => {
        // 类型筛选
        if (query.type && item.type !== query.type) {
          return false;
        }

        // 平台筛选（模糊匹配）
        if (
          query.platform &&
          !item.platform?.toLowerCase().includes(query.platform.toLowerCase())
        ) {
          return false;
        }

        return true;
      });

      return {
        code: 200,
        message: "success",
        data: filteredData,
      };
    },
  },
] as MockMethod[];
