import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebSocketProvider } from "./context/websocket-provider.tsx";
import Chatbox from "./components/custom/index.tsx";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("chat-plugin-root")!).render(
  <StrictMode>
    <WebSocketProvider>
      <QueryClientProvider client={queryClient}>
        <Chatbox />
        <Toaster richColors closeButton duration={5000} />
      </QueryClientProvider>
    </WebSocketProvider>
  </StrictMode>
);
