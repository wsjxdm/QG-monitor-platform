import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./ProjectDetailOverview.module.css";
import {
  Typography,
  Modal,
  Card,
  Empty,
  Button,
  Input,
  message,
  Popconfirm,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
  Dropdown,
  Menu,
  Avatar,
  Badge,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BookOutlined,
  CopyOutlined,
  UnlockOutlined,
  LockOutlined,
  DeleteOutlined,
  BarChartOutlined,
  WarningOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  getProjectInfo,
  getProjectMembers,
  updateProjectInfo,
  deleteProjectAPI,
  exitProjectAPI,
  kickUserAPI,
  changeUserLevelAPI,
} from "../../../../../api/service/project";

const { Title, Text } = Typography;

//用户权限，这里3为普通用户
const currentUserRole: number = 2; // 当前用户角色

interface projectData {
  id: string | number;
  name: string;
  description: string;
  createdTime: string;
  isPublic: boolean;
  invitedCode: string;
  groupCode?: string;
  webhook?: string;
}

interface ProjectMember {
  id: string | number;
  userName: string;
  userRole: number;
  avatar?: string;
}

const ProjectDetailOverview: React.FC = () => {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState<projectData>(
    {} as projectData
  );
  const [groupMembers, setGroupMembers] = useState([] as ProjectMember[]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isTutorialModalVisible, setIsTutorialModalVisible] = useState(false);
  const [contextMenuMember, setContextMenuMember] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    //获取项目资料
    getProjectInfo(projectId, currentUserRole).then((res) => {
      if (res) {
        setProjectData(res);
      }
    });
    //获取项目成员列表
    getProjectMembers(projectId).then((res) => {
      if (res) {
        setGroupMembers(res);
      }
    });
  }, [projectId]);

  // 开始编辑字段
  const startEdit = (field: string, value: string) => {
    // 权限为3的用户不能编辑
    if (currentUserRole === 3) {
      message.warning("您没有权限进行此操作");
      return;
    }
    setEditingField(field);
    setEditValue(value);
  };

  // 保存编辑
  const saveEdit = async () => {
    if (editingField) {
      await updateProjectInfo(projectId, {
        ...projectData,
        [editingField]: editValue,
      });
      setProjectData({
        ...projectData,
        [editingField]: editValue,
      });
      setEditingField(null);
      message.success("信息更新成功");
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingField(null);
  };

  // 复制文本到剪贴板
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${fieldName}已复制到剪贴板`);
  };

  // 删除项目
  const deleteProject = async () => {
    // 使用 trim() 去除空格并确保类型一致
    if (deleteConfirmText.trim() === projectData.name.trim()) {
      try {
        await deleteProjectAPI(projectId);
        message.success("项目删除成功");
        console.log("删除项目:", projectId);
      } catch (error) {
        console.error("删除项目失败:", error);
        message.error("删除项目失败");
      }
    } else {
      message.error("项目名称不匹配，请重新输入");
    }
  };

  //退出项目
  const leaveProject = async () => {
    console.log("退出项目:", projectId);
    try {
      await exitProjectAPI(projectId);
      navigate("/main/project/all");
    } catch (error) {}
  };

  // 显示教程弹窗
  const showTutorialModal = () => {
    setIsTutorialModalVisible(true);
  };

  // 隐藏教程弹窗
  const hideTutorialModal = () => {
    setIsTutorialModalVisible(false);
  };

  // 处理成员右键菜单
  const handleMemberContextMenu = (member: any, e: React.MouseEvent) => {
    e.preventDefault();
    // 只有非普通成员才能操作其他成员
    if (currentUserRole !== 3) {
      setContextMenuMember(member);
    }
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenuMember(null);
  };

  // 更新成员角色
  const updateMemberRole = async (memberId: number, newRole: number) => {
    try {
      await changeUserLevelAPI(projectId, memberId, newRole);
      setGroupMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, userRole: newRole } : member
        )
      );
      message.success("成员角色更新成功");
    } catch (error) {
      message.error("成员角色更新失败");
    }
    closeContextMenu();
  };

  // 移除成员
  const removeMember = async (memberId: number) => {
    try {
      await kickUserAPI(projectId, memberId);
      setGroupMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
      message.success("成员移除成功");
    } catch (error) {
      message.error("成员移除失败");
    }
    closeContextMenu();
  };

  // 渲染成员网格
  const renderMemberGrid = (members: any[], title: string, role: number) => {
    if (members.length === 0) return null;

    return (
      <div key={role} style={{ marginBottom: "20px" }}>
        <Title level={5} style={{ marginBottom: "10px" }}>
          {title}
        </Title>
        <Row gutter={[8, 8]}>
          {members.map((member) => (
            <Col key={member.id} xs={6} sm={4} md={3} lg={3}>
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: "4px",
                  cursor: currentUserRole !== 3 ? "pointer" : "default",
                  position: "relative",
                }}
                onContextMenu={(e) => handleMemberContextMenu(member, e)}
              >
                <Badge>
                  <Avatar
                    size={50}
                    icon={<UserOutlined />}
                    src={member.avatar || undefined}
                  />
                </Badge>
                <div style={{ marginTop: "10px" }}>
                  <Text strong>{member.name}</Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // 按角色分组成员
  const owners = groupMembers.filter((member) => member.userRole === 1);
  const admins = groupMembers.filter((member) => member.userRole === 2);
  const members = groupMembers.filter((member) => member.userRole === 3);

  // 渲染可编辑字段
  const renderEditableField = (
    field: string,
    label: string,
    value: string,
    type: "text" | "textarea" = "text"
  ) => (
    <div className={styles.infoItem}>
      <Text className={styles.infoLabel}>{label}</Text>
      {editingField === field ? (
        <Space>
          {type === "textarea" ? (
            <Input.TextArea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 6 }}
              style={{ width: "300px" }}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{ width: "300px" }}
            />
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveEdit}
            size="small"
          />
          <Button icon={<CloseOutlined />} onClick={cancelEdit} size="small" />
        </Space>
      ) : (
        <div className={styles.infoValue}>
          <Text
            className={styles.editableValue}
            onClick={() => startEdit(field, value)}
          >
            {value}
          </Text>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              startEdit(field, value);
            }}
            size="small"
          />
        </div>
      )}
    </div>
  );

  // 渲染带复制功能的字段（专门用于邀请码、微信群号等）
  const renderCopyableEditableField = (
    field: string,
    label: string,
    value: string,
    fieldName: string
  ) => (
    <div className={styles.infoItem}>
      <Text className={styles.infoLabel}>{label}</Text>
      {editingField === field ? (
        <Space>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{ width: "300px" }}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveEdit}
            size="small"
          />
          <Button icon={<CloseOutlined />} onClick={cancelEdit} size="small" />
        </Space>
      ) : (
        <div className={styles.infoValue}>
          <Text
            className={styles.editableValue}
            onClick={(e) => {
              e.stopPropagation();
              startEdit(field, value);
            }}
          >
            {value}
          </Text>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(value, fieldName);
            }}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              startEdit(field, value);
            }}
            size="small"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 左侧主要内容 */}
        <div className={styles.leftColumn}>
          {/* 项目基本信息卡片 */}
          <div className={styles.section}>
            <div className={styles.projectHeader}>
              <Title level={3} className={styles.projectTitle}>
                {projectData.name}
              </Title>
              <Tag
                icon={
                  projectData.isPublic ? <UnlockOutlined /> : <LockOutlined />
                }
                color={projectData.isPublic ? "success" : "processing"}
              >
                {projectData.isPublic ? "公开项目" : "私有项目"}
              </Tag>
            </div>

            {renderEditableField("name", "项目名称", projectData.name)}
            {renderEditableField(
              "description",
              "项目简介",
              projectData.description,
              "textarea"
            )}
            <div className={styles.infoItem}>
              <Text className={styles.infoLabel}>创建时间</Text>
              <div className={styles.infoValue}>
                <Text>{projectData.createdTime}</Text>
              </div>
            </div>
            {projectData.invitedCode &&
              renderCopyableEditableField(
                "invitedCode",
                "邀请码",
                projectData.invitedCode,
                "邀请码"
              )}
            {projectData.groupCode &&
              renderCopyableEditableField(
                "groupCode",
                "微信群号",
                projectData.groupCode,
                "微信群号"
              )}
            {projectData.webhook &&
              renderCopyableEditableField(
                "webhook",
                "企业微信群机器人URL",
                projectData.webhook,
                "Webhook地址"
              )}

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              {currentUserRole !== 3 && (
                <Popconfirm
                  title="删除项目"
                  description={
                    <div>
                      <Text>请输入项目名称确认删除：</Text>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={projectData.name}
                        style={{ marginTop: "8px" }}
                      />
                    </div>
                  }
                  onConfirm={deleteProject}
                  okText="确认删除"
                  cancelText="取消"
                  icon={<WarningOutlined style={{ color: "red" }} />}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    className={styles.deleteButton}
                  >
                    删除项目
                  </Button>
                </Popconfirm>
              )}

              <Popconfirm
                title="退出项目"
                onConfirm={leaveProject}
                okText="确认退出"
                cancelText="取消"
                icon={<WarningOutlined style={{ color: "red" }} />}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className={styles.deleteButton}
                >
                  退出项目
                </Button>
              </Popconfirm>
            </div>
          </div>

          {/* 项目成员卡片 */}
          <div className={styles.section}>
            <Title level={4} className={styles.sectionTitle}>
              项目成员
            </Title>
            <div>
              {groupMembers.length === 0 ? (
                <Empty description="暂无成员" />
              ) : (
                <>
                  {renderMemberGrid(owners, "老板", 1)}
                  {renderMemberGrid(admins, "管理员", 2)}
                  {renderMemberGrid(members, "成员", 3)}
                </>
              )}
            </div>
          </div>

          {/* 图表区域 */}
          <div className={styles.section}>
            <Title level={4} className={styles.sectionTitle}>
              项目监控数据
            </Title>
            <div className={styles.chartContainer}>
              <Space>
                <BarChartOutlined
                  style={{ fontSize: "32px", color: "#1890ff" }}
                />
                <Text type="secondary">项目数据图表展示区域</Text>
              </Space>
            </div>
          </div>
        </div>

        {/* 右侧信息栏 */}
        <div className={styles.rightColumn}>
          {/* 教程链接，点击后弹窗展示教程 */}
          <div className={styles.section}>
            <Title level={4} className={styles.sectionTitle}>
              使用教程
            </Title>
            <Button
              type="link"
              icon={<BookOutlined />}
              onClick={showTutorialModal}
              style={{ padding: 0 }}
            >
              查看项目接入教程
            </Button>
          </div>
        </div>
      </div>

      {/* 教程弹窗 */}
      <Modal
        title="项目接入教程"
        open={isTutorialModalVisible}
        onCancel={hideTutorialModal}
        footer={[
          <Button key="close" onClick={hideTutorialModal}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <div>
          <Title level={5}>1. 项目初始化</Title>
        </div>
      </Modal>

      {/* 成员操作右键菜单 */}
      {contextMenuMember && (
        <Dropdown
          open={!!contextMenuMember}
          onOpenChange={(open) => !open && closeContextMenu()}
          menu={{
            items: [
              {
                key: "role1",
                label: "设为老板",
                onClick: () => updateMemberRole(contextMenuMember.id, 1),
              },
              {
                key: "role2",
                label: "设为管理员",
                onClick: () => updateMemberRole(contextMenuMember.id, 2),
              },
              {
                key: "role3",
                label: "设为普通成员",
                onClick: () => updateMemberRole(contextMenuMember.id, 3),
              },
              {
                key: "remove",
                label: "移除成员",
                danger: true,
                onClick: () => removeMember(contextMenuMember.id),
              },
            ],
          }}
          trigger={["contextMenu"]}
        >
          {contextMenuMember && (
            <div
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 999,
              }}
              onClick={closeContextMenu}
            />
          )}
        </Dropdown>
      )}
    </div>
  );
};

export default ProjectDetailOverview;
