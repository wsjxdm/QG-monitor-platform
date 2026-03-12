import { Tabs, ConfigProvider } from "antd";
import Loginform from "./loginform";
import RegisterForm from "./register";
import { useState } from "react"; // 添加 useState

const Form = () => {
    const [activeKey, setActiveKey] = useState('1'); // 添加状态管理

    //修改一下bug 
    //添加了key之后每次切换回注册tab都会创建一个新的RegisterForm组件，不会出现复用之前填入表单的信息
    const [registerFormKey, setRegisterFormKey] = useState(0);

    const handleTabChange = (key: string) => {
        setActiveKey(key);
        if (key === '1') {
            setRegisterFormKey(prev => prev + 1);
        }
    };

    const items = [
        {
            key: '1',
            label: `登录`,
            children: <Loginform />,
        },
        {
            key: '2',
            label: `注册`,
            children: <RegisterForm key={registerFormKey} onTabChange={handleTabChange} />,
        },
    ];

    return (
        <div
            style={{
                background: 'white',
                borderRadius: '10px',
                padding: '20px',
                height: 'auto',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 16px rgb(24, 144, 255)',
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
                    activeKey={activeKey} // 绑定当前激活的 tab
                    onChange={handleTabChange} // tab 切换时的回调
                    items={items}
                    centered
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                />
            </ConfigProvider>
        </div>
    );
};

export default Form;