import { message } from "antd";
import "./App.css";
import { Outlet } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";

message.config({
  top: 50,
  duration: 2,
  maxCount: 3,
});
function App() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile && !window.location.pathname.includes("/mobile")) {
    window.location.href = "/mobile";
  }

  return <Outlet />;
}

export default App;
