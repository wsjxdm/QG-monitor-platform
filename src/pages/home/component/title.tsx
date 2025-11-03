import React from 'react';
import { Layout, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const CustomHeader: React.FC = () => {
    return (
        <Header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            padding: '0 24px',
            height: '64px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
            <Title
                level={3}
                style={{
                    color: '#fff',
                    margin: 0,
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(90deg, #1890ff, #00c9b7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                MINI-SENTRY
            </Title>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <QuestionCircleOutlined style={{ fontSize: '20px', color: 'black', cursor: 'pointer' }} />
            </div>
        </Header>
    );
};

export default CustomHeader;