// src/component/TutorialModal/TutorialModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Spin, message, Tabs } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getTutorialMarkdown } from "../../api/service/projectoverview";

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TutorialContent {
  id: number;
  title: string;
  content: string;
  platform: string;
  createdTime: string;
  updatedTime: string;
}

const { TabPane } = Tabs;

const TutorialModal: React.FC<TutorialModalProps> = ({ visible, onClose }) => {
  const [tutorials, setTutorials] = useState<{
    [key: string]: TutorialContent;
  }>({
    frontend: {
      id: 0,
      title: "",
      content: "",
      platform: "frontend",
      createdTime: "",
      updatedTime: "",
    },
    backend: {
      id: 0,
      title: "",
      content: "",
      platform: "backend",
      createdTime: "",
      updatedTime: "",
    },
    mobile: {
      id: 0,
      title: "",
      content: "",
      platform: "mobile",
      createdTime: "",
      updatedTime: "",
    },
  });
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    frontend: false,
    backend: false,
    mobile: false,
  });
  const [activeTab, setActiveTab] = useState<string>("frontend");

  useEffect(() => {
    if (visible) {
      // 当模态框打开时，加载当前标签页的内容
      if (!tutorials[activeTab].content) {
        fetchTutorialMarkdown(activeTab);
      }
    }
  }, [visible, activeTab]);

  const fetchTutorialMarkdown = async (type: string) => {
    // 如果已经有内容，避免重复获取
    if (tutorials[type].content) return;

    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const tutorialData = await getTutorialMarkdown(type);

      const tutorialContent = tutorialData;

      setTutorials((prev) => ({
        ...prev,
        [type]: tutorialContent,
      }));
    } catch (error) {
      message.error(`获取${getTypeLabel(type)}教程文档失败，请稍后重试`);
      console.error(`获取${getTypeLabel(type)}教程文档失败:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 如果该标签页内容还未加载，则加载内容
    if (!tutorials[key].content) {
      fetchTutorialMarkdown(key);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "frontend":
        return "前端";
      case "backend":
        return "后台";
      case "mobile":
        return "移动端";
      default:
        return "";
    }
  };

  return (
    <Modal
      title="项目接入教程"
      open={visible}
      onCancel={onClose}
      footer={null} // 移除底部按钮
      width={800}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="前端接入教程" key="frontend">
          <div style={{ minHeight: 400 }}>
            {loading.frontend ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin tip="加载中..." />
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {tutorials.frontend.content}
              </ReactMarkdown>
            )}
          </div>
        </TabPane>
        <TabPane tab="后台接入教程" key="backend">
          <div style={{ minHeight: 400 }}>
            {loading.backend ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin tip="加载中..." />
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {tutorials.backend.content}
              </ReactMarkdown>
            )}
          </div>
        </TabPane>
        <TabPane tab="移动端接入教程" key="mobile">
          <div style={{ minHeight: 400 }}>
            {loading.mobile ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin tip="加载中..." />
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {tutorials.mobile.content}
              </ReactMarkdown>
            )}
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default TutorialModal;
