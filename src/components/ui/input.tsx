import * as React from "react";

import { cn } from "@/lib/utils";
import { EyeClosed } from "lucide-react";
import { EyeIcon } from "@/icons";

type InputProps = React.ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const isPassword = type === "password";
  // If it's a password field and we've toggled "show", treat it as text
  const actualType = isPassword && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      <input
        type={actualType}
        data-slot="input"
        className={cn(
          // base styles
          "text-foreground placeholder:text-muted-foreground",
          "border-input flex h-12 w-full min-w-0 rounded-md border bg-transparent",
          "px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex",
          "file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // extra right padding if we need room for the eye icon
          isPassword ? "pr-10" : "",
          className
        )}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-2 flex items-center justify-center p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeClosed size={14} /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}
