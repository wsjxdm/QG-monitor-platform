import React, { useState } from "react";
import styles from "./Header.module.css";
import {
  SearchOutlined,
  PlusOutlined,
  UnlockOutlined,
  ProjectOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Input,
  Button,
  Modal,
  Form,
  message,
  List,
  Avatar,
  Dropdown,
  Menu,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Text, Title } = Typography;

// 模拟数据 搜索项目数据
const mockProjects = [
  {
    id: "project-1",
    name: "电商平台监控",
    description:
      "电商网站的前端监控项目1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
    isPublic: true,
  },
  {
    id: "project-2",
    name: "企业管理系统",
    description: "内部OA系统的监控",
    isPublic: false,
  },
  {
    id: "project-3",
    name: "移动端应用",
    description: "手机APP的性能监控",
    isPublic: true,
  },
  {
    id: "project-4",
    name: "数据可视化平台",
    description: "大数据展示平台监控",
    isPublic: false,
  },
];

const ProjectHeader: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockProjects>([]);
  const [isSearchDropdownVisible, setIsSearchDropdownVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinForm] = Form.useForm();
  const [createForm] = Form.useForm();
  // 在组件内部使用useWatch监听表单值
  const isPublic = Form.useWatch("isPublic", createForm);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      const filtered = mockProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(value.toLowerCase()) ||
          project.description.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearchDropdownVisible(true);
    } else {
      setSearchResults([]);
      setIsSearchDropdownVisible(false);
    }
  };

  // 处理搜索结果点击
  const handleProjectClick = (projectId: string) => {
    setIsSearchDropdownVisible(false);
    setSearchValue("");
    setSearchResults([]);
    navigate(`/main/project/${projectId}/detail/overview`);
  };

  // 显示加入项目弹窗
  const showJoinModal = () => {
    setIsJoinModalVisible(true);
  };

  // 显示创建项目弹窗
  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  // 处理加入项目
  const handleJoinProject = async (values: any) => {
    try {
      // 模拟API调用
      console.log("加入项目:", values);
      // 这里应该调用实际的API
      message.success("成功加入项目");
      setIsJoinModalVisible(false);
      joinForm.resetFields();
      // 跳转到项目总览页面（这里使用模拟项目ID）
      navigate(`/main/project/project-1/detail/overview`);
    } catch (error) {
      message.error("加入项目失败");
    }
  };

  // 处理创建项目
  const handleCreateProject = async (values: any) => {
    try {
      // 模拟API调用
      console.log("创建项目:", values);
      // 这里应该调用实际的API
      message.success("项目创建成功");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      // 跳转到新创建的项目总览页面（这里使用模拟项目ID）
      navigate(`/main/project/project-1/detail/overview`, {
        state: { isNew: true }, // 表示这是新创建的项目
      });
    } catch (error) {
      message.error("项目创建失败");
    }
  };

  // 处理权限选择的函数
  const handlePermissionChange = (isPublic: boolean) => {
    createForm.setFieldsValue({ isPublic });
  };

  return (
    <div className={styles.header}>
      {/* 搜索栏 */}
      <div className={styles.searchContainer}>
        <Dropdown
          open={isSearchDropdownVisible}
          onOpenChange={setIsSearchDropdownVisible}
          trigger={["click"]}
          placement="bottomLeft"
          overlayStyle={{ zIndex: 10 }}
          dropdownRender={() => (
            <div className={styles.searchDropdown}>
              {searchResults.length > 0 ? (
                <List
                  dataSource={searchResults}
                  renderItem={(item) => (
                    <List.Item
                      className={styles.searchItem}
                      onClick={() => handleProjectClick(item.id)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={
                              item.isPublic ? (
                                <UnlockOutlined />
                              ) : (
                                <LockOutlined />
                              )
                            }
                            style={{
                              backgroundColor: item.isPublic
                                ? "#52c41a"
                                : "#1890ff",
                            }}
                          />
                        }
                        title={
                          <div>
                            <Text strong>{item.name}</Text>
                            {item.isPublic ? (
                              <span className={styles.publicTag}>公开</span>
                            ) : (
                              <span className={styles.privateTag}>私有</span>
                            )}
                          </div>
                        }
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className={styles.noResults}>
                  <Text type="secondary">未找到相关项目</Text>
                </div>
              )}
            </div>
          )}
        >
          <Search
            placeholder="搜索项目..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            className={styles.searchInput}
          />
        </Dropdown>
      </div>
      {/* 操作按钮 */}
      <div className={styles.buttons}>
        <Button
          type="default"
          icon={<UnlockOutlined />}
          onClick={showJoinModal}
          className={styles.actionButton}
        >
          加入项目
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
          className={styles.actionButton}
        >
          创建项目
        </Button>
      </div>
      {/* 加入项目弹窗 */}
      <Modal
        title="加入项目"
        open={isJoinModalVisible}
        onCancel={() => {
          setIsJoinModalVisible(false);
          joinForm.resetFields();
        }}
        onOk={() => joinForm.submit()}
        okText="加入"
        cancelText="取消"
      >
        <Form form={joinForm} layout="vertical" onFinish={handleJoinProject}>
          <Form.Item
            name="inviteCode"
            label="邀请码"
            rules={[{ required: true, message: "请输入邀请码" }]}
          >
            <Input placeholder="请输入项目邀请码" />
          </Form.Item>
        </Form>
      </Modal>
      {/* 创建项目弹窗 */}
      <Modal
        title="创建项目"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: "请输入项目名称" }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item name="description" label="项目介绍">
            <Input.TextArea placeholder="请输入项目介绍" rows={4} />
          </Form.Item>

          <Form.Item name="isPublic" label="项目权限" initialValue={false}>
            <div className={styles.radioGroup}>
              <div
                className={`${styles.radioOption} ${
                  isPublic === false ? styles.selected : ""
                }`}
                onClick={() => handlePermissionChange(false)}
              >
                <LockOutlined />
                <div>
                  <Text strong>私有项目</Text>
                  <Text type="secondary" className={styles.radioDescription}>
                    仅邀请的成员可以访问
                  </Text>
                </div>
              </div>
              <div
                className={`${styles.radioOption} ${
                  isPublic === true ? styles.selected : ""
                }`}
                onClick={() => handlePermissionChange(true)}
              >
                <UnlockOutlined />
                <div>
                  <Text strong>公开项目</Text>
                  <Text type="secondary" className={styles.radioDescription}>
                    所有用户都可以查看
                  </Text>
                </div>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectHeader;
