import { message } from "antd";
import type { MockMethod } from "vite-plugin-mock";

export default [
  {
    url: "/api/project/private",
    method: "get",
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: "project-1",
            name: "电商平台监控",
            invitedCode: "PUB1A2B3C4D5E6F",
            description: "电商网站的前端监控项目，包含错误收集、性能监控等功能",
            isPublic: false,
            createTime: "2023-01-15 10:30:00",
            errorCount: 12,
            performanceScore: 85,
          },
          {
            id: "project-3",
            name: "移动端应用",
            invitedCode: "PUB2G3H4I5J6K7L",
            description: "手机APP的性能监控，关注启动时间、内存使用等指标",
            isPublic: true,
            createTime: "2023-02-20 14:15:00",
            errorCount: 8,
            performanceScore: 78,
          },
          {
            id: "project-5",
            name: "数据分析平台",
            invitedCode: "PUB3M4N5O6P7Q8R",
            description: "大数据分析平台的监控系统，关注数据处理性能",
            isPublic: true,
            createTime: "2023-03-10 09:45:00",
            errorCount: 5,
            performanceScore: 92,
          },
          {
            id: "project-6",
            name: "在线教育系统",
            invitedCode: "PUB4S5T6U7V8W9X",
            description: "在线教育平台的监控，关注课程访问和用户学习行为",
            isPublic: true,
            createTime: "2023-04-05 16:20:00",
            errorCount: 3,
            performanceScore: 88,
          },
          {
            id: "project-7",
            name: "社交网络应用",
            invitedCode: "PUB5Y6Z7A8B9C0D",
            description: "社交平台的监控系统，关注用户互动和内容分发",
            isPublic: true,
            createTime: "2023-05-12 11:30:00",
            errorCount: 15,
            performanceScore: 81,
          },
          {
            id: "project-8",
            name: "云存储服务",
            invitedCode: "PUB6E7F8G9H0I1J",
            description: "云存储服务监控，关注文件上传下载性能和稳定性",
            isPublic: true,
            createTime: "2023-06-18 13:45:00",
            errorCount: 7,
            performanceScore: 90,
          },
        ],
        message: "获取私有项目列表成功",
      };
    },
  },
  {
    url: "/api/project/public",
    method: "get",
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: 1,
            name: "电商平台监控",
            invitedCode: "PUB1A2B3C4D5E6F",
            description: "电商网站的前端监控项目，包含错误收集、性能监控等功能",
            isPublic: true,
            createTime: "2023-01-15 10:30:00",
            errorCount: 12,
            performanceScore: 85,
          },
          {
            id: 3,
            name: "移动端应用",
            invitedCode: "PUB2G3H4I5J6K7L",
            description: "手机APP的性能监控，关注启动时间、内存使用等指标",
            isPublic: true,
            createTime: "2023-02-20 14:15:00",
            errorCount: 8,
            performanceScore: 78,
          },
          {
            id: 5,
            name: "数据分析平台",
            invitedCode: "PUB3M4N5O6P7Q8R",
            description: "大数据分析平台的监控系统，关注数据处理性能",
            isPublic: true,
            createTime: "2023-03-10 09:45:00",
            errorCount: 5,
            performanceScore: 92,
          },
          {
            id: 6,
            name: "在线教育系统",
            invitedCode: "PUB4S5T6U7V8W9X",
            description: "在线教育平台的监控，关注课程访问和用户学习行为",
            isPublic: true,
            createTime: "2023-04-05 16:20:00",
            errorCount: 3,
            performanceScore: 88,
          },
          {
            id: 7,
            name: "社交网络应用",
            invitedCode: "PUB5Y6Z7A8B9C0D",
            description: "社交平台的监控系统，关注用户互动和内容分发",
            isPublic: true,
            createTime: "2023-05-12 11:30:00",
            errorCount: 15,
            performanceScore: 81,
          },
          {
            id: 8,
            name: "云存储服务",
            invitedCode: "PUB6E7F8G9H0I1J",
            description: "云存储服务监控，关注文件上传下载性能和稳定性",
            isPublic: true,
            createTime: "2023-06-18 13:45:00",
            errorCount: 7,
            performanceScore: 90,
          },
        ],
        message: "获取公开项目列表成功",
      };
    },
  },
  {
    url: "/api/project/info",
    method: "get",
    response: () => {
      return {
        code: 200,
        data: {
          id: 1,
          name: "电商平台监控",
          description: "电商网站的前端监控项目，包含错误收集、性能监控等功能",
          createdTime: "2023-01-15 10:30:00",
          isPublic: true,
          invitedCode: "PROJ1A2B3C4D5E6F",
          groupCode: "GROUP7H8I9J0K1L2M",
          webhook: "https://work.weixin.qq.com/webhook/1234567890",
        },
        message: "获取项目详情成功",
      };
    },
  },
  {
    url: "/api/project/GroupNumber",
    method: "get",
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: 1,
            userName: "林润鑫",
            userRole: 1,
            avatar: "",
          },
          {
            id: 2,
            userName: "吴树杰",
            userRole: 1,
            avatar: "",
          },
          {
            id: 3,
            userName: "吴纯瑶",
            userRole: 1,
            avatar: "",
          },
          {
            id: 4,
            userName: "黄耿标",
            userRole: 2,
            avatar: "",
          },
        ],
        message: "获取项目成员列表成功",
      };
    },
  },
  {
    url: "/api/project/updateProjectData",
    method: "put",
    response: () => {
      return {
        code: 200,
        message: "修改成功",
      };
    },
  },
  {
    url: "/api/project/deleteProject",
    method: "delete",
    response: () => {
      return {
        code: 200,
        message: "删除成功",
      };
    },
  },
  {
    url: "/api/project/exitProject",
    method: "post",
    response: () => {
      return {
        code: 200,
        message: "退出项目成功",
      };
    },
  },
  {
    url: "/api/project/kickUser",
    method: "delete",
    response: () => {
      return {
        code: 200,
        message: "踢出用户成功",
      };
    },
  },
  {
    url: "/api/project/changeUserLevel",
    method: "put",
    response: () => {
      return {
        code: 200,
        message: "修改用户层级成功",
      };
    },
  },
] as MockMethod[];
