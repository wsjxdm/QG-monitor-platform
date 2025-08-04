import { Outlet } from "react-router-dom";
import "./App.css";
import AppLayout from "./component/Layout/Layout";

function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default App;
