import React from 'react';
import MessageList from './MessageList';
import { useSelector } from 'react-redux';


const MessageSystem: React.FC = () => {
  //从redux获取id
  const currentUser = useSelector((state: any) => state.user);
  console.log("currentUser", currentUser);

  const currentUserId = currentUser.user.id;
  return (
    <MessageList
      title="系统消息"
      messageType="notifications"
      receiverId={currentUserId}
      messageTypeCode={0}
      isSenderExist={0}
    />
  );
};

export default MessageSystem;
