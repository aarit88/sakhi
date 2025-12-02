import { useState, useCallback, useRef, useEffect, RefObject } from 'react';

// Mock function for useMagneticEffect to satisfy the compiler
export function useMagneticEffect<T extends HTMLElement>(strength: number): {
    elementRef: RefObject<T>;
    transform: { x: number; y: number };
    handlers: { onMouseMove: (e: React.MouseEvent<T>) => void; onMouseLeave: () => void };
} {
    const elementRef = useRef<T>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0 });

    const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
        const target = e.currentTarget;
        if (!target) return;

        const { left, top, width, height } = target.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        // Calculate rotation based on mouse position (Center is 0,0)
        const centerX = width / 2;
        const centerY = height / 2;

        // Apply a slight transform based on mouse position relative to center
        const dx = x - centerX;
        const dy = y - centerY;

        const newX = dx * strength;
        const newY = dy * strength;

        setTransform({ x: newX, y: newY });
    }, [strength]);

    const onMouseLeave = useCallback(() => {
        setTransform({ x: 0, y: 0 });
    }, []);

    // Ensure handlers are properly associated with the ref on the element
    const handlers = {
        onMouseMove: onMouseMove,
        onMouseLeave: onMouseLeave,
    };

    return { elementRef, transform, handlers };
}