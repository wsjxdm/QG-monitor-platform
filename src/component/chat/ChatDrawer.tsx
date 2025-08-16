import React, { useState, useRef, useEffect } from "react";
import { Drawer, Input, Button, Spin, Avatar, message, Switch, Tooltip } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined, ThunderboltOutlined, HistoryOutlined, ClockCircleOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github.css";
import { useParams } from "react-router-dom";
import { chatAPI, getInfoAPI, submitInfoAPI } from "../../api/service/chat";
import styles from "./ChatDrawer.module.css";

const { TextArea } = Input;


interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type?: string;
  isHistorical?: boolean;
}

interface ChatMessage {
  sendId?: number | string;
  receiverId?: number | string;
  context: string;
}

const renderMarkdownContent = (content: string) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className={className}
                style={{
                  background: "rgba(79, 172, 254, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <pre
              style={{
                padding: "16px",
                borderRadius: "8px",
                overflowX: "auto",
                background: "linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)",
                border: "1px solid #e8ecf0",
                margin: "12px 0"
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
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const [predictMode, setPredictMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [historicalMessageCount, setHistoricalMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { projectId } = useParams<{ projectId: string }>();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const initializeMessages = async () => {
    if (isInitialized) {
      return;
    }

    try {
      setIsInitialized(true);
      const response = await getInfoAPI(userId);

      if (response && response.code === 404) {
        const welcomeMessage = {
          id: "welcome-1",
          content: `您好！我是AI助手，我可以帮助您分析项目 ${projectId} 的相关问题。有什么可以帮助您的呢？`,
          role: "assistant" as const,
          timestamp: new Date(),
          isHistorical: false,
        };
        setMessages([welcomeMessage]);
        setNewMessages([]);
        return;
      }

      if (response && response.code === 200 && response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          const welcomeMessage = {
            id: "welcome-1",
            content: `您好！我是AI助手，我可以帮助您分析项目 ${projectId} 的相关问题。有什么可以帮助您的呢？`,
            role: "assistant" as const,
            timestamp: new Date(),
            isHistorical: false,
          };
          setMessages([welcomeMessage]);
          setNewMessages([]);
          return;
        }

        const formattedMessages: Message[] = response.data.map((msg: any, index: number) => {
          let role: "user" | "assistant";
          const msgSendId = Number(msg.sendId);
          const currentUserId = Number(userId);

          if (msgSendId === 0) {
            role = "assistant";
          } else if (msgSendId === currentUserId) {
            role = "user";
          } else {
            role = "assistant";
          }

          const baseTime = new Date().getTime() - (response.data.length - index) * 60000;

          return {
            id: String(msg.id),
            content: msg.context || "消息内容为空",
            role: role,
            timestamp: new Date(baseTime),
            type: msg.type === "predict" ? "predict" : undefined,
            isHistorical: true,
          };
        }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        setMessages(formattedMessages);
        setHistoricalMessageCount(formattedMessages.length);
        setNewMessages([]);

      } else {
        const welcomeMessage = {
          id: "welcome-1",
          content: `您好！我是AI助手，我可以帮助您分析项目 ${projectId} 的相关问题。有什么可以帮助您的呢？`,
          role: "assistant" as const,
          timestamp: new Date(),
          isHistorical: false,
        };
        setMessages([welcomeMessage]);
        setNewMessages([]);
      }

    } catch (error) {
      const welcomeMessage = {
        id: "welcome-1",
        content: `您好！我是AI助手，我可以帮助您分析项目 ${projectId} 的相关问题。有什么可以帮助您的呢？`,
        role: "assistant" as const,
        timestamp: new Date(),
        isHistorical: false,
      };
      setMessages([welcomeMessage]);
      setNewMessages([]);
    }
  };

  useEffect(() => {
    if (visible && userId && !isInitialized) {
      initializeMessages();
    }
  }, [visible, userId]);

  useEffect(() => {
    if (!visible) {
      setIsInitialized(false);
    }
  }, [visible]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  const submitNewMessages = async () => {
    if (newMessages.length === 0) {
      return;
    }

    try {
      await submitInfoAPI(newMessages);
      setNewMessages([]);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const backupKey = `chat-backup-${userId}-${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(newMessages));
        message.warning("聊天记录已暂存本地，等待后端接口修复");
      } else {
        message.error("聊天记录保存失败，请稍后重试");
      }
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || loading || !userId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: "user",
      timestamp: new Date(),
      type: predictMode ? "predict" : undefined,
      isHistorical: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      let aiReplyContent: string;

      try {
        const response = await chatAPI(currentInput, projectId);

        // 检查响应状态和数据
        if (response.code === 200 && response.data?.reply) {
          aiReplyContent = response.data.reply;
        } else {
          aiReplyContent = "抱歉，AI服务暂时无法处理您的请求。";
        }
      } catch (aiError) {
        console.error("AI通信错误:", aiError);
        aiReplyContent = "抱歉，与AI服务通信失败，请稍后重试。";
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiReplyContent,
        role: "assistant",
        timestamp: new Date(),
        type: predictMode ? "predict" : undefined,
        isHistorical: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      const newUserMessage: ChatMessage = {
        sendId: userId,
        context: currentInput,
      };

      const newAiMessage: ChatMessage = {
        receiverId: userId,
        context: aiMessage.content,
      };

      setNewMessages((prev) => [...prev, newUserMessage, newAiMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "抱歉，服务暂时不可用，请稍后重试。",
        role: "assistant",
        timestamp: new Date(),
        isHistorical: false,
      };
      setMessages((prev) => [...prev, errorMessage]);

      const newUserMessage: ChatMessage = {
        sendId: userId,
        context: currentInput,
      };

      const newErrorMessage: ChatMessage = {
        receiverId: userId,
        context: errorMessage.content,
      };

      setNewMessages((prev) => [...prev, newUserMessage, newErrorMessage]);
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
    return (
      <div>
        {renderMarkdownContent(message.content)}
      </div>
    );
  };

  const handleDrawerClose = async () => {
    if (newMessages.length > 0) {
      try {
        await submitNewMessages();
      } catch (error) {
        console.error("保存聊天记录失败:", error);
      }
    }
    onClose();
  };

  const handleTextAreaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.borderColor = predictMode ? "#667eea" : "#4facfe";
    target.style.boxShadow = predictMode
      ? "0 4px 20px rgba(102, 126, 234, 0.15)"
      : "0 4px 20px rgba(79, 172, 254, 0.15)";
  };

  const handleTextAreaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.borderColor = predictMode
      ? "rgba(102, 126, 234, 0.2)"
      : "rgba(79, 172, 254, 0.2)";
    target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (!target.disabled) {
      target.style.transform = "scale(1.05)";
      target.style.boxShadow = predictMode
        ? "0 6px 20px rgba(102, 126, 234, 0.5)"
        : "0 6px 20px rgba(79, 172, 254, 0.5)";
    }
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.transform = "scale(1)";
    target.style.boxShadow = predictMode
      ? "0 4px 16px rgba(102, 126, 234, 0.4)"
      : "0 4px 16px rgba(79, 172, 254, 0.4)";
  };

  return (
    <Drawer
      title={
        <div className={styles.drawerHeader}>
          <div className={styles.avatarContainer}>
            <RobotOutlined style={{ color: "#fff", fontSize: "18px" }} />
          </div>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              AI 智能助手
            </div>
            {/* {projectId && (
              <div className={styles.projectBadge}>
                项目: {projectId}
              </div>
            )} */}
          </div>
          {newMessages.length > 0 && (
            <div className={styles.messageCountBadge}>
              新消息: {newMessages.length}
            </div>
          )}
        </div>
      }
      placement="right"
      closable
      onClose={handleDrawerClose}
      open={visible}
      width={750} // 增加宽度从420px到600px
      bodyStyle={{
        padding: 0,
        background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
        height: "100%"
      }}
      headerStyle={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      <div className={styles.mainContainer}>
        {/* 预测模式切换 */}
        <div className={styles.predictModeSection}>
          <Tooltip title="启用AI深度分析模式，获得更智能的预测性回答">
            <div className={styles.predictModeContent}>
              <div className={`${styles.predictModeIcon} ${predictMode ? styles.predictModeIconActive : styles.predictModeIconInactive}`}>
                <ThunderboltOutlined style={{
                  color: predictMode ? "#fff" : "rgba(255, 255, 255, 0.8)",
                  fontSize: "16px",
                  transform: predictMode ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.3s ease"
                }} />
              </div>
              <div className={styles.predictModeTextContainer}>
                <div className={styles.predictModeTitle}>
                  AI深度分析
                </div>
                <div className={styles.predictModeSubtitle}>
                  {predictMode ? "智能预测已启用" : "点击启用预测模式"}
                </div>
              </div>
            </div>
          </Tooltip>
          <Switch
            checked={predictMode}
            onChange={setPredictMode}
            style={{
              backgroundColor: predictMode ? "#ff9a9e" : "rgba(255, 255, 255, 0.3)"
            }}
          />
        </div>

        {/* 消息区域 */}
        <div className={`${styles.messagesContainer} ${styles.chatDrawerContent}`}>
          {/* 优化的历史消息分割线 */}
          {historicalMessageCount > 0 && (
            <div className={styles.historicalDivider}>
              <div className={styles.historicalDividerLine}></div>
              <div className={styles.historicalDividerContent}>
                <div className={styles.historicalIcon}>
                  <ClockCircleOutlined />
                </div>
                <div className={styles.historicalInfo}>
                  <div className={styles.historicalTitle}>历史对话记录</div>
                  <div className={styles.historicalCount}>{historicalMessageCount} 条消息</div>
                </div>
              </div>
              <div className={styles.historicalDividerLine}></div>
            </div>
          )}

          {messages.map((message, index) => {
            const isFirstNewMessage = index > 0 &&
              messages[index - 1].isHistorical &&
              !message.isHistorical;

            return (
              <React.Fragment key={message.id}>
                {/* 优化的新消息分割线 */}
                {isFirstNewMessage && (
                  <div className={styles.newMessageDivider}>
                    <div className={styles.newMessageDividerLine}></div>
                    <div className={styles.newMessageDividerContent}>
                      <div className={styles.newMessageIcon}>
                        ✨
                      </div>
                      <span className={styles.newMessageText}>本次对话开始</span>
                    </div>
                    <div className={styles.newMessageDividerLine}></div>
                  </div>
                )}

                <div
                  className={`${styles.messageItem} ${message.role === "user" ? styles.messageItemUser : styles.messageItemAssistant
                    }`}
                  style={{
                    opacity: message.isHistorical ? 0.85 : 1,
                  }}
                >
                  {message.role === "assistant" && (
                    <Avatar
                      className={`${styles.messageAvatar} ${styles.messageAvatarLeft} ${message.type === "predict" ? styles.messageAvatarPredict : ""
                        }`}
                      icon={message.type === "predict" ? <ThunderboltOutlined /> : <RobotOutlined />}
                      style={{
                        border: message.isHistorical ? "2px solid #e8e8e8" : undefined,
                      }}
                    />
                  )}
                  <div
                    className={`${styles.messageBubble} ${message.role === "user"
                      ? `${styles.messageBubbleUser} ${message.type === "predict" ? styles.messageBubbleUserPredict : ""}`
                      : styles.messageBubbleAssistant
                      }`}
                    style={{
                      background: message.isHistorical
                        ? (message.role === "user"
                          ? "linear-gradient(135deg, #b8b8b8 0%, #d0d0d0 100%)"
                          : "#f8f8f8")
                        : undefined,
                      border: message.isHistorical && message.role === "assistant"
                        ? "1px solid #e8e8e8"
                        : undefined,
                    }}
                  >
                    {message.isHistorical && (
                      <div className={`${styles.messageBadge} ${message.role === "user" ? styles.messageBadgeUser : styles.messageBadgeAssistant
                        }`}
                        style={{
                          color: message.role === "user" ? "rgba(255, 255, 255, 0.7)" : "#999"
                        }}
                      >
                        <HistoryOutlined style={{ fontSize: "10px" }} />
                        历史消息
                      </div>
                    )}

                    {message.type === "predict" && (
                      <div className={`${styles.messageBadge} ${message.role === "user" ? styles.messageBadgeUser : styles.messageBadgeAssistant
                        }`}>
                        <ThunderboltOutlined style={{ fontSize: "10px" }} />
                        AI深度分析
                      </div>
                    )}
                    <div className={styles.messageContent}>
                      {renderMessageContent(message)}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar
                      className={`${styles.messageAvatar} ${styles.messageAvatarRight} ${message.type === "predict" ? styles.messageAvatarPredict : ""
                        }`}
                      icon={message.type === "predict" ? <ThunderboltOutlined /> : <UserOutlined />}
                      style={{
                        border: message.isHistorical ? "2px solid #e8e8e8" : undefined,
                      }}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {loading && (
            <div className={styles.loadingContainer}>
              <Avatar
                className={`${styles.messageAvatar} ${styles.messageAvatarLeft} ${predictMode ? styles.messageAvatarPredict : ""
                  }`}
                icon={predictMode ? <ThunderboltOutlined /> : <RobotOutlined />}
              />
              <div className={styles.loadingBubble}>
                <Spin size="small" />
                <span className={styles.loadingText}>
                  {predictMode ? "AI正在深度分析中..." : "AI正在思考中..."}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className={`${styles.inputSection} ${predictMode ? styles.inputSectionPredict : styles.inputSectionNormal
          }`}>
          <div className={styles.inputContainer}>
            <div className={styles.textAreaContainer}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handlePressEnter}
                placeholder={predictMode ? "描述您的问题，AI将进行深度分析..." : "输入消息开始对话..."}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                className={`${styles.textArea} ${predictMode ? styles.textAreaPredict : styles.textAreaNormal
                  }`}
                onFocus={handleTextAreaFocus}
                onBlur={handleTextAreaBlur}
              />
            </div>
            <Button
              type="primary"
              icon={<SendOutlined />}
              shape="circle"
              size="large"
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              className={`${styles.sendButton} ${predictMode ? styles.sendButtonPredict : styles.sendButtonNormal
                }`}
              onMouseEnter={handleButtonMouseEnter}
              onMouseLeave={handleButtonMouseLeave}
            />
          </div>
          {predictMode && (
            <div className={styles.predictModeHint}>
              <ThunderboltOutlined />
              AI深度分析模式已启用，将为您提供更智能的预测性回答
            </div>
          )}
          {newMessages.length > 0 && (
            <div className={styles.newMessagesHint}>
              <span>💾</span>
              本次会话有 {newMessages.length} 条新消息，关闭窗口时将自动保存
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;