// @ts-check

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Minus } from "lucide-react";
import { useState } from "react";
import { useWebSocket } from "@/context/websocket-provider";
import ReplyZone from "./reply-zone";
import { ICTIcon } from "@/icons";
import { cn } from "@/lib/utils";
import MessageCard from "./message-card";
import Spinner from "./spinner";
import RateAgent from "./rate-agent";
import { useLeaveAgentReview } from "@/service";
import Finish from "./finish";

export const Chatbox = () => {
  const [open, setOpen] = useState(false);
  const [ratingReview, setRatingReview] =
    useState<IChatPluginAgentRatingPayload>();

  const {
    connect,
    disconnect,
    isConnected,
    isRegistered,
    getAllMessages,
    getUnreadMessages,
    chatId,
    clearChatId,
    clearRegistration,
  } = useWebSocket();

  const messages = getAllMessages();
  const unreadMessages = getUnreadMessages()?.length;

  const handleMinimize = () => {
    setOpen(false);
  };

  const { leaveReview, leaveReviewLoading, leaveReviewReset, leaveReviewData } =
    useLeaveAgentReview();
  const handleClose = () => {
    setOpen(false);
    clearChatId();
    clearRegistration();
    leaveReviewReset();
    setRatingReview(undefined);
    disconnect();
  };

  const messageWithAgentId = messages?.find((message) => message?.agent_id);

  return (
    <DropdownMenu
      modal={false}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open && !isConnected()) connect(chatId);
      }}
    >
      <DropdownMenuTrigger
        className="fixed bottom-4 right-4 z-[100000] translate transition overflow-visible"
        style={{
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}
        asChild
      >
        <Button className="h-16 w-16 rounded-3xl rounded-br-none text-white p-0">
          <ICTIcon width={"50"} height={"50"} className="!w-8 !h-8" />

          {/* Unread messages badge */}
          {unreadMessages > 0 && (
            <span
              aria-label={`${unreadMessages} unread messages`}
              className="absolute -top-1 -right-1 min-w-[1.25rem] min-h-[1.25rem] px-1 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center"
            >
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}

          {/* Online status dot */}
          {isConnected() && (
            <span
              aria-label="Online"
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="mx-4 h-[667px] max-h-[calc(100dvh-60px)] w-[423px] max-w-[90%] p-0 !z-[100000000] relative !rounded-t-4xl !rounded-bl-4xl -right-5"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        forceMount
        side="top"
        sideOffset={-70}
        align="start"
      >
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="bg-primary flex items-center justify-between px-4 h-16 min-h-16 text-white z-[2]">
            <div className="flex items-center gap-3">
              <ICTIcon />
              <h2 className="font-semibold line-clamp-1 break-all">
                ICT Chatbot
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={handleMinimize}
                variant="ghost"
                size="icon"
                className="text-white"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {leaveReviewData && ratingReview ? (
            <Finish
              review={ratingReview}
              message={leaveReviewData?.message}
              onClose={handleClose}
            />
          ) : (
            <>
              {!messages?.length && (
                <div className="flex flex-col justify-center items-center flex-1">
                  <Spinner />
                </div>
              )}

              {/* Messages Container */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse scroll-smooth",
                  {
                    "pb-20": isRegistered && isConnected(),
                    "pb-[290px]": messageWithAgentId,
                  }
                )}
              >
                <div className="flex flex-col gap-1">
                  {messages
                    ?.filter((message) => !message?.agent_id)
                    ?.sort(
                      (a, b) =>
                        new Date(a?.created_at).valueOf() -
                        new Date(b.created_at).valueOf()
                    )
                    ?.map((message, idx) => (
                      <MessageCard
                        {...message}
                        key={message?.id}
                        prevMessageRole={messages[idx - 1]?.role}
                        nextMessageRole={messages[idx + 1]?.role}
                      />
                    ))}
                </div>
              </div>

              {isRegistered && isConnected() && !messageWithAgentId && (
                <ReplyZone />
              )}
              {messageWithAgentId?.agent_id && (
                <RateAgent
                  message={messageWithAgentId}
                  leaveReview={leaveReview}
                  leaveReviewLoading={leaveReviewLoading}
                  onFinish={(data) => setRatingReview(data)}
                />
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Chatbox;
