import React, { use, useEffect, useState } from "react";
import styles from "./SettingProfile.module.css";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Typography,
  Divider,
  Form,
  Input,
  Button,
  message,
  Popconfirm,
  Row,
  Col,
  Upload,
} from "antd";
import { deleteUserAPI } from "../../../api/service/userService";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "../../../store/slice/userSlice";
import { updateUserAvatarAPI } from "../../../api/service/userService";
import { setAvatar } from "../../../store/slice/userSlice";
import { useSelector } from "react-redux";
import { clearUser } from "../../../store/slice/userSlice";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const SettingProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const userInfo = useSelector((state) => state.user.user);
  const [userData, setUserData] = useState({});
  const [avatarUrl, setAvatarUrl] = useState<string>(userData.avatar);
  const [formData, setFormData] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setUserData(userInfo);
    setAvatarUrl(userData.avatar);
    console.log("[头像更新] >", userData.avatar);
  }, [userInfo]);

  useEffect(() => {
    setAvatarUrl(userData.avatar);
  }, [userData]);

  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue(userData);
  };

  // 保存修改
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // await updateUserAPI(values);
      dispatch(
        updateUserInfo({
          user: {
            id: userInfo.id,
            username: values.name,
            email: values.email,
          },
        })
      );

      if (formData) {
        const response = await updateUserAvatarAPI(formData);
        console.log(
          "这里是updateUserAvatarAPI更新头像的返回头像链接",
          response.data
        );

        if (response.code === 200) {
          dispatch(setAvatar(response.data));
          console.log("使用dispatch后检查redux是否储存了头像", userInfo);
          message.success("修改头像成功");
        } else {
          message.error("修改头像失败");
        }
      }

      setIsEditing(false);
      message.success("信息更新成功");
    } catch (error) {
      message.error("请检查输入信息");
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
    setAvatarUrl(userData.avatar); // 恢复头像
  };

  // 退出登录+
  const handleDeleteAccount = async () => {
    dispatch(clearUser());
    message.success("退出登录成功");
    navigate("/");
  };

  // 处理头像上传
  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done") {
      // 这里应该上传到服务器并获取返回的URL
      // 目前使用本地预览
      const formData = new FormData();
      formData.append("avatar", info.file.originFileObj);
      const updateid = JSON.parse(localStorage.getItem("user")).id;
      formData.append("userId", updateid);
      setFormData(formData);
      if (info.file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarUrl(e.target?.result as string);
        };
        reader.readAsDataURL(info.file.originFileObj);
      }
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  // 自定义上传请求（模拟）
  const customRequest = ({ file, onSuccess }: any) => {
    setTimeout(() => {
      onSuccess?.("ok");
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <Title level={3} className={styles.pageTitle}>
        个人信息
      </Title>

      <div className={styles.content}>
        <Row gutter={[24, 24]}>
          {/* 左侧用户信息区域 */}
          <Col xs={24} lg={16}>
            <div className={styles.section}>
              <Title level={4} className={styles.sectionTitle}>
                基本信息
              </Title>

              <Form form={form} layout="vertical" className={styles.form}>
                {/* 用户名 */}
                <Form.Item
                  label="用户名"
                  name="name"
                  rules={[{ required: true, message: "请输入用户名" }]}
                  className={styles.formItem}
                >
                  {isEditing ? (
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入用户名"
                    />
                  ) : (
                    <Text className={styles.infoText}>{userData.name}</Text>
                  )}
                </Form.Item>

                {/* 邮箱 */}
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: "请输入邮箱" },
                    { type: "email", message: "请输入有效的邮箱地址" },
                  ]}
                  className={styles.formItem}
                >
                  {isEditing ? (
                    <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                  ) : (
                    <Text className={styles.infoText}>{userData.email}</Text>
                  )}
                </Form.Item>

                {/* 手机 */}
                <Form.Item
                  label="手机"
                  name="phone"
                  // rules={[
                  //   { required: true, message: "请输入手机号" },
                  //   { type: "phone", message: "请输入有效的手机号地址" },
                  // ]}
                  className={styles.formItem}
                >
                  {isEditing ? (
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="请输入手机号"
                    />
                  ) : (
                    <Text className={styles.infoText}>{userData.phone}</Text>
                  )}
                </Form.Item>

                {/* 创建时间 */}
                <Form.Item
                  label="账号创建时间"
                  name="created_time"
                  className={styles.formItem}
                >
                  <Text className={styles.infoText}>
                    <CalendarOutlined /> {userData.createdAt}
                  </Text>
                </Form.Item>
              </Form>
            </div>
          </Col>

          {/* 右侧头像区域 */}
          <Col xs={24} lg={8}>
            <div className={styles.section}>
              <Title level={4} className={styles.sectionTitle}>
                头像
              </Title>
              <div className={styles.avatarSection}>
                <Upload
                  name="avatar"
                  showUploadList={false}
                  customRequest={customRequest}
                  onChange={handleAvatarChange}
                  disabled={!isEditing}
                >
                  <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    src={avatarUrl}
                    className={styles.avatar}
                  />
                </Upload>
                <Text type="secondary" className={styles.avatarHint}>
                  {isEditing ? "点击头像可更换图片" : "编辑状态下可更换头像"}
                </Text>
                {isEditing && (
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    customRequest={customRequest}
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="small"
                      disabled={!isEditing}
                    >
                      上传新头像
                    </Button>
                  </Upload>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* 操作按钮区域 */}
        <div className={styles.actionsSection}>
          <Divider />
          <div className={styles.actions}>
            {isEditing ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  className={styles.actionButton}
                >
                  保存
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  className={styles.actionButton}
                >
                  取消
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className={styles.actionButton}
              >
                编辑信息
              </Button>
            )}

            <div className={styles.rightActions}>
              <Popconfirm
                title="确定退出登录吗？"
                // description="注销后所有数据将被永久删除，无法恢复"
                onConfirm={handleDeleteAccount}
                okText="确定"
                cancelText="取消"
              >
                <Button danger className={styles.deleteButton}>
                  退出登录
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingProfile;
