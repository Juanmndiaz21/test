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
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let isVisible = true;
    let isDirty = true;

    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      const cols = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const offsetX = (width - cols * gap) / 2;
      const offsetY = (height - rows * gap) / 2;

      ctx.fillStyle = baseColor;
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = offsetX + i * gap;
          const y = offsetY + j * gap;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const renderInteractive = () => {
      ctx.clearRect(0, 0, width, height);
      const cols = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const offsetX = (width - cols * gap) / 2;
      const offsetY = (height - rows * gap) / 2;
      const maxDist = 120;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = offsetX + i * gap;
          const y = offsetY + j * gap;
          const dx = mouseX - x;
          const dy = mouseY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

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
      isDirty = false;
    };

    const loop = () => {
      if (isVisible && isDirty) {
        renderInteractive();
      }
      animationFrameId = null;
    };

    const scheduleDraw = () => {
      if (!isDirty) {
        isDirty = true;
        if (!animationFrameId && isVisible) {
          animationFrameId = requestAnimationFrame(loop);
        }
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = canvas.width = parent.clientWidth;
      height = canvas.height = parent.clientHeight;
      if (hasHover) {
        isDirty = true;
        renderInteractive();
      } else {
        renderStatic();
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pause rendering when offscreen using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible && hasHover) {
          scheduleDraw();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const parent = canvas.parentElement;
    let handleMouseMove: ((e: MouseEvent) => void) | null = null;
    let handleMouseLeave: (() => void) | null = null;

    if (hasHover && parent) {
      handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        scheduleDraw();
      };

      handleMouseLeave = () => {
        mouseX = -1000;
        mouseY = -1000;
        scheduleDraw();
      };

      parent.addEventListener("mousemove", handleMouseMove, { passive: true });
      parent.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
      if (parent && handleMouseMove && handleMouseLeave) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, gap, baseColor, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${className}`}
    />
  );
}
