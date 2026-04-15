import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react"; // 1. 引入 Suspense 和 lazy
import Layout from "../component/Layout/Layout";
import ManagerRouter from "../component/protect/Protectrouter.tsx";
import App from "../App";
import AppLayout from "../component/Layout/Layout";

// 2. 为所有页面组件创建懒加载版本
function lazyWithPreLoad(load: () => Promise<any>) {
  const Component = lazy(load);
  (Component as any).preload = load;
  return Component;
}



const Home = lazyWithPreLoad(() => import("../pages/home/home"));
const ProjectAll = lazyWithPreLoad(() => import("../pages/main/project/ProjectAll/ProjectAll"));
const ProjectPublic = lazyWithPreLoad(() => import("../pages/main/project/ProjectAll/ProjectPublic"));
const ProjectDetailOverview = lazyWithPreLoad(() => import("../pages/main/project/projectdetail/ProjectDetailOverview/ProjectDetailOverview"));
const ProjectItemDetail = lazyWithPreLoad(() => import("../pages/main/project/projectdetail/ProjectItemDetail/ProjectItemDetail"));
const ProjectDetailIssues = lazyWithPreLoad(() => import("../pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues"));
const ProjectDetailPerformance = lazyWithPreLoad(() => import("../pages/main/project/projectdetail/ProjectDetailPerformance/ProjectDetailPerformance"));
const ProjectDetailLog = lazyWithPreLoad(() => import("../pages/main/project/projectdetail/ProjectDetailLog/ProjectDetailLog"));
const ProjectDetailBehavior = lazyWithPreLoad(() => import("../pages/main/project/projectdetail/ProjectDetailBehavior/ProjectDetailBehavior"));
const MessageSystem = lazyWithPreLoad(() => import("../pages/main/message/MessageSystem"));
const MessageTask = lazyWithPreLoad(() => import("../pages/main/message/MessageTask"));
const SettingProfile = lazyWithPreLoad(() => import("../pages/main/setting/SettingProfile"));
const Work = lazyWithPreLoad(() => import("../pages/main/setting/Work"));
const Mobile = lazyWithPreLoad(() => import("../pages/mobile/mobile.tsx"));
// const AppLayout = lazy(() => import("../component/Layout/Layout"));

export const routerMap = {
  "/pages/home/home": Home,
  "/pages/main/project/ProjectAll/ProjectAll": ProjectAll,
  "/pages/main/project/ProjectPublic/ProjectPublic": ProjectPublic,
  "/pages/main/project/projectdetail/ProjectDetailOverview/ProjectDetailOverview": ProjectDetailOverview,
  "/pages/main/project/projectdetail/ProjectItemDetail/ProjectItemDetail": ProjectItemDetail,
  "/pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues": ProjectDetailIssues,
  "/pages/main/project/projectdetail/ProjectDetailPerformance/ProjectDetailPerformance": ProjectDetailPerformance,
  "/pages/main/project/projectdetail/ProjectDetailLog/ProjectDetailLog": ProjectDetailLog,
  "/pages/main/project/projectdetail/ProjectDetailBehavior/ProjectDetailBehavior": ProjectDetailBehavior,
  "/pages/main/message/MessageSystem/MessageSystem": MessageSystem,
  "/pages/main/message/MessageTask/MessageTask": MessageTask,
  "/pages/main/setting/SettingProfile/SettingProfile": SettingProfile,
  "/pages/main/setting/Work/Work": Work,
  "/pages/mobile/mobile": Mobile,
}
// 3. 创建一个通用的加载中组件
const LoadingFallback = () => <div></div>; // 可以替换成更精美的骨架屏



export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/main",
        element: <AppLayout />,
        children: [
          // 项目路由
          {
            path: "project",
            children: [
              {
                path: "all",
                element: <ProjectAll />,
              },
              {
                path: "public",
                element: <ProjectPublic />,
              },
              {
                path: ":projectId/detail",
                children: [
                  {
                    path: "overview",
                    element: <ProjectDetailOverview />,
                  },
                  {
                    path: ":type/:detailId",
                    element: <ProjectItemDetail />,
                  },
                  {
                    path: "issues",
                    element: <ProjectDetailIssues />,
                  },
                  {
                    path: "performance",
                    element: <ProjectDetailPerformance />,
                  },
                  {
                    path: "log",
                    element: <ProjectDetailLog />,
                  },
                  {
                    path: "behavior",
                    element: <ProjectDetailBehavior />,
                  },
                ],
              },
            ],
          },
          // 消息路由
          {
            path: "message",
            children: [
              {
                path: "system",
                element: <MessageSystem />,
              },
              {
                path: "task",
                element: <MessageTask />,
              },
            ],
          },
          // 设置路由
          {
            path: "setting",
            children: [
              {
                path: "profile",
                element: <SettingProfile />,
              },
              {
                path: "work",
                element: <Work />,
              },
            ],
          },
        ],
      },
      {
        path: "/mobile",
        element: <Mobile />,
      },
    ],
  },
]);