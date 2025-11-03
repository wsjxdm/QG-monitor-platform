import React from 'react';
import { Row, Col, Typography } from 'antd';

const { Title, Text } = Typography;

const Footer: React.FC = () => {
    return (
        <div style={{
            color: '#fff',
            padding: '40px 0',
            textAlign: 'center'
        }}>
            <Title level={3} style={{ margin: '0 0 20px 0', color: '#fff' }}>
                Getting started is easy
            </Title>
            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} sm={12} md={8}>
                    <Title level={4} style={{ margin: '0 0 10px 0' }}>
                        Start for free
                    </Title>
                    <Text>
                        Start with Sentry's 14-day free Business plan trial - after the trial is over, you can either use Sentry's free plan or scale based on your needs.
                    </Text>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Title level={4} style={{ margin: '0 0 10px 0' }}>
                        No contracts
                    </Title>
                    <Text>
                        You can upgrade or downgrade at any time, and we'll automatically adjust your rate at the beginning of your next billing cycle.
                    </Text>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Title level={4} style={{ margin: '0 0 10px 0' }}>
                        Save money
                    </Title>
                    <Text>
                        If you need more events than what's included in your plan, we got you. Either set a pay-as-you-go event budget or save 20% by reserving in advance.
                    </Text>
                </Col>
            </Row>
        </div>
    );
};

export default Footer;