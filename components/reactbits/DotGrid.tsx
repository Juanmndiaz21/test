"use client";

import React, { useEffect, useRef } from "react";

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  glowColor?: string;
  className?: string;
}

export default function DotGrid({
  dotSize = 1.5,
  gap = 24,
  baseColor = "rgba(255, 255, 255, 0.12)",
  glowColor = "rgba(255, 255, 255, 0.5)",
  className = "",
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = canvas.width = parent.clientWidth;
      height = canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const offsetX = (width - cols * gap) / 2;
      const offsetY = (height - rows * gap) / 2;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = offsetX + i * gap;
          const y = offsetY + j * gap;

          const dx = mouseX - x;
          const dy = mouseY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          ctx.beginPath();
          if (dist < maxDist) {
            const factor = 1 - dist / maxDist;
            ctx.fillStyle = glowColor;
            ctx.arc(x, y, dotSize + factor * 1.5, 0, Math.PI * 2);
          } else {
            ctx.fillStyle = baseColor;
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, gap, baseColor, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${className}`}
    />
  );
}
