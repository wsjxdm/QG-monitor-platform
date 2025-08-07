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
          moduleName: "用户登录",
          moduleId: 1,
          name: "linrunxin",
          delegatorId: 1,
          avatarUrl: "",
        },
        {
          id: 2,
          platform: "项目B",
          type: "网络错误",
          moduleName: "注册",
          moduleId: 2,
          timestamp: "2023-01-02",
        },
        {
          id: 3,
          platform: "项目C",
          type: "SQL注入",
          moduleName: "用户登录",
          moduleId: 1,
          timestamp: "2023-01-03",
        },
        {
          id: 4,
          platform: "项目D",
          type: "XSS漏洞",
          moduleName: "用户登录",
          moduleId: 1,
          timestamp: "2023-01-04",
        },
        {
          id: 5,
          platform: "项目E",
          type: "命令注入",
          moduleName: "用户登录",
          moduleId: 1,
          timestamp: "2023-01-05",
        },
        {
          id: 6,
          platform: "项目F",
          type: "资源泄露",
          moduleId: 1,
          moduleName: "用户登录",
          timestamp: "2023-01-06",
        },
        {
          id: 7,
          platform: "项目G",
          type: "权限绕过",
          moduleId: 1,
          moduleName: "用户登录",
          timestamp: "2023-01-07",
        },
        {
          id: 8,
          platform: "项目H",
          type: "数据篡改",
          moduleId: 1,
          moduleName: "用户登录",
          timestamp: "2023-01-08",
        },
        {
          id: 9,
          platform: "项目I",
          type: "拒绝服务",
          moduleId: 1,
          moduleName: "用户登录",
          timestamp: "2023-01-09",
        },
        {
          id: 10,
          platform: "项目J",
          type: "信息泄露",
          moduleId: 1,
          moduleName: "用户登录",
          timestamp: "2023-01-10",
        },
        {
          id: 11,
          platform: "项目K",
          type: "跨站脚本",
          moduleId: 1,
          moduleName: "用户登录",
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
          !item.platform
            ?.toLowerCase()
            .includes(query.platform.toLowerCase() || query.moduleId)
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
  {
    url: "/api/error/getProjectMember",
    method: "get",
    response: ({ query }) => {
      console.log("获取项目成员:", query);
      return {
        code: 200,
        message: "获取到项目普通成员列表成功",
        data: [
          {
            id: 1,
            name: "linrunxin",
            email: "linrunxin@example.com",
            avatar: null,
            role: 3,
          },
          {
            id: 2,
            name: "wushujie",
            email: "wushujie@example.com",
            avatar: null,
            role: 3,
          },
          {
            id: 3,
            name: "wuchunyao",
            email: "wuchunyao@example.com",
            avatar: null,
            role: 3,
          },
          {
            id: 4,
            name: "huanggengbiao",
            email: "huanggengbiao@example.com",
            avatar: null,
            role: 3,
          },
          {
            id: 5,
            name: "zhangyong",
            email: "zhangyong@example.com",
            avatar: null,
            role: 3,
          },
          {
            id: 6,
            name: "zhangyong",
            email: "zhangyong@example.com",
            avatar: null,
            role: 3,
          },
        ],
      };
    },
  },
  {
    url: "/api/projects/alertIssueNumber",
    method: "put",
    response: ({ errorId, userId }) => {
      console.log("指派错误:", errorId, "给用户:", userId);
      return {
        code: 200,
        message: "指派成功",
      };
    },
  },
] as MockMethod[];
