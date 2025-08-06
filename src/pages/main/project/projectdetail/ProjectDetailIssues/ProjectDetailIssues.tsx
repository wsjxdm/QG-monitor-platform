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
      type: "select" as const,
      options: [
        { label: "空指针", value: "空指针" },
        { label: "网络错误", value: "网络错误" },
        { label: "SQL注入", value: "SQL注入" },
        { label: "XSS漏洞", value: "XSS漏洞" },
        { label: "命令注入", value: "命令注入" },
        { label: "资源泄露", value: "资源泄露" },
        { label: "权限绕过", value: "权限绕过" },
        { label: "数据篡改", value: "数据篡改" },
        { label: "拒绝服务", value: "拒绝服务" },
        { label: "信息泄露", value: "信息泄露" },
        { label: "跨站脚本", value: "跨站脚本" },
      ],
      placeholder: "请选择错误类型",
    },
    {
      key: "platform",
      label: "平台",
      type: "input" as const,
      placeholder: "请输入平台名称",
    },
  ];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
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
  ];

  // 获取错误数据的函数
  const fetchErrorData = async (filterParams: Record<string, any> = {}) => {
    setLoading(true);
    console.log("获取错误数据:", filterParams);
    try {
      const response = await getErrorDataAPI(filterParams);
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
