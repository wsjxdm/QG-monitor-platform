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
} from "antd";
import { Column, Line } from "@ant-design/plots";
import { ReloadOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

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
    vitals?: { fcp: number | string; lcp: number | string };
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
  operationFps?: string;
  duration?: number;
}

// 在 ProjectDetailPerformance.tsx 文件中添加以下组件

// 前端页面加载时间柱状图组件
const PageLoadTimeChart: React.FC<{
  timeType: string;
  projectId: string;
  loading: boolean;
  data: { page: string; value: number }[];
}> = ({ timeType, projectId, loading, data }) => {
  const config = {
    data,
    xField: "page",
    yField: "value",
    loading,
    axis: {
      y: {
        title: "平均加载时间 (ms)",
      },
    },
    label: {
      text: (d: any) => `${d.value}ms`,
      position: "top",
    },
    style: {
      maxWidth: 50,
    },
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? <Spin /> : <Column autoFit {...config} />}
    </div>
  );
};

// 前端FP，FCP双折线图组件
const FpDataChart: React.FC<{
  timeType: string;
  projectId: string;
  loading: boolean;
  data: { page: string; fp: number; fcp: number }[];
}> = ({ timeType, projectId, loading, data }) => {
  // 转换数据格式以适应双折线图
  const transformedData = data.flatMap((item) => [
    { page: item.page, type: "FP", value: item.fp },
    { page: item.page, type: "FCP", value: item.fcp },
  ]);

  const config = {
    data: transformedData,
    xField: "page",
    yField: "value",
    seriesField: "type",
    loading,
    axis: {
      y: {
        title: "时间 (ms)",
      },
    },
    legend: {
      color: {
        itemMarker: "circle",
      },
    },
    style: {
      lineWidth: 2,
    },
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? <Spin /> : <Line autoFit {...config} />}
    </div>
  );
};

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
      y: {
        title: "平均用时 (ms)",
      },
    },
    label: {
      text: (d: any) => `${d.time}ms`,
      position: "top",
    },
    style: {
      maxWidth: 50,
    },
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? <Spin /> : <Column autoFit {...config} />}
    </div>
  );
};

const ProjectDetailPerformance: React.FC = () => {
  const { projectId } = useParams();

  // 后端性能数据状态
  const [backendData, setBackendData] = useState<BackendPerformance[]>([]);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendExpandedRowKeys, setBackendExpandedRowKeys] = useState<
    React.Key[]
  >([]);
  const [backendFilters, setBackendFilters] = useState({
    environment: "",
    search: "",
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
    search: "",
  });

  // 获取后端性能数据
  const fetchBackendData = async (filterParams: Record<string, any> = {}) => {
    setBackendLoading(true);
    try {
      // 这里应该调用实际的API获取后端性能数据
      // const response = await getBackendPerformanceDataAPI({
      //   platform: "backend",
      //   projectId,
      //   ...filterParams
      // });

      // 模拟后端数据
      const mockData: BackendPerformance[] = Array.from(
        { length: 5 },
        (_, index) => ({
          id: `backend-${index + 1}`,
          timestamp: new Date(Date.now() - index * 60000).toISOString(),
          module: index % 2 === 0 ? `Module-${index + 1}` : undefined,
          projectId: projectId || 1,
          environment:
            index % 3 === 0
              ? "production"
              : index % 3 === 1
              ? "development"
              : "test",
          api: `/api/v1/resource/${index + 1}`,
          duration: Math.floor(Math.random() * 5000) + 100,
          slow: index % 5 === 0,
          environmentSnapshot: {
            ip: `192.168.1.${index + 1}`,
            protocol: index % 2 === 0 ? "HTTP/1.1" : "HTTP/2",
            httpMethod:
              index % 3 === 0 ? "GET" : index % 3 === 1 ? "POST" : "PUT",
            browserName: index % 2 === 0 ? "Chrome" : "Firefox",
            browserVersion: `${80 + index}.0.1`,
            osName: index % 2 === 0 ? "Windows" : "MacOS",
            osVersion: `10.1${index}`,
            language: "zh-CN",
            isAjax: index % 2 === 0,
          },
          sessionId: `session-${index + 1}`,
        })
      );

      // 应用筛选条件
      const filteredData = mockData.filter((item) => {
        // 环境筛选
        if (
          filterParams.environment &&
          item.environment !== filterParams.environment
        ) {
          return false;
        }

        // 搜索筛选
        if (filterParams.search) {
          const searchLower = filterParams.search.toLowerCase();
          const matchesSearch =
            (item.api && item.api.toLowerCase().includes(searchLower)) ||
            (item.module &&
              item.module.toString().toLowerCase().includes(searchLower));

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      });

      setBackendData(filteredData);
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
      // const response = await getFrontendPerformanceDataAPI({
      //   platform: "frontend",
      //   projectId,
      //   ...filterParams
      // });

      // 模拟前端数据
      const mockData: FrontendPerformance[] = Array.from(
        { length: 5 },
        (_, index) => ({
          id: `frontend-${index + 1}`,
          timestamp: new Date(Date.now() - index * 60000).toISOString(),
          projectId: projectId || 1,
          sessionId: `session-${index + 1}`,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          metrics: {
            vitals: {
              lcp: index * 100,
              fcp: index * 50,
            },
            navigation: {
              domReady: index * 30,
              loadComplete: index * 70,
            },
          },
          captureType:
            index % 4 === 0
              ? "pageLoad"
              : index % 4 === 1
              ? "apiCall"
              : index % 4 === 2
              ? "userAction"
              : "custom",
          duration: Math.floor(Math.random() * 5000) + 100,
        })
      );

      // 应用筛选条件
      const filteredData = mockData.filter((item) => {
        // 捕获类型筛选
        if (
          filterParams.captureType &&
          item.captureType !== filterParams.captureType
        ) {
          return false;
        }

        // 搜索筛选
        if (filterParams.search) {
          const searchLower = filterParams.search.toLowerCase();
          const matchesSearch =
            (item.captureType &&
              item.captureType.toLowerCase().includes(searchLower)) ||
            (item.userAgent &&
              item.userAgent.toLowerCase().includes(searchLower));

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      });

      setFrontendData(filteredData);
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
      // const response = await getMobilePerformanceDataAPI({
      //   platform: "mobile",
      //   projectId,
      //   ...filterParams
      // });

      // 模拟移动端数据
      const mockData: MobilePerformance[] = Array.from(
        { length: 5 },
        (_, index) => ({
          id: `mobile-${index + 1}`,
          timestamp: new Date(Date.now() - index * 60000).toISOString(),
          projectId: projectId || 1,
          deviceModule: index % 2 === 0 ? `Device-${index + 1}` : undefined,
          osVersion: index % 2 === 0 ? `OS-${index + 1}.0` : undefined,
          batteryLevel:
            index % 2 === 0 ? Math.floor(Math.random() * 100) : undefined,
          memoryUsage: {
            usedMemory: `${Math.floor(Math.random() * 4096)}MB`,
            totalMemory: `${Math.floor(Math.random() * 4096)}MB`,
          },
          operationFps:
            index % 3 === 0
              ? `${Math.floor(Math.random() * 60)} FPS`
              : undefined,
          duration: Math.floor(Math.random() * 5000) + 100,
        })
      );

      // 应用筛选条件
      const filteredData = mockData.filter((item) => {
        // 设备型号筛选
        if (
          filterParams.deviceModule &&
          item.deviceModule !== filterParams.deviceModule
        ) {
          return false;
        }

        // 搜索筛选
        if (filterParams.search) {
          const searchLower = filterParams.search.toLowerCase();
          const matchesSearch =
            (item.deviceModule &&
              item.deviceModule.toLowerCase().includes(searchLower)) ||
            (item.osVersion &&
              item.osVersion.toLowerCase().includes(searchLower));

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      });

      setMobileData(filteredData);
    } catch (error) {
      console.error("获取移动端性能数据失败:", error);
    } finally {
      setMobileLoading(false);
    }
  };

  // 页面加载时间状态
  const [pageLoadData, setPageLoadData] = useState<
    { page: string; value: number }[]
  >([]);
  const [pageLoadLoading, setPageLoadLoading] = useState(false);

  // FP/FCP数据状态
  const [fpData, setFpData] = useState<
    { page: string; fp: number; fcp: number }[]
  >([]);
  const [fpLoading, setFpLoading] = useState(false);

  // API请求时间状态
  const [apiRequestData, setApiRequestData] = useState<
    { api: string; time: number }[]
  >([]);
  const [apiRequestLoading, setApiRequestLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "frontend" | "backend" | "mobile"
  >("frontend");

  // 获取页面加载时间数据
  const fetchPageLoadData = async (timeType: string) => {
    setPageLoadLoading(true);
    try {
      // 实际使用时替换为:
      // const response = await axios.get("你的页面加载时间API地址", {
      //   params: { timeType, projectId }
      // });

      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockData = [
        { page: "首页", value: 1200 },
        { page: "商品详情页", value: 1800 },
        { page: "购物车", value: 900 },
        { page: "订单页", value: 1500 },
        { page: "个人中心", value: 1100 },
      ];

      setPageLoadData(mockData);
    } catch (error) {
      console.error("获取页面加载时间数据失败:", error);
      setPageLoadData([]);
    } finally {
      setPageLoadLoading(false);
    }
  };

  // 获取FP/FCP数据
  const fetchFpData = async (timeType: string) => {
    setFpLoading(true);
    try {
      // 实际使用时替换为:
      // const response = await axios.get("你的FP/FCP数据API地址", {
      //   params: { timeType, projectId }
      // });

      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockData = [
        { page: "首页", fp: 800, fcp: 1200 },
        { page: "商品详情页", fp: 1000, fcp: 1600 },
        { page: "购物车", fp: 600, fcp: 900 },
        { page: "订单页", fp: 900, fcp: 1300 },
        { page: "个人中心", fp: 700, fcp: 1000 },
      ];

      setFpData(mockData);
    } catch (error) {
      console.error("获取FP/FCP数据失败:", error);
      setFpData([]);
    } finally {
      setFpLoading(false);
    }
  };

  // 获取API请求时间数据
  const fetchApiRequestData = async (
    timeType: string,
    platform: "frontend" | "backend" | "mobile"
  ) => {
    setApiRequestLoading(true);
    try {
      // 实际使用时替换为:
      // const response = await axios.get("你的API请求时间API地址", {
      //   params: { timeType, platform, projectId }
      // });

      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 800));

      let mockData;
      switch (platform) {
        case "frontend":
          mockData = [
            { api: "/api/home", time: 400 },
            { api: "/api/products", time: 600 },
            { api: "/api/cart", time: 300 },
            { api: "/api/user", time: 350 },
          ];
          break;
        case "backend":
          mockData = [
            { api: "/user/profile", time: 150 },
            { api: "/order/list", time: 250 },
            { api: "/product/detail", time: 180 },
            { api: "/payment/status", time: 200 },
          ];
          break;
        case "mobile":
          mockData = [
            { api: "/api/mobile/login", time: 500 },
            { api: "/api/mobile/data", time: 700 },
            { api: "/api/mobile/upload", time: 800 },
            { api: "/api/mobile/notify", time: 400 },
          ];
          break;
        default:
          mockData = [];
      }

      setApiRequestData(mockData);
    } catch (error) {
      console.error("获取API请求时间数据失败:", error);
      setApiRequestData([]);
    } finally {
      setApiRequestLoading(false);
    }
  };

  useEffect(() => {
    //todo 可以先获取后端的，其他等切换的时候获取，也可以通过plateform:all来获取所有数据

    // 初始加载所有数据
    fetchBackendData({});
    fetchFrontendData({});
    fetchMobileData({});

    fetchPageLoadData("7d");
    fetchFpData("7d");
    fetchApiRequestData("7d", "frontend");
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
      case "development":
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
      case "pageLoad":
        return <Tag color="green">页面加载</Tag>;
      case "apiCall":
        return <Tag color="blue">API调用</Tag>;
      case "userAction":
        return <Tag color="purple">用户操作</Tag>;
      case "custom":
        return <Tag color="cyan">自定义</Tag>;
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
                  padding: "12px",
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
                      <Text>LCP: {record.metrics.vitals.lcp}ms</Text>
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
                <Text>{record.batteryLevel}%</Text>
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
            {record.operationFps && (
              <Col span={8}>
                <Text strong>帧率: </Text>
                <Text>{record.operationFps}</Text>
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

        {/* 新增的图表部分 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card title="前端页面加载时间">
              <PageLoadTimeChart
                timeType="7d"
                projectId={projectId || "1"}
                loading={pageLoadLoading}
                data={pageLoadData}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card title="前端FP，FCP数据">
              <FpDataChart
                timeType="7d"
                projectId={projectId || "1"}
                loading={fpLoading}
                data={fpData}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card
              title="各平台API请求平均用时"
              extra={
                <Space>
                  <Select
                    value={selectedPlatform}
                    style={{ width: 120 }}
                    onChange={(value) => {
                      setSelectedPlatform(value);
                      fetchApiRequestData("7d", value);
                    }}
                    options={[
                      { value: "frontend", label: "前端" },
                      { value: "backend", label: "后端" },
                      { value: "mobile", label: "移动端" },
                    ]}
                    size="small"
                  />
                </Space>
              }
            >
              <ApiRequestTimeChart
                timeType="7d"
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
              <Col>
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
              </Col>

              <Col flex="auto">
                <Space>
                  <Text>搜索:</Text>
                  <Input
                    style={{ width: 200 }}
                    placeholder="搜索API或模块"
                    value={backendFilters.search}
                    onChange={(e) =>
                      handleBackendFilterChange("search", e.target.value)
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
              pageSize: 5,
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
                    <Option value="pageLoad">页面加载</Option>
                    <Option value="apiCall">API调用</Option>
                    <Option value="userAction">用户操作</Option>
                    <Option value="custom">自定义</Option>
                  </Select>
                </Space>
              </Col>

              <Col flex="auto">
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
              </Col>

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
              pageSize: 5,
              showSizeChanger: true,
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
              <Col>
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
              </Col>

              <Col flex="auto">
                <Space>
                  <Text>搜索:</Text>
                  <Input
                    style={{ width: 200 }}
                    placeholder="搜索设备或系统版本"
                    value={mobileFilters.search}
                    onChange={(e) =>
                      handleMobileFilterChange("search", e.target.value)
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
              pageSize: 5,
              showSizeChanger: true,
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
