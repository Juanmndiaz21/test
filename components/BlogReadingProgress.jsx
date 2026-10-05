'use client';

import { useState, useEffect } from 'react';

export default function BlogReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const article = document.getElementById('blog-article-root');
            if (!article) return;

            const rect = article.getBoundingClientRect();
            const total = article.scrollHeight - window.innerHeight;
            const scrolled = -rect.top;
            const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
            setProgress(pct);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (progress <= 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-1 bg-black/40 z-50 pointer-events-none">
            <div
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-100 ease-out shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
