'use client';

import { motion, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }) {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    if (reduceMotion) return children;

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}