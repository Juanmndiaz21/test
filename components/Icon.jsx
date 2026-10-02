import React from 'react';
import {
    IconBook,
    IconCopy,
    IconSearch,
    IconArrowUpRight,
    IconArrowLeft,
    IconArrowRight,
    IconArrowDown,
    IconChevronDown,
    IconChevronUp,
    IconChevronLeft,
    IconChevronRight,
    IconMenu2,
    IconWorld,
    IconBrandDiscord,
    IconMessage,
    IconShoppingCart,
    IconBox,
    IconCheck,
    IconX,
    IconPlus,
    IconMinus,
    IconEye,
    IconEyeOff,
    IconBell,
    IconBolt,
    IconDeviceGamepad2,
    IconStar,
    IconUsers,
    IconClipboardList,
    IconLayoutDashboard,
    IconHelpCircle,
    IconEdit,
    IconTrash,
    IconShieldCheck,
    IconBuildingStore,
    IconWallet,
    IconTrendingUp,
    IconMail,
    IconClock,
    IconTag,
    IconCrown,
    IconLogout,
    IconLock,
    IconInfoCircle,
    IconCircleCheck,
    IconAlertCircle,
    IconAlertTriangle,
    IconPlayerPlay,
    IconPlayerPause,
    IconHeadphones,
    IconAdjustmentsHorizontal,
    IconSparkles,
    IconLayersLinked,
    IconRadar,
    IconPackage,
    IconCamera,
    IconCar,
    IconTarget,
    IconCoin,
    IconPhoto,
    IconUpload,
    IconFolder,
    IconLoader2,
} from '@tabler/icons-react';

/**
 * Tabler Icons mapping for the entire project
 * https://github.com/tabler/tabler-icons
 */
const TABLER_MAP = {
    book: IconBook,
    copy: IconCopy,
    search: IconSearch,
    'arrow-up-right': IconArrowUpRight,
    'arrow-left': IconArrowLeft,
    'arrow-right': IconArrowRight,
    'arrow-down': IconArrowDown,
    'chevron-down': IconChevronDown,
    'chevron-up': IconChevronUp,
    'chevron-left': IconChevronLeft,
    'chevron-right': IconChevronRight,
    menu: IconMenu2,
    globe: IconWorld,
    world: IconWorld,
    discord: IconBrandDiscord,
    message: IconMessage,
    cart: IconShoppingCart,
    box: IconBox,
    check: IconCheck,
    x: IconX,
    plus: IconPlus,
    minus: IconMinus,
    eye: IconEye,
    'eye-off': IconEyeOff,
    bell: IconBell,
    bolt: IconBolt,
    gamepad: IconDeviceGamepad2,
    star: IconStar,
    users: IconUsers,
    clipboard: IconClipboardList,
    dashboard: IconLayoutDashboard,
    'circle-help': IconHelpCircle,
    help: IconHelpCircle,
    edit: IconEdit,
    trash: IconTrash,
    shield: IconShieldCheck,
    'shield-check': IconShieldCheck,
    store: IconBuildingStore,
    wallet: IconWallet,
    'trending-up': IconTrendingUp,
    mail: IconMail,
    clock: IconClock,
    tag: IconTag,
    crown: IconCrown,
    logout: IconLogout,
    lock: IconLock,
    info: IconInfoCircle,
    'info-circle': IconInfoCircle,
    'check-circle': IconCircleCheck,
    'alert-circle': IconAlertCircle,
    'alert-triangle': IconAlertTriangle,
    play: IconPlayerPlay,
    pause: IconPlayerPause,
    headset: IconHeadphones,
    headphones: IconHeadphones,
    sliders: IconAdjustmentsHorizontal,
    sparkles: IconSparkles,
    stars: IconSparkles,
    layers: IconLayersLinked,
    radar: IconRadar,
    package: IconPackage,
    camera: IconCamera,
    car: IconCar,
    target: IconTarget,
    coin: IconCoin,
    coins: IconCoin,
    photo: IconPhoto,
    image: IconPhoto,
    upload: IconUpload,
    folder: IconFolder,
    loader: IconLoader2,
};

export default function Icon({ name, icon, className = 'w-5 h-5', stroke = 2, strokeWidth, size, ...props }) {
    const raw = (name || icon || '').toString().toLowerCase().trim();
    if (!raw) return null;

    // Normalize name removing prefixes like 'solar:', 'icon', 'tb'
    const normalized = raw
        .replace(/^solar:/i, '')
        .replace(/-bold-duotone$/i, '')
        .replace(/^icon-?/i, '')
        .replace(/^tb-?/i, '');

    const Component = TABLER_MAP[raw] || TABLER_MAP[normalized] || IconBox;

    return (
        <Component
            className={className}
            stroke={strokeWidth || stroke}
            size={size}
            aria-hidden="true"
            {...props}
        />
    );
}