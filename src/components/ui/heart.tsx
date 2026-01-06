"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export interface HeartIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HeartIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  /** Fill the heart with solid color */
  filled?: boolean;
  /** Enable continuous pulsing animation */
  pulsing?: boolean;
}

const HeartIcon = forwardRef<HeartIconHandle, HeartIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, filled = false, pulsing = false, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    // Start pulsing animation on mount if pulsing prop is true
    useEffect(() => {
      if (pulsing) {
        controls.start("pulse");
      }
    }, [pulsing, controls]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else if (!pulsing) {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave, pulsing]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          initial={pulsing ? "pulse" : "normal"}
          fill={filled ? "currentColor" : "none"}
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={filled ? "0" : "2"}
          variants={{
            normal: { scale: 1 },
            animate: { scale: [1, 1.08, 1] },
            pulse: {
              scale: [1, 1.1, 1],
              transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </motion.svg>
      </div>
    );
  }
);

HeartIcon.displayName = "HeartIcon";

export { HeartIcon };
