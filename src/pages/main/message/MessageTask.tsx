import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Empty, Avatar } from 'antd';
import moment from 'moment';
import styles from './MessageSystem.module.css';

const { Title, Text } = Typography;

// 定义消息类型
interface MessageItem {
  id: string;
  avatar: string;
  Manager: string;
  projectName: string;
  errorMessage: string;
  timestamp: number; // 时间戳
  isRead: boolean;   // 已读状态
}

// 模拟消息数据
const mockMessages: MessageItem[] = [
  {
    id: '1',
    avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    Manager: '张三',
    projectName: '项目A',
    errorMessage: '服务器错误：500 Internal Server Error',
    timestamp: Date.now() - 3600000, // 1小时前
    isRead: false
  },
  {
    id: '2',
    avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    Manager: '李四',
    projectName: '项目B',
    errorMessage: '数据库连接失败：Timeout',
    timestamp: Date.now() - 7200000, // 2小时前
    isRead: true
  },
  {
    id: '3',
    avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    Manager: '王五',
    projectName: '项目C',
    errorMessage: 'API请求超时：408 Request Timeout',
    timestamp: Date.now() - 86400000, // 1天前
    isRead: false
  },
];

const MessageTask: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 800);
  }, []);


  const handleClick = (id: string) => {
    console.log('点击了某一行错误', id);
    //要跳转到详情页面

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, isRead: true } : msg
      ))
  };

  return (
    <div className={styles.container}>
      <Card
        title={<Title level={4} className={styles['card-title']}>指派任务</Title>}
        className={styles.card}
      >
        <List
          loading={loading}
          dataSource={messages}
          locale={{ emptyText: <Empty description="暂无系统消息" /> }} // 添加空状态
          renderItem={(item) => (
            <List.Item
              className={`${styles['list-item']} ${item.isRead ? styles['read'] : styles['unread']}`}
              onClick={() => handleClick(item.id)}>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={
                  <div className={styles['meta-title']}>
                    <Text> {item.Manager}</Text>
                    <Text className={styles['project-name']}>
                      {!item.isRead && <div className={styles['unread-dot']}
                        style={{ float: 'left', marginTop: "5px" }} />}
                      {item.projectName}
                    </Text>
                    <Text type="secondary" className={styles.time}>
                      {moment(item.timestamp).fromNow()}
                    </Text>
                  </div>
                }
                description={
                  <>
                    <Text type="secondary" className={styles['alarm-message']}>指派你去解决：</Text>
                    <Text type="danger" className={styles['error-message']}
                      style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                      {item.errorMessage}
                    </Text>
                    <div className={styles['additional-info']}>
                      <Text type="secondary" className={styles['additional-time']}>
                        时间：{moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                      </Text>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default MessageTask;