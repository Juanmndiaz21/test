'use client';

import { useSession } from 'next-auth/react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';

export default function SupportChannels({ translations = {} }) {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;
    const shouldReduceMotion = useReducedMotion();

    const channels = [
        {
            id: 'liveChat',
            icon: 'message',
            title: translations.liveChatTitle || 'Live Chat Support',
            desc: translations.liveChatDesc || 'Get immediate assistance with our live chat support available 24/7.',
            actionText: isLoggedIn
                ? (translations.liveChatActionAuth || 'Start Live Chat')
                : (translations.liveChatAction || 'Sign In to Start Chat'),
            href: isLoggedIn ? '/contact' : '/login?callbackUrl=/help',
            isExternal: false,
            buttonStyle: 'bg-[#9333EA] hover:bg-[#8229b8] active:scale-[0.98] text-white',
            iconBg: 'bg-[#9333EA]',
        },
        {
            id: 'discord',
            icon: 'discord',
            title: translations.discordTitle || 'Discord Community',
            desc: translations.discordDesc || 'Join our Discord server for instant support and community help.',
            actionText: translations.discordAction || 'Join Discord',
            href: 'https://discord.gg',
            isExternal: true,
            buttonStyle: 'bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] text-white',
            iconBg: 'bg-[#5865F2]',
        },
        {
            id: 'email',
            icon: 'mail',
            title: translations.emailTitle || 'Email Support',
            desc: translations.emailDesc || "Send us an email and we'll get back to you within 24 hours.",
            actionText: translations.emailAction || 'Send Email',
            href: 'mailto:support@ogmodz.com',
            isExternal: true,
            buttonStyle: 'bg-[#9333EA] hover:bg-[#8229b8] active:scale-[0.98] text-white',
            iconBg: 'bg-[#9333EA]',
        },
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: shouldReduceMotion ? 0 : i * 0.08,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {channels.map((channel, i) => (
                <motion.div
                    key={channel.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-xl bg-[#252530] p-6 sm:p-7 flex flex-col justify-between group transition-colors duration-150 hover:bg-[#282836]"
                >
                    <div className="flex-1 flex flex-col justify-start">
                        {/* Channel Icon Badge */}
                        <div
                            aria-hidden="true"
                            className={`w-10 h-10 rounded-lg ${channel.iconBg} text-white flex items-center justify-center mb-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 group-hover:-rotate-2`}
                        >
                            <Icon name={channel.icon} className="w-5 h-5" />
                        </div>

                        {/* Title (semantic h3) */}
                        <h3 className="font-['Trebuchet_MS',sans-serif] text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                            {channel.title}
                        </h3>

                        {/* Description with AAA contrast */}
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            {channel.desc}
                        </p>
                    </div>

                    {/* Action Button */}
                    {channel.isExternal ? (
                        <a
                            href={channel.href}
                            target={channel.href.startsWith('http') ? '_blank' : undefined}
                            rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            aria-label={`${channel.title}: ${channel.actionText}`}
                            className={`w-full min-h-[44px] py-2.5 px-4 rounded-lg font-['Trebuchet_MS',sans-serif] font-medium text-sm text-center flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252530] ${channel.buttonStyle}`}
                        >
                            {channel.actionText}
                        </a>
                    ) : (
                        <Link
                            href={channel.href}
                            aria-label={`${channel.title}: ${channel.actionText}`}
                            className={`w-full min-h-[44px] py-2.5 px-4 rounded-lg font-['Trebuchet_MS',sans-serif] font-medium text-sm text-center flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252530] ${channel.buttonStyle}`}
                        >
                            {channel.actionText}
                        </Link>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
