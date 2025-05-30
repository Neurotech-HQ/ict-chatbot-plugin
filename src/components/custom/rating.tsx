"use client";

import React, { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StarRatingWithIndexEmojisProps {
  /** Current rating (1–5). 0/undefined means “no rating.” */
  value?: number;

  /** Called when user clicks a slot. */
  onChange?: (rating: number | undefined) => void;

  /** Disable all interaction. */
  disabled?: boolean;

  /** Size of each emoji in pixels. */
  size?: number;

  /** Tooltip text for each slot (0..4). */
  ratingTooltips?: { index: number; content: string }[];

  /** Exactly five emojis, one per index (0 through 4). */
  indexEmojis?: [string, string, string, string, string];

  /** Gap between emojis (px). */
  spacing?: number;

  /** Hover animation? */
  animation?: boolean;

  /** Read-only mode (no hover/click). */
  readOnly?: boolean;
}

export const StarRatingWithIndexEmojis: React.FC<StarRatingWithIndexEmojisProps> = ({
  value,
  onChange,
  disabled = false,
  size = 32,
  ratingTooltips = [
    { index: 0, content: "Terrible" },
    { index: 1, content: "Bad" },
    { index: 2, content: "Average" },
    { index: 3, content: "Good" },
    { index: 4, content: "Awesome" },
  ],
  /** Default emojis: index 0–4 */
  indexEmojis = ["😡", "😞", "😐", "🙂", "😍"],
  spacing = 8,
  animation = true,
  readOnly = false,
}) => {
  const maxRating = 5;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Determine current “selected slot” (hover takes priority over value)
  const current = hoveredIndex !== null ? hoveredIndex : value ?? 0;

  const handleMouseEnter = (idx: number) => {
    if (!disabled && !readOnly) setHoveredIndex(idx + 1);
  };
  const handleMouseLeave = () => {
    if (!readOnly) setHoveredIndex(null);
  };
  const handleClick = (idx: number) => {
    if (disabled || readOnly) return;
    const clickedValue = idx + 1;
    if (value === clickedValue) {
      onChange?.(undefined);
    } else {
      onChange?.(clickedValue);
    }
  };

  return (
    <div style={{ gap: spacing }} className="inline-flex items-center">
      {Array.from({ length: maxRating }, (_, idx) => {
        // Now “filled” = only when idx === current - 1
        const filled = idx === current - 1;
        const emoji = indexEmojis[idx];

        const starElement = (
          <div
            key={idx}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(idx)}
            role="radio"
            aria-checked={filled}
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !readOnly) {
                handleClick(idx);
              }
            }}
            style={{
              cursor: disabled || readOnly ? "default" : "pointer",
            }}
            className={cn("", {
              "transform hover:scale-125 transition-transform":
                !disabled && !readOnly && animation,
            })}
          >
            <span
              style={{
                display: "inline-block",
                width: `${size}px`,
                height: `${size}px`,
                fontSize: `${size}px`,
                lineHeight: 1,
                // Only the selected slot is in full color; all others are grayscale/faded
                filter: filled ? "none" : "grayscale(100%) opacity(0.4)",
              }}
            >
              {emoji}
            </span>
          </div>
        );

        if (!disabled && !readOnly && ratingTooltips[idx]?.content) {
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>{starElement}</TooltipTrigger>
              <TooltipContent>{ratingTooltips[idx].content}</TooltipContent>
            </Tooltip>
          );
        }
        return starElement;
      })}
    </div>
  );
};
