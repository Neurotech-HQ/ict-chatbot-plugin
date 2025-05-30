import clsx from "clsx";
import { formatUTCDate, markdownWrap, wrapUrl } from "@/utils";
import RegisterUser from "./register-user";
import { BotIcon, Headset } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useWebSocket } from "@/context/websocket-provider";

type TRole = "agent" | "user" | "assistant" | "system";

const MessageCard = ({
  created_at,
  content,
  role,
  type,
  prevMessageRole,
  nextMessageRole,
  id,
}: TChatPluginChatMessage & {
  prevMessageRole: TRole;
  nextMessageRole: TRole;
}) => {
  const { markAsRead, getUnreadMessages } = useWebSocket();
  const unreadMessages = getUnreadMessages();

  const { ref } = useInView({
    threshold: 0,
    onChange: (isVisible) => {
      if (isVisible && unreadMessages?.includes(id)) markAsRead(id);
    },
  });

  const isSent = role === "user";
  const isReceived = !isSent;

  const isPrevSame = prevMessageRole === role;
  const isNextSame = nextMessageRole === role;

  const isLast = isPrevSame && !isNextSame;
  const isSingle = !isPrevSame && !isNextSame;

  const showAvatar = isReceived && (isLast || isSingle);

  const avatar =
    role === "agent" ? (
      <Headset className="w-5 h-5 text-primary" />
    ) : (
      <BotIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    );

  const bubbleBase =
    "p-3 relative overflow-hidden select-text text-sm whitespace-pre-wrap break-words rounded-3xl";

  const bubbleColor = clsx({
    "bg-black/5 text-black dark:bg-white/5 dark:text-white":
      isSent && role === "user",
    "bg-purple-600 text-white dark:bg-purple-500":
      role === "assistant" || role === "system",
    "bg-primary text-white": role === "agent",
  });

  const borderFixes = clsx({
    // Sent (right)
    "rounded-br-none": isSent && (isLast || isSingle),

    // Received (left)
    "rounded-bl-none": isReceived && (isLast || isSingle),

    // System (override)
    "!rounded-3xl !rounded-bl-none": role === "system",
  });

  const containerClass = clsx(
    "flex animate-slide-up-and-fade",
    type === "registration_required"
      ? "justify-center"
      : isSent
      ? "justify-end"
      : "justify-start"
  );

  const rowClass = clsx(
    "flex items-end gap-2 max-w-[85%] lg:max-w-[75%]",
    isSent ? "flex-row-reverse" : "flex-row",
    type === "registration_required" && "!max-w-full w-full"
  );

  return (
    <div className={containerClass} ref={ref} id={id}>
      <div className={rowClass}>
        {/* Avatar */}
        {showAvatar ? (
          <div className="w-6 h-6 min-w-6 flex items-end justify-center mb-1">
            {avatar}
          </div>
        ) : (
          role !== "user" && <div className="w-6 h-6 min-w-6" />
        )}

        {/* Message Bubble */}
        <div
          className={clsx(
            bubbleBase,
            bubbleColor,
            borderFixes,
            type === "registration_required" && "w-full"
          )}
        >
          <p
            dangerouslySetInnerHTML={{
              __html: markdownWrap(wrapUrl(content)),
            }}
          />

          {type === "registration_required" && (
            <div className="bg-white dark:bg-sidebar p-5 rounded-xl mt-3">
              <RegisterUser />
            </div>
          )}

          <div
            className={clsx(
              "flex justify-end mt-2 text-[10px] opacity-70",
              isSent ? "text-gray-500 dark:text-gray-300" : "text-white"
            )}
          >
            {/* @ts-ignore */}
            {formatUTCDate(created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
