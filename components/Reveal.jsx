'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function Reveal({ children, className, delay = 0 }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{
                duration: shouldReduceMotion ? 0.15 : 0.38,
                delay: shouldReduceMotion ? 0 : delay,
                ease: [0.23, 1, 0.32, 1],
            }}
        >
            {children}
        </motion.div>
    );
}