import React, { useEffect, useMemo, useState } from "react";
import { Column } from "@ant-design/plots";
import { DualAxes } from "@ant-design/plots";
import { Select, Row, Col, Card, Typography, Spin, Empty } from "antd";

const { Title } = Typography;
const { Option } = Select;
import { useParams } from "react-router-dom";
import {
  getPageDataAPI,
  getPlatformDataAPI,
  getBuryPointDataAPI,
  getButtonClickDataAPI,
} from "../../../../../api/service/Behavior";
import processTimeData from "../../../../../utils/addTime";

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
      const response = await getBuryPointDataAPI(
        projectId,
        startTimeStr,
        endTimeStr
      );
      //对数据进行处理，如果label超过5个字符则截断并添加省略号
      // const processedData = response.map((item: any) => ({
      //   ...item,
      //   label:
      //     item.label.length > 5 ? item.label.slice(0, 5) + "…" : item.label,
      // }));
      console.log("埋点数据响应:", response);
      setData(response);
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

// 页面数据图表
const PageData: React.FC<{ timeType: string; projectId: string }> = ({
  timeType,
  projectId,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localTimeType, setLocalTimeType] = useState(timeType); // 使用本地状态管理时间类型

  // 时间筛选选项
  const timeOptions = [
    { value: "day", label: "近1天" },
    { value: "week", label: "近7天" },
    { value: "month", label: "近30天" },
  ];

  useEffect(() => {
    fetchPageData();
  }, [localTimeType, projectId]); // 使用本地时间类型

  const fetchPageData = async () => {
    setLoading(true);
    try {
      // 计算时间范围
      const endTime = new Date();
      const startTime = new Date();

      switch (localTimeType) {
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

      console.log(
        "开始时间:",
        startTimeStr,
        "结束时间:",
        endTimeStr,
        "projectId:",
        projectId
      );

      // 调用实际API获取页面数据，传递时间参数
      const response = await getPageDataAPI(
        projectId,
        startTimeStr,
        endTimeStr
      );
      console.log("页面数据响应:", response);
      const res = response.map((item: any) => ({
        ...item,
        label: item.route,
        pt: item.avgTotalTime,
        enterCount: item.samples,
      }));
      setData(res || []);
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
    <div>
      {/* 独立的时间筛选器 */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Select
          value={localTimeType}
          style={{ width: 120 }}
          onChange={setLocalTimeType} // 更新本地时间类型
          options={timeOptions}
        />
      </div>

      <div style={{ height: 300 }}>
        {loading ? (
          <Spin />
        ) : data.length > 0 ? (
          <DualAxes autoFit {...config} />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

// 按钮数据
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
      const response = await getButtonClickDataAPI(projectId);
      const processedData = response.map((item: any) => ({
        ...item,
        label: item.buttonId,
        count: item.eventCount,
      }));
      setData(processedData || []);
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

// 平台访问量
const PlatformData: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeType, setTimeType] = useState("day");

  // 时间筛选选项
  const timeOptions = [
    { value: "day", label: "近1天" },
    { value: "week", label: "近7天" },
    { value: "month", label: "近30天" },
  ];

  useEffect(() => {
    fetchPlatformData();
  }, [timeType, projectId]);

  const [hasData, setHasData] = useState(false);

  const fetchPlatformData = async () => {
    setLoading(true);
    try {
      const response = await getPlatformDataAPI(projectId, timeType);
      for (const item of response) {
        if (item > 0) {
          setHasData(true);
          console.log(
            "%c [ ]-111",
            "color: #f00; font-weight: bold;background: #fff;width: 100%;"
          );
          break;
        }
      }
      const res = processTimeData(response, timeType);

      setData(res);
    } catch (error) {
      console.error("获取平台数据失败:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 修改图表配置以支持大数据量显示
  const config = {
    data,
    xField: "time",
    yField: "value",
    style: {
      // minWidth: "100px",
    },
    // 添加滚动条支持
    // scrollbar: {
    //   x: { ratio: 0.7 }, // 显示70%的数据范围
    // },
    // 调整轴标签避免重叠
    axis: {
      x: {
        label: {
          autoHide: true, // 自动隐藏重叠标签
          autoRotate: true, // 自动旋转标签
          formatter: (text: string) => {
            if (timeType === "day") {
              return text.split(" ")[1]?.substring(0, 5) || text; // 只显示小时:分钟
            }
            return text.substring(5); // 去掉年份，只显示月日
          },
        },
        title: false,
      },
      y: {
        label: {
          formatter: (value: number) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}k`; // 千位简化
            }
            return value;
          },
        },
      },
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
          maxWidth: "150px",
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
        {loading ? (
          <Spin />
        ) : hasData ? (
          <Column autoFit {...config} />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

const ProjectDetailBehavior: React.FC = () => {
  //从路由中获取项目id
  const { projectId } = useParams();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>项目行为分析</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="埋点数据" bordered={false}>
            <BuryPointDetail timeType="day" projectId={projectId} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="页面数据" bordered={false}>
            <PageData timeType="day" projectId={projectId} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="按钮数据" bordered={false}>
            <FormData timeType="day" projectId={projectId} />
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
