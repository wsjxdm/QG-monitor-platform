import React, { useState } from "react";
import ProjectHeader from "./component/Header";
import {
  Typography,
  Card,
  List,
  Avatar,
  Space,
  Tag,
  Button,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UnlockOutlined,
  LockOutlined,
  CopyOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

// 模拟公开项目数据
const mockPublicProjects = [
  {
    id: "project-1",
    name: "电商平台监控",
    invited_code: "PUB1A2B3C4D5E6F",
    description: "电商网站的前端监控项目，包含错误收集、性能监控等功能",
    is_public: false,
    create_time: "2023-01-15 10:30:00",
    errorCount: 12,
    performanceScore: 85,
  },
  {
    id: "project-3",
    name: "移动端应用",
    invited_code: "PUB2G3H4I5J6K7L",
    description: "手机APP的性能监控，关注启动时间、内存使用等指标",
    is_public: true,
    create_time: "2023-02-20 14:15:00",
    errorCount: 8,
    performanceScore: 78,
  },
  {
    id: "project-5",
    name: "数据分析平台",
    invited_code: "PUB3M4N5O6P7Q8R",
    description: "大数据分析平台的监控系统，关注数据处理性能",
    is_public: true,
    create_time: "2023-03-10 09:45:00",
    errorCount: 5,
    performanceScore: 92,
  },
  {
    id: "project-6",
    name: "在线教育系统",
    invited_code: "PUB4S5T6U7V8W9X",
    description: "在线教育平台的监控，关注课程访问和用户学习行为",
    is_public: true,
    create_time: "2023-04-05 16:20:00",
    errorCount: 3,
    performanceScore: 88,
  },
  {
    id: "project-7",
    name: "社交网络应用",
    invited_code: "PUB5Y6Z7A8B9C0D",
    description: "社交平台的监控系统，关注用户互动和内容分发",
    is_public: true,
    create_time: "2023-05-12 11:30:00",
    errorCount: 15,
    performanceScore: 81,
  },
  {
    id: "project-8",
    name: "云存储服务",
    invited_code: "PUB6E7F8G9H0I1J",
    description: "云存储服务监控，关注文件上传下载性能和稳定性",
    is_public: true,
    create_time: "2023-06-18 13:45:00",
    errorCount: 7,
    performanceScore: 90,
  },
];

const ProjectAll: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleProjectClick = (projectId: string) => {
    navigate(`/main/project/${projectId}/detail/overview`);
  };

  // 复制邀请码
  const copyInviteCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success("邀请码已复制到剪贴板");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>公开项目</Title>

      {/* 项目头部组件 */}
      <ProjectHeader />

      {/* 项目网格列表 */}
      <div style={{ marginTop: "20px" }}>
        <Row gutter={[16, 16]}>
          {mockPublicProjects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={project.id}>
              <Card
                hoverable
                onClick={() => handleProjectClick(project.id)}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* 项目名称和公开状态 */}
                  <div style={{ marginBottom: "12px" }}>
                    <Space>
                      <Text strong style={{ fontSize: "16px" }}>
                        {project.name}
                      </Text>
                      <Tag
                        color={project.is_public ? "green" : "red"}
                        icon={
                          project.is_public ? (
                            <UnlockOutlined />
                          ) : (
                            <LockOutlined />
                          )
                        }
                      >
                        {project.is_public ? "公开" : "私有"}
                      </Tag>
                    </Space>
                  </div>

                  {/* 邀请码 */}
                  <div style={{ marginBottom: "12px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      邀请码: {project.invited_code.substring(0, 10)}...
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        size="small"
                        onClick={(e) => copyInviteCode(project.invited_code, e)}
                        style={{ marginLeft: "4px" }}
                      >
                        {copiedCode === project.invited_code
                          ? "已复制"
                          : "复制"}
                      </Button>
                    </Text>
                  </div>

                  {/* 项目简介 */}
                  <div style={{ marginBottom: "12px", flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      {project.description}
                    </Text>
                  </div>

                  {/* 创建时间 */}
                  <div style={{ marginBottom: "12px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      <CalendarOutlined /> {project.create_time}
                    </Text>
                  </div>
                </div>

                {/* 图表占位区域 */}
                <div>
                  <Divider style={{ margin: "12px 0" }} />
                  <div
                    style={{
                      height: "80px",
                      backgroundColor: "#fafafa",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Space>
                      <BarChartOutlined
                        style={{ fontSize: "20px", color: "#1890ff" }}
                      />
                      <Text type="secondary">项目数据图表</Text>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProjectAll;
