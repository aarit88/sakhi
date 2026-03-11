"use client"

import { useEffect, useRef } from "react"

export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: "50px",
      ...options,
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [callback, options])

  return ref
}

export function useScrollAnimation() {
  const animateOnScroll = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-slide-up")
        entry.target.classList.remove("opacity-0", "translate-y-8")
      }
    })
  }

  return useIntersectionObserver(animateOnScroll)
}

export function useCountUp(end: number, duration = 2000) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let start = 0
            const increment = end / (duration / 16)

            const timer = setInterval(() => {
              start += increment
              if (start >= end) {
                element.textContent = end.toString()
                clearInterval(timer)
              } else {
                element.textContent = Math.floor(start).toString()
              }
            }, 16)

            observer.unobserve(element)
          }
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [end, duration])

  return ref
}
