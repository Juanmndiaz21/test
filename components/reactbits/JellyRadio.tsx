"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export interface JellyRadioItem {
  value: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface JellyRadioProps {
  items: JellyRadioItem[] | string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string, index: number) => void;
  chipColor?: string;
  activeColor?: string;
  textColor?: string;
  activeTextColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  gap?: number;
  radius?: number;
  swell?: number;
  barge?: number;
  shrink?: number;
  jelly?: number;
  bounce?: number;
  stagger?: number;
  stiffness?: number;
  disabled?: boolean;
  className?: string;
}

export default function JellyRadio({
  items,
  defaultValue,
  value: controlledValue,
  onChange,
  chipColor = "#18181b",
  activeColor = "#9225CF",
  textColor = "#a1a1aa",
  activeTextColor = "#ffffff",
  size = "md",
  gap = 8,
  radius = 16,
  swell = 0.2,
  barge = 6,
  shrink = 0.05,
  jelly = 1,
  bounce = 0.25,
  stiffness = 580,
  disabled = false,
  className = "",
}: JellyRadioProps) {
  // Normalize items
  const normalizedItems: JellyRadioItem[] = React.useMemo(() => {
    if (typeof items === "string") {
      if (items === "levels") {
        return [
          { value: "Easy", label: "Easy" },
          { value: "Medium", label: "Medium" },
          { value: "Hard", label: "Hard" },
          { value: "Extreme", label: "Extreme" },
        ];
      }
      return [{ value: items, label: items }];
    }
    return items;
  }, [items]);

  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || normalizedItems[0]?.value || ""
  );

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

  // Size configurations
  const sizeStyles = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-xs font-semibold",
    lg: "px-5 py-2.5 text-sm font-semibold",
  };

  const handleSelect = (item: JellyRadioItem, index: number) => {
    if (disabled || item.disabled) return;
    if (controlledValue === undefined) {
      setInternalValue(item.value);
    }
    onChange?.(item.value, index);
  };

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      style={{
        gap: `${gap}px`,
        padding: "4px",
      }}
    >
      {normalizedItems.map((item, index) => {
        const isSelected = item.value === selectedValue;
        const isDisabled = disabled || item.disabled;

        return (
          <motion.button
            key={item.value}
            type="button"
            disabled={isDisabled}
            onClick={() => handleSelect(item, index)}
            whileHover={
              !isDisabled
                ? {
                    scale: 1 + swell * 0.4,
                    y: -1,
                  }
                : undefined
            }
            whileTap={
              !isDisabled
                ? {
                    scale: 1 - shrink,
                    y: 1,
                  }
                : undefined
            }
            transition={{
              type: "spring",
              stiffness: stiffness,
              damping: 25 - bounce * 15,
              mass: 0.6 * jelly,
            }}
            className={`relative flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 ${
              sizeStyles[size]
            } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            style={{
              borderRadius: `${radius}px`,
              color: isSelected ? activeTextColor : textColor,
            }}
          >
            {/* Active Jelly Pill Background */}
            {isSelected && (
              <motion.div
                layoutId="jelly-radio-pill"
                className="absolute inset-0 shadow-lg"
                style={{
                  backgroundColor: activeColor,
                  borderRadius: `${radius}px`,
                }}
                transition={{
                  type: "spring",
                  stiffness: stiffness,
                  damping: 26 - bounce * 14,
                  mass: 0.7 * jelly,
                }}
              />
            )}

            {/* Inactive Chip Background */}
            {!isSelected && (
              <div
                className="absolute inset-0 transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: chipColor,
                  borderRadius: `${radius}px`,
                }}
              />
            )}

            {/* Content Foreground */}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label || item.value}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export { JellyRadio };
