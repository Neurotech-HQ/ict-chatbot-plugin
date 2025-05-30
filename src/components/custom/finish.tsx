"use client";

import { Button } from "../ui/button";
import { StarRatingWithIndexEmojis } from "./rating";

interface IChatPluginAgentRatingPayload {
  ratings: 1 | 2 | 3 | 4 | 5;
  agent_id: string;
  comments: string;
}

const ratingDetails: Record<
  IChatPluginAgentRatingPayload["ratings"],
  { label: string; emoji: string; message: string; followUp?: string }
> = {
  1: {
    label: "Terrible",
    emoji: "😡",
    message: "We are sorry to hear that your experience wasn’t great.",
    followUp:
      "One of our representatives will reach out to further assist you. We will be in touch!",
  },
  2: {
    label: "Bad",
    emoji: "😞",
    message: "Thank you for rating your experience with us.",
  },
  3: {
    label: "Average",
    emoji: "😐",
    message: "Thanks for your feedback — we’ll continue improving.",
  },
  4: {
    label: "Good",
    emoji: "🙂",
    message: "Great! We're happy you had a good experience.",
  },
  5: {
    label: "Awesome",
    emoji: "😍",
    message: "We are thrilled to hear you had a great experience!",
    followUp:
      "Kindly don’t hesitate to chat with us if you have any other questions, suggestions, queries, or concerns.",
  },
};

const Finish = ({
  review,
  message,
  onClose,
}: {
  review: IChatPluginAgentRatingPayload;
  message: string;
  onClose: () => void;
}) => {
  const { label, emoji, message: defaultMessage, followUp } =
    ratingDetails[review.ratings];

  return (
    <div className="w-full h-[calc(100%-64px)] max-h-[calc(100%-64px)] overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
      {/* Thank You */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {message || `🎉 Thank you for your feedback!`}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {defaultMessage}
        </p>
        {followUp && (
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {followUp}
          </p>
        )}
      </div>

      {/* Rating Display */}
      <div className="flex flex-col items-center space-y-2">
        <StarRatingWithIndexEmojis
          value={review.ratings}
          size={32}
          spacing={10}
          animation={false}
          readOnly={true}
        />
        <p className="text-sm text-muted-foreground">
          You rated this chat:{" "}
          <span className="font-medium">
            {label} {emoji}
          </span>
        </p>
      </div>

      {/* Comment Display */}
      {review?.comments && (
        <div className="bg-muted rounded-lg p-4 text-sm text-left text-muted-foreground max-w-md w-full border border-border">
          <p className="font-medium mb-1">Your comment:</p>
          <p className="whitespace-pre-wrap">{review.comments}</p>
        </div>
      )}

      {/* Close Button */}
      <Button onClick={onClose} className="mt-2">
        Close Chat
      </Button>
    </div>
  );
};

export default Finish;
