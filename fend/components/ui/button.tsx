import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg" | "icon";  // allow "icon"
  variant?: string;
};

export function Button({ children, size = "md", variant, className = "", ...props }: ButtonProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2 flex items-center justify-center w-10 h-10"  // icon style
  };

  return (
    <button
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
