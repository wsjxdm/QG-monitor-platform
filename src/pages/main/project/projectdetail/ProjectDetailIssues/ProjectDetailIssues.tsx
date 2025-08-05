import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, List, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ProjectDetailIssues: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  console.log("1111模拟数据");
  //! 模拟数据，错误列表数据
  const errorList = [
    {
      id: "001",
      title: "JavaScript运行时错误",
      time: "2023-07-15 14:30:22",
    },
  ];

  // 跳转到错误详情页
  const goToErrorDetail = (errorId: string) => {
    navigate(`/main/project/${projectId}/detail/error/${errorId}`);
  };

  return (
    <div>
      <Title level={2}>项目 {projectId} - 问题列表</Title>

      <Card title="错误报告" extra={<Button type="primary">刷新</Button>}>
        <List
          itemLayout="horizontal"
          dataSource={errorList}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => goToErrorDetail(item.id)}>
                  查看详情
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <ExclamationCircleOutlined
                    style={{ fontSize: "24px", color: "#ff4d4f" }}
                  />
                }
                title={item.title}
                description={`错误ID: ${item.id} | 发生时间: ${item.time}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ProjectDetailIssues;
