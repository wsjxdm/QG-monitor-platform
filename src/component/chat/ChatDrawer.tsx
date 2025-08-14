import React, { useState, useRef, useEffect } from "react";
import { Drawer, Input, Button, Spin, Avatar, message } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github.css";
import { chatAPI, getInfoAPI, submitInfoAPI } from "../../api/service/chat";

const { TextArea } = Input;

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// 添加新的消息接口，用于与后端通信
interface ChatMessage {
  id: string;
  sendId: number | string;
  receiverId: number | string;
  context: string;
  timestamp: Date;
}

const renderMarkdownContent = (content: string) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <pre
              style={{
                padding: "12px",
                borderRadius: "4px",
                overflowX: "auto",
                backgroundColor: "#f6f8fa",
              }}
            >
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
        h1: ({ node, ...props }) => (
          <h1
            style={{
              fontSize: "1.5em",
              fontWeight: "bold",
              margin: "16px 0 8px",
            }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            style={{
              fontSize: "1.3em",
              fontWeight: "bold",
              margin: "14px 0 7px",
            }}
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            style={{
              fontSize: "1.1em",
              fontWeight: "bold",
              margin: "12px 0 6px",
            }}
            {...props}
          />
        ),
        p: ({ node, ...props }) => <p style={{ margin: "8px 0" }} {...props} />,
        ul: ({ node, ...props }) => (
          <ul style={{ paddingLeft: "20px", margin: "8px 0" }} {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol style={{ paddingLeft: "20px", margin: "8px 0" }} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li style={{ margin: "4px 0" }} {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            style={{
              borderLeft: "4px solid #d0d7de",
              paddingLeft: "16px",
              margin: "16px 0",
              color: "#57606a",
            }}
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a style={{ color: "#0969da" }} {...props} />
        ),
        table: ({ node, ...props }) => (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "16px 0",
            }}
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            style={{
              padding: "6px 13px",
              border: "1px solid #d0d7de",
              backgroundColor: "#f6f8fa",
              fontWeight: "bold",
            }}
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            style={{
              padding: "6px 13px",
              border: "1px solid #d0d7de",
            }}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const ChatDrawer: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]); // 用于存储新对话
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id; // 假设用户信息存储在 localStorage 的 "user" 键中

  // 初始化消息
  useEffect(() => {
    if (visible && userId) {
      initializeMessages();
    }
  }, [visible, userId]);

  // 组件卸载时提交新消息
  useEffect(() => {
    return () => {
      if (newMessages.length > 0) {
        submitNewMessages();
      }
    };
  }, [newMessages]);

  const initializeMessages = async () => {
    try {
      const response = await getInfoAPI(userId);

      // 转换消息格式
      const formattedMessages: Message[] = response
        .map((msg: any) => ({
          id: msg.id,
          content: msg.context,
          role: msg.sendId === 0 ? "assistant" : "user",
          timestamp: new Date(msg.timestamp || Date.now()),
        }))
        .sort(
          (a: Message, b: Message) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      setMessages(formattedMessages);
      setNewMessages([]); // 重置新消息数组
    } catch (error) {
      console.error("获取历史消息失败:", error);
      message.error("获取历史消息失败");

      // 如果获取失败，设置默认欢迎消息
      setMessages([
        {
          id: "1",
          content: "您好！我是AI助手，有什么可以帮助您的吗？",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const submitNewMessages = async () => {
    if (newMessages.length === 0) return;

    try {
      await submitInfoAPI(newMessages);
      console.log("新消息已提交:", newMessages);
    } catch (error) {
      console.error("提交消息失败:", error);
      message.error("消息提交失败");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    // 添加用户消息到显示列表
    setMessages((prev) => [...prev, userMessage]);

    // 添加用户消息到新消息列表（用于提交到后端）
    const newUserMessage: ChatMessage = {
      id: userMessage.id,
      sendId: userId,
      receiverId: 0, // 发送给AI
      context: inputValue,
      timestamp: userMessage.timestamp,
    };
    setNewMessages((prev) => [...prev, newUserMessage]);

    setInputValue("");
    setLoading(true);

    try {
      // 调用AI接口
      const response = await chatAPI(inputValue);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content:
          response.data?.reply ||
          response.reply ||
          "抱歉，我没有理解您的问题。",
        role: "assistant",
        timestamp: new Date(),
      };

      // 添加AI消息到显示列表
      setMessages((prev) => [...prev, aiMessage]);

      // 添加AI消息到新消息列表（用于提交到后端）
      const newAiMessage: ChatMessage = {
        id: aiMessage.id,
        sendId: 0, // AI发送
        receiverId: userId,
        context: aiMessage.content,
        timestamp: aiMessage.timestamp,
      };
      setNewMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("与AI通信失败:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "抱歉，与AI通信失败，请稍后重试。",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (message: Message) => {
    return renderMarkdownContent(message.content);
  };

  // 处理抽屉关闭
  const handleDrawerClose = () => {
    // 组件卸载时提交新消息
    if (newMessages.length > 0) {
      submitNewMessages();
    }
    onClose();
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
      onClose={handleDrawerClose}
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
                  padding: "5px 14px",
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
                <div className="message-content">
                  {renderMessageContent(message)}
                </div>
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
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                scrollbarWidth: "none",
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
