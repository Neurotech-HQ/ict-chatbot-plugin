import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useWebSocket } from "./context/websocket-provider";
import { toast } from "sonner";
import { formatErrorMessage } from "./utils";

const useRegisterUser = (
  options?: UseMutationOptions<{}, ApiError, IChatPluginRegisterUserPayload>
) => {
  const { api, setRegistered, connect, chatId } = useWebSocket();
  const { mutateAsync, isPending, reset, ...rest } = useMutation({
    mutationFn: async (variables) => {
      const { data } = await api.post<{}>("/register_user", variables, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data;
    },
    mutationKey: ["chat-plugin-register-user"],
    onSuccess: () => {
      setRegistered(true);
      connect(chatId);
      localStorage.setItem("isRegistered", "true");
    },
    onError: (err) => {
      toast.error(formatErrorMessage(err));
    },
    ...options,
  });

  return {
    register: mutateAsync,
    registerLoading: isPending,
    registerReset: reset,
    ...rest,
  };
};

const useLeaveAgentReview = (
  options?: UseMutationOptions<
    {
      message: string;
    },
    ApiError,
    IChatPluginAgentRatingPayload
  >
) => {
  const { api, chatId } = useWebSocket();
  const { mutateAsync, isPending, reset, data, ...rest } = useMutation({
    mutationFn: async (variables) => {
      const { data } = await api.post<{ message: string }>(
        `/analytics/agent_rating/${chatId}`,
        variables,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
    mutationKey: ["chat-plugin-leave-agent-review"],
    onSuccess: () => {},
    onError: (err) => {
      toast.error(formatErrorMessage(err));
    },
    ...options,
  });

  return {
    leaveReview: mutateAsync,
    leaveReviewLoading: isPending,
    leaveReviewReset: reset,
    leaveReviewData: data,
    ...rest,
  };
};

export { useRegisterUser, useLeaveAgentReview };
