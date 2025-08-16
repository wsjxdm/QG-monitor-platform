import { Navigate } from "react-router-dom";
import { message } from "antd";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ManagerRouter: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = localStorage.getItem("user");
  console.log("ManagerRouter user:", user);

  if (user === null) {
    console.log("用户未登录");
    message.error("请先登录");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ManagerRouter;
