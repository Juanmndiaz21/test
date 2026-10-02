'use client';

import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';
import { SiDiscord } from 'react-icons/si';

/**
 * Solar Duotone Bold Icon mappings for the entire project
 * Adheres to the solar-duotone-bold design system specification.
 */
const SOLAR_ICONS = {
    book: 'solar:book-bookmark-bold-duotone',
    copy: 'solar:copy-bold-duotone',
    search: 'solar:magnifer-bold-duotone',
    'arrow-up-right': 'solar:arrow-right-up-bold-duotone',
    'arrow-left': 'solar:arrow-left-bold-duotone',
    'arrow-right': 'solar:arrow-right-bold-duotone',
    'arrow-down': 'solar:arrow-down-bold-duotone',
    'chevron-down': 'solar:alt-arrow-down-bold-duotone',
    'chevron-up': 'solar:alt-arrow-up-bold-duotone',
    'chevron-left': 'solar:alt-arrow-left-bold-duotone',
    'chevron-right': 'solar:alt-arrow-right-bold-duotone',
    menu: 'solar:hamburger-menu-bold-duotone',
    globe: 'solar:global-bold-duotone',
    message: 'solar:chat-round-dots-bold-duotone',
    cart: 'solar:cart-large-bold-duotone',
    box: 'solar:box-bold-duotone',
    check: 'solar:check-circle-bold-duotone',
    x: 'solar:close-circle-bold-duotone',
    plus: 'solar:add-circle-bold-duotone',
    minus: 'solar:minus-circle-bold-duotone',
    eye: 'solar:eye-bold-duotone',
    'eye-off': 'solar:eye-closed-bold-duotone',
    bell: 'solar:bell-bold-duotone',
    bolt: 'solar:bolt-bold-duotone',
    gamepad: 'solar:gamepad-bold-duotone',
    star: 'solar:star-bold-duotone',
    users: 'solar:users-group-two-rounded-bold-duotone',
    clipboard: 'solar:clipboard-list-bold-duotone',
    dashboard: 'solar:widget-2-bold-duotone',
    'circle-help': 'solar:question-circle-bold-duotone',
    edit: 'solar:pen-new-square-bold-duotone',
    trash: 'solar:trash-bin-trash-bold-duotone',
    shield: 'solar:shield-check-bold-duotone',
    store: 'solar:shop-2-bold-duotone',
    wallet: 'solar:wallet-2-bold-duotone',
    'trending-up': 'solar:chart-2-bold-duotone',
    mail: 'solar:letter-bold-duotone',
    clock: 'solar:clock-circle-bold-duotone',
    tag: 'solar:tag-price-bold-duotone',
    crown: 'solar:crown-bold-duotone',
    logout: 'solar:logout-2-bold-duotone',
    info: 'solar:info-circle-bold-duotone',
    'check-circle': 'solar:check-circle-bold-duotone',
    'alert-circle': 'solar:danger-circle-bold-duotone',
    'alert-triangle': 'solar:danger-triangle-bold-duotone',
    play: 'solar:play-circle-bold-duotone',
    pause: 'solar:pause-circle-bold-duotone',
    headset: 'solar:headphones-round-sound-bold-duotone',
    sliders: 'solar:tuning-bold-duotone',
    sparkles: 'solar:stars-bold-duotone',
    layers: 'solar:layers-bold-duotone',
    radar: 'solar:radar-2-bold-duotone',
    package: 'solar:box-bold-duotone',
};

export default function Icon({ name, className = 'w-5 h-5', strokeWidth, ...props }) {
    if (!name) return null;

    if (name === 'discord') {
        return <SiDiscord className={className} aria-hidden="true" {...props} />;
    }

    const solarIconName = name.startsWith('solar:')
        ? name
        : SOLAR_ICONS[name] || (name.includes(':') ? name : `solar:${name}-bold-duotone`);

    return (
        <IconifyIcon
            icon={solarIconName}
            className={className}
            aria-hidden="true"
            {...props}
        />
    );
}