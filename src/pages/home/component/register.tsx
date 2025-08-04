import { Form, Input, Button, Space } from "antd";




const RegisterForm = () => {

    const [form] = Form.useForm();
    return (
        <div className="login-form">
            <Form
                form={form}
                name="register"
                // onFinish={onFinish}
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
                    label="密码"
                    rules={[
                        { required: true, message: "请输入密码" },
                        { min: 6, message: "密码至少6个字符!" },
                    ]}
                >
                    <Input.Password placeholder="请输入密码" />
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
                        // onClick={handlerSendVerificationCode}
                        // disabled={countdown > 0}
                        >
                            {/* {countdown > 0 ? `${countdown}s后重试` : "发送验证码"} */}
                        </Button>
                    </Space.Compact>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" block
                            style={
                                {
                                    backgroundColor: '#1890ff'
                                }
                            }>
                            注册
                        </Button>
                        <Button htmlType="button">
                            {/* onClick={onReset} */}
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterForm;