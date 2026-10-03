'use client';

import React, { useRef, useEffect } from 'react';

export default function CursorGrid({
    cellSize = 70,
    color = '#D946EF',
    radius = 140,
    falloff = 'smooth',
    holdTime = 400,
    fadeDuration = 800,
    lineWidth = 1.2,
    maxOpacity = 1,
    fillOpacity = 0,
    gridOpacity = 0,
    cellRadius = 0,
    clickPulse = true,
    pulseSpeed = 600,
    className = '',
    style = {},
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let width = 0;
        let height = 0;

        // Trail of recent cursor positions
        const trail = [];
        const pulses = [];
        let mouseX = -1000;
        let mouseY = -1000;
        let isHovered = false;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            width = parent.clientWidth;
            height = parent.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);

        const parent = canvas.parentElement || window;

        const onPointerMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isHovered = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

            if (isHovered) {
                const now = performance.now();
                // Avoid flooding with identical points
                const last = trail[trail.length - 1];
                if (!last || Math.hypot(mouseX - last.x, mouseY - last.y) > 6 || now - last.time > 30) {
                    trail.push({ x: mouseX, y: mouseY, time: now });
                }
            }
        };

        const onPointerLeave = () => {
            isHovered = false;
            mouseX = -1000;
            mouseY = -1000;
        };

        const onPointerDown = (e) => {
            if (!clickPulse) return;
            const rect = canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            if (px >= 0 && px <= width && py >= 0 && py <= height) {
                pulses.push({
                    x: px,
                    y: py,
                    startTime: performance.now(),
                    maxRadius: Math.max(width, height) * 0.7,
                });
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', onPointerLeave, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });

        const render = () => {
            const now = performance.now();
            ctx.clearRect(0, 0, width, height);

            // 1. Draw base idle grid if gridOpacity > 0
            if (gridOpacity > 0) {
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.globalAlpha = gridOpacity;
                ctx.beginPath();
                for (let x = 0; x <= width; x += cellSize) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                }
                for (let y = 0; y <= height; y += cellSize) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                }
                ctx.stroke();
                ctx.restore();
            }

            // Clean expired trail points
            const totalDuration = holdTime + fadeDuration;
            while (trail.length > 0 && now - trail[0].time > totalDuration) {
                trail.shift();
            }

            // Clean expired pulses
            while (pulses.length > 0 && now - pulses[0].startTime > pulseSpeed) {
                pulses.shift();
            }

            // If mouse currently inside, ensure immediate glow point
            if (isHovered) {
                trail.push({ x: mouseX, y: mouseY, time: now });
            }

            // 2. Draw illuminated cell fills if fillOpacity > 0
            if (fillOpacity > 0 && trail.length > 0) {
                ctx.save();
                ctx.fillStyle = color;
                for (const pt of trail) {
                    const elapsed = now - pt.time;
                    let factor = 1;
                    if (elapsed > holdTime) {
                        factor = Math.max(0, 1 - (elapsed - holdTime) / fadeDuration);
                    }
                    const col = Math.floor(pt.x / cellSize);
                    const row = Math.floor(pt.y / cellSize);
                    ctx.globalAlpha = factor * fillOpacity;
                    if (cellRadius > 0) {
                        ctx.beginPath();
                        ctx.roundRect(col * cellSize, row * cellSize, cellSize, cellSize, cellRadius);
                        ctx.fill();
                    } else {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
                ctx.restore();
            }

            // 3. Draw glowing grid lines based on active trail points
            if (trail.length > 0 || pulses.length > 0) {
                // Collect unique vertical and horizontal lines affected
                const minCol = 0;
                const maxCol = Math.ceil(width / cellSize);
                const minRow = 0;
                const maxRow = Math.ceil(height / cellSize);

                ctx.save();
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';

                // Check vertical grid lines
                for (let c = minCol; c <= maxCol; c++) {
                    const lx = c * cellSize;
                    for (const pt of trail) {
                        const dx = Math.abs(lx - pt.x);
                        if (dx < radius) {
                            const elapsed = now - pt.time;
                            let factor = 1;
                            if (elapsed > holdTime) {
                                factor = Math.max(0, 1 - (elapsed - holdTime) / fadeDuration);
                            }
                            if (factor <= 0) continue;

                            const dy = Math.sqrt(radius * radius - dx * dx);
                            const y1 = Math.max(0, pt.y - dy);
                            const y2 = Math.min(height, pt.y + dy);

                            if (y2 > y1) {
                                const grad = ctx.createLinearGradient(lx, y1, lx, y2);
                                const peakAlpha = (1 - dx / radius) * factor * maxOpacity;
                                grad.addColorStop(0, 'transparent');
                                grad.addColorStop(0.5, color);
                                grad.addColorStop(1, 'transparent');

                                ctx.globalAlpha = peakAlpha;
                                ctx.strokeStyle = grad;
                                ctx.beginPath();
                                ctx.moveTo(lx, y1);
                                ctx.lineTo(lx, y2);
                                ctx.stroke();
                            }
                        }
                    }
                }

                // Check horizontal grid lines
                for (let r = minRow; r <= maxRow; r++) {
                    const ly = r * cellSize;
                    for (const pt of trail) {
                        const dy = Math.abs(ly - pt.y);
                        if (dy < radius) {
                            const elapsed = now - pt.time;
                            let factor = 1;
                            if (elapsed > holdTime) {
                                factor = Math.max(0, 1 - (elapsed - holdTime) / fadeDuration);
                            }
                            if (factor <= 0) continue;

                            const dx = Math.sqrt(radius * radius - dy * dy);
                            const x1 = Math.max(0, pt.x - dx);
                            const x2 = Math.min(width, pt.x + dx);

                            if (x2 > x1) {
                                const grad = ctx.createLinearGradient(x1, ly, x2, ly);
                                const peakAlpha = (1 - dy / radius) * factor * maxOpacity;
                                grad.addColorStop(0, 'transparent');
                                grad.addColorStop(0.5, color);
                                grad.addColorStop(1, 'transparent');

                                ctx.globalAlpha = peakAlpha;
                                ctx.strokeStyle = grad;
                                ctx.beginPath();
                                ctx.moveTo(x1, ly);
                                ctx.lineTo(x2, ly);
                                ctx.stroke();
                            }
                        }
                    }
                }

                // 4. Render click pulse shockwaves
                for (const pulse of pulses) {
                    const elapsed = now - pulse.startTime;
                    const progress = elapsed / pulseSpeed;
                    if (progress < 1) {
                        const currentRadius = progress * pulse.maxRadius;
                        const pulseAlpha = (1 - progress) * maxOpacity;
                        const ringWidth = Math.max(10, (1 - progress) * 40);

                        ctx.save();
                        ctx.globalAlpha = pulseAlpha * 0.8;
                        ctx.strokeStyle = color;
                        ctx.lineWidth = lineWidth * 2;
                        ctx.beginPath();
                        ctx.arc(pulse.x, pulse.y, currentRadius, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    }
                }

                ctx.restore();
            }

            if (isVisible) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        let isVisible = true;
        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        }, { threshold: 0 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerleave', onPointerLeave);
            window.removeEventListener('pointerdown', onPointerDown);
        };
    }, [
        cellSize,
        color,
        radius,
        falloff,
        holdTime,
        fadeDuration,
        lineWidth,
        maxOpacity,
        fillOpacity,
        gridOpacity,
        cellRadius,
        clickPulse,
        pulseSpeed,
    ]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
            style={{
                touchAction: 'none',
                ...style,
            }}
        />
    );
}
