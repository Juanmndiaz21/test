'use client';

import { motion, useReducedMotion } from 'motion/react';
import Icon from './Icon';

function Stars({ label }) {
    return (
        <div className="flex gap-1 text-lime-300" role="img" aria-label={label}>
            {Array.from({ length: 5 }).map((_, index) => (
                <Icon key={index} name="star" className="w-3.5 h-3.5" />
            ))}
        </div>
    );
}

export default function ReviewGrid({ reviews, starsAria }) {
    const reduceMotion = useReducedMotion();

    const variants = {
        rest: { y: 0, scale: 1 },
        hover: { y: -6, scale: 1.02 },
    };

    return (
        <div className="grid md:grid-cols-3 gap-5">
            {reviews.map((review, index) => (
                <motion.figure
                    key={review.author}
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={reduceMotion ? undefined : 'hover'}
                    animate="rest"
                    variants={variants}
                    className="panel-surface rounded-2xl p-7 md:p-8 transition-shadow hover:shadow-xl hover:border-lime-300/40 relative overflow-hidden cursor-default"
                >
                    <Stars label={starsAria} />
                    <blockquote className="text-slate-300 leading-relaxed mt-5">“{review.text}”</blockquote>
                    <figcaption className="mt-6">
                        <strong className="block text-white font-black">{review.author}</strong>
                        <span className="block text-sm text-slate-400 mt-1">{review.tag}</span>
                    </figcaption>
                </motion.figure>
            ))}
        </div>
    );
}