import Form from "./component/form";
import Introduction from "./component/introduction";
import Title from "./component/title";
import Footer from "./component/foot"; // 引入Footer组件
import React from "react";
import { Row, Col } from "antd";

const Home: React.FC = () => {
    return (
        <div style={{
            width: "100%",
            minHeight: "100vh",
            margin: "0 auto",
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Title />
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: "linear-gradient(170deg, rgb(255, 255, 255) 32%, rgb(24, 144, 255) 43%, rgb(0, 201, 183) 100%)",
                justifyContent: 'center'
            }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                }}>
                    <div style={{ width: '100%', maxWidth: '1200px' }}>
                        <Row
                            gutter={[0, 24]} // 减少水平间距从24到12
                            justify="center"
                            style={{ margin: 0 }}
                        >
                            <Col xs={24} md={9} lg={9}> {/* 调整列宽 */}
                                <Introduction />
                            </Col>
                            <Col xs={24} md={11} lg={13}> {/* 调整列宽 */}
                                <Form />
                            </Col>
                        </Row>
                    </div>
                </div>
                <Footer /> {/* 将Footer放在内容区域之后，但在主容器内 */}
            </div>
        </div>
    );
};

export default Home;