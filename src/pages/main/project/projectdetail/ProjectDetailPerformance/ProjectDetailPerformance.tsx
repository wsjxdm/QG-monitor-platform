import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  Card,
  Spin,
  Empty,
  message,
} from "antd";
import { Column, DualAxes } from "@ant-design/plots";
import { ReloadOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
  getPerformanceDataAPI,
  getFpDataAPI,
  getMobilePerformanceDataAPI,
  getAverageTimeDataAPI,
} from "../../../../../api/service/performance";
import { getUserResponsibility } from "../../../../../api/service/projectoverview";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface environmentSnapshot {
  ip: string;
  protocol?: string;
  httpMethod?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  language?: string;
  isAjax?: boolean;
}

interface BackendPerformance {
  id: number | string;
  timestamp: string | number | Date;
  module?: string | number;
  projectId: string | number;
  environment?: string;
  environmentSnapshot?: environmentSnapshot;
  api?: string;
  sessionId?: string | number;
  slow?: boolean;
  duration?: number;
}

interface FrontendPerformance {
  id: number | string;
  timestamp: string | number | Date;
  projectId: string | number;
  sessionId?: string | number;
  userAgent?: string;
  metrics?: {
    vitals?: {
      fcp: number | string;
      lcp: number | string;
      ttfb: number | string;
    };
    navigation?: { domReady: number | string; loadComplete: number | string };
  };
  captureType?: string;
  duration?: number;
}

interface MobilePerformance {
  id: number | string;
  timestamp: string | number | Date;
  projectId: string | number;
  deviceModule?: string;
  osVersion?: string;
  batteryLevel?: number;
  memoryUsage?: { usedMemory: string | number; totalMemory: string | number };
  operationFps?: string | number;
  duration?: number;
  operationId?: string | number;
  apiName?: string;
}

// 三端请求平均用时柱状图组件
const ApiRequestTimeChart: React.FC<{
  timeType: string;
  platform: "frontend" | "backend" | "mobile";
  projectId: string;
  loading: boolean;
  data: { api: string; time: number }[];
}> = ({ timeType, platform, projectId, loading, data }) => {
  const config = {
    data,
    xField: "api",
    yField: "time",
    loading,
    axis: {
      x: {
        // 直接在这里截断显示
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
    },
    style: {
      maxWidth: 50,
    },
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? (
        <Spin />
      ) : data.length > 0 ? (
        <Column autoFit {...config} />
      ) : (
        <Empty />
      )}
    </div>
  );
};

// 修改 MobilePerformanceChart 组件为以下版本
const MobilePerformanceChart: React.FC<{
  timeType: string;
  projectId: string;
  loading: boolean;
  data: MobilePerformance[];
}> = ({ timeType, projectId, loading, data }) => {
  // 处理数据，为每个操作创建独立的数据点
  const fpsData = data.map((item) => {
    const timeLabel = new Date(item.timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      time: timeLabel,
      operationId: `${item.operationId}`,
      operationFps: item.operationFps || 0,
    };
  });

  // 处理内存使用率数据
  const memoryData = data.map((item) => {
    const timeLabel = new Date(item.timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 将内存使用量从字符串转换为百分比
    const usedMemoryStr = item.memoryUsage?.usedMemory || "0MB";
    const totalMemoryStr = item.memoryUsage?.totalMemory || "1MB";

    const usedMemory = parseFloat(usedMemoryStr.replace("MB", ""));
    const totalMemory = parseFloat(totalMemoryStr.replace("MB", ""));

    return {
      time: timeLabel,
      operationId: `${item.operationId}`,
      memoryUsage: totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0,
    };
  });

  // 提取所有唯一的操作ID
  const operationIds = Array.from(
    new Set(data.map((item) => item.operationId))
  );

  // 为不同操作ID设置不同颜色
  const getColor = (index: number) => {
    const colors = ["#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E8684A"];
    return colors[index % colors.length];
  };

  const config = {
    xField: "time",
    legend: true,
    children: [
      {
        type: "interval",
        data: fpsData,
        yField: "operationFps",
        seriesField: "operationId",
        axis: { y: { position: "left" } },
        style: {
          maxWidth: 50,
        },
        color: (d: any) => {
          const index = operationIds.indexOf(d.operationId);
          return getColor(index);
        },
      },
      {
        type: "line",
        data: memoryData,
        yField: "memoryUsage",
        seriesField: "operationId",
        shapeField: "smooth",
        axis: {
          y: {
            position: "right",
            title: "内存使用率 (%)",
            labelFormatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
        style: (d: any) => {
          const index = operationIds.indexOf(d.operationId);
          return {
            lineWidth: 2,
            stroke: getColor(index),
          };
        },
      },
    ],
    loading: loading,
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? (
        <Spin />
      ) : data.length > 0 ? (
        <DualAxes autoFit {...config} />
      ) : (
        <Empty />
      )}
    </div>
  );
};

const ProjectDetailPerformance: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [fpTimeType, setFpTimeType] = useState("day");
  const [apiTimeType, setApiTimeType] = useState("day");
  const [mobilePerformanceData, setMobilePerformanceData] = useState<
    { time: string; operationFps: number; memoryUsage: number }[]
  >([]);
  const [mobilePerformanceLoading, setMobilePerformanceLoading] =
    useState(false);
  const [mobilePerformanceTimeType, setMobilePerformanceTimeType] =
    useState("day");

  // 后端性能数据状态
  const [backendData, setBackendData] = useState<BackendPerformance[]>([]);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendExpandedRowKeys, setBackendExpandedRowKeys] = useState<
    React.Key[]
  >([]);
  const [backendFilters, setBackendFilters] = useState({
    moduleName: "",
  });

  // 前端性能数据状态
  const [frontendData, setFrontendData] = useState<FrontendPerformance[]>([]);
  const [frontendLoading, setFrontendLoading] = useState(false);
  const [frontendExpandedRowKeys, setFrontendExpandedRowKeys] = useState<
    React.Key[]
  >([]);
  const [frontendFilters, setFrontendFilters] = useState({
    captureType: "",
    search: "",
  });

  // 移动端性能数据状态
  const [mobileData, setMobileData] = useState<MobilePerformance[]>([]);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileExpandedRowKeys, setMobileExpandedRowKeys] = useState<
    React.Key[]
  >([]);
  const [mobileFilters, setMobileFilters] = useState({
    deviceModule: "",
    osVersion: "",
  });

  // 获取后端性能数据
  const fetchBackendData = async (filterParams: Record<string, any> = {}) => {
    setBackendLoading(true);
    try {
      // 这里应该调用实际的API获取后端性能数据
      const response = await getPerformanceDataAPI({
        platform: "backend",
        projectId,
        ...filterParams,
      });

      setBackendData(response[0]);
    } catch (error) {
      console.error("获取后端性能数据失败:", error);
    } finally {
      setBackendLoading(false);
    }
  };

  // 获取前端性能数据
  const fetchFrontendData = async (filterParams: Record<string, any> = {}) => {
    setFrontendLoading(true);
    try {
      // 这里应该调用实际的API获取前端性能数据
      const response = await getPerformanceDataAPI({
        platform: "frontend",
        projectId,
        ...filterParams,
      });

      // console.log("前端性能数据:", response[1]);
      setFrontendData(response[1]);
    } catch (error) {
      console.error("获取前端性能数据失败:", error);
    } finally {
      setFrontendLoading(false);
    }
  };

  // 获取移动端性能数据
  const fetchMobileData = async (filterParams: Record<string, any> = {}) => {
    setMobileLoading(true);
    try {
      // 这里应该调用实际的API获取移动端性能数据
      const response = await getPerformanceDataAPI({
        platform: "mobile",
        projectId,
        ...filterParams,
      });

      // console.log("移动端性能数据:", response[2]);
      setMobileData(response[2]);
    } catch (error) {
      console.error("获取移动端性能数据失败:", error);
    } finally {
      setMobileLoading(false);
    }
  };

  // 添加获取移动端运行性能数据的函数
  const fetchMobilePerformanceData = async (timeType: string) => {
    setMobilePerformanceLoading(true);
    try {
      const response = await getMobilePerformanceDataAPI(projectId, timeType);
      setMobilePerformanceData(response);
    } catch (error) {
      console.error("获取移动端运行性能数据失败:", error);
      setMobilePerformanceData([]);
    } finally {
      setMobilePerformanceLoading(false);
    }
  };

  // 页面加载时间状态
  // const [pageLoadData, setPageLoadData] = useState<
  //   { page: string; value: number }[]
  // >([]);
  // const [pageLoadLoading, setPageLoadLoading] = useState(false);

  // FP/FCP数据状态
  // const [fpData, setFpData] = useState<
  //   { page: string; fp: number; fcp: number }[]
  // >([]);
  // const [fpLoading, setFpLoading] = useState(false);

  // API请求时间状态
  const [apiRequestData, setApiRequestData] = useState<
    { api: string; time: number }[]
  >([]);
  const [apiRequestLoading, setApiRequestLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "frontend" | "backend" | "mobile"
  >("frontend");

  // 获取FP/FCP数据
  // const fetchFpData = async (timeType: string) => {
  //   setFpLoading(true);
  //   try {
  //     const endTime = new Date();
  //     const startTime = new Date();

  //     switch (timeType) {
  //       case "day":
  //         startTime.setDate(startTime.getDate() - 1);
  //         break;
  //       case "week":
  //         startTime.setDate(startTime.getDate() - 7);
  //         break;
  //       case "month":
  //         startTime.setDate(startTime.getDate() - 30);
  //         break;
  //       default:
  //         startTime.setDate(startTime.getDate() - 7);
  //     }

  //     // 格式化时间为 "yyyy-MM-dd HH:mm:ss"
  //     const formatTime = (date: Date) => {
  //       return date.toISOString().replace("T", " ").substring(0, 19);
  //     };

  //     const startTimeStr = formatTime(startTime);
  //     const endTimeStr = formatTime(endTime);
  //     const response = await getFpDataAPI(projectId, startTimeStr, endTimeStr);

  //     // let mockData;
  //     // switch (timeType) {
  //     //   case "day":
  //     //     mockData = [
  //     //       { page: "首页", lcp: 800, fcp: 1000, dom: 900, load: 1100 },
  //     //       { page: "商品详情页", lcp: 900, fcp: 1200, dom: 1000, load: 1300 },
  //     //       { page: "购物车", lcp: 500, fcp: 700, dom: 600, load: 800 },
  //     //     ];
  //     //     break;
  //     //   case "week":
  //     //     mockData = [
  //     //       { page: "首页", lcp: 1200, fcp: 1500, dom: 1300, load: 1600 },
  //     //       { page: "商品详情页", lcp: 1000, fcp: 1600, dom: 1400, load: 1800 },
  //     //       { page: "购物车", lcp: 600, fcp: 900, dom: 800, load: 1000 },
  //     //       { page: "订单页", lcp: 900, fcp: 1300, dom: 1100, load: 1500 },
  //     //       { page: "个人中心", lcp: 700, fcp: 1000, dom: 900, load: 1200 },
  //     //     ];
  //     //     break;
  //     //   case "month":
  //     //     mockData = [
  //     //       { page: "首页", lcp: 1500, fcp: 1800, dom: 1600, load: 1900 },
  //     //       { page: "商品详情页", lcp: 1300, fcp: 1900, dom: 1700, load: 2100 },
  //     //       { page: "购物车", lcp: 800, fcp: 1100, dom: 900, load: 1200 },
  //     //       { page: "订单页", lcp: 1100, fcp: 1500, dom: 1300, load: 1700 },
  //     //       { page: "个人中心", lcp: 900, fcp: 1200, dom: 1000, load: 1400 },
  //     //       { page: "搜索页", lcp: 700, fcp: 900, dom: 800, load: 1000 },
  //     //     ];
  //     //     break;
  //     //   default:
  //     //     mockData = [
  //     //       { page: "首页", lcp: 1200, fcp: 1500, dom: 1300, load: 1600 },
  //     //       { page: "商品详情页", lcp: 1000, fcp: 1600, dom: 1400, load: 1800 },
  //     //       { page: "购物车", lcp: 600, fcp: 900, dom: 800, load: 1000 },
  //     //       { page: "订单页", lcp: 900, fcp: 1300, dom: 1100, load: 1500 },
  //     //       { page: "个人中心", lcp: 700, fcp: 1000, dom: 900, load: 1200 },
  //     //     ];
  //     // }

  //     setFpData(response);
  //   } catch (error) {
  //     console.error("获取FP/FCP数据失败:", error);
  //     setFpData([]);
  //   } finally {
  //     setFpLoading(false);
  //   }
  // };

  // 更新筛选器的onChange处理函数，确保同时更新时间和平台
  const handleApiTimeChange = (value: string) => {
    setApiTimeType(value);
    fetchApiRequestData(value, selectedPlatform); // 同时获取数据
  };

  const handlePlatformChange = (value: "frontend" | "backend" | "mobile") => {
    setSelectedPlatform(value);
    fetchApiRequestData(apiTimeType, value); // 同时获取数据
  };

  // 获取API请求时间数据
  const fetchApiRequestData = async (
    timeType: string,
    platform: "frontend" | "backend" | "mobile"
  ) => {
    setApiRequestLoading(true);
    try {
      // 实际使用时替换为:
      const response = await getAverageTimeDataAPI(
        projectId,
        platform,
        timeType
      );
      const processedData = Object.entries(response).map(([key, value]) => ({
        api: key,
        time: value,
      }));

      // console.log(
      //   "%c [ ]-273",
      //   "color: #f00; font-weight: bold;background: #fff;width: 100%;",
      //   "performedData",
      //   processedData
      // );
      setApiRequestData(processedData);
    } catch (error) {
      console.error("获取API请求时间数据失败:", error);
      setApiRequestData([]);
    } finally {
      setApiRequestLoading(false);
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
    // 初始加载所有数据
    fetchBackendData({});
    fetchFrontendData({});
    fetchMobileData({});

    fetchMobilePerformanceData("day");
    // fetchFpData("day");
    fetchApiRequestData("day", "frontend");
  }, [projectId]);

  // 后端性能相关处理函数
  const handleBackendRefresh = () => {
    fetchBackendData(backendFilters);
  };

  const handleBackendExpand = (
    expanded: boolean,
    record: BackendPerformance
  ) => {
    if (expanded) {
      setBackendExpandedRowKeys([...backendExpandedRowKeys, record.id]);
    } else {
      setBackendExpandedRowKeys(
        backendExpandedRowKeys.filter((key) => key !== record.id)
      );
    }
  };

  const handleBackendFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...backendFilters,
      [key]: value,
    };

    setBackendFilters(newFilters);
    fetchBackendData(newFilters);
  };

  // 前端性能相关处理函数
  const handleFrontendRefresh = () => {
    fetchFrontendData(frontendFilters);
  };

  const handleFrontendExpand = (
    expanded: boolean,
    record: FrontendPerformance
  ) => {
    if (expanded) {
      setFrontendExpandedRowKeys([...frontendExpandedRowKeys, record.id]);
    } else {
      setFrontendExpandedRowKeys(
        frontendExpandedRowKeys.filter((key) => key !== record.id)
      );
    }
  };

  const handleFrontendFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...frontendFilters,
      [key]: value,
    };

    setFrontendFilters(newFilters);
    fetchFrontendData(newFilters);
  };

  // 移动端性能相关处理函数
  const handleMobileRefresh = () => {
    fetchMobileData(mobileFilters);
  };

  const handleMobileExpand = (expanded: boolean, record: MobilePerformance) => {
    if (expanded) {
      setMobileExpandedRowKeys([...mobileExpandedRowKeys, record.id]);
    } else {
      setMobileExpandedRowKeys(
        mobileExpandedRowKeys.filter((key) => key !== record.id)
      );
    }
  };

  const handleMobileFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...mobileFilters,
      [key]: value,
    };

    setMobileFilters(newFilters);
    fetchMobileData(newFilters);
  };

  // 渲染环境标签
  const renderEnvironmentTag = (environment?: string) => {
    if (!environment) return null;

    switch (environment) {
      case "production":
        return <Tag color="red">生产</Tag>;
      case "dev":
        return <Tag color="blue">开发</Tag>;
      case "test":
        return <Tag color="orange">测试</Tag>;
      default:
        return <Tag>{environment}</Tag>;
    }
  };

  // 渲染捕获类型标签
  const renderCaptureTypeTag = (captureType?: string) => {
    if (!captureType) return null;

    switch (captureType) {
      case "auto":
        return <Tag color="green">自动</Tag>;
      case "navigation":
        return <Tag color="blue">导航</Tag>;
      default:
        return <Tag>{captureType}</Tag>;
    }
  };

  // 后端性能表格列定义
  const backendColumns: ColumnsType<BackendPerformance> = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string | number | Date) => (
        <Text>{new Date(timestamp).toLocaleString()}</Text>
      ),
    },
    {
      title: "API",
      dataIndex: "api",
      key: "api",
      width: 200,
      render: (api?: string) => (api ? <Text ellipsis>{api}</Text> : null),
    },
    {
      title: "环境",
      dataIndex: "environment",
      key: "environment",
      width: 100,
      render: renderEnvironmentTag,
    },
    {
      title: "耗时",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration?: number) => (duration ? `${duration}ms` : null),
    },
  ];

  // 前端性能表格列定义
  const frontendColumns: ColumnsType<FrontendPerformance> = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string | number | Date) => (
        <Text>{new Date(timestamp).toLocaleString()}</Text>
      ),
    },
    {
      title: "类型",
      dataIndex: "captureType",
      key: "captureType",
      width: 120,
      render: renderCaptureTypeTag,
    },
    {
      title: "耗时",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration?: number) => (duration ? `${duration}ms` : null),
    },
    {
      title: "用户代理",
      dataIndex: "userAgent",
      key: "userAgent",
      width: 200,
      render: (userAgent?: string) =>
        userAgent ? <Text ellipsis>{userAgent}</Text> : null,
    },
  ];

  // 移动端性能表格列定义
  const mobileColumns: ColumnsType<MobilePerformance> = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string | number | Date) => (
        <Text>{new Date(timestamp).toLocaleString()}</Text>
      ),
    },
    {
      title: "设备型号",
      dataIndex: "deviceModule",
      key: "deviceModule",
      width: 150,
      render: (deviceModule?: string) =>
        deviceModule ? <Text>{deviceModule}</Text> : null,
    },
    {
      title: "系统版本",
      dataIndex: "osVersion",
      key: "osVersion",
      width: 120,
      render: (osVersion?: string) =>
        osVersion ? <Text>{osVersion}</Text> : null,
    },
    {
      title: "耗时",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration?: number) => (duration ? `${duration}ms` : null),
    },
    {
      title: "电池电量",
      dataIndex: "batteryLevel",
      key: "batteryLevel",
      width: 100,
      render: (batteryLevel?: number) =>
        batteryLevel !== undefined ? `${batteryLevel}%` : null,
    },
  ];

  // 后端性能展开行内容
  const backendExpandedRowRender = (record: BackendPerformance) => {
    return (
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>项目ID: </Text>
              <Text>{record.projectId}</Text>
            </Col>
            {record.module && (
              <Col span={8}>
                <Text strong>模块: </Text>
                <Text>{record.module}</Text>
              </Col>
            )}
            {record.sessionId && (
              <Col span={8}>
                <Text strong>会话ID: </Text>
                <Text>{record.sessionId}</Text>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            {record.duration && (
              <Col span={8}>
                <Text strong>耗时: </Text>
                <Text>{record.duration}ms</Text>
              </Col>
            )}
            {record.slow !== undefined && (
              <Col span={8}>
                <Text strong>慢查询: </Text>
                <Text>{record.slow ? "是" : "否"}</Text>
              </Col>
            )}
          </Row>

          {record.environmentSnapshot && (
            <div>
              <Text strong>环境快照: </Text>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "8px 2px",
                  borderRadius: "4px",
                  margin: "8px 0 0 0",
                  fontSize: "12px",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>IP地址: </Text>
                    <Text>{record.environmentSnapshot.ip}</Text>
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
        </Space>
      </div>
    );
  };

  // 前端性能展开行内容
  const frontendExpandedRowRender = (record: FrontendPerformance) => {
    return (
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>项目ID: </Text>
              <Text>{record.projectId}</Text>
            </Col>
            {record.sessionId && (
              <Col span={8}>
                <Text strong>会话ID: </Text>
                <Text>{record.sessionId}</Text>
              </Col>
            )}
            {record.captureType && (
              <Col span={8}>
                <Text strong>捕获类型: </Text>
                {renderCaptureTypeTag(record.captureType)}
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            {record.duration && (
              <Col span={8}>
                <Text strong>耗时: </Text>
                <Text>{record.duration}ms</Text>
              </Col>
            )}
          </Row>

          {record.userAgent && (
            <div>
              <Text strong>用户代理: </Text>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "8px",
                  borderRadius: "4px",
                  marginTop: 8,
                  fontSize: "12px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {record.userAgent}
              </div>
            </div>
          )}

          {record.metrics && (
            <div>
              <Text strong>指标数据: </Text>
              <Row gutter={16} style={{ marginTop: 10 }}>
                {record.metrics.vitals && (
                  <Col span={12}>
                    <Text>关键性能指标: </Text>
                    <div>
                      <Text>FCP: {record.metrics.vitals.fcp}ms</Text>
                      <br />
                      <Text>
                        LCP:{" "}
                        {record.metrics.vitals.lcp
                          ? `${record.metrics.vitals.lcp}ms`
                          : "N/A"}
                      </Text>
                      <br />
                      <Text>
                        TTFB:{" "}
                        {record.metrics.vitals.ttfb
                          ? `${record.metrics.vitals.ttfb}ms`
                          : "N/A"}
                      </Text>
                    </div>
                  </Col>
                )}
                {record.metrics.navigation && (
                  <Col span={12}>
                    <Text>导航指标: </Text>
                    <div>
                      <Text>
                        DOM Ready: {record.metrics.navigation.domReady}ms
                      </Text>
                      <br />
                      <Text>
                        Load Complete: {record.metrics.navigation.loadComplete}
                        ms
                      </Text>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Space>
      </div>
    );
  };

  // 移动端性能展开行内容
  const mobileExpandedRowRender = (record: MobilePerformance) => {
    return (
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>项目ID: </Text>
              <Text>{record.projectId}</Text>
            </Col>
            {record.deviceModule && (
              <Col span={8}>
                <Text strong>设备型号: </Text>
                <Text>{record.deviceModule}</Text>
              </Col>
            )}
            {record.osVersion && (
              <Col span={8}>
                <Text strong>系统版本: </Text>
                <Text>{record.osVersion}</Text>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            {record.duration && (
              <Col span={8}>
                <Text strong>耗时: </Text>
                <Text>{record.duration}ms</Text>
              </Col>
            )}
            {record.batteryLevel !== undefined && (
              <Col span={8}>
                <Text strong>电池电量: </Text>
                <Text>{record.batteryLevel}</Text>
              </Col>
            )}
            {record.memoryUsage && (
              <Col span={8}>
                <Text strong>内存使用: </Text>
                <Text>
                  {record.memoryUsage.usedMemory} /{" "}
                  {record.memoryUsage.totalMemory}
                </Text>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            {record.operationFps !== null && (
              <Col span={8}>
                <Text strong>帧率: </Text>
                <Text>{record.operationFps}</Text>
              </Col>
            )}
            {/* 新增字段显示 */}
            {record.operationId && (
              <Col span={8}>
                <Text strong>操作ID: </Text>
                <Text>{record.operationId}</Text>
              </Col>
            )}
            {record.apiName && (
              <Col span={8}>
                <Text strong>API: </Text>
                <Text>{record.apiName}</Text>
              </Col>
            )}
          </Row>
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
        <Title level={4}>性能监控</Title>
      </div>

      <div>
        {/* <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card
              title="前端FCP,LCP,DOM.LOAD数据"
              extra={
                <Select
                  value={fpTimeType}
                  style={{ width: 120 }}
                  onChange={(value) => {
                    setFpTimeType(value);
                    fetchFpData(value);
                  }}
                  options={[
                    { value: "day", label: "近1天" },
                    { value: "week", label: "近7天" },
                    { value: "month", label: "近30天" },
                  ]}
                  size="small"
                />
              }
            >
              <FpDataChart
                timeType={fpTimeType}
                projectId={projectId || "1"}
                loading={fpLoading}
                data={fpData}
              />
            </Card>
          </Col>
        </Row> */}

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card
              title="移动端运行性能 (FPS 和内存使用率)"
              extra={
                <Select
                  value={mobilePerformanceTimeType}
                  style={{ width: 120 }}
                  onChange={(value) => {
                    setMobilePerformanceTimeType(value);
                    fetchMobilePerformanceData(value);
                  }}
                  options={[
                    { value: "day", label: "近1天" },
                    { value: "week", label: "近7天" },
                    { value: "month", label: "近30天" },
                  ]}
                  size="small"
                />
              }
            >
              <MobilePerformanceChart
                timeType={mobilePerformanceTimeType}
                projectId={projectId || "1"}
                loading={mobilePerformanceLoading}
                data={mobilePerformanceData}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card
              title="各端API请求平均用时"
              extra={
                <Space>
                  <Select
                    value={selectedPlatform}
                    style={{ width: 120 }}
                    onChange={handlePlatformChange}
                    options={[
                      { value: "frontend", label: "前端" },
                      { value: "backend", label: "后端" },
                      { value: "mobile", label: "移动端" },
                    ]}
                    size="small"
                  />
                  <Select
                    value={apiTimeType}
                    style={{ width: 120 }}
                    onChange={handleApiTimeChange}
                    options={[
                      { value: "day", label: "近1天" },
                      { value: "week", label: "近7天" },
                      { value: "month", label: "近30天" },
                    ]}
                    size="small"
                  />
                </Space>
              }
            >
              <ApiRequestTimeChart
                timeType={apiTimeType}
                platform={selectedPlatform}
                projectId={projectId || "1"}
                loading={apiRequestLoading}
                data={apiRequestData}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="后端性能" key="1">
          {/* 后端性能筛选栏 */}
          <div
            style={{
              background: "#fafafa",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <Row gutter={16} align="middle">
              {/* <Col>
                <Space>
                  <Text>环境:</Text>
                  <Select
                    style={{ width: 120 }}
                    placeholder="全部环境"
                    value={backendFilters.environment || undefined}
                    onChange={(value) =>
                      handleBackendFilterChange("environment", value)
                    }
                    allowClear
                    size="small"
                  >
                    <Option value="production">生产</Option>
                    <Option value="development">开发</Option>
                    <Option value="test">测试</Option>
                  </Select>
                </Space>
              </Col> */}

              <Col flex="auto">
                <Space>
                  <Text>搜索:</Text>
                  <Input
                    style={{ width: 200 }}
                    placeholder="搜索API或模块"
                    value={backendFilters.moduleName}
                    onChange={(e) =>
                      handleBackendFilterChange("moduleName", e.target.value)
                    }
                    allowClear
                    size="small"
                  />
                </Space>
              </Col>

              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleBackendRefresh}
                  disabled={backendLoading}
                  size="small"
                >
                  刷新
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            dataSource={backendData}
            columns={backendColumns}
            loading={backendLoading}
            expandable={{
              expandedRowRender: backendExpandedRowRender,
              expandedRowKeys: backendExpandedRowKeys,
              onExpand: handleBackendExpand,
              expandIcon,
              rowExpandable: () => true,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            rowKey="id"
            size="small"
            scroll={{ x: "max-content" }}
          />
        </TabPane>

        <TabPane tab="前端性能" key="2">
          {/* 前端性能筛选栏 */}
          <div
            style={{
              background: "#fafafa",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <Row gutter={16} align="middle">
              <Col>
                <Space>
                  <Text>类型:</Text>
                  <Select
                    style={{ width: 150 }}
                    placeholder="全部类型"
                    value={frontendFilters.captureType || undefined}
                    onChange={(value) =>
                      handleFrontendFilterChange("captureType", value)
                    }
                    allowClear
                    size="small"
                  >
                    <Option value="auto">自动</Option>
                    <Option value="navigation">导航</Option>
                  </Select>
                </Space>
              </Col>

              {/* <Col flex="auto">
                <Space>
                  <Text>搜索:</Text>
                  <Input
                    style={{ width: 200 }}
                    placeholder="搜索类型或用户代理"
                    value={frontendFilters.search}
                    onChange={(e) =>
                      handleFrontendFilterChange("search", e.target.value)
                    }
                    allowClear
                    size="small"
                  />
                </Space>
              </Col> */}

              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleFrontendRefresh}
                  disabled={frontendLoading}
                  size="small"
                >
                  刷新
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            dataSource={frontendData}
            columns={frontendColumns}
            loading={frontendLoading}
            expandable={{
              expandedRowRender: frontendExpandedRowRender,
              expandedRowKeys: frontendExpandedRowKeys,
              onExpand: handleFrontendExpand,
              expandIcon,
              rowExpandable: () => true,
            }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            rowKey="id"
            size="small"
            scroll={{ x: "max-content" }}
          />
        </TabPane>

        <TabPane tab="移动端性能" key="3">
          {/* 移动端性能筛选栏 */}
          <div
            style={{
              background: "#fafafa",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <Row gutter={16} align="middle">
              {/* <Col>
                <Space>
                  <Text>设备:</Text>
                  <Select
                    style={{ width: 150 }}
                    placeholder="全部设备"
                    value={mobileFilters.deviceModule || undefined}
                    onChange={(value) =>
                      handleMobileFilterChange("deviceModule", value)
                    }
                    allowClear
                    size="small"
                  >
                    <Option value="Device-1">Device-1</Option>
                    <Option value="Device-2">Device-2</Option>
                    <Option value="Device-3">Device-3</Option>
                  </Select>
                </Space>
              </Col> */}

              <Col flex="auto">
                <Space>
                  <Text>搜索:</Text>
                  <Input
                    style={{ width: 200 }}
                    placeholder="搜索设备或系统版本"
                    value={mobileFilters.osVersion}
                    onChange={(e) =>
                      handleMobileFilterChange("osVersion", e.target.value)
                    }
                    allowClear
                    size="small"
                  />
                </Space>
              </Col>

              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleMobileRefresh}
                  disabled={mobileLoading}
                  size="small"
                >
                  刷新
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            dataSource={mobileData}
            columns={mobileColumns}
            loading={mobileLoading}
            expandable={{
              expandedRowRender: mobileExpandedRowRender,
              expandedRowKeys: mobileExpandedRowKeys,
              onExpand: handleMobileExpand,
              expandIcon,
              rowExpandable: () => true,
            }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            rowKey="id"
            size="small"
            scroll={{ x: "max-content" }}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPerformance;
