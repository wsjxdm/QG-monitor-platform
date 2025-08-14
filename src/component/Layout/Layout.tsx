import { Layout, Menu, theme, Dropdown, Button, message } from "antd";
import { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUserInfo } from "../../store/slice/userSlice";
import { decryptWithAESAndRSA } from "../../utils/encrypt";
import {
  getPrivateProjects,
  getPublicProjects,
} from "../../api/service/projectoverview";

const { Header, Sider, Content } = Layout;
//todo
const user = {
  id: 14,
};
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [firstLevelKey, setFirstLevelKey] = useState("project");
  const [secondLevelKey, setSecondLevelKey] = useState("all-projects");
  const [thirdLevelKey, setThirdLevelKey] = useState("overview");
  const [openKeys, setOpenKeys] = useState(["all-projects", "public-projects"]);
  const dispatch = useDispatch();
  const [privateProjects, setPrivateProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);

  // ==== 页面刷新时重新获取用户信息存入redux===
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchUserInfo(2));
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

  //todo 获取项目信息并绑定路由

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
        setSecondLevelKey(pathParts[projectIndex + 1]);
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
  }, [location]);

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
      //模拟数据
      children: privateProjects.map((project) => ({
        key: `${project.uuid}`,
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
        key: `${project.uuid}`,
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
    } else {
      // 处理项目点击，导航到项目详情总览页
      navigate(`/main/project/${key}/detail/overview`);
    }
  };

  // 处理第三层导航切换
  const handleThirdLevelChange = (key: string) => {
    setThirdLevelKey(key);

    // 获取当前项目ID（从第二层选中的项目）
    const projectId = secondLevelKey;
    if (
      !["all-projects", "public-projects"].includes(projectId) &&
      firstLevelKey === "project"
    ) {
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
    (secondLevelKey.startsWith("project-") ||
      secondLevelKey.startsWith("public-") ||
      secondLevelKey.startsWith("pro-")); // 添加这一行来支持你的项目ID格式

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
        <Content className={styles.content}>
          <div
            style={{
              padding: 20,
              background: colorBgContainer,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
