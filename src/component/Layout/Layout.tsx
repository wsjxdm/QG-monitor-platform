import {
  Layout,
  Menu,
  theme,
  Dropdown,
  Button,
  message,
  FloatButton,
} from "antd";
import { useState, useEffect, useRef } from "react";
import styles from "./Layout.module.css";
import {
  DownOutlined,
  ProjectOutlined,
  MessageOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  BugOutlined,
  BarChartOutlined,
  GlobalOutlined,
  UserOutlined,
  BellOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, Outlet, useMatches } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUserInfo } from "../../store/slice/userSlice";
import { decryptWithAESAndRSA } from "../../utils/encrypt";
import {
  getPrivateProjects,
  getPublicProjects,
} from "../../api/service/projectoverview";
import ChatDrawer from "../chat/ChatDrawer";

const { Header, Sider, Content } = Layout;
//从local storage获取用户信息
const user = JSON.parse(localStorage.getItem("user"));
const AppLayout = () => {
  const location = useLocation();
  //用来将outlet外层的div滚动回顶部
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [firstLevelKey, setFirstLevelKey] = useState("project");
  const [secondLevelKey, setSecondLevelKey] = useState("all-projects");
  const [thirdLevelKey, setThirdLevelKey] = useState("overview");
  const [openKeys, setOpenKeys] = useState(["all-projects", "public-projects"]);
  const dispatch = useDispatch();
  const [privateProjects, setPrivateProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [showChatButton, setShowChatButton] = useState(false);
  const matches = useMatches();

  // ==== 页面刷新时重新获取用户信息存入redux===
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(user.id);

        dispatch(fetchUserInfo(user.id));
        const privateProject = await getPrivateProjects(user.id);
        const publicProject = await getPublicProjects();
        setPrivateProjects(privateProject.reverse());
        setPublicProjects(publicProject.reverse());
      } catch (error) {
        message.error("获取项目列表失败");
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    // 检查路由层级，如果路径包含项目详情相关路径则显示聊天按钮
    const isProjectDetailPage = matches.some((match) =>
      match.pathname.includes("/detail/")
    );
    setShowChatButton(isProjectDetailPage);
  }, [matches]);

  //todo 获取项目信息并绑定路由

  useEffect(() => {
    // 每次路由变化时重置内容区域的滚动位置
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // 根据当前路径更新导航状态
  useEffect(() => {
    const path = location.pathname;

    // 更新第一层导航状态
    if (path.includes("/main/project")) {
      setFirstLevelKey("project");
    } else if (path.includes("/main/message")) {
      setFirstLevelKey("message");
    } else if (path.includes("/main/setting")) {
      setFirstLevelKey("setting");
    }

    // 更新第二层导航状态
    if (path === "/main/project/all") {
      setSecondLevelKey("all-projects");
    } else if (path === "/main/project/public") {
      setSecondLevelKey("public-projects");
    } else if (path === "/main/message/system") {
      setSecondLevelKey("system-message");
    } else if (path === "/main/message/task") {
      setSecondLevelKey("task-message");
    } else if (path === "/main/setting/profile") {
      setSecondLevelKey("profile");
    } else if (path.includes("/main/project/") && path.includes("/detail/")) {
      // 处理直接访问项目详情页的情况
      const pathParts = path.split("/");
      const projectIndex = pathParts.indexOf("project");
      if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
        const projectId = pathParts[projectIndex + 1];

        // 查找项目属于私有还是公共，设置正确的key
        const isPrivateProject = privateProjects.some(
          (project) => project.uuid == projectId
        );
        const isPublicProject = publicProjects.some(
          (project) => project.uuid == projectId
        );

        // 如果在两个列表中都存在，优先使用sessionStorage中记录的来源
        if (isPrivateProject && isPublicProject) {
          const projectSource = sessionStorage.getItem(
            `project-source-${projectId}`
          );
          if (projectSource === "public") {
            setSecondLevelKey(`public-${projectId}`);
          } else {
            // 默认或来源为private时选择私有项目
            setSecondLevelKey(`private-${projectId}`);
          }
        } else if (isPrivateProject) {
          setSecondLevelKey(`private-${projectId}`);
        } else if (isPublicProject) {
          setSecondLevelKey(`public-${projectId}`);
        }

        // 同时设置第三层导航
        const detailIndex = pathParts.indexOf("detail");
        if (detailIndex !== -1 && pathParts[detailIndex + 1]) {
          setThirdLevelKey(pathParts[detailIndex + 1]);
        }
      }
    } else if (path.includes("/main/project/") && !path.includes("/detail/")) {
      // 处理访问项目列表页的情况
      const pathParts = path.split("/");
      const projectIndex = pathParts.indexOf("project");
      if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
        setSecondLevelKey(pathParts[projectIndex + 1]);
      }
    }
  }, [location, privateProjects, publicProjects]);

  // 第一层导航
  const firstLevelItems = [
    { key: "project", icon: <ProjectOutlined />, label: "项目" },
    { key: "message", icon: <MessageOutlined />, label: "消息" },
    { key: "setting", icon: <SettingOutlined />, label: "设置" },
  ];

  // 第二层导航 - 项目相关
  const projectSecondLevelItems = [
    {
      key: "all-projects",
      label: "所有项目",
      icon: <UnorderedListOutlined />,
      children: privateProjects.map((project) => ({
        key: `private-${project.uuid}`,
        label: project.name,
        icon: <ProjectOutlined />,
      })),
      // 使用 onTitleClick 处理分组标题点击
      onTitleClick: () => {
        navigate("/main/project/all");
      },
    },
    {
      key: "public-projects",
      label: "公开项目",
      icon: <GlobalOutlined />,
      //模拟数据
      children: publicProjects.map((project) => ({
        key: `public-${project.uuid}`,
        label: project.name,
        icon: <ProjectOutlined />,
      })),
      // 使用 onTitleClick 处理分组标题点击
      onTitleClick: () => {
        navigate("/main/project/public");
      },
    },
  ];

  // 第二层导航 - 消息相关
  const messageSecondLevelItems = [
    { key: "system-message", icon: <BellOutlined />, label: "系统通知" },
    { key: "task-message", icon: <CheckCircleOutlined />, label: "任务通知" },
  ];

  // 第二层导航 - 设置相关
  const settingSecondLevelItems = [
    { key: "profile", icon: <UserOutlined />, label: "个人信息" },
    { key: "work", icon: <AlertOutlined />, label: "工作" },
  ];

  // 第三层导航 - 项目详情相关
  const projectThirdLevelItems = [
    //模拟数据或者说待定
    { key: "overview", icon: <EyeOutlined />, label: "总览" },
    { key: "issues", icon: <BugOutlined />, label: "问题" },
    { key: "performance", icon: <BarChartOutlined />, label: "性能" },
    { key: "log", icon: <FileTextOutlined />, label: "日志" },
    { key: "behavior", icon: <UserOutlined />, label: "行为" },
  ];

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 处理第一层导航切换
  const handleFirstLevelChange = (key: string) => {
    setFirstLevelKey(key);

    // 根据第一层导航切换第二层内容和路由
    switch (key) {
      case "project":
        setSecondLevelKey("all-projects");
        navigate("/main/project/all"); // 显示所有项目列表
        break;
      case "message":
        setSecondLevelKey("system-message");
        navigate("/main/message/system"); // 显示消息系统
        break;
      case "setting":
        setSecondLevelKey("profile");
        navigate("/main/setting/profile"); // 显示设置页面
        break;
      default:
        break;
    }
  };

  // 处理第二层导航切换
  const handleSecondLevelChange = (key: string) => {
    setSecondLevelKey(key);

    // 根据选择的项目导航到具体项目页面
    if (key === "all-projects") {
      // 点击"所有项目"分组标签时，导航到所有项目列表
      navigate("/main/project/all");
    } else if (key === "public-projects") {
      // 点击"公开项目"分组标签时，导航到公开项目列表
      navigate("/main/project/public");
    } else if (key === "system-message") {
      navigate("/main/message/system"); // 显示系统消息
    } else if (key === "task-message") {
      navigate("/main/message/task"); // 显示任务消息
    } else if (key === "profile") {
      navigate("/main/setting/profile"); // 显示个人信息
    } else if (key === "work") {
      navigate("/main/setting/work"); // 显示工作设置
    } else {
      // 处理项目点击，需要去除前缀并记录来源
      let projectId = key;
      if (key.startsWith("private-")) {
        projectId = key.substring(8); // 去除 "private-" 前缀
        // 记录项目来源
        sessionStorage.setItem(`project-source-${projectId}`, "private");
        navigate(`/main/project/${projectId}/detail/overview`);
      } else if (key.startsWith("public-")) {
        projectId = key.substring(7); // 去除 "public-" 前缀
        // 记录项目来源
        sessionStorage.setItem(`project-source-${projectId}`, "public");
        navigate(`/main/project/${projectId}/detail/overview`);
      }
    }
  };

  // 处理第三层导航切换
  const handleThirdLevelChange = (key: string) => {
    setThirdLevelKey(key);
    // 获取当前项目ID（从第二层选中的项目）
    let projectId = secondLevelKey;
    if (
      !["all-projects", "public-projects"].includes(projectId) &&
      firstLevelKey === "project"
    ) {
      // 移除前缀获取真实的项目ID
      if (projectId.startsWith("private-")) {
        projectId = projectId.substring(8); // 去除 "private-" 前缀
      } else if (projectId.startsWith("public-")) {
        projectId = projectId.substring(7); // 去除 "public-" 前缀
      }

      navigate(`/main/project/${projectId}/detail/${key}`);
    }
  };

  // 处理折叠面板展开/收起
  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 获取当前应该显示的第二层菜单项
  const getCurrentSecondLevelItems = () => {
    switch (firstLevelKey) {
      case "project":
        return projectSecondLevelItems;
      case "message":
        return messageSecondLevelItems;
      case "setting":
        return settingSecondLevelItems;
      default:
        return [];
    }
  };

  // 判断是否显示第三层导航栏 - 只有在选择了具体项目时才显示
  const showThirdLevel =
    !["all-projects", "public-projects"].includes(secondLevelKey) &&
    firstLevelKey === "project" &&
    (secondLevelKey.startsWith("private-") ||
      secondLevelKey.startsWith("public-") ||
      secondLevelKey.startsWith("project-") ||
      secondLevelKey.startsWith("pro-"));

  //=========组件初始化时配置全局socket==========
  useEffect(() => {
    // 应用加载时全局连接WebSocket
    dispatch({ type: "ws/connect" });
    console.log("你好");

    // 应用卸载时断开连接
    return () => {
      dispatch({ type: "ws/disconnect" });
    };
  }, [dispatch]);

  return (
    <Layout className={styles.layout}>
      {/* 第一层导航栏 */}
      <Header className={styles.firstLevelHeader}>
        <div className={styles.logo}>Mini-Sentry</div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[firstLevelKey]}
          items={firstLevelItems}
          onClick={({ key }) => handleFirstLevelChange(key)}
          className={styles.firstLevelMenu}
        />
      </Header>

      <Layout>
        {/* 第二层导航栏 */}
        <Sider className={styles.secondLevelSider}>
          <Menu
            mode="inline"
            selectedKeys={[secondLevelKey]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={getCurrentSecondLevelItems()}
            onClick={({ key }) => handleSecondLevelChange(key)}
            className={styles.secondLevelMenu}
          />
        </Sider>

        {/* 第三层导航栏（仅在选择了具体项目时显示） */}
        {showThirdLevel && (
          <Sider width={150} className={styles.thirdLevelSider}>
            <Menu
              mode="inline"
              selectedKeys={[thirdLevelKey]}
              items={projectThirdLevelItems}
              onClick={({ key }) => handleThirdLevelChange(key)}
              className={styles.thirdLevelMenu}
            />
          </Sider>
        )}

        {/* 内容区域 */}
        <Content className={styles.content} ref={contentRef}>
          <div
            style={{
              padding: 20,
              background: colorBgContainer,
              width: "100%",
              height: "100%",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
      {/* 聊天抽屉 */}
      <ChatDrawer visible={chatVisible} onClose={() => setChatVisible(false)} />

      {/* 悬浮聊天按钮 */}
      {showChatButton && (
        <FloatButton
          icon={<RobotOutlined />}
          type="primary"
          style={{ right: 24 }}
          onClick={() => setChatVisible(true)}
          tooltip="AI 助手"
        />
      )}
    </Layout>
  );
};

export default AppLayout;
