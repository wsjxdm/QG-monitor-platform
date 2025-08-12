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
} from "antd";
import { Column, Line, DualAxes } from "@ant-design/plots";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import TableWithSelector from "../../../../../component/Table/TableWithSelector";
import {
  getErrorDataAPI,
  assignErrorAPI,
  getProjectMembersAPI,
  getPlatformDataAPI,
  getPlatformTenAPI,
} from "../../../../../api/service/issue";

const { Title } = Typography;

//todo 用户的权限判断
const currentUser = {
  role: 1,
  id: 14,
};

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
}

// 项目成员接口
interface ProjectMember {
  userId: string | number;
  username: string;
  email?: string;
  avatar?: string;
  userRole: number;
  power?: number | string;
}

// 平台访问量
const PlatformData: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeType, setTimeType] = useState("day"); // 时间筛选移到组件内部

  // 时间筛选选项
  const timeOptions = [
    { value: "day", label: "近1天" },
    { value: "week", label: "近7天" },
    { value: "month", label: "近30天" },
  ];

  useEffect(() => {
    fetchPlatformData();
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
        return date.toISOString().replace("T", " ").substring(0, 19);
      };

      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);
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
          justifyContent: "flex-end",
        }}
      >
        <Select
          value={timeType}
          style={{ width: 120 }}
          onChange={setTimeType}
          options={timeOptions}
        />
      </div>
      <div style={{ height: 300 }}>
        {loading ? <Spin /> : <Line autoFit {...config} />}
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
      const response = await getPlatformTenAPI(projectId);
      console.log(response);

      // 模拟错误数量数据 (柱状图)
      const mockErrorCountData: ErrorCountDataItem[] = [
        { errorType: "TypeError", count: 120 },
        { errorType: "ReferenceError", count: 95 },
        { errorType: "NetworkError", count: 87 },
        { errorType: "SyntaxError", count: 76 },
        { errorType: "RangeError", count: 65 },
        { errorType: "PromiseRejection", count: 54 },
        { errorType: "SecurityError", count: 43 },
        { errorType: "URIError", count: 32 },
        { errorType: "EvalError", count: 21 },
        { errorType: "InternalError", count: 15 },
      ];

      // 模拟错误占比数据 (折线图)
      const mockErrorRatioData: ErrorRatioDataItem[] = [
        { errorType: "TypeError", ratio: 0.25 },
        { errorType: "ReferenceError", ratio: 0.19 },
        { errorType: "NetworkError", ratio: 0.17 },
        { errorType: "SyntaxError", ratio: 0.15 },
        { errorType: "RangeError", ratio: 0.13 },
        { errorType: "PromiseRejection", ratio: 0.11 },
        { errorType: "SecurityError", ratio: 0.08 },
        { errorType: "URIError", ratio: 0.06 },
        { errorType: "EvalError", ratio: 0.04 },
        { errorType: "InternalError", ratio: 0.03 },
      ];

      setErrorCountData(response[0]);
      setErrorRatioData(response[1]);
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

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Select
          value={platform}
          style={{ width: 120 }}
          onChange={setPlatform}
          options={platformOptions}
        />
      </div>

      <div style={{ height: 300 }}>
        {loading ? <Spin /> : <DualAxes autoFit {...config} />}
      </div>
    </div>
  );
};

const ProjectDetailIssues: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 跳转到错误详情页
  const goToErrorDetail = (errorId: number, platform: string) => {
    navigate(`/main/project/${projectId}/detail/error/${errorId}`, {
      state: { platform },
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
    {
      key: "moduleId",
      label: "模块名称",
      type: "select" as const,
      options: [
        //todo 这里的模块名称需要从后端获取
        { label: "模块1", value: 1 },
        { label: "模块2", value: 2 },
        { label: "模块3", value: 3 },
        { label: "模块4", value: 4 },
        { label: "模块5", value: 5 },
      ],
    },
  ];

  useEffect(() => {
    console.log("更新后的项目成员:", members);
  }, [members]);

  // 获取项目成员
  const fetchProjectMembers = async () => {
    try {
      const response = await getProjectMembersAPI(projectId);
      setMembers(response);
      console.log("项目成员:", response);
    } catch (error) {
      console.error("获取项目成员失败:", error);
    }
  };

  // 处理指派错误
  const handleAssignError = async (
    errorId: string | number,
    responsibleId: string | number,
    delegatorId: string | number,
    platform: string
  ) => {
    try {
      // 只有非普通成员才能进行指派操作
      if (currentUser && currentUser.role == 2) {
        message.warning("普通成员不能指派问题");
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
          item.id == errorId
            ? {
                ...item,
                delegatorId: delegatorId,
                username:
                  members.find((m) => m.userId == responsibleId)?.username ||
                  null,
              }
            : item
        )
      );
      console.log(data);
    } catch (error) {
      message.error("指派失败");
      console.error("指派错误失败:", error);
    }
  };

  // 渲染指派列
  const renderAssignColumn = (record: ErrorItem) => {
    // 只显示普通成员(userRole == 2)作为可指派选项
    console.log(
      "%c [ ]-273",
      "color: #f00; font-weight: bold;background: #fff;width: 100%;",
      members
    );
    const menuItems = members
      .filter((member) => member.userRole == 2)
      .map((member) => ({
        key: member.userId,
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size="small" src={member.avatar} icon={<UserOutlined />} />
            <span>{member.username}</span>
          </div>
        ),
      }));
    const menuProps = {
      items: menuItems,
      onClick: ({ key }: { key: string }) => {
        handleAssignError(record.id, key, currentUser.id, record.platform);
      },
    };

    return (
      <div
        style={{ textAlign: "center", minWidth: 120 }}
        onClick={(e) => e.stopPropagation()}
      >
        {record?.delegatorId ? (
          <Tooltip title={`已指派给: ${record.username || "未知用户"}`}>
            <Avatar size="small" src={record?.avatar} icon={<UserOutlined />} />
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
      const arry1 = response[0];
      const arry2 = response[1];
      const arry3 = response[2];
      const updataArry1 = arry1.map((item: any) => {
        return {
          ...item,
          platform: "backend",
          username: item.name,
        };
      });
      const updataArry2 = arry2.map((item: any) => {
        return {
          ...item,
          username: item.name,
          platform: "frontend",
        };
      });
      const updataArry3 = arry3.map((item: any) => {
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
      console.log("获取错误数据", [
        ...updataArry1,
        ...updataArry2,
        ...updataArry3,
      ]);
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
  const renderCustomTable = () => {
    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => {
              goToErrorDetail(record.id as number, record.platform);
            },
          })}
          rowKey="id"
        />
      </div>
    );
  };

  return (
    <div>
      <div>
        <Title level={4}>错误分析</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card title="错误趋势" bordered={false}>
              <PlatformData projectId={projectId} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card title="平台错误分析" bordered={false}>
              <TopErrorsChart projectId={projectId} />
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
              goToErrorDetail(record.id as number, record.platform);
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
