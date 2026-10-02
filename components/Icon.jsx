import React from 'react';
import { SiDiscord } from 'react-icons/si';
import { SOLAR_ICONS_DATA } from './solarIconsData';

/**
 * Solar Duotone Bold Icon mappings for the entire project
 * Renders pure inline SVGs without external network requests or CSP restrictions.
 */
const SOLAR_NAME_MAP = {
    book: 'book-bookmark-bold-duotone',
    copy: 'copy-bold-duotone',
    search: 'magnifer-bold-duotone',
    'arrow-up-right': 'arrow-right-up-bold-duotone',
    'arrow-left': 'arrow-left-bold-duotone',
    'arrow-right': 'arrow-right-bold-duotone',
    'arrow-down': 'arrow-down-bold-duotone',
    'chevron-down': 'alt-arrow-down-bold-duotone',
    'chevron-up': 'alt-arrow-up-bold-duotone',
    'chevron-left': 'alt-arrow-left-bold-duotone',
    'chevron-right': 'alt-arrow-right-bold-duotone',
    menu: 'hamburger-menu-bold-duotone',
    globe: 'global-bold-duotone',
    message: 'chat-round-dots-bold-duotone',
    cart: 'cart-large-bold-duotone',
    box: 'box-bold-duotone',
    check: 'check-circle-bold-duotone',
    x: 'close-circle-bold-duotone',
    plus: 'add-circle-bold-duotone',
    minus: 'minus-circle-bold-duotone',
    eye: 'eye-bold-duotone',
    'eye-off': 'eye-closed-bold-duotone',
    bell: 'bell-bold-duotone',
    bolt: 'bolt-bold-duotone',
    gamepad: 'gamepad-bold-duotone',
    star: 'star-bold-duotone',
    users: 'users-group-two-rounded-bold-duotone',
    clipboard: 'clipboard-list-bold-duotone',
    dashboard: 'widget-2-bold-duotone',
    'circle-help': 'question-circle-bold-duotone',
    edit: 'pen-new-square-bold-duotone',
    trash: 'trash-bin-trash-bold-duotone',
    shield: 'shield-check-bold-duotone',
    store: 'shop-2-bold-duotone',
    wallet: 'wallet-2-bold-duotone',
    'trending-up': 'chart-2-bold-duotone',
    mail: 'letter-bold-duotone',
    clock: 'clock-circle-bold-duotone',
    tag: 'tag-price-bold-duotone',
    crown: 'crown-bold-duotone',
    logout: 'logout-2-bold-duotone',
    info: 'info-circle-bold-duotone',
    'check-circle': 'check-circle-bold-duotone',
    'alert-circle': 'danger-circle-bold-duotone',
    'alert-triangle': 'danger-triangle-bold-duotone',
    play: 'play-circle-bold-duotone',
    pause: 'pause-circle-bold-duotone',
    headset: 'headphones-round-sound-bold-duotone',
    sliders: 'tuning-bold-duotone',
    sparkles: 'stars-bold-duotone',
    layers: 'layers-bold-duotone',
    radar: 'radar-2-bold-duotone',
    package: 'box-bold-duotone',
};

export default function Icon({ name, icon, className = 'w-5 h-5', strokeWidth, ...props }) {
    const iconIdentifier = name || icon;
    if (!iconIdentifier) return null;

    if (iconIdentifier === 'discord') {
        return <SiDiscord className={className} aria-hidden="true" {...props} />;
    }

    const cleanName = iconIdentifier.replace(/^solar:/, '');
    const key = SOLAR_NAME_MAP[cleanName] || cleanName;
    const svgBody = SOLAR_ICONS_DATA[key] || SOLAR_ICONS_DATA[`${key}-bold-duotone`];

    if (!svgBody) {
        return null;
    }

    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svgBody }}
            {...props}
        />
    );
}