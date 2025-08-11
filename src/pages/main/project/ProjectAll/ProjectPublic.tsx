import React, { useState, useEffect } from "react";
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
  Empty,
} from "antd";
import {
  UnlockOutlined,
  LockOutlined,
  CopyOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getPublicProjects } from "../../../../api/service/projectoverview";

const { Title, Text } = Typography;

const ProjectPublic: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [PublicProjects, setPublicProjects] = useState<
    {
      uuid: string;
      name: string;
      description: string;
      isPublic: boolean;
      invitedCode: string;
      createdTime: string | number;
      errorCount: number;
      performanceScore: number;
    }[]
  >([]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/main/project/${projectId}/detail/overview`);
  };

  // 获取公开项目列表
  useEffect(() => {
    getPublicProjects().then((res: any) => {
      console.log("获取公开项目列表", res);
      setPublicProjects(res.reverse());
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>公开项目</Title>

      {/* 项目头部组件 */}
      <ProjectHeader />

      {/* 项目网格列表 */}
      {PublicProjects?.length > 0 ? (
        <div style={{ marginTop: "20px" }}>
          <Row gutter={[16, 16]}>
            {PublicProjects.map((project) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={project.uuid}>
                <Card
                  hoverable
                  onClick={() => handleProjectClick(project.uuid)}
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
                        <Tag icon={<UnlockOutlined />} color="success">
                          公开
                        </Tag>
                      </Space>
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
                        <CalendarOutlined /> {project.createdTime}
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
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default ProjectPublic;
