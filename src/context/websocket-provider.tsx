import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { capitalizeFirstLetter, isProbablyJSON } from "../utils";

const CONNECTION_TIMEOUT = 60 * 60 * 1000; // 1 hour

const WebSocketContext = createContext<TChatPluginWebSocketContextType | null>(
  null
);

export const useWebSocket = (): TChatPluginWebSocketContextType => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return ctx;
};

const apiUrl = window.chatPluginVariables.apiUrl;
const wsLink = window.chatPluginVariables.wsUrl;

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const api = axios.create({
    baseURL: apiUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [chatId, setChatId] = useState(localStorage.getItem("chatId") || "");
  const [isRegistered, setRegistered] = useState(
    !!localStorage.getItem("isRegistered")
  );

  const connectionRef = useRef<IChatPluginSocketConnectionState | null>(null);
  const connStateListeners = useRef<Set<() => void>>(new Set());

  const [connected, setConnected] = useState(false);
  const [unreadMessagesState, setUnreadMessagesState] = useState<string[]>([]);
  const [allMessagesState, setAllMessagesState] = useState<
    TChatPluginChatMessage[]
  >([]);

  const unreadMessages = useRef<string[]>([]);
  const allMessages = useRef<TChatPluginChatMessage[]>([]);

  const unreadListeners = useRef<Set<() => void>>(new Set());
  const allMessageListeners = useRef<Set<() => void>>(new Set());

  const notifyConnectionListeners = () => {
    connStateListeners.current.forEach((cb) => cb());
  };

  const notifyUnreadListeners = () => {
    unreadListeners.current.forEach((cb) => cb());
  };

  const notifyAllMessageListeners = () => {
    allMessageListeners.current.forEach((cb) => cb());
  };

  const getConnection =
    useCallback((): IChatPluginSocketConnectionState | null => {
      return connectionRef.current;
    }, []);

  const addUnread = (msg: string) => {
    unreadMessages.current = [...unreadMessages.current, msg];
    setUnreadMessagesState([...unreadMessages.current]);
    notifyUnreadListeners();
  };

  const getUnreadMessages = (): string[] => {
    return unreadMessagesState;
  };

  const markAsRead = (messageId: string) => {
    if (unreadMessages.current.length > 0) {
      unreadMessages.current = unreadMessages.current.filter(
        (message) => message !== messageId
      );
      setUnreadMessagesState([]);
      notifyUnreadListeners();
    }
  };

  const subscribeToUnread = (cb: () => void) => {
    unreadListeners.current.add(cb);
    return () => {
      unreadListeners.current.delete(cb);
    };
  };

  const getAllMessages = () => {
    return allMessagesState;
  };

  const subscribeToAllMessages = (cb: () => void) => {
    allMessageListeners.current.add(cb);
    return () => {
      allMessageListeners.current.delete(cb);
    };
  };

  const disconnect = useCallback(() => {
    const st = getConnection();
    if (!st) return;

    if (st.reconnectTimer) clearTimeout(st.reconnectTimer);
    if (st.connectionTimer) clearTimeout(st.connectionTimer);

    if (st.socket.readyState === WebSocket.OPEN) {
      st.socket.close();
    }

    connectionRef.current = null;
    unreadMessages.current = [];
    allMessages.current = [];
    setUnreadMessagesState([]);
    setAllMessagesState([]);
    setConnected(false);
    notifyConnectionListeners();
    notifyUnreadListeners();
    notifyAllMessageListeners();
  }, [getConnection]);

  const connect = useCallback(
    (chatId?: string) => {
      disconnect();

      const ws = new WebSocket(
        `${wsLink}/ws/chat/user${chatId ? `?chat_id=${chatId}` : ""}`
      );

      connectionRef.current = {
        socket: ws,
        subscribers: [],
        reconnectTimer: null,
        connectionTimer: null,
        isConnected: false,
        currentChatId: chatId || "",
      };

      unreadMessages.current = [];
      allMessages.current = [];
      setUnreadMessagesState([]);
      setAllMessagesState([]);
      notifyUnreadListeners();
      notifyAllMessageListeners();

      ws.onopen = () => {
        const st = getConnection();
        if (!st) return;

        st.isConnected = true;
        setConnected(true);
        st.connectionTimer = setTimeout(() => disconnect(), CONNECTION_TIMEOUT);
        notifyConnectionListeners();
      };

      ws.onmessage = (evt) => {
        const st = getConnection();

        if (!st) return;

        let msg: TChatPluginChatMessage;

        if (typeof evt.data === "string") {
          const data = evt.data.trim();

          if (isProbablyJSON(data)) {
            const parsed = JSON.parse(data);

            // Handle system messages like storing chat_id
            if (parsed?.type === "store_chat_id") {
              setChatId(parsed.chat_id);
              return localStorage.setItem("chatId", parsed.chat_id);
            }

            msg = {
              ...parsed,
              id: parsed?.id || `${Date.now()}`,
              created_at: Date.now(),
              content: parsed?.content || parsed?.message || "",
              role: parsed?.role || "agent",
            };
          } else {
            // Plain text fallback
            msg = {
              id: `${Date.now()}`,
              content: data,
              role: "agent",
              created_at: Date.now(),
              chat_id: st.currentChatId,
            };
          }

          allMessages.current.push(msg);
          setAllMessagesState([...allMessages.current]); // if you added this
          notifyAllMessageListeners();
          st.subscribers.forEach((cb) => cb(msg));
          addUnread(msg?.id);
        }
      };

      ws.onclose = (event) => {
        const st = getConnection();
        if (!st) return;

        st.isConnected = false;
        setConnected(false);
        // st.reconnectTimer = setTimeout(() => connect(chatId), 5000);
        notifyConnectionListeners();

        if (!event.wasClean) {
          toast.error(
            `Connection closed (code ${event.code})${
              event.reason ? `: ${event.reason}` : ""
            }`
          );
        }
      };
    },
    [disconnect, getConnection, wsLink]
  );

  const sendMessage = useCallback(
    async (message: TMessagePayload): Promise<TChatPluginChatMessage> => {
      const st = getConnection();
      if (!st || !st.isConnected) {
        toast.warning("Not connected");
        throw new Error("Not connected");
      }

      const newMsg: TChatPluginChatMessage = {
        id: `${Date.now()}`,
        content:
          typeof message === "string"
            ? message
            : capitalizeFirstLetter(message?.value),
        role: "user",
        created_at: Date.now(),
        chat_id: st.currentChatId,
      };

      st.socket.send(
        typeof message === "string" ? message : JSON.stringify(message)
      );

      return newMsg;
    },
    [getConnection]
  );

  const subscribe = useCallback(
    (cb: (msg: TChatPluginChatMessage) => void) => {
      const st = getConnection();
      if (!st) {
        throw new Error("Must connect before subscribing");
      }
      st.subscribers.push(cb);
      return () => {
        const latest = getConnection();
        if (latest) {
          latest.subscribers = latest.subscribers.filter((fn) => fn !== cb);
        }
      };
    },
    [getConnection]
  );

  const isConnected = useCallback(() => {
    return connected;
  }, [connected]);

  const getCurrentChatId = useCallback(() => {
    const st = getConnection();
    return st ? st.currentChatId : null;
  }, [getConnection]);

  const subscribeToConnectionState = useCallback((cb: () => void) => {
    connStateListeners.current.add(cb);
    return () => {
      connStateListeners.current.delete(cb);
    };
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <WebSocketContext.Provider
      value={{
        connect,
        disconnect,
        sendMessage,
        subscribe,
        isConnected,
        getCurrentChatId,
        getUnreadMessages,
        markAsRead,
        subscribeToUnread,
        subscribeToConnectionState,
        getAllMessages,
        subscribeToAllMessages,
        api,
        isRegistered,
        setRegistered,
        chatId,
        clearChatId: () => {
          localStorage.removeItem("chatId");
          setChatId("");
        },
        clearRegistration: () => {
          localStorage.removeItem("isRegistered");
          setRegistered(false);
        },
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
