import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Typography, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProjectItemDetail: React.FC = () => {
  const { projectId, type, detailId } = useParams();
  const navigate = useNavigate();

  // 根据类型显示不同的标题和内容
  const renderContent = () => {
    switch (type) {
      case "error":
        return (
          <>
            <Title level={3}>错误详情</Title>
            <Text strong>错误ID:</Text> {detailId}
            <br />
            <Text strong>错误类型:</Text> JavaScript运行时错误
            <br />
            <Text strong>错误信息:</Text> Uncaught ReferenceError:
            undefinedVariable is not defined
            <br />
            <Text strong>发生时间:</Text> 2023-07-15 14:30:22
            <br />
            <Text strong>浏览器:</Text> Chrome 115.0.0.0
            <br />
            <Text strong>操作系统:</Text> Windows 10
          </>
        );
      case "performance":
        return (
          <>
            <Title level={3}>性能详情</Title>
            <Text strong>性能ID:</Text> {detailId}
            <br />
            <Text strong>页面URL:</Text> https://example.com/dashboard
            <br />
            <Text strong>加载时间:</Text> 2.3秒
            <br />
            <Text strong>DOMContentLoaded:</Text> 1.1秒
            <br />
            <Text strong>首次绘制:</Text> 0.8秒
          </>
        );
      default:
        return (
          <>
            <Title level={3}>详情</Title>
            <Text strong>类型:</Text> {type}
            <br />
            <Text strong>ID:</Text> {detailId}
          </>
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
          <Title level={2}>项目 {projectId} - 详情信息</Title>
          {renderContent()}
        </Space>
      </Card>
    </div>
  );
};

export default ProjectItemDetail;
