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


  return <Outlet />;
}

export default App;
