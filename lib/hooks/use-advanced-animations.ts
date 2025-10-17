"use client"

import { useRef, useState, useCallback, useEffect } from "react"

/**
 * useMagneticEffect: Creates a "magnetic" pull effect on hover.
 * This hook is generic, allowing it to correctly reference any HTML element type (T extends HTMLElement).
 * * @template T - The type of the DOM element (e.g., HTMLButtonElement, HTMLDivElement).
 * @param {number} strength - Multiplier for the magnetic effect intensity (e.g., 0.3).
 */
export function useMagneticEffect<T extends HTMLElement>(strength = 0.3) {
  const [transform, setTransform] = useState({ x: 0, y: 0 })
  const elementRef = useRef<T>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        // Calculate center of the element relative to the viewport
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Calculate distance from cursor to center and apply strength
        const deltaX = (e.clientX - centerX) * strength
        const deltaY = (e.clientY - centerY) * strength

        setTransform({ x: deltaX, y: deltaY })
      }
    },
    [strength],
  )

  const handleMouseEnter = useCallback(() => {
    // Attach listener to the whole document when hovering over the element
    document.addEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  const handleMouseLeave = useCallback(() => {
    // Remove listener and reset position when leaving
    document.removeEventListener("mousemove", handleMouseMove)
    setTransform({ x: 0, y: 0 })
  }, [handleMouseMove])

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseMove])

  return {
    elementRef,
    transform,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  }
}
