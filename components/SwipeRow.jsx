'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimation, AnimatePresence } from 'motion/react';

export default function SwipeRow({
    children,
    actions = [],
    onAction,
    onCommit,
    actionColor = '#e5484d',
    drawerColor = '#3f3f46',
    rowColor = '#27272a',
    textColor = '#f5f5f5',
    height,
    radius = 16,
    actionWidth = 80,
    direction = 'left',
    snapBounce = 0.2,
    resistance = 0.55,
    collapseMs = 200,
    commitAt = 0.6,
    fullSwipe = true,
    disabled = false,
    style = {},
    className = '',
}) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(300);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const x = useMotionValue(0);
    const controls = useAnimation();

    const isLeft = direction === 'left';
    const totalActionsWidth = actions.length * actionWidth;

    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const handleCommit = async (action) => {
        setIsCollapsed(true);
        setTimeout(() => {
            if (onCommit) onCommit(action);
        }, collapseMs);
    };

    const handleDragEnd = async (_, info) => {
        if (disabled) return;

        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const threshold = containerWidth * commitAt;

        if (isLeft) {
            // Full swipe left triggered
            if (fullSwipe && (offset < -threshold || (offset < -totalActionsWidth && velocity < -400))) {
                await controls.start({
                    x: -containerWidth,
                    transition: { duration: 0.18, ease: 'easeOut' },
                });
                const primaryAction = actions.find(a => a.id === 'delete') || actions[0];
                handleCommit(primaryAction);
                return;
            }

            // Snap open drawer
            if (offset < -totalActionsWidth * 0.4 || velocity < -150) {
                setIsOpen(true);
                controls.start({
                    x: -totalActionsWidth,
                    transition: { type: 'spring', bounce: snapBounce, stiffness: 350, damping: 30 },
                });
            } else {
                setIsOpen(false);
                controls.start({
                    x: 0,
                    transition: { type: 'spring', bounce: snapBounce, stiffness: 350, damping: 30 },
                });
            }
        } else {
            // Right swipe
            if (fullSwipe && (offset > threshold || (offset > totalActionsWidth && velocity > 400))) {
                await controls.start({
                    x: containerWidth,
                    transition: { duration: 0.18, ease: 'easeOut' },
                });
                const primaryAction = actions.find(a => a.id === 'delete') || actions[0];
                handleCommit(primaryAction);
                return;
            }

            if (offset > totalActionsWidth * 0.4 || velocity > 150) {
                setIsOpen(true);
                controls.start({
                    x: totalActionsWidth,
                    transition: { type: 'spring', bounce: snapBounce, stiffness: 350, damping: 30 },
                });
            } else {
                setIsOpen(false);
                controls.start({
                    x: 0,
                    transition: { type: 'spring', bounce: snapBounce, stiffness: 350, damping: 30 },
                });
            }
        }
    };

    const handleActionClick = (action) => {
        if (onAction) onAction(action);
        if (action.id === 'delete' || action.dismiss || action.id === 'archive') {
            handleCommit(action);
        } else {
            controls.start({ x: 0 });
            setIsOpen(false);
        }
    };

    if (isCollapsed) {
        return (
            <motion.div
                initial={{ opacity: 1, height: typeof height === 'number' ? height : 'auto' }}
                animate={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: collapseMs / 1000, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
            />
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative select-none ${className}`}
            style={{
                borderRadius: `${radius}px`,
                overflow: 'hidden',
                backgroundColor: drawerColor,
                minHeight: typeof height === 'number' ? `${height}px` : undefined,
                touchAction: 'pan-y',
                ...style,
            }}
        >
            {/* Background Actions Drawer */}
            <div
                className={`absolute inset-y-0 flex items-stretch ${
                    isLeft ? 'right-0 justify-end' : 'left-0 justify-start'
                }`}
                style={{
                    width: `${Math.max(totalActionsWidth, 80)}px`,
                }}
            >
                {actions.map((act) => {
                    const isDelete = act.id === 'delete';
                    const bgColor = isDelete ? actionColor : drawerColor;
                    return (
                        <button
                            key={act.id}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(act);
                            }}
                            className="flex flex-col items-center justify-center gap-1 font-medium transition-opacity hover:opacity-90 active:scale-95 cursor-pointer text-white"
                            style={{
                                width: `${actionWidth}px`,
                                backgroundColor: bgColor,
                            }}
                            aria-label={act.label}
                        >
                            <span className="shrink-0">{act.icon}</span>
                            {act.label && (
                                <span className="text-[11px] font-mono tracking-tight font-semibold uppercase">
                                    {act.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Foreground Draggable Row */}
            <motion.div
                animate={controls}
                style={{
                    x,
                    backgroundColor: rowColor,
                    color: textColor,
                    borderRadius: `${radius}px`,
                }}
                drag={disabled ? false : 'x'}
                dragDirectionLock
                dragConstraints={
                    isLeft
                        ? { left: fullSwipe ? -containerWidth : -totalActionsWidth, right: 0 }
                        : { left: 0, right: fullSwipe ? containerWidth : totalActionsWidth }
                }
                dragElastic={resistance}
                onDragEnd={handleDragEnd}
                className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
            >
                {children}
            </motion.div>
        </div>
    );
}
