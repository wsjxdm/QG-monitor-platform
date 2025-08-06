import "./App.css";
import AppLayout from "./component/Layout/Layout";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function App() {

  const dispatch = useDispatch();

  //=========组件初始化时配置全局socket==========
  useEffect(() => {
    // 应用加载时全局连接WebSocket
    dispatch({ type: 'ws/connect' });

    // 应用卸载时断开连接
    return () => {
      dispatch({ type: 'ws/disconnect' });
    };

  }, [dispatch]);

  return <AppLayout></AppLayout>;
}

export default App;
