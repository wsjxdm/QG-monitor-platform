import React from "react";
import ProjectHeader from "./component/Header";
import { Card, List, Avatar, Typography, Space } from "antd";
import {
  ProjectOutlined,
  UnlockOutlined,
  LockOutlined,
  BarChartOutlined,
  BugOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

// 模拟项目数据
const mockProjects = [
  {
    id: "project-1",
    name: "电商平台监控",
    description: "电商网站的前端监控项目，包含错误收集、性能监控等功能",
    is_public: true,
    errorCount: 12,
    performanceScore: 85,
  },
  {
    id: "project-2",
    name: "企业管理系统",
    description: "内部OA系统的监控，重点关注用户行为和系统稳定性",
    is_public: false,
    errorCount: 3,
    performanceScore: 92,
  },
  {
    id: "project-3",
    name: "移动端应用",
    description: "手机APP的性能监控，关注启动时间、内存使用等指标",
    is_public: true,
    errorCount: 8,
    performanceScore: 78,
  },
];
const ProjectPublic: React.FC = () => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/main/project/${projectId}/detail/overview`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>公开项目</Title>

      {/* 项目头部组件 */}
      <ProjectHeader />

      {/* 项目列表 */}
      <Card style={{ marginTop: "20px" }}>
        <List
          grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
          dataSource={mockProjects}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleProjectClick(item.id)}
                cover={
                  <div
                    style={{
                      height: "120px",
                      background: "#f0f2f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ProjectOutlined
                      style={{ fontSize: "48px", color: "#1890ff" }}
                    />
                  </div>
                }
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      icon={
                        item.is_public ? <UnlockOutlined /> : <LockOutlined />
                      }
                      style={{
                        backgroundColor: item.is_public ? "#52c41a" : "#1890ff",
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{item.name}</Text>
                      {item.is_public ? (
                        <span
                          style={{
                            background: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            borderRadius: "2px",
                            padding: "0 4px",
                            fontSize: "12px",
                            color: "#52c41a",
                          }}
                        >
                          公开
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#e6f7ff",
                            border: "1px solid #91d5ff",
                            borderRadius: "2px",
                            padding: "0 4px",
                            fontSize: "12px",
                            color: "#1890ff",
                          }}
                        >
                          私有
                        </span>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{item.description}</Text>
                      <div
                        style={{
                          marginTop: "8px",
                          display: "flex",
                          gap: "16px",
                        }}
                      >
                        <Text type="danger">
                          <BugOutlined /> {item.errorCount} 错误
                        </Text>
                        <Text type="success">
                          <BarChartOutlined /> {item.performanceScore} 分
                        </Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
export default ProjectPublic;
