import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home";
import { App } from "../App"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />,
            },
        ],
    },
]);