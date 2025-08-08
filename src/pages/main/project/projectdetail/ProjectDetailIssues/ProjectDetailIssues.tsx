// src/pages/main/project/projectdetail/ProjectDetailIssues/ProjectDetailIssues.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Dropdown,
  Avatar,
  Tooltip,
  Tag,
  message,
  Table,
} from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import TableWithSelector from "../../../../../component/Table/TableWithSelector";
import {
  getErrorDataAPI,
  assignErrorAPI,
  getProjectMembersAPI,
} from "../../../../../api/service/issue";

const { Title } = Typography;

//todo 用户的权限判断
const currentUser = {
  role: 2,
  id: 1,
};

// 错误展示
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

// 项目成员接口
interface ProjectMember {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: number;
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
  const [members, setMembers] = useState<ProjectMember[]>([]);

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
      key: "moduleId",
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

  // 获取项目成员
  const fetchProjectMembers = async () => {
    try {
      const response = await getProjectMembersAPI(projectId);
      setMembers(response || []);
    } catch (error) {
      console.error("获取项目成员失败:", error);
    }
  };

  // 处理指派错误
  const handleAssignError = async (
    errorId: string | number,
    delegatorId: string | number
  ) => {
    try {
      // 只有非普通成员才能进行指派操作
      if (currentUser && currentUser.role == 3) {
        message.warning("普通成员不能指派问题");
        return;
      }

      await assignErrorAPI(errorId, delegatorId, currentUser.id);
      message.success("指派成功");

      // 更新本地数据而不重新获取
      setData((prevData) =>
        prevData.map((item) =>
          item.id == errorId
            ? {
                ...item,
                delegatorId: delegatorId,
                name: members.find((m) => m.id == delegatorId)?.name || null,
              }
            : item
        )
      );
      console.log(data);
    } catch (error) {
      message.error("指派失败");
      console.error("指派错误失败:", error);
    }
  };

  // 渲染指派列
  const renderAssignColumn = (record: ErrorItem) => {
    const assignedMember = members.find(
      (member) => member.id == record.delegatorId
    );

    // 只显示普通成员(role == 3)作为可指派选项
    const menuItems = members
      .filter((member) => member.role == 3)
      .map((member) => ({
        key: member.id,
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar
              size="small"
              src={member.avatarUrl}
              icon={<UserOutlined />}
            />
            <span>{member.name}</span>
          </div>
        ),
      }));

    const menuProps = {
      items: menuItems,
      onClick: ({ key }: { key: string }) => handleAssignError(record.id, key),
    };

    return (
      <div
        style={{ textAlign: "center", minWidth: 120 }}
        onClick={(e) => e.stopPropagation()}
      >
        {record.delegatorId ? (
          <Tooltip title={`已指派给: ${assignedMember?.name || "未知用户"}`}>
            <span>{assignedMember?.name || "未知用户"}</span>
          </Tooltip>
        ) : (
          <span style={{ color: "#ff4d4f" }}>未指派</span>
        )}
        <Dropdown menu={menuProps} trigger={["hover"]}>
          <a
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{ marginLeft: 8 }}
          >
            <DownOutlined />
          </a>
        </Dropdown>
      </div>
    );
  };

  const columns = [
    {
      title: "平台",
      dataIndex: "platform",
      key: "platform",
      width: 100,
      minWidth: 100,
    },
    {
      title: "错误类型",
      dataIndex: "type",
      key: "type",
      width: 150,
      minWidth: 150,
      render: (type: string) => <span>{type}</span>,
    },
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 150,
      minWidth: 150,
    },
    {
      title: "模块名称",
      dataIndex: "moduleName",
      key: "moduleName",
      width: 120,
      minWidth: 120,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right" as const,
      width: 100,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right" as const,
      width: 100,
    },
    {
      title: "指派人",
      dataIndex: "name",
      key: "name",
      width: 100,
      minWidth: 100,
      render: (name: string) => <span>{name}</span>,
    },
    {
      title: "错误信息",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      width: 200,
      minWidth: 200,
    },

    {
      title: "指派",
      key: "assign",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: ErrorItem) => renderAssignColumn(record),
    },
  ];

  // 获取错误数据的函数
  const fetchErrorData = async (filterParams: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const response = await getErrorDataAPI({
        ...filterParams,
        projectId,
        env: "dev",
      });
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
    fetchProjectMembers();
  }, []);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchErrorData(filters);
  };

  // 自定义渲染表格，添加横向滚动和固定列支持
  const renderCustomTable = () => {
    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
          scroll={{ x: "max-content" }}
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
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条数据`,
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default ProjectDetailIssues;
