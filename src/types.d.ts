// Prefix all “type” with TChatPlugin…
type TChatPluginChatMessage = {
  id: string;
  content: string;
  agent_id?: string;
  role: "agent" | "user" | "assistant" | "system";
  created_at: number | string;
  chat_id: string;
  type?: "store_chat_id" | "rating_prompt" | "registration_required";
};

// Prefix all “interface” with IChatPlugin…
interface IChatPluginSocketConnectionState {
  socket: WebSocket;
  subscribers: Array<(msg: TChatPluginChatMessage) => void>;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  connectionTimer: ReturnType<typeof setTimeout> | null;
  isConnected: boolean;
  currentChatId: string;
}

interface TChatPluginWebSocketContextType {
  connect: (chatId?: string) => void;
  disconnect: () => void;
  sendMessage: (message: string) => Promise<TChatPluginChatMessage>;
  subscribe: (cb: (msg: TChatPluginChatMessage) => void) => () => void;
  isConnected: () => boolean;
  getCurrentChatId: () => string | null;
  getUnreadMessages: () => string[];
  markAsRead: (messageId: string) => void;
  subscribeToUnread: (cb: () => void) => () => void;
  subscribeToConnectionState: (cb: () => void) => () => void;
  api: AxiosInstance;
  isRegistered: boolean;
  setRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  chatId?: string;
  getAllMessages: () => TChatPluginChatMessage[];
  subscribeToAllMessages: (cb: () => void) => () => void;
  clearChatId: () => void;
  clearRegistration: () => void;
}

interface IChatPluginRegisterUserPayload {
  email: string;
  phone_number: string;
  name: string;
  chat_id: string;
}

interface IChatPluginAgentRatingPayload {
  ratings: 1 | 2 | 3 | 4 | 5;
  agent_id: string;
  comments: string;
}

type ApiError = AxiosError<{
  message:
    | string
    | {
        response: {
          data: {
            detail?: string;
            message?: string;
          };
          status: number;
        };
      };
}>;

type IChatPluginThemeOptions = "light" | "dark" | "system";

interface IChatPluginThemeContextProps {
  theme: IChatPluginThemeOptions;
  setTheme: (theme: IChatPluginThemeOptions) => void;
  isDark: boolean;
}

interface ChatPluginVariables {
  apiUrl: string;
  wsUrl: string;
}

interface Window {
  chatPluginVariables: ChatPluginVariables;
}
