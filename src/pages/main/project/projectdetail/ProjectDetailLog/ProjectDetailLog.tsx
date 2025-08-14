import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Typography,
  Spin,
  Empty,
  Button,
  Space,
  Tag,
  Row,
  Col,
  message,
  Select,
} from "antd";
import { Column } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import { ReloadOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getLogDataAPI,
  getMethodCallDataAPI,
} from "../../../../../api/service/log";
import { getUserResponsibility } from "../../../../../api/service/projectoverview";

const { Text, Title } = Typography;

interface environmentSnapshot {
  ip?: string;
  protocol?: string;
  httpMethod?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  language?: string;
  isAjax?: boolean;
}

// 日志数据接口
interface LogItem {
  id: string | number;
  timestamp: string;
  api: string;
  module: string;
  projectId: string | number;
  environment: string;
  type: string;
  stack: string;
  environmentSnapshot: environmentSnapshot;
  event: string;
}

interface MethodCallItem {
  methodName: string;
  event: string | number;
}

// 方法调用统计图表组件
const MethodCallChart: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [data, setData] = useState<MethodCallItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeType, setTimeType] = useState("day"); // 时间筛选状态

  // 时间筛选选项
  const timeOptions = [
    { value: "day", label: "近1天" },
    { value: "week", label: "近7天" },
    { value: "month", label: "近30天" },
  ];

  // 获取方法调用统计数据
  const fetchMethodCallData = async () => {
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
          startTime.setDate(startTime.getDate() - 1);
      }

      // 格式化时间为 "yyyy-MM-dd HH:mm:ss"
      const formatTime = (date: Date) => {
        return date.toISOString().replace("T", " ").substring(0, 19);
      };

      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      // 调用实际API获取方法调用统计数据，传递时间参数
      const response = await getMethodCallDataAPI(
        projectId,
        startTimeStr,
        endTimeStr
      );

      setData(response || []);
    } catch (error) {
      console.error("获取方法调用统计失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 当时间筛选改变时重新获取数据
  useEffect(() => {
    fetchMethodCallData();
  }, [timeType, projectId]);

  const config = {
    data,
    xField: "methodName",
    yField: "event",
    loading: loading,
    style: {
      maxWidth: 50,
    },
    axis: {
      x: {
        // 直接在这里截断显示（如果传进来不是 string，请先处理）
        labelFormatter: (val: any) => {
          if (val == null) return val;
          const s = String(val);
          return s.length > 5 ? s.slice(0, 5) + "…" : s;
        },
        labelFontSize: 12,
        // 如果标签重叠，尝试旋转（可选）
        transform: [
          {
            type: "rotate",
            optionalAngles: [0, -45],
            recoverWhenFailed: true,
          },
        ],
      },
      y: {
        title: {
          text: "调用次数",
        },
      },
    },
  };

  return (
    <div
      style={{
        marginBottom: 50,
        padding: 16,
        border: "1px solid #f0f0f0",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          方法调用统计
        </Title>
        <Select
          value={timeType}
          style={{ width: 120 }}
          onChange={setTimeType}
          options={timeOptions}
        />
      </div>
      {loading ? (
        <Spin />
      ) : data.length > 0 ? (
        <Column autoFit {...config} />
      ) : (
        <Empty description="暂无方法调用数据" />
      )}
    </div>
  );
};

const ProjectDetailLog: React.FC = () => {
  const { projectId } = useParams();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();

  // 模拟获取日志数据
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getLogDataAPI(projectId);

      // 模拟数据
      // const mockLogs: LogItem[] = Array.from({ length: 10 }, (_, index) => ({
      //   id: index + 1,
      //   timestamp: new Date(Date.now() - index * 60000).toISOString(),
      //   api: `/api/v1/resource/${index + 1}`,
      //   module: `Module-${index + 1}`,
      //   projectId: projectId || 1,
      //   environment: index % 2 === 0 ? "production" : "development",
      //   type: index % 3 === 0 ? "error" : index % 3 === 1 ? "warning" : "info",
      //   stack: `Error: Something went wrong\n    at Function.process (${
      //     index + 1
      //   })\n    at Module.main (main.js)`,
      //   environmentSnapshot: {
      //     ip: `192.168.1.${index + 1}`,
      //     protocol: index % 2 === 0 ? "HTTP/1.1" : "HTTP/2",
      //     httpMethod:
      //       index % 3 === 0 ? "GET" : index % 3 === 1 ? "POST" : "PUT",
      //     browserName: index % 2 === 0 ? "Chrome" : "Firefox",
      //     browserVersion: `${80 + index}.0.1`,
      //     osName: index % 2 === 0 ? "Windows" : "MacOS",
      //     osVersion: `10.1${index}`,
      //     language: "zh-CN",
      //     isAjax: index % 2 === 0,
      //   },
      //   event: JSON.stringify(
      //     {
      //       userId: `user-${index + 1}`,
      //       action: "click",
      //       target: `button-${index + 1}`,
      //     },
      //     null,
      //     2
      //   ),
      // }));

      setLogs(response);
    } catch (error) {
      console.error("获取日志失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    getUserResponsibility(projectId, user?.id).then((res) => {
      if (res) {
        if (res.power === 0) {
          message.warning("您无权进入该项目，请联系项目管理员");
          navigate("/main/project/all");
        }
      }
    });
    fetchLogs();
  }, [projectId]);

  const handleExpand = (expanded: boolean, record: LogItem) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.id));
    }
  };

  // 渲染环境标签
  const renderEnvironmentTag = (environment: string) => {
    switch (environment) {
      case "production":
        return <Tag color="red">生产</Tag>;
      case "development":
        return <Tag color="blue">开发</Tag>;
      case "test":
        return <Tag color="orange">测试</Tag>;
      default:
        return <Tag color="default">{environment}</Tag>;
    }
  };

  // 渲染类型标签
  const renderTypeTag = (type: string) => {
    switch (type) {
      case "error":
        return <Tag color="error">错误</Tag>;
      case "warning":
        return <Tag color="warning">警告</Tag>;
      case "info":
        return <Tag color="processing">信息</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  // 表格列定义
  const columns: ColumnsType<LogItem> = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string) => (
        <Text ellipsis>{new Date(timestamp).toLocaleString()}</Text>
      ),
    },
    {
      title: "API",
      dataIndex: "api",
      key: "api",
      width: 200,
      render: (api: string) => (
        <Text ellipsis strong>
          {api}
        </Text>
      ),
    },
    {
      title: "环境",
      dataIndex: "environment",
      key: "environment",
      width: 100,
      render: renderEnvironmentTag,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: renderTypeTag,
    },
    {
      title: "模块",
      dataIndex: "module",
      key: "module",
      width: 120,
      render: (module: string) => <Text ellipsis>{module}</Text>,
    },
  ];

  // 展开行内容
  const expandedRowRender = (record: LogItem) => {
    return (
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>项目ID: </Text>
            <Text>{record.projectId}</Text>
          </div>
          {record.stack && (
            <div>
              <Text strong>完整堆栈: </Text>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "12px",
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  margin: "8px 0 0 0",
                  fontSize: "12px",
                }}
              >
                {record.stack}
              </pre>
            </div>
          )}
          {record.environmentSnapshot && (
            <div>
              <Text strong>环境快照: </Text>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "12px",
                  borderRadius: "4px",
                  margin: "8px 0 0 0",
                  fontSize: "12px",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>IP地址: </Text>
                    <Text>{record.environmentSnapshot?.ip}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>协议: </Text>
                    <Text>{record.environmentSnapshot.protocol || "N/A"}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>HTTP方法: </Text>
                    <Text>
                      {record.environmentSnapshot.httpMethod || "N/A"}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>浏览器: </Text>
                    <Text>
                      {record.environmentSnapshot.browserName}{" "}
                      {record.environmentSnapshot.browserVersion || ""}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>操作系统: </Text>
                    <Text>
                      {record.environmentSnapshot.osName}{" "}
                      {record.environmentSnapshot.osVersion || ""}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>语言: </Text>
                    <Text>{record.environmentSnapshot.language || "N/A"}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>AJAX请求: </Text>
                    <Text>
                      {record.environmentSnapshot.isAjax ? "是" : "否"}
                    </Text>
                  </Col>
                </Row>
              </div>
            </div>
          )}
          <div>
            <Text strong>次数: </Text>
            {record.event}
          </div>
        </Space>
      </div>
    );
  };

  // 自定义展开图标
  const expandIcon = ({ expanded, onExpand, record }: any) => {
    if (expanded) {
      return (
        <Button
          type="text"
          icon={<DownOutlined />}
          onClick={(e) => {
            onExpand(record, e);
          }}
          size="small"
        />
      );
    } else {
      return (
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={(e) => {
            onExpand(record, e);
          }}
          size="small"
        />
      );
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4}>项目日志</Title>
      </div>

      <MethodCallChart projectId={projectId} />

      <Title level={5}>项目日志列表</Title>
      <Table
        dataSource={logs}
        columns={columns}
        loading={loading}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: handleExpand,
          expandIcon,
          rowExpandable: () => true,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条日志`,
        }}
        rowKey="id"
        size="small"
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: <Empty description="暂无日志数据" />,
        }}
      />
    </div>
  );
};

export default ProjectDetailLog;
