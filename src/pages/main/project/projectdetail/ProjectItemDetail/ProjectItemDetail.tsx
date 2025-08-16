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

import {
  getErrorDetailAPI,
  setIssueThresholdAPI,
  getIssueThresholdAPI,
  markIssueResolvedAPI,
  getIssueStatusAPI,
} from "../../../../../api/service/issue";
import { getUserResponsibility } from "../../../../../api/service/projectoverview";

interface ErrorDetailItem {
  id: string | number;
  projectId: string | number;
  moduleId: number | string;
  type?: string;
  timestamp?: string | number | Date;
  message?: string;
  isHandled?: boolean;
  module?: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  captureType?: string;
  env?: string;
  event?: string | number;
  errorType?: string;
  breadcrumbs?: Array<{
    category?: string;
    message?: string;
    level?: string;
    timestamp?: string | number;
    data?: Record<string, any>;
    captureType?: string;
  }>;
  // JavaScript错误特有字段
  sourceCode?: string;
  filename?: string;
  jsFilename?: string;
  lineno?: number;
  colno?: number;
  // HTTP错误特有字段
  duration?: number;
  request?: {
    url: string;
    method: string;
  };
  response?: {
    status: number;
  };
  // 资源错误特有字段
  resourceType?: string;
  resourceUrl?: string;
  elementInfo?: {
    tagName: string;
    id?: string;
  };
}

const ProjectItemDetail: React.FC = () => {
  const { projectId, detailId } = useParams();
  const navigate = useNavigate();
  const [errorData, setErrorData] = useState<ErrorDetailItem | null>(null);
  const [isThresholdModalVisible, setIsThresholdModalVisible] = useState(false);
  const [thresholdForm] = Form.useForm();
  const [currentThreshold, setCurrentThreshold] = useState<number | null>(null);
  const [issueStatus, setIssueStatus] = useState<number>(0);

  //读取错误平台
  const location = useLocation();
  const { platform, errorType } = location.state;

  useEffect(() => {
    const fetchErrorDetail = async () => {
      try {
        //todo 获取普通用户是否为负责人然后再接着判断
        const issueState = await getIssueStatusAPI(
          projectId,
          errorType,
          platform
        );
        setIssueStatus(issueState.isHandle);
        const responsibleId = issueState.responsibleId;
        const currentUser = JSON.parse(localStorage.getItem("user"));
        getUserResponsibility(projectId, currentUser?.id).then((res) => {
          if (res) {
            if (res.userRole === 2 && responsibleId !== currentUser?.id) {
              message.warning("您无权查看此错误详情，请联系项目管理员");
              navigate(`/main/project/${projectId}/detail/issues`);
              return;
            }
          }
        });

        const response = await getErrorDetailAPI(detailId, platform);
        //将获取到的数据中的面包屑中的category为performance的去掉
        if (response?.breadcrumbs) {
          response.breadcrumbs = response.breadcrumbs.filter(
            (item: any) => item.category !== "performance"
          );
        }

        //获取阈值
        const res = await getIssueThresholdAPI(projectId, errorType, platform);
        if (res) {
          setCurrentThreshold(res.threshold);
        }

        setErrorData(response);
      } catch (error) {
        console.error("获取错误详情失败:", error);
        message.error("获取错误详情失败");
      }
    };

    if (detailId && platform) {
      fetchErrorDetail();
    }
  }, [detailId, platform]);

  // 格式化时间戳
  const formatTimestamp = (timestamp: string | number | Date) => {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
  };

  const handleSetThreshold = async (values: { threshold: number }) => {
    try {
      // 这里应该调用实际的API来设置阈值
      await setIssueThresholdAPI(
        projectId,
        errorData?.errorType,
        platform,
        values.threshold
      );

      setCurrentThreshold(values.threshold);
      setIsThresholdModalVisible(false);
      //将表单重置
      thresholdForm.resetFields();
      message.success("阈值设置成功");
    } catch (error) {
      message.error("阈值设置失败");
    }
  };

  // 添加标记为已解决的函数
  const handleMarkAsResolved = async () => {
    try {
      // 调用API切换问题状态
      await markIssueResolvedAPI(projectId, platform, errorType);

      // 切换状态：如果是已解决(1)则改为未解决(0)，如果是未解决(0)则改为已解决(1)
      setIssueStatus((prevStatus) => (prevStatus === 1 ? 0 : 1));
      message.success(`问题已标记为${issueStatus === 1 ? "未解决" : "已解决"}`);
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
  const renderActionButtons = () => {
    const isUnassigned = issueStatus === -1;
    const isResolved = issueStatus === 1;

    return (
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<SettingOutlined />} onClick={showThresholdModal}>
          设置阈值
        </Button>

        <Popconfirm
          title={`确认标记为${isResolved ? "未解决" : "已解决"}?`}
          description={
            isUnassigned
              ? "该问题无人负责，请先指派负责人"
              : `确认后该问题将被标记为${isResolved ? "未解决" : "已解决"}状态`
          }
          onConfirm={isUnassigned ? undefined : handleMarkAsResolved}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ disabled: isUnassigned }}
        >
          <Button
            type="primary"
            icon={<CheckOutlined />}
            disabled={isUnassigned}
          >
            {isUnassigned ? "无人负责" : isResolved ? "已解决" : "标记为已解决"}
          </Button>
        </Popconfirm>
      </Space>
    );
  };

  // 渲染面包屑
  const renderBreadcrumbs = (breadcrumbs?: ErrorDetailItem["breadcrumbs"]) => {
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
                  {Object.entries(breadcrumb.data).map(([key, value]) => (
                    <div key={key}>
                      {key}: {String(value)}
                    </div>
                  ))}
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

  // 渲染源代码
  const renderSourceCode = (sourceCode?: string) => {
    if (!sourceCode) {
      return <Text type="secondary">无源代码信息</Text>;
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
        {sourceCode}
      </pre>
    );
  };

  // 渲染基本信息
  const renderBasicInfo = (data: ErrorDetailItem) => (
    <Descriptions title="基本信息" bordered column={1}>
      <Descriptions.Item label="错误ID">{data.id}</Descriptions.Item>
      {data.errorType && (
        <Descriptions.Item label="错误类型">{data.errorType}</Descriptions.Item>
      )}
      {data.message && (
        <Descriptions.Item label="错误信息">{data.message}</Descriptions.Item>
      )}
      {data.timestamp && (
        <Descriptions.Item label="发生时间">
          {formatTimestamp(data.timestamp)}
        </Descriptions.Item>
      )}
      {data.url && (
        <Descriptions.Item label="页面URL">{data.url}</Descriptions.Item>
      )}
      {data.userAgent && (
        <Descriptions.Item label="浏览器信息">
          {data.userAgent}
        </Descriptions.Item>
      )}
      {data.env && (
        <Descriptions.Item label="环境">{data.env}</Descriptions.Item>
      )}
      {data.filename && (
        <Descriptions.Item label="文件名">{data.filename}</Descriptions.Item>
      )}
      {data.jsFilename && (
        <Descriptions.Item label="JS文件名">
          {data.jsFilename}
        </Descriptions.Item>
      )}
      {data.lineno && (
        <Descriptions.Item label="行号">{data.lineno}</Descriptions.Item>
      )}
      {data.colno && (
        <Descriptions.Item label="列号">{data.colno}</Descriptions.Item>
      )}
      {data.duration !== undefined && data.duration !== null && (
        <Descriptions.Item label="请求耗时">
          {data.duration} ms
        </Descriptions.Item>
      )}
    </Descriptions>
  );

  // 渲染请求信息
  const renderRequestInfo = (data: ErrorDetailItem) => {
    if (!data.request && !data.response) {
      return null;
    }

    return (
      <Descriptions title="请求信息" bordered column={1}>
        {data.request?.url && (
          <Descriptions.Item label="请求URL">
            {data.request.url}
          </Descriptions.Item>
        )}
        {data.request?.method && (
          <Descriptions.Item label="请求方法">
            {data.request.method}
          </Descriptions.Item>
        )}
        {data.response?.status && (
          <Descriptions.Item label="响应状态码">
            <Tag color={data.response.status === 200 ? "green" : "red"}>
              {data.response.status}
            </Tag>
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  // 渲染资源信息
  const renderResourceInfo = (data: ErrorDetailItem) => {
    if (!data.resourceType && !data.resourceUrl && !data.elementInfo) {
      return null;
    }

    return (
      <Descriptions title="资源信息" bordered column={1}>
        {data.resourceType && (
          <Descriptions.Item label="资源类型">
            {data.resourceType}
          </Descriptions.Item>
        )}
        {data.resourceUrl && (
          <Descriptions.Item label="资源URL">
            {data.resourceUrl}
          </Descriptions.Item>
        )}
        {data.elementInfo?.tagName && (
          <Descriptions.Item label="元素标签">
            {data.elementInfo.tagName}
          </Descriptions.Item>
        )}
        {data.elementInfo?.id && (
          <Descriptions.Item label="元素ID">
            {data.elementInfo.id}
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  // 渲染内容
  const renderContent = () => {
    if (!errorData) {
      return <Text>加载中...</Text>;
    }

    return (
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        {renderBasicInfo(errorData)}

        {renderRequestInfo(errorData)}

        {renderResourceInfo(errorData)}

        {errorData.sourceCode && (
          <Card title="源代码" size="small">
            {renderSourceCode(errorData.sourceCode)}
          </Card>
        )}

        <Card title="面包屑" size="small">
          {renderBreadcrumbs(errorData.breadcrumbs)}
        </Card>

        {errorData.stack && (
          <Card title="错误堆栈" size="small">
            {renderStackTrace(errorData.stack)}
          </Card>
        )}
      </Space>
    );
  };

  // 返回到上一个页面
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ padding: "5px", marginRight: 12 }}
        >
          返回
        </Button>
        <Title level={4} style={{ margin: 0, fontSize: "24px" }}>
          错误详情
        </Title>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
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
            <Text
              type="secondary"
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              当前阈值:
              <Text strong>
                {currentThreshold !== null ? currentThreshold : "10"}
              </Text>
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectItemDetail;
