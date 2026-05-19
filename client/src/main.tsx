import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from "@/components/ui/provider";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
//import VerifyAccess from "./utils/verifyAccess";

const sadmiApi = new QueryClient();

import App from "@/App.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={sadmiApi}>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
