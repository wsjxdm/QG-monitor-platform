import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./ProjectDetailOverview.module.css";
import {
  Typography,
  Modal,
  Card,
  Spin,
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
  Switch,
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
import { Line } from "@ant-design/plots";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLocation } from "react-router-dom";
import {
  getProjectInfo,
  getProjectMembers,
  updateProjectInfo,
  deleteProjectAPI,
  exitProjectAPI,
  kickUserAPI,
  changeUserLevelAPI,
  getTutorialMarkdown,
  getUserResponsibility,
  getInviteCodeAPI,
} from "../../../../../api/service/projectoverview";
import project from "../../../../../mock/project";
import { eventBus } from "../../../../../utils/event";

const { Title, Text } = Typography;

//todo 用户权限，以及不可见的话要跳转

interface projectData {
  id: string | number;
  name: string;
  description: string;
  createdTime: string | number | Date;
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
  userId: string | number;
}
const ProjectDetailOverview: React.FC = () => {
  const { projectId } = useParams();
  const { isNew } = useLocation()?.state || {};
  const [projectData, setProjectData] = useState<projectData>(
    {} as projectData
  );
  const [groupMembers, setGroupMembers] = useState([] as ProjectMember[]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isTutorialModalVisible, setIsTutorialModalVisible] = useState(
    isNew ? true : false
  );
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteModalLoading, setIsInviteModalLoading] = useState(false);

  const [role, setRole] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isTutorialModalLoading, setIsTutorialModalLoading] = useState(false);
  // 在 useState 声明区域添加
  const [markdown, setMarkdown] = useState();
  const [contextMenuMember, setContextMenuMember] = useState<any>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {
    // 重置编辑状态
    setEditingField(null);
    setEditValue("");

    //获取当前成员的权限
    getUserResponsibility(projectId, user.id).then((res) => {
      console.log(
        "%c [ ]-272",
        "color: #f00; font-weight: bold;background: #fff;width: 100%;",
        res
      );
      if (res) {
        setRole(res.power);
        setUserRole(res.userRole);
        // 将日志移到这里
        console.log(
          "%c [ ]-273",
          "color: #f00; font-weight: bold;background: #fff;width: 100%;",
          res.userRole,
          res.power
        );
        if (res.power === 0) {
          message.warning("您无权进入该项目，请联系项目管理员");
          navigate("/main/project/all");
        }
      }
    });
    //获取项目资料
    getProjectInfo(projectId).then((res) => {
      if (res) {
        // console.log("项目资料:", res);
        setProjectData(res);
      }
    });
    //获取项目成员列表
    getProjectMembers(projectId).then((res) => {
      if (res) {
        // console.log("项目成员列表:", res);
        setGroupMembers(res);
      }
    });
    getTutorialMarkdown().then((res) => {
      if (res) {
        // console.log("获取到的教程:", res);
        setMarkdown(res[0].content);
      }
    });
  }, [projectId]);

  // 开始编辑字段
  const startEdit = (field: string, value: string) => {
    // console.log(
    //   "%c [ ]-273",
    //   "color: #f00; font-weight: bold;background: #fff;width: 100%;",
    //   userRole
    // );
    // 只有非普通成员才能编辑 (userRole !== 2)
    if (userRole === 2 || userRole == null) {
      message.warning("您没有权限进行此操作");
      return;
    }
    setEditingField(field);
    setEditValue(value);
  };

  // 保存编辑
  const saveEdit = async () => {
    if (editingField) {
      try {
        // 处理布尔值字段
        let finalValue = editValue;
        if (editingField === "isPublic") {
          finalValue = editValue === "true";
        }

        const updateData = {
          ...projectData,
          uuid: projectId,
          [editingField]: finalValue,
        };

        await updateProjectInfo(updateData);

        setProjectData({
          ...projectData,
          [editingField]: finalValue,
        });
        setEditingField(null);
        message.success("信息更新成功");
      } catch (error) {
        message.error("信息更新失败");
      }
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

        eventBus.emit("projectListChanged", projectId);

        message.success("项目删除成功");
        navigate("/main/project/all");
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
    // 检查是否是最后一个管理员或老板
    const isOwnerOrAdmin = userRole === 0 || userRole === 1;

    if (isOwnerOrAdmin) {
      // 计算当前项目中管理员和老板的数量
      const ownerAndAdminCount = groupMembers.filter(
        (member) => member.userRole === 0 || member.userRole === 1
      ).length;

      // 如果当前用户是管理员或老板，且是最后一个，则显示提示
      if (ownerAndAdminCount <= 1) {
        message.warning(
          "当前项目只有您一位管理者，如果退出需先转让管理身份或删除项目"
        );
        return;
      }
    }
    if (userRole == null) {
      message.warning("您并非项目成员，无法退出项目");
    }

    try {
      await exitProjectAPI(projectId, user.id);
      eventBus.emit("projectListChanged");
      navigate("/main/project/all");
    } catch (error) {
      message.error("退出项目失败");
    }
  };

  // 显示教程弹窗
  const showTutorialModal = async () => {
    setIsTutorialModalVisible(true);
    setIsTutorialModalLoading(true);
    try {
      // 从后台获取markdown文件
      const markdownContent = await getTutorialMarkdown();
      // console.log("获取到的教程:", markdownContent);
      // 设置获取到的内容
      setMarkdown(markdownContent[0].content);
      setIsTutorialModalLoading(false);
    } catch (error) {
      message.error("获取文件失败，请稍后重试");
      // 出错时也停止加载状态
      setIsTutorialModalLoading(false);
    }
  };

  // 修改 showInviteModal 函数
  const showInviteModal = async () => {
    setIsInviteModalVisible(true);
    setIsInviteModalLoading(true);
    try {
      // 调用后台接口获取邀请码
      // 这里需要替换为实际的 API 调用
      const inviteCodeResponse = await getInviteCodeAPI(projectId);
      setInviteCode(inviteCodeResponse);
      setIsInviteModalLoading(false);
    } catch (error) {
      message.error("获取邀请码失败，请稍后重试");
      setIsInviteModalLoading(false);
      setIsInviteModalVisible(false);
    }
  };

  // 添加隐藏邀请码弹窗的函数
  const hideInviteModal = () => {
    setIsInviteModalVisible(false);
    setInviteCode(""); // 清空邀请码
  };

  // 添加复制邀请码到剪贴板的函数
  const copyInviteCodeToClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        // 如果不支持 Clipboard API，使用传统方法
        const textarea = document.createElement("textarea");
        textarea.value = inviteCode;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } else {
        // 使用现代 Clipboard API
        await navigator.clipboard.writeText(inviteCode);
      }
      message.success("邀请码已复制到剪贴板");
    } catch (err) {
      message.error("复制失败，请手动复制");
      console.error("Failed to copy:", err);
    }
  };
  // 隐藏教程弹窗
  const hideTutorialModal = () => {
    setIsTutorialModalVisible(false);
  };

  // 处理成员右键菜单
  const handleMemberContextMenu = (member: any, e: React.MouseEvent) => {
    e.preventDefault();
    // 只有非普通成员才能操作其他成员
    if (userRole === 2) {
      message.warning("权限不足");
      return;
    }
    if (userRole == null) {
      message.warning("权限不足");
      return;
    }
    if (userRole !== 2) {
      setContextMenuMember(member);
    }
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenuMember(null);
  };

  // 更新成员角色
  const updateMemberRole = async (
    memberId: number,
    memberRole: number,
    newRole: number
  ) => {
    if (memberRole < userRole) {
      message.error("权限不足");
      return;
    }
    try {
      await changeUserLevelAPI(user.id, projectId, memberId, newRole);
      //如果用户修改自己的权限，更新当前用户的权限状态
      if (memberId === user.id) {
        setUserRole(newRole);
      }
      setGroupMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.userId === memberId ? { ...member, userRole: newRole } : member
        )
      );
      // console.log("更新后的成员列表:", groupMembers);
      message.success("成员角色更新成功");
    } catch (error) {
      getProjectMembers(projectId).then((res) => {
        if (res) {
          // console.log("项目成员列表:", res);
          setGroupMembers(res);
        }
      });
      //获取当前成员的权限
      getUserResponsibility(projectId, user.id).then((res) => {
        console.log(
          "%c [ ]-272",
          "color: #f00; font-weight: bold;background: #fff;width: 100%;",
          res
        );
        if (res) {
          setRole(res.power);
          setUserRole(res.userRole);
          // 将日志移到这里
          console.log(
            "%c [ ]-273",
            "color: #f00; font-weight: bold;background: #fff;width: 100%;",
            res.userRole,
            res.power
          );
          if (res.power === 0) {
            message.warning("您无权进入该项目，请联系项目管理员");
            navigate("/main/project/all");
          }
        }
      });
      message.error("成员角色更新失败");
    }
    closeContextMenu();
  };

  // 移除成员
  const removeMember = async (memberId: number, memberRole: number) => {
    console.log(
      "%c [  ]-401",
      "font-size:13px; background:pink; color:#bf2c9f;",
      userRole
    );

    if (userRole == 2) {
      message.error("您没有权限进行操作");
      return;
    }

    const isRemovingSelf = memberId === user.id;

    // 如果移除的是自己，且自己是管理员或老板
    if (isRemovingSelf && (userRole === 0 || userRole === 1)) {
      // 计算当前项目中管理员和老板的数量
      const ownerAndAdminCount = groupMembers.filter(
        (member) => member.userRole === 0 || member.userRole === 1
      ).length;

      // 如果是最后一个管理员或老板
      if (ownerAndAdminCount <= 1) {
        message.warning(
          "当前项目只有您一位管理者，如果退出需先转让管理身份或删除项目"
        );
        closeContextMenu();
        return;
      }
    }

    if (memberRole < userRole) {
      message.error("权限不足");
      return;
    }
    try {
      await exitProjectAPI(projectId, memberId);
      setGroupMembers((prevMembers) =>
        prevMembers.filter((member) => member.userId !== memberId)
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
        <div className={styles.memberGroupTitle}>{title}</div>
        <div className={styles.memberGrid}>
          {members.map((member) => (
            <div
              key={member.id}
              className={styles.memberCard}
              onContextMenu={(e) => handleMemberContextMenu(member, e)}
              style={{ cursor: role !== 2 ? "pointer" : "default" }}
            >
              <Badge>
                <Avatar
                  size={50}
                  icon={<UserOutlined />}
                  src={member.avatar || undefined}
                />
              </Badge>
              <div className={styles.memberName}>
                <Text
                  strong
                  ellipsis={{ tooltip: member.username }}
                  style={{ maxWidth: 80 }}
                >
                  {member.username}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 按角色分组成员
  const owners = groupMembers.filter((member) => member.userRole === 0);
  const admins = groupMembers.filter((member) => member.userRole === 1);
  const members = groupMembers.filter((member) => member.userRole === 2);

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
        <Space style={{ flex: 1, display: "flex", width: "100%" }}>
          {type === "textarea" ? (
            <Input.TextArea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 6 }}
              style={{ flex: 1 }}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{ flex: 1 }}
            />
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveEdit}
            size="small"
            style={{ marginLeft: 8 }}
          />
          {role == 2 && (
            <Button
              icon={<CloseOutlined />}
              onClick={cancelEdit}
              size="small"
              style={{ marginLeft: 8 }}
            />
          )}
        </Space>
      ) : (
        <div className={styles.infoValue}>
          <Text
            className={styles.editableValue}
            onClick={() => startEdit(field, value)}
          >
            {value}
          </Text>
          {role == 2 && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                startEdit(field, value);
              }}
              size="small"
            />
          )}
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
        <Space
          style={{ display: "flex", width: "100%" }}
          className={styles.infoValue}
        >
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveEdit}
            size="small"
            style={{ marginLeft: 8 }}
          />
          <Button
            icon={<CloseOutlined />}
            onClick={cancelEdit}
            size="small"
            style={{ marginLeft: 8 }}
          />
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

  // 渲染可编辑的公开/私密状态字段
  const renderEditableSwitchField = (
    field: string,
    label: string,
    value: boolean
  ) => (
    <div className={styles.infoItem}>
      <Text className={styles.infoLabel}>{label}</Text>
      {editingField === field ? (
        <Space>
          <Switch
            checked={editValue === "true"}
            onChange={(checked) => setEditValue(checked.toString())}
            checkedChildren="公开"
            unCheckedChildren="私有"
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
            onClick={() => startEdit(field, value.toString())}
          >
            {value ? "公开项目" : "私有项目"}
          </Text>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              startEdit(field, value.toString());
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
          {/* 项目英雄区域 */}
          <div className={styles.projectHero}>
            <div className={styles.projectHeader}>
              <Title level={3} className={styles.projectTitle}>
                {projectData.name}
              </Title>
              <Tag
                icon={
                  projectData.isPublic ? <UnlockOutlined /> : <LockOutlined />
                }
                color={projectData.isPublic ? "success" : "processing"}
                className={styles.projectTag}
              >
                {projectData.isPublic ? "公开项目" : "私有项目"}
              </Tag>
            </div>
            <Text className={styles.projectDescription}>
              {projectData.description}
            </Text>
          </div>

          {/* 基本信息卡片 */}
          <div className={styles.section}>
            <Title level={4} className={styles.sectionTitle}>
              项目基本信息
            </Title>

            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <div className={styles.infoItem}>
                  <div className={styles.infoValue}>
                    {renderEditableField("name", "项目名称", projectData.name)}
                  </div>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoItem}>
                  <Text className={styles.infoLabel}>项目ID</Text>
                  <div className={styles.infoValue}>
                    <Text>{projectData.uuid}</Text>
                  </div>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoItem}>
                  <Text className={styles.infoLabel}>项目创建时间</Text>
                  <div className={styles.infoValue}>
                    <Text>
                      {new Date(projectData.createdTime)
                        .toLocaleString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                        .replace(/\//g, "-")}
                    </Text>
                  </div>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoItem}>
                  <div className={styles.infoValue}>
                    {renderEditableSwitchField(
                      "isPublic",
                      "项目权限",
                      projectData.isPublic
                    )}
                  </div>
                </div>
              </div>

              {/* 条件渲染的字段 */}
              {role === 2 && (
                <>
                  <div className={styles.infoCard}>
                    <div className={styles.infoItem}>
                      <div
                        className={`${styles.infoValue} ${styles.copyableField}`}
                      >
                        {renderCopyableEditableField(
                          "groupCode",
                          "微信群号",
                          projectData?.groupCode || "暂无",
                          "微信群号"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoItem}>
                      <div
                        className={`${styles.infoValue} ${styles.copyableField}`}
                      >
                        {renderCopyableEditableField(
                          "webhook",
                          "企业微信群机器人URL",
                          projectData?.webhook || "暂无",
                          "Webhook地址"
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 项目描述单独一行 */}
            <div className={styles.infoCard} style={{ gridColumn: "1 / -1" }}>
              <div className={styles.infoItem}>
                <div className={styles.infoValue}>
                  {renderEditableField(
                    "description",
                    "项目简介",
                    projectData.description,
                    "textarea"
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className={styles.actionButtons}>
              {(userRole === 0 || userRole === 1) && (
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

              {userRole !== null && (
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
              )}
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
                <div>
                  <div className={styles.memberGroup}>
                    {/* <div className={styles.memberGroupTitle}>老板</div> */}
                    <Row gutter={[16, 16]}>
                      {renderMemberGrid(owners, "老板", 1)}
                    </Row>
                  </div>

                  <div className={styles.memberGroup}>
                    {/* <div className={styles.memberGroupTitle}>管理员</div> */}
                    <Row gutter={[16, 16]}>
                      {renderMemberGrid(admins, "管理员", 2)}
                    </Row>
                  </div>

                  <div className={styles.memberGroup}>
                    {/* <div className={styles.memberGroupTitle}>成员</div> */}
                    <Row gutter={[16, 16]}>
                      {renderMemberGrid(members, "成员", 3)}
                    </Row>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧信息栏 */}
        <div className={styles.rightColumn}>
          {/* 生成邀请码链接 */}
          {(userRole === 0 || userRole === 1) && (
            <div className={styles.section}>
              <Title level={4} className={styles.sectionTitle}>
                邀请好友加入项目
              </Title>
              <Button
                type="link"
                icon={<BookOutlined />}
                onClick={showInviteModal}
                className={styles.linkButton}
              >
                生成邀请码
              </Button>
            </div>
          )}

          {/* 教程链接 */}
          <div className={styles.section}>
            <Title level={4} className={styles.sectionTitle}>
              使用教程
            </Title>
            <Button
              type="link"
              icon={<BookOutlined />}
              onClick={showTutorialModal}
              className={styles.linkButton}
            >
              查看项目接入教程
            </Button>
          </div>

          {/*广告区域 */}
          <div className={styles.adSection}>
            <div className={styles.adCard}>
              <div className={styles.adHeader}>
                <Title level={5} className={styles.adTitle}>
                  🚀 升级您的项目体验
                </Title>
              </div>
              <div className={styles.adContent}>
                <div className={styles.adFeature}>
                  <span className={styles.adIcon}>⚡</span>
                  <Text className={styles.adText}>高性能API接口</Text>
                </div>
                <div className={styles.adFeature}>
                  <span className={styles.adIcon}>📊</span>
                  <Text className={styles.adText}>实时数据监控</Text>
                </div>
                <div className={styles.adFeature}>
                  <span className={styles.adIcon}>🔒</span>
                  <Text className={styles.adText}>企业级安全保障</Text>
                </div>
                <div className={styles.adFeature}>
                  <span className={styles.adIcon}>🎯</span>
                  <Text className={styles.adText}>智能分析报告</Text>
                </div>
              </div>
              <Button type="primary" className={styles.adButton} size="large">
                立即升级 Pro 版
              </Button>
              <Text className={styles.adSubtext}>30天免费试用，随时取消</Text>
            </div>
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
          {isTutorialModalLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin tip="加载中..." />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          )}
        </div>
      </Modal>
      {/* 邀请码弹窗 */}
      <Modal
        title="项目邀请码"
        open={isInviteModalVisible}
        onCancel={hideInviteModal}
        footer={[
          <Button key="close" onClick={hideInviteModal}>
            关闭
          </Button>,
        ]}
        width={400}
      >
        <div>
          {isInviteModalLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin tip="生成邀请码中..." />
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text>请将以下邀请码发送给您要邀请的用户：</Text>
              <div
                style={{
                  margin: "20px 0",
                  padding: "15px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                }}
              >
                {inviteCode}
              </div>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={copyInviteCodeToClipboard}
                style={{ marginTop: "10px" }}
              >
                复制邀请码
              </Button>
              <div
                style={{ marginTop: "15px", fontSize: "12px", color: "#999" }}
              >
                注意：此邀请码为一次性使用，十分钟内有效
              </div>
            </div>
          )}
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
                onClick: () =>
                  updateMemberRole(
                    contextMenuMember.userId,
                    contextMenuMember.userRole,
                    0
                  ),
              },
              {
                key: "role2",
                label: "设为管理员",
                onClick: () =>
                  updateMemberRole(
                    contextMenuMember.userId,
                    contextMenuMember.userRole,
                    1
                  ),
              },
              {
                key: "role3",
                label: "设为普通成员",
                onClick: () =>
                  updateMemberRole(
                    contextMenuMember.userId,
                    contextMenuMember.userRole,
                    2
                  ),
              },
              {
                key: "remove",
                label: "移除成员",
                danger: true,
                onClick: () =>
                  removeMember(
                    contextMenuMember.userId,
                    contextMenuMember.userRole
                  ),
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
