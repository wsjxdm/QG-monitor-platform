import { message } from "antd";
import "./App.css";
import { Outlet } from "react-router-dom";

message.config({
  top: 50,
});
function App() {
  return <Outlet />;
}

export default App;
