import React, { useState, useRef, useEffect } from "react";
import { Drawer, Input, Button, Spin, Avatar } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const ChatDrawer: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "您好！我是AI助手，有什么可以帮助您的吗？",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `我收到了您的消息："${inputValue}"。这是一个模拟回复。`,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("发送消息失败:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，消息发送失败，请稍后重试。",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RobotOutlined />
          <span>AI 助手</span>
        </div>
      }
      placement="right"
      closable
      onClose={onClose}
      open={visible}
      width={400}
      bodyStyle={{ padding: 0, backgroundColor: "#f7faff" }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* 消息区域 */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "12px",
              }}
            >
              {message.role === "assistant" && (
                <Avatar
                  style={{
                    backgroundColor: "#87d4f2",
                    marginRight: "8px",
                    flexShrink: 0,
                  }}
                  icon={<RobotOutlined />}
                />
              )}
              <div
                style={{
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: "20px",
                  background:
                    message.role === "user"
                      ? "linear-gradient(135deg, #b6e0fe, #88c9f9)"
                      : "#fff",
                  color: message.role === "user" ? "#034078" : "#000",
                  wordBreak: "break-word",
                  boxShadow:
                    message.role === "assistant"
                      ? "0 2px 6px rgba(0,0,0,0.06)"
                      : "none",
                }}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar
                  style={{
                    backgroundColor: "#88c9f9",
                    marginLeft: "8px",
                    flexShrink: 0,
                  }}
                  icon={<UserOutlined />}
                />
              )}
            </div>
          ))}
          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "12px",
              }}
            >
              <Avatar
                style={{
                  backgroundColor: "#87d4f2",
                  marginRight: "8px",
                  flexShrink: 0,
                }}
                icon={<RobotOutlined />}
              />
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "20px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <Spin size="small" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #e8e8e8",
            backgroundColor: "#f7faff",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handlePressEnter}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{
                borderRadius: "20px",
                resize: "none",
                padding: "8px 12px",
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              shape="circle"
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;
