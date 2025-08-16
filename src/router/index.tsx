import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home";
import Layout from "../component/Layout/Layout";
import ProjectAll from "../pages/main/project/ProjectAll/ProjectAll";
import ProjectPublic from "../pages/main/project/ProjectAll/ProjectPublic";
import ProjectDetailOverview from "../pages/main/project/projectdetail/ProjectDetailOverview/ProjectDetailOverview";
import ProjectItemDetail from "../pages/main/project/projectdetail/ProjectItemDetail/ProjectItemDetail";
import ProjectDetailIssues from "../pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues";
import ProjectDetailPerformance from "../pages/main/project/projectdetail/ProjectDetailPerformance/ProjectDetailPerformance";
import ProjectDetailLog from "../pages/main/project/projectdetail/ProjectDetailLog/ProjectDetailLog";
import ProjectDetailBehavior from "../pages/main/project/projectdetail/ProjectDetailBehavior/ProjectDetailBehavior";
import MessageSystem from "../pages/main/message/MessageSystem";
import MessageTask from "../pages/main/message/MessageTask";
import SettingProfile from "../pages/main/setting/SettingProfile";
import Work from "../pages/main/setting/Work";
import Mobile from "../pages/mobile/mobile.tsx";

import ManagerRouter from "../component/protect/Protectrouter.tsx";

import App from "../App";
import AppLayout from "../component/Layout/Layout";

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
                element: (
                  <ManagerRouter>
                    <ProjectAll />
                  </ManagerRouter>
                ),
              },
              {
                path: "public",
                element: (
                  <ManagerRouter>
                    <ProjectPublic />
                  </ManagerRouter>
                ),
              },
              {
                path: ":projectId/detail",
                children: [
                  {
                    path: "overview",
                    element: (
                      <ManagerRouter>
                        <ProjectDetailOverview />
                      </ManagerRouter>
                    ),
                  },
                  {
                    //这是问题详情
                    path: ":type/:detailId",
                    element: (
                      <ManagerRouter>
                        <ProjectItemDetail />
                      </ManagerRouter>
                    ),
                  },
                  {
                    path: "issues",
                    element: (
                      <ManagerRouter>
                        <ProjectDetailIssues />
                      </ManagerRouter>
                    ),
                  },
                  {
                    path: "performance",
                    element: (
                      <ManagerRouter>
                        <ProjectDetailPerformance />
                      </ManagerRouter>
                    ),
                  },
                  {
                    path: "log",
                    element: (
                      <ManagerRouter>
                        <ProjectDetailLog />
                      </ManagerRouter>
                    ),
                  },
                  {
                    path: "behavior",
                    element: (
                      <ManagerRouter>
                        <ProjectDetailBehavior />
                      </ManagerRouter>
                    ),
                  },
                  // 后面再加上监控的东西
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
                element: (
                  <ManagerRouter>
                    <MessageSystem />
                  </ManagerRouter>
                ),
              },
              {
                path: "task",
                element: (
                  <ManagerRouter>
                    <MessageTask />
                  </ManagerRouter>
                ),
              },
            ],
          },
          // 设置路由
          {
            path: "setting",
            children: [
              {
                path: "profile",
                element: (
                  <ManagerRouter>
                    <SettingProfile />
                  </ManagerRouter>
                ),
              },
              {
                path: "work",
                element: (
                  <ManagerRouter>
                    <Work />
                  </ManagerRouter>
                ),
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
