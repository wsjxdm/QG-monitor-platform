import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Space,
  Descriptions,
  Timeline,
  Tag,
  Collapse,
  Modal,
  InputNumber,
  Form,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// 普通错误
interface ErrorItem {
  id: string;
  projectId: string | number;
  moduleId: number | string;
  type: string;
  timestamp: string | number | Date;
  message?: string;
  isHandled: boolean;
  stack?: string;
  userAgent: string;
  url: string;
  captureType: string;
  breadcrumbs?: Array<{
    category?: string;
    message?: string;
    level?: string;
    timestamp?: string;
    data?: {
      title?: string;
      referrer?: string;
      timestamp?: string | number;
    };
    captureType?: string;
  }>;
  env: string;
  event: string | number;
  errorType?: string;
  tag?: [
    environment?: string,
    version?: string,
    userId?: string,
    custonField?: string
  ];
}

// HTTP错误，包含ErrorItem的内容，以及其他特有的错误信息
interface HttpErrorItem extends ErrorItem {
  duration: number;
  errorType: string;
  message: string;
  request?: {
    url: string;
    method: string;
  };
  response?: {
    status: number;
  };
}

// 资源请求错误
interface ResourceErrorItem extends ErrorItem {
  errorType: string;
  message: string;
  resourceType: string;
  resourceUrl: string;
  elementInfo?: {
    tagName: string;
    id?: string;
  };
}

const ProjectItemDetail: React.FC = () => {
  const { projectId, type, detailId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [errorData, setErrorData] = useState<
    ErrorItem | HttpErrorItem | ResourceErrorItem | null
  >(null);
  const [isThresholdModalVisible, setIsThresholdModalVisible] = useState(false);
  const [thresholdForm] = Form.useForm();
  const [currentThreshold, setCurrentThreshold] = useState<number | null>(null);

  // 添加已解决状态
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    // 模拟获取错误详情数据
    // 实际项目中应该通过API获取真实数据
    if (state?.errorData) {
      setErrorData(state.errorData);
    } else {
      // 模拟数据
      const mockData: Record<string, any> = {
        error: {
          id: detailId,
          projectId: projectId,
          moduleId: "module-1",
          type: "javascript",
          timestamp: new Date().toISOString(),
          message: "Uncaught ReferenceError: undefinedVariable is not defined",
          isHandled: false,
          stack:
            "ReferenceError: undefinedVariable is not defined\n    at someFunction (app.js:15:10)\n    at HTMLButtonElement.onclick (index.html:25:13)",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          url: "https://example.com/page",
          captureType: "error",
          breadcrumbs: [
            {
              category: "navigation",
              message: "Page loaded",
              timestamp: new Date(Date.now() - 10000).toISOString(),
              data: {
                title: "Example Page",
                referrer: "https://google.com",
              },
            },
            {
              category: "ui.click",
              message: "Button clicked",
              timestamp: new Date(Date.now() - 5000).toISOString(),
            },
            {
              category: "error",
              message: "ReferenceError occurred",
              timestamp: new Date().toISOString(),
            },
          ],
          env: "production",
          event: "error-event-123",
          errorType: "ReferenceError",
        },
        http: {
          id: detailId,
          projectId: projectId,
          moduleId: "module-2",
          type: "http",
          timestamp: new Date().toISOString(),
          message:
            "Failed to load resource: the server responded with a status of 500",
          isHandled: false,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          url: "https://example.com/api/data",
          captureType: "http",
          env: "production",
          event: "http-error-456",
          errorType: "HttpError",
          duration: 1250,
          request: {
            url: "https://api.example.com/data",
            method: "GET",
          },
          response: {
            status: 500,
          },
        },
        resource: {
          id: detailId,
          projectId: projectId,
          moduleId: "module-3",
          type: "resource",
          timestamp: new Date().toISOString(),
          message: "Failed to load image",
          isHandled: false,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          url: "https://example.com/page",
          captureType: "resource",
          env: "production",
          event: "resource-error-789",
          errorType: "ResourceError",
          resourceType: "image",
          resourceUrl: "https://example.com/images/missing.png",
          elementInfo: {
            tagName: "IMG",
            id: "logo",
          },
        },
      };

      setErrorData(mockData[type as string] || null);
    }
  }, [projectId, type, detailId, state]);

  // 格式化时间戳
  const formatTimestamp = (timestamp: string | number | Date) => {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
  };

  const handleSetThreshold = async (values: { threshold: number }) => {
    try {
      // 这里应该调用实际的API来设置阈值
      // await setIssueThresholdAPI(detailId, values.threshold);

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentThreshold(values.threshold);
      setIsThresholdModalVisible(false);
      message.success("阈值设置成功");
    } catch (error) {
      message.error("阈值设置失败");
    }
  };

  // 添加标记为已解决的函数
  const handleMarkAsResolved = async () => {
    try {
      // 这里应该调用实际的API来标记问题为已解决
      // await markIssueAsResolvedAPI(detailId);

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsResolved(true);
      message.success("问题已标记为已解决");
    } catch (error) {
      message.error("标记失败，请重试");
    }
  };

  // 显示阈值设置弹窗
  const showThresholdModal = () => {
    thresholdForm.setFieldsValue({ threshold: currentThreshold });
    setIsThresholdModalVisible(true);
  };

  // 渲染操作按钮
  const renderActionButtons = () => (
    <Space style={{ marginBottom: 16 }}>
      <Button icon={<SettingOutlined />} onClick={showThresholdModal}>
        设置阈值
      </Button>

      <Popconfirm
        title="确认标记为已解决?"
        description="确认后该问题将被标记为已解决状态"
        onConfirm={handleMarkAsResolved}
        okText="确认"
        cancelText="取消"
      >
        <Button type="primary" icon={<CheckOutlined />} disabled={isResolved}>
          {isResolved ? "已解决" : "标记为已解决"}
        </Button>
      </Popconfirm>
    </Space>
  );

  // 渲染面包屑
  const renderBreadcrumbs = (breadcrumbs?: ErrorItem["breadcrumbs"]) => {
    if (!breadcrumbs || breadcrumbs.length === 0) {
      return <Text type="secondary">无面包屑信息</Text>;
    }

    return (
      <Timeline>
        {breadcrumbs.map((breadcrumb, index) => (
          <Timeline.Item key={index}>
            <div>
              <Text strong>{breadcrumb.message || "无消息"}</Text>
              <br />
              <Text type="secondary">
                {breadcrumb.category} -{" "}
                {formatTimestamp(breadcrumb.timestamp || new Date())}
              </Text>
              {breadcrumb.data && (
                <div style={{ marginTop: 8 }}>
                  {breadcrumb.data.title && (
                    <div>页面标题: {breadcrumb.data.title}</div>
                  )}
                  {breadcrumb.data.referrer && (
                    <div>来源页面: {breadcrumb.data.referrer}</div>
                  )}
                </div>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  // 渲染错误堆栈
  const renderStackTrace = (stack?: string) => {
    if (!stack) {
      return <Text type="secondary">无堆栈信息</Text>;
    }

    return (
      <pre
        style={{
          background: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          overflowX: "auto",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
        }}
      >
        {stack}
      </pre>
    );
  };

  // 渲染普通错误详情
  const renderErrorDetails = (data: ErrorItem) => (
    <Space direction="vertical" size="middle" style={{ display: "flex" }}>
      <Descriptions title="基本信息" bordered column={1}>
        <Descriptions.Item label="错误ID">{data.id}</Descriptions.Item>
        <Descriptions.Item label="错误类型">{data.errorType}</Descriptions.Item>
        <Descriptions.Item label="错误信息">{data.message}</Descriptions.Item>
        <Descriptions.Item label="发生时间">
          {formatTimestamp(data.timestamp)}
        </Descriptions.Item>
        <Descriptions.Item label="页面URL">{data.url}</Descriptions.Item>
        <Descriptions.Item label="浏览器信息">
          {data.userAgent}
        </Descriptions.Item>
        <Descriptions.Item label="环境">{data.env}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={data.isHandled ? "green" : "red"}>
            {data.isHandled ? "已处理" : "未处理"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Card title="面包屑" size="small">
        {renderBreadcrumbs(data.breadcrumbs)}
      </Card>

      <Card title="错误堆栈" size="small">
        {renderStackTrace(data.stack)}
      </Card>
    </Space>
  );

  // 渲染HTTP错误详情
  const renderHttpErrorDetails = (data: HttpErrorItem) => (
    <Space direction="vertical" size="middle" style={{ display: "flex" }}>
      <Descriptions title="基本信息" bordered column={1}>
        <Descriptions.Item label="错误ID">{data.id}</Descriptions.Item>
        <Descriptions.Item label="错误类型">{data.errorType}</Descriptions.Item>
        <Descriptions.Item label="错误信息">{data.message}</Descriptions.Item>
        <Descriptions.Item label="发生时间">
          {formatTimestamp(data.timestamp)}
        </Descriptions.Item>
        <Descriptions.Item label="页面URL">{data.url}</Descriptions.Item>
        <Descriptions.Item label="浏览器信息">
          {data.userAgent}
        </Descriptions.Item>
        <Descriptions.Item label="环境">{data.env}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={data.isHandled ? "green" : "red"}>
            {data.isHandled ? "已处理" : "未处理"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Descriptions title="请求信息" bordered column={1}>
        <Descriptions.Item label="请求URL">
          {data.request?.url}
        </Descriptions.Item>
        <Descriptions.Item label="请求方法">
          {data.request?.method}
        </Descriptions.Item>
        <Descriptions.Item label="响应状态码">
          <Tag color={data.response?.status === 200 ? "green" : "red"}>
            {data.response?.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="请求耗时">
          {data.duration} ms
        </Descriptions.Item>
      </Descriptions>

      <Card title="面包屑" size="small">
        {renderBreadcrumbs(data.breadcrumbs)}
      </Card>
    </Space>
  );

  // 渲染资源错误详情
  const renderResourceErrorDetails = (data: ResourceErrorItem) => (
    <Space direction="vertical" size="middle" style={{ display: "flex" }}>
      <Descriptions title="基本信息" bordered column={1}>
        <Descriptions.Item label="错误ID">{data.id}</Descriptions.Item>
        <Descriptions.Item label="错误类型">{data.errorType}</Descriptions.Item>
        <Descriptions.Item label="错误信息">{data.message}</Descriptions.Item>
        <Descriptions.Item label="发生时间">
          {formatTimestamp(data.timestamp)}
        </Descriptions.Item>
        <Descriptions.Item label="页面URL">{data.url}</Descriptions.Item>
        <Descriptions.Item label="浏览器信息">
          {data.userAgent}
        </Descriptions.Item>
        <Descriptions.Item label="环境">{data.env}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={data.isHandled ? "green" : "red"}>
            {data.isHandled ? "已处理" : "未处理"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Descriptions title="资源信息" bordered column={1}>
        <Descriptions.Item label="资源类型">
          {data.resourceType}
        </Descriptions.Item>
        <Descriptions.Item label="资源URL">
          {data.resourceUrl}
        </Descriptions.Item>
        {data.elementInfo && (
          <>
            <Descriptions.Item label="元素标签">
              {data.elementInfo.tagName}
            </Descriptions.Item>
            {data.elementInfo.id && (
              <Descriptions.Item label="元素ID">
                {data.elementInfo.id}
              </Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>

      <Card title="面包屑" size="small">
        {renderBreadcrumbs(data.breadcrumbs)}
      </Card>
    </Space>
  );

  // 根据类型显示不同的内容
  const renderContent = () => {
    if (!errorData) {
      return <Text>加载中...</Text>;
    }

    switch (type) {
      case "error":
        return renderErrorDetails(errorData as ErrorItem);
      case "http":
        return renderHttpErrorDetails(errorData as HttpErrorItem);
      case "resource":
        return renderResourceErrorDetails(errorData as ResourceErrorItem);
      default:
        return (
          <Descriptions title="详情信息" bordered column={1}>
            <Descriptions.Item label="类型">{type}</Descriptions.Item>
            <Descriptions.Item label="ID">{detailId}</Descriptions.Item>
          </Descriptions>
        );
    }
  };

  // 返回到上一个页面
  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          返回
        </Button>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Title level={2}>项目 {projectId} - 错误详情</Title>

          {/* 添加操作按钮 */}
          {renderActionButtons()}

          {renderContent()}
        </Space>
      </Card>

      {/* 阈值设置弹窗 */}
      <Modal
        title="设置问题阈值"
        open={isThresholdModalVisible}
        onCancel={() => setIsThresholdModalVisible(false)}
        onOk={() => thresholdForm.submit()}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={thresholdForm}
          onFinish={handleSetThreshold}
          layout="vertical"
        >
          <Form.Item
            name="threshold"
            label="阈值"
            rules={[{ required: true, message: "请输入阈值" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入阈值"
              min={0}
            />
          </Form.Item>
          <div>
            <Text type="secondary">
              当前阈值:{" "}
              {currentThreshold !== null ? currentThreshold : "未设置"}
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectItemDetail;
