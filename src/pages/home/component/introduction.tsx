import React from 'react';
import { Typography, Row, Col, Image } from 'antd';

const { Title, Text } = Typography;

const Introduction: React.FC = () => {
    return (
        <div style={{
            background: 'white',
            color: '#000',
            padding: '50px',
            textAlign: 'left',
            border: "1px solid #ccc",
            borderRadius: "15px",
            height: 'auto', // 改为自动高度
            maxWidth: '50%', // 限制最大宽度
            margin: '0 auto',
        }}>
            <Title level={2} style={{
                margin: '0 0 15px 0',
                color: '#000',
                fontSize: '26px'
            }}>
                Start monitoring today
            </Title>
            <Text style={{
                marginBottom: '15px',
                display: 'block',
                color: '#000',
                fontSize: '17px', // 稍微减小正文字体
                lineHeight: '1.5'
            }}>
                Sentry helps over 4M developers and 130K organizations see what actually matters, solve errors and performance issues quicker.
            </Text>
            <Text strong style={{
                display: 'block',
                marginBottom: '15px',
                color: '#000',
                fontSize: '12px'
            }}>
                THESE FOLKS GET IT:
            </Text>
            <Row gutter={[12, 12]} justify="start">
                <Col xs={12} sm={6}>
                    <Image
                        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        width="100%"
                        preview={false}
                        style={{ maxHeight: '60px', objectFit: 'contain' }}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Image
                        src="https://www.atlassian.com/static/responsive/logo/atlassian-fullcolor-darkmode.svg"
                        width="100%"
                        preview={false}
                        style={{ maxHeight: '60px', objectFit: 'contain' }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Introduction;