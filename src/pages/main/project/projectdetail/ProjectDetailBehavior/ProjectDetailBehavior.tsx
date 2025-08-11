// ProjectDetailBehavior.tsx
import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { DualAxes } from "@ant-design/plots";
import { Select, Row, Col, Card, Typography, Spin } from "antd";

const { Title } = Typography;
const { Option } = Select;

interface Behavior {
  id: number;
  projectId: string | number;
  timeStamp: string | Date;
  sessionId?: string;
  userAgent?: string;
  breadcrumbs?: {
    category?: string;
    message?: string;
    level?: string;
    timestamp?: string;
    data: { title?: string; referer?: string };
    captureType?: string;
  }[];
  pageInfo?: {
    title: string;
    stayTime: number | string;
  };
  captureType: string;
}

// 埋点数据图表
const BuryPointDetail: React.FC<{ timeType: string; projectId: string }> = ({
  timeType,
  projectId,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuryPointData();
  }, [timeType, projectId]);

  const fetchBuryPointData = async () => {
    setLoading(true);
    try {
      // 调用实际API获取埋点数据
      // const response = await getBuryPointDataAPI({ timeType, projectId });
      const response = {
        data: [
          { label: "点击", value: 100 },
          { label: "曝光", value: 200 },
          { label: "提交", value: 150 },
          { label: "错误", value: 50 },
          { label: "页面加载", value: 300 },
          { label: "表单提交", value: 80 },
          { label: "自定义事件", value: 120 },
          { label: "资源加载", value: 90 },
          { label: "网络请求", value: 40 },
          { label: "页面跳转", value: 60 },
          { label: "用户行为", value: 70 },
          { label: "性能数据", value: 110 },
          { label: "其他", value: 100 },
          { label: "自定义事件", value: 120 },
        ],
      };
      setData(response.data || []);
    } catch (error) {
      console.error("获取埋点数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data,
    xField: "label",
    yField: "value",
    loading: loading,
    style: {
      maxWidth: 50, // 限制最大宽度
    },
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? <Spin /> : <Column autoFit {...config} />}
    </div>
  );
};

// 页面数据图表
const PageData: React.FC<{ timeType: string; projectId: string }> = ({
  timeType,
  projectId,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPageData();
  }, [timeType, projectId]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      // 调用实际API获取页面数据
      // const response = await getPageDataAPI({ timeType, projectId });
      const response = {
        data: [
          { label: "首页", pt: 50, enterCount: 100 },
          { label: "详情页", pt: 30, enterCount: 80 },
          { label: "购物车", pt: 20, enterCount: 60 },
          { label: "订单页", pt: 10, enterCount: 40 },
          { label: "支付页", pt: 5, enterCount: 20 },
          { label: "注册页", pt: 2, enterCount: 10 },
          { label: "登录页", pt: 1, enterCount: 5 },
          { label: "404", pt: 0, enterCount: 0 },
        ],
      };
      setData(response.data || []);
    } catch (error) {
      console.error("获取页面数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    xField: "label",
    data,
    legend: {
      color: {
        itemMarker: (v: string) => {
          if (v === "pt") return "rect";
          return "smooth";
        },
      },
    },
    scale: { y: { domainMax: 100 } },
    children: [
      {
        type: "interval",
        yField: "pt",
        axis: { y: { position: "left" } },
        style: {
          maxWidth: 50, // 限制柱子最大宽度
        },
      },
      {
        type: "line",
        yField: "enterCount",
        shapeField: "smooth",
        scale: { color: { relations: [["enterCount", "#fdae6b"]] } },
        axis: { y: { position: "right" } },
        style: { lineWidth: 2 },
      },
    ],
    loading: loading,
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? <Spin /> : <DualAxes autoFit {...config} />}
    </div>
  );
};

// 表单数据
const FormData: React.FC<{ timeType: string; projectId: string }> = ({
  timeType,
  projectId,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, [timeType, projectId]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      // 调用实际API获取表单数据
      // const response = await getFormDataAPI({ timeType, projectId });
      const response = {
        data: [
          { label: "登录表单", count: 200, rate: 0.75, smooth: "smooth" },
          { label: "注册表单", count: 100, rate: 0.5, smooth: "smooth" },
          { label: "修改密码表单", count: 50, rate: 0.25, smooth: "smooth" },
          { label: "忘记密码表单", count: 25, rate: 0.1, smooth: "smooth" },
          { label: "反馈表单", count: 10, rate: 0.05, smooth: "smooth" },

          { label: "反馈表单", count: 10, rate: 0.05, smooth: "smooth" },
          { label: "搜索表单", count: 5, rate: 0.02, smooth: "smooth" },
          { label: "评论表单", count: 3, rate: 0.01, smooth: "smooth" },
          { label: "订阅表单", count: 2, rate: 0.005, smooth: "smooth" },
          { label: "联系表单", count: 1, rate: 0.002, smooth: "smooth" },
        ],
      };
      setData(response.data || []);
    } catch (error) {
      console.error("获取表单数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    xField: "label",
    data,
    legend: {
      color: {
        itemMarker: (v: string) => {
          if (v === "count") return "rect";
          return "smooth";
        },
      },
    },
    scale: {
      y: {
        domainMax: 200,
      },
      y1: {
        domainMax: 1, // 为比率轴设置合适的最大值
      },
    },
    children: [
      {
        type: "interval",
        yField: "count",
        axis: { y: { position: "left" } },
        style: {
          maxWidth: 50, // 限制柱子最大宽度
          maxHeight: 0.8, // 限制柱子最大高度
        },
      },
      {
        type: "line",
        yField: "rate",
        shapeField: "smooth",
        scale: {
          color: { relations: [["rate", "#fdae6b"]] },
          y: { domainMax: 1 }, // 为比率设置独立的y轴范围
        },
        axis: {
          y: {
            position: "right",
            labelFormatter: (val: number) => (val * 100).toFixed(0) + "%", // 显示为百分比
          },
        },
        style: { lineWidth: 2 },
      },
    ],
    loading: loading,
  };

  return (
    <div style={{ height: 300 }}>
      {loading ? <Spin /> : <DualAxes autoFit {...config} />}
    </div>
  );
};

// 平台访问量
const PlatformData: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeType, setTimeType] = useState("7d"); // 时间筛选移到组件内部

  // 时间筛选选项
  const timeOptions = [
    { value: "1d", label: "近1天" },
    { value: "7d", label: "近7天" },
    { value: "30d", label: "近30天" },
    { value: "90d", label: "近90天" },
  ];

  useEffect(() => {
    fetchPlatformData();
  }, [timeType, projectId]);

  const fetchPlatformData = async () => {
    setLoading(true);
    try {
      // 调用实际API获取平台数据
      // const response = await getPlatformDataAPI({ timeType, projectId });
      const response = {
        data: [
          { time: "2023-01-01", value: 0.6 },
          { time: "2023-01-02", value: 0.7 },
          { time: "2023-01-03", value: 0.8 },
          { time: "2023-01-04", value: 0.5 },
          { time: "2023-01-05", value: 0.9 },
          { time: "2023-01-06", value: 0.4 },
          { time: "2023-01-07", value: 0.6 },
          { time: "2023-01-08", value: 0.7 },
          { time: "2023-01-09", value: 0.8 },
          { time: "2023-01-10", value: 0.5 },
          { time: "2023-01-11", value: 0.9 },
          { time: "2023-01-12", value: 0.4 },
          { time: "2023-01-13", value: 0.6 },
          { time: "2023-01-14", value: 0.7 },
          { time: "2023-01-15", value: 0.8 },
          { time: "2023-01-16", value: 0.5 },
          { time: "2023-01-17", value: 0.9 },
          { time: "2023-01-18", value: 0.4 },
          { time: "2023-01-19", value: 0.6 },
          { time: "2023-01-20", value: 0.7 },
          { time: "2023-01-21", value: 0.8 },
          { time: "2023-01-22", value: 0.5 },
          { time: "2023-01-23", value: 0.9 },
          { time: "2023-01-24", value: 0.4 },
          { time: "2023-01-25", value: 0.6 },
          { time: "2023-01-26", value: 0.7 },
          { time: "2023-01-27", value: 0.8 },
          { time: "2023-01-28", value: 0.5 },
          { time: "2023-01-29", value: 0.9 },
          { time: "2023-01-30", value: 0.4 },
        ],
      };
      setData(response.data || []);
    } catch (error) {
      console.error("获取平台数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data,
    xField: "time",
    yField: "value",
    label: {
      text: (d: any) => `${(d.value * 100).toFixed(1)}%`,
      textBaseline: "bottom",
    },
    axis: {
      y: {
        labelFormatter: ".0%",
      },
    },
    style: {
      // 圆角样式
      radiusTopLeft: 10,
      radiusTopRight: 10,
    },
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
          value={timeType}
          style={{ width: 120 }}
          onChange={setTimeType}
          options={timeOptions}
        />
      </div>
      <div style={{ height: 300 }}>
        {loading ? <Spin /> : <Column autoFit {...config} />}
      </div>
    </div>
  );
};

const ProjectDetailBehavior: React.FC = () => {
  const projectId = "1"; // 这里应该从路由参数中获取projectId

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>项目行为分析</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="埋点数据" bordered={false}>
            <BuryPointDetail timeType="7d" projectId={projectId} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="页面数据" bordered={false}>
            <PageData timeType="7d" projectId={projectId} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="表单数据" bordered={false}>
            <FormData timeType="7d" projectId={projectId} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="平台访问量" bordered={false}>
            <PlatformData projectId={projectId} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailBehavior;
