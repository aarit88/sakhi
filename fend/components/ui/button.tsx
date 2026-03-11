import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg" | "icon";  // allow "icon"
  variant?: string;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size = "md", variant, className = "", ...props }, ref) => {
    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      icon: "p-2 flex items-center justify-center w-10 h-10"  // icon style
    };

    return (
      <button
        ref={ref}
        className={`${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
