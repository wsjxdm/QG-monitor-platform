import { Tabs, ConfigProvider } from "antd";
import Loginform from "./loginform";
import RegisterForm from "./register";
import React from "react";

const Form = () => {
    const items = [
        {
            key: '1',
            label: `登录`,
            children: <Loginform />,
        },
        {
            key: '2',
            label: `注册`,
            children: <RegisterForm />,
        },
    ]

    return (
        <div style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            height: 'auto', // 改为自动高度
            minHeight: '400px', // 设置最小高度而不是固定高度
            display: 'flex',
            flexDirection: 'column'
        }}>
            <ConfigProvider
                theme={{
                    components: {
                        Tabs: {
                            colorPrimary: '#1890ff',
                            inkBarColor: "#1890ff"
                        }
                    }
                }}
            >
                <Tabs
                    items={items}
                    centered
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                />
            </ConfigProvider>
        </div>
    );
};

export default Form;