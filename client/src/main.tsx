import "./mockApi";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from "@/components/ui/provider";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import VerifyAccess from "./utils/verifyAccess";

const sadmiApi = new QueryClient();

import Login from "@/Login.tsx";
import Admin from "@/Admin.tsx";
import Cliente from "@/Cliente.tsx";
import Maquina from "@/Maquina.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <VerifyAccess allowedProfiles={["administrador"]}>
        <Admin />
      </VerifyAccess>
    ),
  },
  {
    path: "/cliente",
    element: (
      <VerifyAccess allowedProfiles={["cliente"]}>
        <Cliente />
      </VerifyAccess>
    ),
  },
  {
    path: "/maquina/:idMaquina",
    element: (
      <VerifyAccess allowedProfiles={["administrador", "cliente"]}>
        <Maquina />
      </VerifyAccess>
    ),
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
