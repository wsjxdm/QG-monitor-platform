import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import wsReducer from "./slice/websocketSlice";
import { wsMiddleware } from "./Middleware/wsMiddleware";

// 配置 store
export const store = configureStore({
  reducer: {
    user: userReducer,
    ws: wsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(wsMiddleware),
});
