import { Form, Input, Button, Typography } from "antd";



const Loginform = () => {

    const [form] = Form.useForm();
    const { Text } = Typography;
    return (
        <div className="login-form">
            <Form
                form={form}
                name="login"
                // onFinish={handleLogin}
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
                        style={
                            {
                                backgroundColor: '#1890ff'
                            }
                        }>
                        登录
                    </Button>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Text type="secondary">
                        <Button
                            type="link"
                            size="small"
                            // onClick={() =>
                            // }
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

export default Loginform;