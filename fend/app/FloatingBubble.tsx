"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * FloatingBubble component. Generates random position, delay, and duration
 * on the client-side (inside useEffect) to prevent Next.js hydration errors.
 */
export function FloatingBubble({ className }: { className?: string }) {
  const [style, setStyle] = useState({});

  // This effect runs only once, exclusively on the client side (after hydration).
  useEffect(() => {
    const randomLeft = `${(Math.random() * 95 + 5).toFixed(2)}%`; // 5% to 95%
    const randomTop = `${(Math.random() * 90 + 10).toFixed(2)}%`;  // 10% to 100%
    const randomDelay = `${(Math.random() * 6).toFixed(2)}s`;
    const randomDuration = `${(Math.random() * 10 + 8).toFixed(2)}s`;

    setStyle({
      left: randomLeft,
      top: randomTop,
      animationDelay: randomDelay,
      animationDuration: randomDuration,
    });
  }, []);

  // During SSR, the style object is empty, avoiding a server/client mismatch.
  // The element only renders and receives dynamic styles on the client.
  if (Object.keys(style).length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute w-2 h-2 bg-primary/20 rounded-full opacity-30 animate-float pointer-events-none",
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}
