import App from "@/App";

import About from "@/pages/About";

import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        Component: About,
        path: "about",
      },
    ],
  },
]);

export default router;
