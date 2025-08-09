// MessageList.tsx - 通用消息列表组件
import React, { useState, useEffect } from 'react';
import { List, Card, Avatar, Typography, Empty, Popconfirm, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import styles from './MessageSystem.module.css';
import { getMessagesAPI } from '../../../api/service/messageService';
import { updateStatusAPI } from '../../../api/service/messageService';
import { useSelector } from 'react-redux';
import { deleteAllAPI } from '../../../api/service/messageService';
import { deleteByIdAPI } from '../../../api/service/messageService';


const { Title, Text } = Typography;


interface MessageItem {
    id: number;
    projectName: string;
    errorMessage: string;
    timestamp: number;
    isRead: boolean;
    avatar?: string; // 可选的头像字段
    senderName?: string; // 可选的发送者名称
    isSenderExist?: number;
}

interface MessageListProps {
    title: string;
    messageType: 'designate' | 'notifications';
    receiverId: number;
    messageTypeCode: number;
    renderAvatar?: (item: MessageItem) => React.ReactNode;
    renderTitle?: (item: MessageItem) => React.ReactNode;
    isSenderExist?: number;
}

const MessageList: React.FC<MessageListProps> = ({
    title,
    messageType,
    receiverId,
    messageTypeCode,
    renderAvatar,
    renderTitle,
    isSenderExist
}) => {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [ischange, setIschange] = useState(false);//用于触发重新渲染
    const notification = useSelector(
        (state: any) => state.ws.messageByType[messageType] || {}
    );

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getMessagesAPI(receiverId, messageTypeCode);
                setMessages(data);
            } catch (error) {
                console.error("获取消息失败:", error);
            }
            setLoading(false);
        };
        fetchMessages();
    }, [ischange]);

    useEffect(() => {
        if (Object.keys(notification).length === 0) return;

        setMessages(prevMessages => [
            ...(Object.values(notification) as MessageItem[]),
            ...prevMessages
        ]);
    }, [notification]);

    const defaultAvatar = (
        <Avatar
            icon={<ClockCircleOutlined />}
            style={{ backgroundColor: '#1890ff', color: '#fff' }}
        />
    );

    //点击了标记已读
    const handleClick = (id: number) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === id ? { ...msg, isRead: true } : msg
            )
        );

        const updateStatus = async () => {
            try {
                await updateStatusAPI(id);
            } catch (error) {
                console.error('更新消息状态失败:', error);
            }
        };
        updateStatus();
    };

    //清空所有消息
    const handleClearAll = async () => {
        console.log(isSenderExist);

        const response = await deleteAllAPI(receiverId, isSenderExist);

        console.log(response);

        if (response.code === 200) {
            setMessages([]);
        } else {
            console.error("清空消息失败");
        }
    }

    //删除单条消息
    const handleClearSingle = async (id: number) => {
        const response = await deleteByIdAPI(id);
        if (response.code === 200) {
            setMessages(messages.filter((message) => message.id !== id));
        } else {
            console.error("删除消息失败");
        }
    }




    return (
        <div className={styles.container}>
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} >
                        <Title level={4} className={styles['card-title']} style={{ margin: 0 }}>
                            {title}
                        </Title>
                        <Popconfirm
                            title="确定要清空所有消息吗？"
                            onConfirm={handleClearAll}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button size="small" >
                                清空所有消息
                            </Button>
                        </Popconfirm>
                    </div>
                }
                className={styles.card}
            >
                <List
                    loading={loading}
                    dataSource={messages}
                    locale={{ emptyText: <Empty description="暂无消息" /> }}
                    renderItem={(item) => (
                        <List.Item
                            className={`${styles['list-item']} ${item.isRead ? styles['read'] : styles['unread']}`}
                            onClick={() => handleClick(item.id)}

                        >
                            <List.Item.Meta
                                avatar={renderAvatar ? renderAvatar(item) : defaultAvatar}
                                title={renderTitle ? renderTitle(item) : (
                                    <div className={styles['meta-title']}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {!item.isRead && <div className={styles['unread-dot']} />}
                                            <Text className={styles['project-name']}>{item.projectName}</Text>
                                        </div>
                                        <Text type="secondary" className={styles.time}>
                                            {moment(item.timestamp).fromNow()}
                                        </Text>
                                    </div>
                                )}
                                description={
                                    <>
                                        {item.senderName && (
                                            <Text type="secondary" className={styles['alarm-message']}>
                                                指派你去解决：
                                            </Text>
                                        )}
                                        <Text
                                            type="danger"
                                            className={styles['error-message']}
                                            style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}
                                        >
                                            {item.errorMessage}
                                        </Text>
                                        <div className={styles['additional-info']}>
                                            <Text type="secondary" className={styles['additional-time']}>
                                                时间：{moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                            </Text>
                                            <Popconfirm
                                                title="确定要删除这条消息吗？"
                                                onConfirm={() => handleClearSingle(item.id)}
                                                okText="确定"
                                                cancelText="取消"
                                            >
                                                <Button size="small" style={{ float: 'right' }}>
                                                    删除消息
                                                </Button>
                                            </Popconfirm>
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

export default MessageList;