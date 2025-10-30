import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home";
import Loading from "../component/Loading/Loading";

const ProjectAll = React.lazy(
  () => import("../pages/main/project/ProjectAll/ProjectAll")
);
const ProjectPublic = React.lazy(
  () => import("../pages/main/project/ProjectAll/ProjectPublic")
);
const ProjectDetailOverview = React.lazy(
  () =>
    import(
      "../pages/main/project/projectdetail/ProjectDetailOverview/ProjectDetailOverview"
    )
);
const ProjectItemDetail = React.lazy(
  () =>
    import(
      "../pages/main/project/projectdetail/ProjectItemDetail/ProjectItemDetail"
    )
);
const ProjectDetailIssues = React.lazy(
  () =>
    import(
      "../pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues"
    )
);
const ProjectDetailPerformance = React.lazy(
  () =>
    import(
      "../pages/main/project/projectdetail/ProjectDetailPerformance/ProjectDetailPerformance"
    )
);
const ProjectDetailLog = React.lazy(
  () =>
    import(
      "../pages/main/project/projectdetail/ProjectDetailLog/ProjectDetailLog"
    )
);
const ProjectDetailBehavior = React.lazy(
  () =>
    import(
      "../pages/main/project/projectdetail/ProjectDetailBehavior/ProjectDetailBehavior"
    )
);
const MessageSystem = React.lazy(
  () => import("../pages/main/message/MessageSystem")
);
const MessageTask = React.lazy(
  () => import("../pages/main/message/MessageTask")
);
const SettingProfile = React.lazy(
  () => import("../pages/main/setting/SettingProfile")
);
const Work = React.lazy(() => import("../pages/main/setting/Work"));
const Mobile = React.lazy(() => import("../pages/mobile/mobile.tsx"));

const ManagerRouter = React.lazy(
  () => import("../component/protect/Protectrouter.tsx")
);

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
                  <React.Suspense fallback={<Loading />}>
                    <ManagerRouter>
                      <ProjectAll />
                    </ManagerRouter>
                  </React.Suspense>
                ),
              },
              {
                path: "public",
                element: (
                  <React.Suspense fallback={<Loading />}>
                    <ManagerRouter>
                      <ProjectPublic />
                    </ManagerRouter>
                  </React.Suspense>
                ),
              },
              {
                path: ":projectId/detail",
                children: [
                  {
                    path: "overview",
                    element: (
                      <React.Suspense fallback={<Loading />}>
                        <ManagerRouter>
                          <ProjectDetailOverview />
                        </ManagerRouter>
                      </React.Suspense>
                    ),
                  },
                  {
                    //这是问题详情
                    path: ":type/:detailId",
                    element: (
                      <React.Suspense fallback={<Loading />}>
                        <ManagerRouter>
                          <ProjectItemDetail />
                        </ManagerRouter>
                      </React.Suspense>
                    ),
                  },
                  {
                    path: "issues",
                    element: (
                      <React.Suspense fallback={<Loading />}>
                        <ManagerRouter>
                          <ProjectDetailIssues />
                        </ManagerRouter>
                      </React.Suspense>
                    ),
                  },
                  {
                    path: "performance",
                    element: (
                      <React.Suspense fallback={<Loading />}>
                        <ManagerRouter>
                          <ProjectDetailPerformance />
                        </ManagerRouter>
                      </React.Suspense>
                    ),
                  },
                  {
                    path: "log",
                    element: (
                      <React.Suspense fallback={<Loading />}>
                        <ManagerRouter>
                          <ProjectDetailLog />
                        </ManagerRouter>
                      </React.Suspense>
                    ),
                  },
                  {
                    path: "behavior",
                    element: (
                      <React.Suspense fallback={null}>
                        <ManagerRouter>
                          <ProjectDetailBehavior />
                        </ManagerRouter>
                      </React.Suspense>
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
                  <React.Suspense fallback={<Loading />}>
                    <ManagerRouter>
                      <MessageSystem />
                    </ManagerRouter>
                  </React.Suspense>
                ),
              },
              {
                path: "task",
                element: (
                  <React.Suspense fallback={<Loading />}>
                    <ManagerRouter>
                      <MessageTask />
                    </ManagerRouter>
                  </React.Suspense>
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
                  <React.Suspense fallback={<Loading />}>
                    <ManagerRouter>
                      <SettingProfile />
                    </ManagerRouter>
                  </React.Suspense>
                ),
              },
              {
                path: "work",
                element: (
                  <React.Suspense fallback={<Loading />}>
                    <ManagerRouter>
                      <Work />
                    </ManagerRouter>
                  </React.Suspense>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "/mobile",
        element: (
          <React.Suspense fallback={<Loading />}>
            <Mobile />
          </React.Suspense>
        ),
      },
    ],
  },
]);
