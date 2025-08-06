import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { List, Card, Avatar, Typography, Empty, notification } from 'antd'; // 添加Badge组件
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import styles from './MessageSystem.module.css';
const { Title, Text } = Typography;

// 更新消息类型定义
interface MessageItem {
  id: string;
  project_name: string;
  errorMessage: string;
  timestamp: number; // 时间戳
  is_read: boolean;   // 已读状态
}

// 更新模拟消息数据
const mockMessages: MessageItem[] = [
  {
    id: '1',
    project_name: '项目A',
    errorMessage: '服务器错误：500 Internal Server Error',
    timestamp: Date.now() - 3600000, // 1小时前
    is_read: false // 未读
  },
  {
    id: '2',
    project_name: '项目B',
    errorMessage: '数据库连接失败：Timeout',
    timestamp: Date.now() - 7200000, // 2小时前
    is_read: true // 已读
  },
  {
    id: '3',
    project_name: '项目C',
    errorMessage: 'API请求超时：408 Request Timeout',
    timestamp: Date.now() - 86400000, // 1天前
    is_read: true // 已读
  },
];

const MessageSystem: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 800);
  }, []);

  //接收到websocket发送过来的新的消息后加入到原来的数据中
  useEffect(() => {
    const notification = useSelector(
      (state: any) => state.ws.messageByType.notification || []
    );

    setMessages([
      ...messages,
      notification]
    )
  }, [notification]);

  // 系统默认头像
  const defaultAvatar = (
    <Avatar
      icon={<ClockCircleOutlined />}
      style={{ backgroundColor: '#1890ff', color: '#fff' }}
    />
  );

  // 消息点击处理
  const handleClick = (id: string) => {
    console.log('点击了某一行错误', id);
    // 将消息标记为已读
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, is_read: true } : msg
      )
    );
    // 要跳转到详情页面
    // 要一个接口 更改消息的阅读状态
  };

  return (
    <div className={styles.container}>
      <Card
        title={<Title level={4} className={styles['card-title']}>系统消息</Title>}
        className={styles.card}
      >
        <List
          loading={loading}
          dataSource={messages}
          locale={{ emptyText: <Empty description="暂无系统消息" /> }}
          renderItem={(item) => (
            <List.Item
              className={`${styles['list-item']} ${item.is_read ? styles['read'] : styles['unread']}`}
              onClick={() => handleClick(item.id)}
            >
              <List.Item.Meta
                avatar={defaultAvatar}
                title={
                  <div className={styles['meta-title']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!item.is_read && <div className={styles['unread-dot']} />}
                      <Text className={styles['project-name']}>{item.project_name}</Text>
                    </div>
                    <Text type="secondary" className={styles.time}>
                      {moment(item.timestamp).fromNow()}
                    </Text>
                  </div>
                }
                description={
                  <>
                    <Text
                      type="danger"
                      className={styles['error-message']}
                      style={{ fontWeight: item.is_read ? 'normal' : 'bold' }}
                    >
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

export default MessageSystem;