"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { StarRatingWithIndexEmojis } from "./rating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { useWebSocket } from "@/context/websocket-provider";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

const ratingSchema = z.object({
  ratings: z
    .number({ invalid_type_error: "Rating is required" })
    .min(1, "Please select a rating")
    .max(5),
  comments: z.string().optional(),
});

type RatingSchema = z.infer<typeof ratingSchema>;

const RateAgent: React.FC<{
  message: TChatPluginChatMessage;
  leaveReview: UseMutateAsyncFunction<
    {},
    any,
    IChatPluginAgentRatingPayload,
    unknown
  >;
  leaveReviewLoading: boolean;
  onFinish: (data: IChatPluginAgentRatingPayload) => void;
}> = ({ message, leaveReview, leaveReviewLoading, onFinish }) => {
  const { markAsRead, getUnreadMessages } = useWebSocket();

  const unreadMessages = getUnreadMessages();
  const { ref } = useInView({
    /* Optional options */
    threshold: 0,
    onChange: (isVisible) => {
      if (
        isVisible &&
        unreadMessages?.find((messageId) => messageId === message?.id)
      )
        markAsRead(message?.id);
    },
  });
  const form = useForm<RatingSchema>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      ratings: 0,
      comments: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = (data: RatingSchema) => {
    if (data?.ratings > 0)
      leaveReview({
        agent_id: message?.agent_id || "",
        comments: data?.comments || "",
        // @ts-ignore
        ratings: data?.ratings,
      }).then(() => {
        onFinish({
          agent_id: message?.agent_id || "",
          comments: data?.comments || "",
          // @ts-ignore
          ratings: data?.ratings,
        });
      });
  };

  return (
    <div
      className="absolute bottom-4 left-0 w-full px-4 max-h-[calc(100%-74px)] h-fit overflow-y-auto"
      ref={ref}
    >
      <div
        className={cn(
          "bg-white/30 dark:bg-white/10 backdrop-blur-lg",
          "border border-border rounded-lg",
          "focus-within:ring-2 focus-within:ring-neutral-100 dark:focus-within:ring-neutral-600",
          "flex flex-col items-center gap-4 p-6"
        )}
      >
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 w-full max-w-xl"
          >
            {/* === Rating Field === */}
            <FormField
              control={control}
              name="ratings"
              render={({ field }) => {
                const hasError = !!errors.ratings;
                return (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-foreground">
                      Rate the Agent
                    </FormLabel>
                    <FormControl>
                      <StarRatingWithIndexEmojis
                        value={field.value}
                        onChange={(val) => field.onChange(val ?? 0)}
                        size={36}
                        spacing={12}
                        animation={true}
                        readOnly={false}
                      />
                    </FormControl>

                    {/* Error wrapper with transition on max-height */}
                    <div
                      className={cn(
                        "overflow-hidden transition-[max-height] duration-300 ease-in-out"
                      )}
                      style={{
                        maxHeight: hasError ? "3rem" : "0rem",
                      }}
                    >
                      <FormMessage
                        className={cn(
                          "text-sm text-destructive transition-opacity duration-300",
                          hasError ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </FormItem>
                );
              }}
            />

            {/* === Comment Field === */}
            <FormField
              control={control}
              name="comments"
              render={({ field }) => {
                const hasError = !!errors.comments;
                return (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-foreground">
                      Leave a Comment
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write your comment..."
                        className="!bg-transparent resize-none overflow-hidden max-h-[150px] border border-border rounded px-3 py-2"
                        rows={4}
                      />
                    </FormControl>

                    {/* Error wrapper with transition on max-height */}
                    <div
                      className={cn(
                        "overflow-hidden transition-[max-height] duration-300 ease-in-out"
                      )}
                      style={{
                        maxHeight: hasError ? "3rem" : "0rem",
                      }}
                    >
                      <FormMessage
                        className={cn(
                          "text-sm text-destructive transition-opacity duration-300",
                          hasError ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </FormItem>
                );
              }}
            />

            {/* === Submit Button === */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={leaveReviewLoading}
                loading={leaveReviewLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit Feedback
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RateAgent;
