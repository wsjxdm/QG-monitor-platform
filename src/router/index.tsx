import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react"; // 1. 引入 Suspense 和 lazy
import Layout from "../component/Layout/Layout";
import ManagerRouter from "../component/protect/Protectrouter.tsx";
import App from "../App";
import AppLayout from "../component/Layout/Layout";

// 2. 为所有页面组件创建懒加载版本
const Home = lazy(() => import("../pages/home/home"));
const ProjectAll = lazy(() => import("../pages/main/project/ProjectAll/ProjectAll"));
const ProjectPublic = lazy(() => import("../pages/main/project/ProjectAll/ProjectPublic"));
const ProjectDetailOverview = lazy(() => import("../pages/main/project/projectdetail/ProjectDetailOverview/ProjectDetailOverview"));
const ProjectItemDetail = lazy(() => import("../pages/main/project/projectdetail/ProjectItemDetail/ProjectItemDetail"));
const ProjectDetailIssues = lazy(() => import("../pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues"));
const ProjectDetailPerformance = lazy(() => import("../pages/main/project/projectdetail/ProjectDetailPerformance/ProjectDetailPerformance"));
const ProjectDetailLog = lazy(() => import("../pages/main/project/projectdetail/ProjectDetailLog/ProjectDetailLog"));
const ProjectDetailBehavior = lazy(() => import("../pages/main/project/projectdetail/ProjectDetailBehavior/ProjectDetailBehavior"));
const MessageSystem = lazy(() => import("../pages/main/message/MessageSystem"));
const MessageTask = lazy(() => import("../pages/main/message/MessageTask"));
const SettingProfile = lazy(() => import("../pages/main/setting/SettingProfile"));
const Work = lazy(() => import("../pages/main/setting/Work"));
const Mobile = lazy(() => import("../pages/mobile/mobile.tsx"));
// const AppLayout = lazy(() => import("../component/Layout/Layout"));
// 3. 创建一个通用的加载中组件
const LoadingFallback = () => <div></div>; // 可以替换成更精美的骨架屏

// 高阶组件处理守卫路由和懒加载
const LazyRoute = ({ component: Component, requireAuth = true }) => {
  const content = (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  return content;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LazyRoute component={Home} requireAuth={false} />,
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
                element: <LazyRoute component={ProjectAll} />,
              },
              {
                path: "public",
                element: <LazyRoute component={ProjectPublic} />,
              },
              {
                path: ":projectId/detail",
                children: [
                  {
                    path: "overview",
                    element: <LazyRoute component={ProjectDetailOverview} />,
                  },
                  {
                    path: ":type/:detailId",
                    element: <LazyRoute component={ProjectItemDetail} />,
                  },
                  {
                    path: "issues",
                    element: <LazyRoute component={ProjectDetailIssues} />,
                  },
                  {
                    path: "performance",
                    element: <LazyRoute component={ProjectDetailPerformance} />,
                  },
                  {
                    path: "log",
                    element: <LazyRoute component={ProjectDetailLog} />,
                  },
                  {
                    path: "behavior",
                    element: <LazyRoute component={ProjectDetailBehavior} />,
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
                // element: <LazyRoute component={MessageSystem} />,
                element: <MessageSystem />,
              },
              {
                path: "task",
                element: <LazyRoute component={MessageTask} />,
              },
            ],
          },
          // 设置路由
          {
            path: "setting",
            children: [
              {
                path: "profile",
                element: <LazyRoute component={SettingProfile} />,
              },
              {
                path: "work",
                element: <LazyRoute component={Work} />,
              },
            ],
          },
        ],
      },
      {
        path: "/mobile",
        element: <LazyRoute component={Mobile} requireAuth={false} />,
      },
    ],
  },
]);