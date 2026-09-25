'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function HelpFaqList({ faqs = [] }) {
    const shouldReduceMotion = useReducedMotion();

    const itemVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: shouldReduceMotion ? 0 : 0.12 + i * 0.05,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    return (
        <div className="space-y-3 sm:space-y-3.5">
            {faqs.map((faq, index) => (
                <motion.div
                    key={index}
                    id={`faq-${index + 1}`}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-20px' }}
                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-xl bg-[#252530] p-5 sm:p-6 transition-colors duration-150 hover:bg-[#282836]"
                >
                    <h3 className="font-['Trebuchet_MS',sans-serif] text-base font-bold text-white mb-2 leading-snug">
                        {faq.q || faq.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line max-w-4xl">
                        {faq.a || faq.content}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
