// src/pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "antd";
import TableWithSelector from "../../../../../component/Table/TableWithSelector";
import { getErrorDataAPI } from "../../../../../api/service/issue";

const { Title } = Typography;

//错误展示
interface ErrorItem {
  id: number | string;
  platform?: string;
  projectId?: string | number;
  moduleId?: string | number;
  type?: string;
  timestamp?: string | number | Date;
  message?: string;
  isHandled?: boolean;
  moduleName?: string;
  delegatorId?: string | number | null;
  name?: string | null;
  avatarUrl?: string | null;
}

const ProjectDetailIssues: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 跳转到错误详情页
  const goToErrorDetail = (errorId: number) => {
    navigate(`/main/project/${projectId}/detail/error/${errorId}`);
  };

  const [data, setData] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filterConfig = [
    {
      key: "type",
      label: "错误类型",
      type: "input" as const,
      placeholder: "请输入错误类型",
    },
    {
      key: "platform",
      label: "平台",
      type: "select" as const,
      options: [
        { label: "web", value: "web" },
        { label: "java", value: "java" },
        { label: "android", value: "android" },
      ],
    },
    {
      key: "moduleName",
      label: "模块名称",
      type: "select" as const,
      options: [
        { label: "模块1", value: 1 },
        { label: "模块2", value: 2 },
        { label: "模块3", value: 3 },
        { label: "模块4", value: 4 },
        { label: "模块5", value: 5 },
      ],
    },
  ];

  const columns = [
    {
      title: "平台",
      dataIndex: "platform",
      key: "platform",
    },
    {
      title: "错误类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <span>{type}</span>,
    },
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
    },
    {
      title: "模块名称",
      dataIndex: "moduleName",
      key: "moduleName",
    },
  ];

  // 获取错误数据的函数
  const fetchErrorData = async (filterParams: Record<string, any> = {}) => {
    setLoading(true);
    console.log("获取错误数据:", filterParams);
    try {
      //!传环境env，projectId
      const response = await getErrorDataAPI({
        ...filterParams,
        projectId,
        env: "dev",
      });
      console.log("获取错误数据响应:", response);

      setData(response || []);
    } catch (error) {
      console.error("获取错误数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 当筛选条件变化时重新获取数据
  useEffect(() => {
    fetchErrorData(filters);
  }, [filters]);

  // 页面初始化时获取数据
  useEffect(() => {
    fetchErrorData();
  }, []);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    // 不再这里调用fetchErrorData，而是通过useEffect监听filters变化来触发
  };

  const handleRefresh = () => {
    fetchErrorData(filters);
  };

  return (
    <div>
      <Title level={4}>错误列表</Title>
      <TableWithSelector<ErrorItem>
        filterConfig={filterConfig}
        dataSource={data}
        columns={columns}
        loading={loading}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onRow={(record) => ({
          onClick: () => {
            goToErrorDetail(record.id as number);
          },
        })}
        rowKey="id"
      />
    </div>
  );
};

export default ProjectDetailIssues;
