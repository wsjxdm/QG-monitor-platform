import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Dropdown,
  Avatar,
  Tooltip,
  Tag,
  Spin,
  message,
  Table,
  Select,
  Row,
  Col,
  Card,
  Empty,
} from "antd";
import { Column, Line, DualAxes } from "@ant-design/plots";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import TableWithSelector from "../../../../../component/Table/TableWithSelector";
import {
  getErrorDataAPI,
  assignErrorAPI,
  getProjectMembersAPI,
  getPlatformDataAPI,
  getPlatformFrontTenAPI,
  getPlatformBackenTenAPI,
  getPlatformMobileTenAPI,
  getIllegalAccessAPI,
  getMapDataAPI,
} from "../../../../../api/service/issue";
import { getUserResponsibility } from "../../../../../api/service/projectoverview";
import GlobeArcs from "../../../../../component/GlobeArcs";
import type { Route } from "../../../../../component/GlobeArcs";

const { Title } = Typography;

//todo 用户的权限判断
// const currentUser = JSON.parse(localStorage.getItem("user"));
// const currentUser = {
//   role: 1,
//   id: 14,
// };

// 错误展示
interface ErrorItem {
  id: number | string;
  platform?: string;
  projectId?: string | number;
  moduleId?: string | number;
  type?: string;
  timestamp?: string | number | Date;
  message?: string;
  isHandled?: boolean;
  moduleName?: string;
  delegatorId?: string | number | null;
  username?: string | null;
  avatarUrl?: string | null;
  errorType?: string;
  responsibleId?: string | number | null;
}

// 项目成员接口
interface ProjectMember {
  userId: string | number;
  username: string;
  email?: string;
  avatarUrl?: string;
  userRole: number;
  power?: number | string;
}

// 非法访问项接口
interface IllegalAccessItem {
  ip: string;
  event: number;
}

// 错误趋势
const PlatformData: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeType, setTimeType] = useState("day"); // 时间筛选移到组件内部
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  // 时间筛选选项
  const timeOptions = [
    { value: "day", label: "近1天" },
    { value: "week", label: "近7天" },
    { value: "month", label: "近30天" },
  ];

  useEffect(() => {
    fetchPlatformData();
    const fetchRole = async () => {
      const role = await getUserResponsibility(projectId, currentUser.id);
      return role.userRole;
    };
    fetchRole().then((role) => {
      currentUser.role = role;
    });
  }, [timeType, projectId]);

  const fetchPlatformData = async () => {
    setLoading(true);
    try {
      // 计算时间范围
      const endTime = new Date();
      const startTime = new Date();

      switch (timeType) {
        case "day":
          startTime.setDate(startTime.getDate() - 1);
          break;
        case "week":
          startTime.setDate(startTime.getDate() - 7);
          break;
        case "month":
          startTime.setDate(startTime.getDate() - 30);
          break;
        default:
          startTime.setDate(startTime.getDate() - 7);
      }

      // 格式化时间为 "yyyy-MM-dd HH:mm:ss"
      const formatTime = (date: Date) => {
        const pad = (num: number) => num.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      console.log(
        "%c [  ]-135",
        "font-size:13px; background:pink; color:#bf2c9f;",
        startTimeStr,
        endTimeStr
      );
      // 调用实际API获取平台数据，传递startTime和endTime参数
      const response = await getPlatformDataAPI(
        projectId,
        startTimeStr,
        endTimeStr
      );

      setData(response || []);
    } catch (error) {
      console.error("获取平台数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data,
    xField: (d) => new Date(d.time),
    yField: "value",
    sizeField: "value",
    shapeField: "trail",
    legend: { size: false },
    colorField: "category",
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={5}>错误趋势</Title>
        <Select
          value={timeType}
          style={{ width: 120 }}
          onChange={setTimeType}
          options={timeOptions}
        />
      </div>
      <div style={{ height: 300 }}>
        {loading ? (
          <Spin />
        ) : data.length > 0 ? (
          <Line autoFit {...config} />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

interface ErrorCountDataItem {
  errorType: string;
  count: number;
}

interface ErrorRatioDataItem {
  errorType: string;
  ratio: number;
}

interface TopErrorsChartProps {
  projectId: string;
}

const TopErrorsChart: React.FC<TopErrorsChartProps> = ({ projectId }) => {
  const [errorCountData, setErrorCountData] = useState<ErrorCountDataItem[]>(
    []
  );
  const [errorRatioData, setErrorRatioData] = useState<ErrorRatioDataItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<"frontend" | "backend" | "mobile">(
    "frontend"
  );

  // 平台选项
  const platformOptions = [
    { value: "frontend", label: "前端" },
    { value: "backend", label: "后端" },
    { value: "mobile", label: "移动" },
  ];

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (platform === "frontend") {
        response = await getPlatformFrontTenAPI(projectId);
      } else if (platform === "backend") {
        response = await getPlatformBackenTenAPI(projectId);
      } else {
        response = await getPlatformMobileTenAPI(projectId);
      }

      if (response) {
        setErrorCountData(response[0]);
        setErrorRatioData(response[1]);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [platform, projectId]);

  // 图表配置
  const config = {
    xField: "errorType",
    legend: true,
    children: [
      {
        data: errorCountData,
        type: "interval",
        yField: "count",
        style: { maxWidth: 50 },
        axis: { y: { position: "left" } },
      },
      {
        data: errorRatioData,
        type: "line",
        yField: "ratio",
        style: { lineWidth: 2 },
        axis: {
          y: {
            position: "right",
            labelFormatter: (val: number) => `${(val * 100).toFixed(0)}%`,
          },
        },
        shapeField: "smooth",
        scale: { color: { relations: [["ratio", "#fdae6b"]] } },
      },
    ],
    loading: loading,
  };

  const hasData = errorCountData?.length > 0 || errorRatioData?.length > 0;

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={5}>平台错误分析</Title>
        <Select
          value={platform}
          style={{ width: 120 }}
          onChange={setPlatform}
          options={platformOptions}
        />
      </div>

      <div style={{ height: 300 }}>
        {loading ? (
          <Spin />
        ) : hasData ? (
          <DualAxes autoFit {...config} />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

//  IllegalAccessChart 组件
const IllegalAccessChart: React.FC<{ projectId: string; timeType: string }> = ({
  projectId,
  timeType,
}) => {
  const [data, setData] = useState<IllegalAccessItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIllegalAccessData();
  }, [projectId, timeType]); // 添加 timeType 作为依赖

  const fetchIllegalAccessData = async () => {
    setLoading(true);
    try {
      // 计算时间范围
      const endTime = new Date();
      const startTime = new Date();

      switch (
        timeType // 使用传入的 timeType
      ) {
        case "day":
          startTime.setDate(startTime.getDate() - 1);
          break;
        case "week":
          startTime.setDate(startTime.getDate() - 7);
          break;
        case "month":
          startTime.setDate(startTime.getDate() - 30);
          break;
        default:
          startTime.setDate(startTime.getDate() - 7);
      }

      // 格式化时间为 "yyyy-MM-dd HH:mm:ss"
      const formatTime = (date: Date) => {
        const pad = (num: number) => num.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      const response = await getIllegalAccessAPI(
        projectId,
        startTimeStr,
        endTimeStr
      );

      setData(response);
    } catch (error) {
      console.error("获取非法访问数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data,
    xField: "ip",
    yField: "event",
    loading: loading,
    axis: {
      x: {
        label: {
          autoHide: true,
          autoRotate: true,
        },
      },
      y: {
        title: {
          text: "访问次数",
        },
      },
    },
    style: {
      maxWidth: 50,
    },
  };

  return (
    <div>
      {/* 移除原来的时间筛选器 */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={5}>非法访问统计图表组件</Title>
        {/* 时间筛选器已移至父组件 */}
      </div>
      <div style={{ height: 300 }}>
        {loading ? (
          <Spin />
        ) : data && data.length > 0 ? (
          <Column autoFit {...config} />
        ) : (
          <Empty description="暂无非法访问数据" />
        )}
      </div>
    </div>
  );
};

const ProjectDetailIssues: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  // 添加地图数据状态
  const [mapRoutes, setMapRoutes] = useState<Route[]>([
    {
      start: { lat: 39.9042, lng: 116.4074, city: "北京", event: 10 },
      end: { lat: 37.7749, lng: -122.4194, city: "旧金山", event: 5 },
      color: ["#2dd4bf", "#60a5fa"],
      altitude: 0.22,
    },
  ]);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {
    getUserResponsibility(projectId, currentUser.id).then((res) => {
      if (res) {
        setCurrentUser((prevUser) => ({
          ...prevUser,
          role: res.userRole,
        }));
      }
    });
  }, [projectId]);

  // 添加统一的时间筛选状态
  const [illegalAccessTimeType, setIllegalAccessTimeType] = useState("day");

  // 获取地图数据的函数
  const fetchMapData = async (timeType: string) => {
    try {
      // 计算时间范围
      const endTime = new Date();
      const startTime = new Date();

      switch (timeType) {
        case "day":
          startTime.setDate(startTime.getDate() - 1);
          break;
        case "week":
          startTime.setDate(startTime.getDate() - 7);
          break;
        case "month":
          startTime.setDate(startTime.getDate() - 30);
          break;
        default:
          startTime.setDate(startTime.getDate() - 1);
      }

      // 格式化时间为 "yyyy-MM-dd HH:mm:ss"
      const formatTime = (date: Date) => {
        const pad = (num: number) => num.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      // 调用 getMapDataAPI 获取地图数据
      const response = await getMapDataAPI(projectId, startTimeStr, endTimeStr);

      // 处理响应数据并转换为 Route 格式
      const routesData = response.map((item: any) => ({
        start: {
          lat: item.latitude,
          lng: item.longitude,
          city: `${item.city}/${item.country}`,
          event: item.event,
        },
        end: {
          lat: "23.0333",
          lng: "113.4006",
          city: "中国广东",
        },
        color: ["#2dd4bf", "#60a5fa"],
        altitude: 0.22,
      }));
      console.log("212", routesData);

      setMapRoutes(routesData);
    } catch (error) {
      console.error("获取地图数据失败:", error);
      // 保持默认数据或设置为空数组
      setMapRoutes([]);
    }
  };

  // 当时间筛选器变化时，同时更新两个图表的数据
  useEffect(() => {
    // 更新非法访问统计数据
    // 这里会触发 IllegalAccessChart 组件重新获取数据

    // 更新地图数据
    fetchMapData(illegalAccessTimeType);
  }, [illegalAccessTimeType, projectId]);

  // 跳转到错误详情页
  const goToErrorDetail = (
    errorId: number,
    platform: string,
    errorType: string,
    responsibleId: number | string | null
  ) => {
    getUserResponsibility(projectId, currentUser?.id).then((res) => {
      if (res) {
        if (res.userRole === 2 && responsibleId !== currentUser?.id) {
          message.warning("您无权查看此错误详情，请联系项目管理员");
          return;
        } else {
          navigate(`/main/project/${projectId}/detail/error/${errorId}`, {
            state: { platform, errorType },
          });
        }
      }
    });
  };

  const [data, setData] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const filterConfig = [
    {
      key: "errorType",
      label: "错误类型",
      type: "input",
      placeholder: "请输入错误类型",
    },
    {
      key: "platform",
      label: "平台",
      type: "select" as const,
      options: [
        { label: "前端", value: "frontend" },
        { label: "后端", value: "backend" },
        { label: "移动", value: "mobile" },
      ],
    },
  ];

  useEffect(() => {
    // console.log("更新后的项目成员:", members);
  }, [members]);

  // 获取项目成员
  const fetchProjectMembers = async () => {
    try {
      const response = await getProjectMembersAPI(projectId);
      const res = response.map((item) => {
        return {
          ...item,
          avatarUrl: item.avatar,
        };
      });
      setMembers(res);
      // console.log("项目成员:", response);
    } catch (error) {
      console.error("获取项目成员失败:", error);
    }
  };

  // 处理指派错误
  const handleAssignError = async (
    errorId: string | number,
    responsibleId: string | number,
    delegatorId: string | number,
    platform: string,
    errorType: string
  ) => {
    try {
      // 只有非普通成员才能进行指派操作
      if (currentUser && currentUser.role == 2) {
        message.warning("普通成员不能指派问题");
        return;
      }

      if (currentUser?.role == null) {
        message.warning("非项目成员不可指派问题");

        console.log(
          "%c [  ]-597",
          "font-size:13px; background:pink; color:#bf2c9f;",
          currentUser.role
        );
        return;
      }

      await assignErrorAPI(
        errorId,
        delegatorId,
        platform,
        responsibleId,
        projectId
      );
      message.success("指派成功");

      // 更新本地数据而不重新获取
      setData((prevData) =>
        prevData.map((item) =>
          item.errorType == errorType
            ? {
                ...item,
                delegatorId: delegatorId,
                username:
                  members.find((m) => m.userId == responsibleId)?.username ||
                  null,
                avatarUrl:
                  members.find((m) => m.userId == responsibleId)?.avatarUrl ||
                  null,
              }
            : item
        )
      );
      // console.log(data);
    } catch (error) {
      message.error("指派失败");
      console.error("指派错误失败:", error);
    }
  };

  // 渲染指派列
  const renderAssignColumn = (record: ErrorItem) => {
    // 只显示普通成员(userRole == 2)作为可指派选项
    const menuItems = members
      .filter((member) => member.userRole == 2)
      .map((member) => ({
        key: member.userId,
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar
              size="small"
              src={member.avatarUrl}
              icon={<UserOutlined />}
            />
            <span>{member.username}</span>
          </div>
        ),
      }));
    const menuProps = {
      items: menuItems,
      onClick: ({ key }: { key: string }) => {
        handleAssignError(
          record.id,
          key,
          currentUser.id,
          record.platform,
          record.errorType
        );
      },
    };

    return (
      <div
        style={{ textAlign: "center", minWidth: 120 }}
        onClick={(e) => e.stopPropagation()}
      >
        {record?.delegatorId ? (
          <Tooltip title={`已指派给: ${record.username || "未知用户"}`}>
            <Avatar
              size="small"
              src={record?.avatarUrl}
              icon={<UserOutlined />}
            />
            <span style={{ marginLeft: 8 }}>
              {record.username || "未知用户"}
            </span>
          </Tooltip>
        ) : (
          <span style={{ color: "#ff4d4f" }}>未指派</span>
        )}
        <Dropdown menu={menuProps} trigger={["hover"]}>
          <a
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{ marginLeft: 8 }}
          >
            <DownOutlined />
          </a>
        </Dropdown>
      </div>
    );
  };

  const columns = [
    {
      title: "平台",
      dataIndex: "platform",
      key: "platform",
      width: 100,
      minWidth: 100,
    },
    {
      title: "错误类型",
      dataIndex: "errorType",
      key: "errorType",
      width: 150,
      minWidth: 150,
      render: (type: string) => <span>{type}</span>,
    },
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 150,
      minWidth: 150,
    },
    {
      title: "环境",
      dataIndex: "environment",
      key: "environment",
      width: 120,
      minWidth: 120,
    },
    {
      title: "指派人",
      dataIndex: "username",
      key: "username",
      width: 100,
      minWidth: 100,
      render: (name: string) => <span>{name}</span>,
    },
    {
      title: "错误信息",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      width: 200,
      minWidth: 200,
    },

    {
      title: "指派",
      key: "username",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: ErrorItem) => renderAssignColumn(record),
    },
  ];

  // 获取错误数据的函数
  const fetchErrorData = async (filterParams: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const response = await getErrorDataAPI({
        ...filterParams,
        projectId,
      });
      let arry1 = [];
      let arry2 = [];
      let arry3 = [];
      if (response) {
        arry1 = response[0] || [];
        arry2 = response[1] || [];
        arry3 = response[2] || [];
      }
      let updataArry1 = [];
      let updataArry2 = [];
      let updataArry3 = [];
      if (arry1) {
        updataArry1 = arry1.map((item: any) => {
          return {
            ...item,
            platform: "backend",
            username: item.name,
            timestamp: new Date(item.timestamp)
              .toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
              .replace(/\//g, "-"),
          };
        });
      }
      if (arry2) {
        updataArry2 = arry2.map((item: any) => {
          return {
            ...item,
            username: item.name,
            platform: "frontend",
            timestamp: new Date(item.timestamp)
              .toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
              .replace(/\//g, "-"),
          };
        });
      }
      if (arry3) {
        updataArry3 = arry3.map((item: any) => {
          return {
            ...item,
            platform: "mobile",
            username: item.name,
            timestamp: new Date(item.timestamp)
              .toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
              .replace(/\//g, "-"),
          };
        });
      }
      setData([...updataArry1, ...updataArry2, ...updataArry3]);
    } catch (error) {
      console.error("获取错误数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 当筛选条件变化时重新获取数据
  useEffect(() => {
    fetchErrorData(filters);
  }, [filters]);

  // 页面初始化时获取数据
  useEffect(() => {
    getUserResponsibility(projectId, currentUser?.id).then((res) => {
      if (res) {
        if (res.power === 0) {
          message.warning("您无权进入该项目，请联系项目管理员");
          navigate("/main/project/all");
        }
      }
    });
    fetchErrorData();
    fetchProjectMembers();
  }, []);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchErrorData(filters);
  };

  // 自定义渲染表格，添加横向滚动和固定列支持
  // const renderCustomTable = () => {
  //   return (
  //     <div style={{ width: "100%", overflowX: "auto" }}>
  //       <Table
  //         dataSource={data}
  //         columns={columns}
  //         loading={loading}
  //         pagination={{
  //           showSizeChanger: true,
  //           showQuickJumper: true,
  //           showTotal: (total) => `共 ${total} 条数据`,
  //         }}
  //         scroll={{ x: "max-content" }}
  //         onRow={(record) => ({
  //           onClick: () => {
  //             goToErrorDetail(
  //               record.id as number,
  //               record.platform,
  //               record.errorType || null
  //             );
  //           },
  //         })}
  //         rowKey="id"
  //       />
  //     </div>
  //   );
  // };

  return (
    <div>
      <div>
        <Title level={4}>错误分析</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card>
              <PlatformData projectId={projectId} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card>
              <TopErrorsChart projectId={projectId} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 12 }}
            lg={{ span: 12 }}
          >
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 20,
                }}
              >
                <Select
                  value={illegalAccessTimeType}
                  style={{ width: 120 }}
                  onChange={setIllegalAccessTimeType}
                  options={[
                    { value: "day", label: "近1天" },
                    { value: "week", label: "近7天" },
                    { value: "month", label: "近30天" },
                  ]}
                />
              </div>
              <IllegalAccessChart
                projectId={projectId}
                timeType={illegalAccessTimeType}
              />
            </Card>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 12 }}
            lg={{ span: 12 }}
          >
            <Card title="非法访问轨迹">
              <div style={{ width: "100%", height: "400px" }}>
                <GlobeArcs routes={mapRoutes} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <div>
        <Title level={4}>错误列表</Title>
        <TableWithSelector<ErrorItem>
          filterConfig={filterConfig}
          dataSource={data}
          columns={columns}
          loading={loading}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          onRow={(record) => ({
            onClick: () => {
              goToErrorDetail(
                record.id as number,
                record.platform,
                record.errorType,
                record.responsibleId
              );
            },
          })}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default ProjectDetailIssues;
