// MessageSystem.tsx
import React from 'react';
import MessageList from './MessageList';

const MessageSystem: React.FC = () => {
  return (
    <MessageList
      title="系统消息"
      messageType="notifications"
      receiverId={3}
      messageTypeCode={0}
      isSenderExist={0}
    />
  );
};

export default MessageSystem;
