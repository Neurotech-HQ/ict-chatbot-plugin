// components/ReplyZone.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Mic, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/context/websocket-provider";

export const ReplyZone: React.FC = () => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { sendMessage } = useWebSocket();

  // Format elapsed ms into "MM:SS"
  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // AUTO-EXPAND textarea when text changes (max 150px)
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      const newHeight = Math.min(ta.scrollHeight, 150);
      ta.style.height = newHeight + "px";
    }
  }, [text]);

  // Start recording: capture startTime locally and run interval
  // const startRecording = () => {
  //   const startTime = Date.now();
  //   setIsRecording(true);
  //   setElapsed(0);

  //   intervalRef.current = window.setInterval(() => {
  //     setElapsed(Date.now() - startTime);
  //   }, 250);
  // };

  // Common logic to stop recording and clear interval
  const stopRecording = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setElapsed(0);
  };

  // User taps “Cancel” while recording
  const cancelRecording = () => {
    stopRecording();
  };

  // User taps “Send” while recording
  const sendVoiceNote = () => {
    stopRecording();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      e.target.value = "";
    }
  };

  // Open native file picker
  // const openFileSelector = () => {
  //   fileInputRef.current?.click();
  // };

  // Send text message
  const handleSend = useCallback(async () => {
    if (text.trim().length === 0) return;
    await sendMessage(text.trim());
    setText("");
  }, [sendMessage, text]);

  return (
    <div className="absolute bottom-4 left-0 w-full px-4">
      <div
        className={cn(
          // No extra padding here—caller can wrap/position as needed
          "bg-white/30 dark:bg-white/10 backdrop-blur-lg border border-border rounded-lg focus-within:ring-2 focus-within:ring-neutral-100 dark:focus-within:ring-neutral-600",
          // Flex layout for textarea + buttons
          "flex items-center gap-2"
        )}
      >
        {/* Hidden file input for the paperclip icon */}
        <input
          type="file"
          accept="*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* If a file is chosen, show its name as a chip */}
        {fileName && (
          <div className="flex items-center bg-muted px-2 py-1 rounded-md">
            <Paperclip className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm text-foreground line-clamp-1">
              {fileName}
            </span>
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setFileName(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Textarea or Recording UI */}
        <div className="flex-1">
          {isRecording ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-primary rounded-md">
              <Mic className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Recording… {formatElapsed(elapsed)}
              </span>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              className={cn(
                // Remove any focus/border/background from textarea itself
                "!bg-[transparent] border-none focus:ring-0 focus-visible:ring-0 focus-visible:border-none focus:border-none",
                // Auto-expand up to 150px
                "w-full resize-none overflow-hidden max-h-[150px]"
              )}
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {/* Show paperclip + mic only when no text, not recording, and no file selected */}
          {/* {!isRecording && text.trim().length === 0 && !fileName && (
            <>
              <Button
                variant="ghost"
                className="p-2"
                onClick={openFileSelector}
              >
                <Paperclip className="h-5 w-5 text-foreground" />
              </Button>

              <button
                onMouseDown={startRecording}
                onMouseUp={cancelRecording}
                className="p-2 rounded-full hover:bg-muted/50"
              >
                <Mic className="h-5 w-5 text-foreground" />
              </button>
            </>
          )} */}

          {/* If recording, show Cancel (❌) and Send (✉️) */}
          {isRecording && (
            <>
              <button
                onClick={cancelRecording}
                className="p-2 rounded-full hover:bg-muted/50"
              >
                <X className="h-5 w-5 text-destructive" />
              </button>
              <button
                onClick={sendVoiceNote}
                className="p-2 rounded-full hover:bg-muted/50"
              >
                <Send className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          {/* If there’s text (and not recording), show Send button */}
          {!isRecording && text.trim().length > 0 && (
            <Button
              onClick={handleSend}
              className="p-2"
              variant="ghost"
              disabled={text.trim().length === 0}
            >
              <Send className="h-5 w-5 text-primary" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplyZone;
