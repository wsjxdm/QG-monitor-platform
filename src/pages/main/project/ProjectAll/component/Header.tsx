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
import {
  searchProjects,
  joinProject,
  createProject,
} from "../../../../../api/service/projectheader";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Text, Title } = Typography;

//搜索项目
interface searchProject {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
}
const user = {
  id: 14,
};

const ProjectHeader: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<searchProject[]>([]);
  const [isSearchDropdownVisible, setIsSearchDropdownVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [joinForm] = Form.useForm();
  const [createForm] = Form.useForm();
  // 在组件内部使用useWatch监听表单值
  const isPublic = Form.useWatch("isPublic", createForm);

  // 处理搜索
  const handleSearch = async (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      try {
        const filtered = await searchProjects(value);
        setSearchResults(filtered);
        setIsSearchDropdownVisible(true);
      } catch (error) {
        message.error("搜索项目失败，请稍后重试");
      }
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
      const response = await joinProject(values.inviteCode, user.id);
      // message.success("成功加入项目");
      setIsJoinModalVisible(false);
      joinForm.resetFields();
      // 跳转到项目总览页面（这里使用模拟项目ID）
      navigate(`/main/project/${response.projectId}/detail/overview`);
    } catch (error) {
      message.error("加入项目失败");
    }
  };

  // 处理创建项目
  const handleCreateProject = async (values: any) => {
    try {
      const { uuid } = await createProject(
        values.name,
        values.description,
        isPublic,
        user.id
      );
      message.success("项目创建成功");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      navigate(`/main/project/${uuid}/detail/overview`, {
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
