import { Form, Input, Button, Typography, Space, message } from "antd";
import { useState, useEffect } from "react";
import '@ant-design/v5-patch-for-react-19';
import { getCodeAPI } from "../../../api/service/userService";
import { login } from "../../../api/service/userService";
import { findPassword } from "../../../api/service/userService";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/slice/userSlice";

const Loginform = () => {
    const [form] = Form.useForm();
    const { Text } = Typography;
    const [isForgotPassword, setIsForgotPassword] = useState(false); // 切换登录和找回密码
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleForgotPassword = () => {
        setIsForgotPassword(true);
    };
    const handleBackToLogin = () => {
        setIsForgotPassword(false);
    };

    //登录成功后的处理
    const handleLogin = async (values: any) => {
        const response = await login(values.email, values.password)
        if (response.code === 200) {
            console.log("登录成功");
            navigate("/main");
            dispatch(setUser(response.data));
        }
    };

    //发送验证码的倒计时
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown]);
    //获取验证码
    const handleGetCode = async () => {

        const email = form.getFieldValue("email");

        if (!email) {
            message.error("请输入邮箱");
            return;
        }
        const response = await getCodeAPI(email);

        if (response.code === 200) {
            setCountdown(60);
            message.success("验证码已发送");
        } else {
            message.error("验证码发送失败");
        }
    };
    //找回密码
    const handlefindPassword = async () => {
        const response = await findPassword(
            form.getFieldValue("email"),
            form.getFieldValue("code"),
            form.getFieldValue("password")
        );
        if (response.code === 200) {
            message.success("密码修改成功");
            setIsForgotPassword(false);
        } else {
            message.error("验证码错误");
        }
    };

    if (!isForgotPassword) {
        return (
            <div className="login-form">
                <Form
                    form={form}
                    name="login"
                    onFinish={handleLogin}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[
                            { required: true, message: "请输入邮箱!" },
                            { type: "email", message: "请输入有效的邮箱!" },
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[
                            { required: true, message: "请输入密码!" },
                            { min: 6, message: "密码至少6个字符!" },
                        ]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block
                            style={{ backgroundColor: '#1890ff' }}>
                            登录
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Text type="secondary">
                            <Button
                                type="link"
                                size="small"
                                onClick={handleForgotPassword}
                                style={{ float: "right" }}
                            >
                                忘记密码？
                            </Button>
                        </Text>
                    </Form.Item>
                </Form>
            </div>
        )
    }
    return (
        <div>
            <Form
                form={form}
                name="findPassword"
                onFinish={handlefindPassword}
                layout="vertical"
                autoComplete="off"
            >
                <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[{ required: true, type: "email", message: "请输入有效邮箱" }]}
                >
                    <Input placeholder="请输入邮箱" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="新密码"
                    rules={[
                        { required: true, message: "请输入新密码" },
                        { min: 6, message: "密码至少6个字符!" },
                    ]}
                >
                    <Input.Password placeholder="请输入新密码" />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    rules={[
                        { required: true, message: "请输入确认密码" },
                        { min: 6, message: "密码至少6个字符!" },
                    ]}
                >
                    <Input.Password placeholder="请输入确认密码" />
                </Form.Item>
                <Form.Item
                    label="验证码"
                    required
                    rules={[{ required: true, message: "请输入验证码" }]}
                >
                    <Space.Compact>
                        <Form.Item
                            name="code"
                            noStyle
                            rules={[{ required: true, message: "请输入验证码" }]}
                        >
                            <Input.OTP
                                formatter={(str) => str.toUpperCase()}
                                style={{ flex: 1 }}
                            />
                        </Form.Item>
                        <Button
                            type="link"
                            onClick={handleGetCode}
                            disabled={countdown > 0}
                        >
                            {countdown > 0 ? `(${countdown})秒后重新发送` : '发送验证码'}
                        </Button>
                    </Space.Compact>
                </Form.Item>

                <Form.Item>
                    <Space>
                        {/* 这里发送完可以显示一个多少秒后继续发送 */}
                        <Button type="primary" htmlType="submit" block
                            style={{ backgroundColor: '#1890ff' }}>
                            确认修改密码
                        </Button>
                        <Button htmlType="button">
                            {/* onClick={onReset} */}
                            重置
                        </Button>
                    </Space>
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                    <Text type="secondary">
                        <Button
                            type="link"
                            size="small"
                            onClick={handleBackToLogin}
                            style={{ float: "right" }}
                        >
                            返回登录
                        </Button>
                    </Text>
                </Form.Item>
            </Form>
        </div>
    );
}



export default Loginform;