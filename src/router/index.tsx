import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home";
import Layout from "../component/Layout/Layout";
import ProjectAll from "../pages/main/project/ProjectAll/ProjectAll";
import ProjectPublic from "../pages/main/project/ProjectAll/ProjectPublic";
import ProjectDetailOverview from "../pages/main/project/projectdetail/ProjectDetailOverview/ProjectDetailOverview";
import ProjectDetailIssues from "../pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues";
import MessageSystem from "../pages/main/message/MessageSystem";
import SettingProfile from "../pages/main/setting/SettingProfile";

import App from "../App";

export const router = createBrowserRouter([
  {
    path: "/",

    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/main",
        element: <App />,
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
                    path: "issues",
                    element: <ProjectDetailIssues />,
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
                element: <MessageSystem />,
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
            ],
          },
        ],
      },
    ],
  },
]);
