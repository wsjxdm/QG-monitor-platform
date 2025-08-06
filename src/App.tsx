import { message } from "antd";
import "./App.css";
import { Outlet } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

message.config({
  top: 50,
  duration: 2,
  maxCount: 3,
});
function App() {
  const dispatch = useDispatch();

  //=========组件初始化时配置全局socket==========
  useEffect(() => {
    // 应用加载时全局连接WebSocket
    dispatch({ type: "ws/connect" });

    // 应用卸载时断开连接
    return () => {
      dispatch({ type: "ws/disconnect" });
    };
  }, [dispatch]);

  return <Outlet />;
}

export default App;
