import React from "react";
import { Typography, Button } from "antd";
import { useRef } from "react";
import { use3DTilt } from "../../hook/3D";

const { Title, Text } = Typography;

const Mobile: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  use3DTilt(containerRef);

  const handleDownload = () => {
    const downloadUrl = "/path/to/your/mobile/app.apk";
    window.location.href = downloadUrl;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(170deg, rgb(255, 255, 255) 32%, rgb(24, 144, 255) 43%, rgb(0, 201, 183) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        ref={containerRef}
        style={{
          background: "white",
          color: "#000",
          padding: "50px",
          textAlign: "left",
          borderRadius: "15px",
          height: "auto",
          maxWidth: "85%",
          margin: "0 auto",
          boxShadow: "0 8px 16px rgb(24, 144, 255)",
        }}
      >
        <Title
          level={2}
          style={{
            margin: "0 0 15px 0",
            color: "#000",
            fontSize: "26px",
          }}
        >
          移动端应用下载
        </Title>
        <Text
          style={{
            marginBottom: "30px",
            display: "block",
            color: "#000",
            fontSize: "17px",
            lineHeight: "1.5",
          }}
        >
          检测到您正在使用移动设备访问，建议下载我们的移动端应用以获得更好的体验。
        </Text>
        <Button
          type="primary"
          size="large"
          onClick={handleDownload}
          style={{
            width: "100%",
            backgroundColor: "rgb(24, 144, 255)",
            borderColor: "rgb(24, 144, 255)",
            fontSize: "16px",
            height: "45px",
            transition: "all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#667eea";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgb(24, 144, 255)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          点击下载移动端应用
        </Button>
      </div>
    </div>
  );
};

export default Mobile;
