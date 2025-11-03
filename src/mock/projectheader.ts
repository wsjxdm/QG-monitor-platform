import { message } from "antd";
import type { MockMethod } from "vite-plugin-mock";
import project from "./project";

export default [
  {
    url: "/api/project/search",
    method: "get",
    response: ({ query }) => {
      console.log("Search query:", query);
      return {
        code: 0,
        message: "success",
        data: [
          {
            id: 1,
            name: "电商平台监控",
            description: "电商网站的前端监控项目",
            isPublic: true,
          },
          {
            id: 2,
            name: "企业管理系统",
            description: "内部OA系统的监控",
            isPublic: false,
          },
          {
            id: 3,
            name: "移动端应用",
            description: "手机APP的性能监控",
            isPublic: true,
          },
          {
            id: 4,
            name: "数据可视化平台",
            description: "大数据展示平台监控",
            isPublic: false,
          },
        ],
      };
    },
  },
  {
    url: "/api/project/join",
    method: "post",
    response: () => {
      return {
        code: 200,
        data: {
          projectId: 1,
        },
        message: "加入项目成功",
      };
    },
  },
  {
    url: "/api/project/create",
    method: "post",
    response: () => {
      return {
        code: 200,
        data: {
          projectId: 1,
        },
        message: "项目创建成功",
      };
    },
  },
] as MockMethod[];
