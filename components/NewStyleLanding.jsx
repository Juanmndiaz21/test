'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useRouter } from '@/i18n/navigation';
import { gameToSlug } from '@/lib/gameSlugs';
import {
    ShieldCheck,
    Lightning,
    ArrowRight,
    Star,
    MagnifyingGlass,
    DiscordLogo,
    CheckCircle,
    CaretDown,
    CaretLeft,
    CaretRight,
    GameController,
    Fire,
    Sparkle,
    CreditCard,
    RocketLaunch,
    ShoppingCart,
} from '@phosphor-icons/react';

import DotGrid from '@/components/reactbits/DotGrid';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { HoverBorderGradient, AceternityLogo } from '@/components/ui/hover-border-gradient';

const CURATED_GAMES = [
    {
        name: 'Grand Theft Auto V',
        short: 'GTA V',
        slug: 'gta-5',
        image: '/store/GTA V.webp',
        tag: 'Best Seller',
    },
    {
        name: 'Red Dead Redemption 2',
        short: 'RDR 2',
        slug: 'rdr2',
        image: '/store/rdr2.webp',
        tag: 'Popular',
    },
    {
        name: 'Counter-Strike 2',
        short: 'CS2',
        slug: 'cs2',
        image: '/store/cs2.webp',
        tag: 'Trending',
    },
    {
        name: 'EA SPORTS FC',
        short: 'FC 27 / 24',
        slug: 'ea-sports-fc',
        image: '/store/fc27.webp',
        tag: 'Hot Release',
    },
];

const DEFAULT_SERVICES = [
    {
        id: 'rdr2-cash',
        title: 'RDR2 | Safe Online Cash Service',
        subtitle: 'Select Cash Amount',
        game: 'Red Dead Redemption 2',
        oldPrice: '$15.00',
        price: '$9.99',
        badge: 'HOT',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        categories: ['featured', 'onsale'],
        image: '/store/RDR2-CASH.webp',
        link: '/store?game=rdr2',
    },
    {
        id: 'gtav-cash',
        title: 'GTA V | Safe Online Cash Service',
        subtitle: 'Select Cash Amount',
        game: 'Grand Theft Auto V',
        oldPrice: '$12.00',
        price: '$7.49',
        badge: 'HOT',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        categories: ['bestseller', 'onsale'],
        image: '/store/GTAV-CASHBOOST.webp',
        link: '/store?game=gta-5',
    },
    {
        id: 'gtav-acc',
        title: 'GTA V | Modded Accounts (PC & PS5)',
        subtitle: 'Select Account Rank',
        game: 'Grand Theft Auto V',
        oldPrice: '$45.00',
        price: '$29.99',
        badge: 'BESTSELLER',
        badgeColor: 'bg-[#9225CF]/20 text-purple-300 border-[#9225CF]/30',
        categories: ['bestseller', 'featured'],
        image: '/store/GTAV-FULLACC.webp',
        link: '/store?game=gta-5',
    },
    {
        id: 'rdr2-role',
        title: 'RDR2 | Role XP & Max Unlock All',
        subtitle: 'Select XP Package',
        game: 'Red Dead Redemption 2',
        oldPrice: '$22.00',
        price: '$14.99',
        badge: 'HOT',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        categories: ['onsale'],
        image: '/store/RDR2-MAXLVLROLE.webp',
        link: '/store?game=rdr2',
    },
    {
        id: 'cs2-boost',
        title: 'CS2 | Premier Rating & Win Boost',
        subtitle: 'Select Elo Target',
        game: 'Counter-Strike 2',
        oldPrice: '$35.00',
        price: '$24.99',
        badge: 'NEW',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        categories: ['new', 'featured'],
        image: '/store/cs2.webp',
        link: '/store?game=cs2',
    },
    {
        id: 'gtav-unlock',
        title: 'GTA V | Unlock All Heists & Garages',
        subtitle: 'Full Inventory Package',
        game: 'Grand Theft Auto V',
        oldPrice: '$20.00',
        price: '$11.99',
        badge: 'POPULAR',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        categories: ['bestseller', 'onsale'],
        image: '/store/GTAV-UNLOCKALL.webp',
        link: '/store?game=gta-5',
    },
    {
        id: 'gtav-cars',
        title: 'GTA V | Modded Cars & Outfits',
        subtitle: 'Custom Garages & Outfits',
        game: 'Grand Theft Auto V',
        oldPrice: '$25.00',
        price: '$16.50',
        badge: 'NEW',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        categories: ['new', 'featured'],
        image: '/store/GTAV-CARS.webp',
        link: '/store?game=gta-5',
    },
    {
        id: 'rdr2-gold',
        title: 'RDR2 | Gold Bars Express Package',
        subtitle: '50-500 Bars Injected',
        game: 'Red Dead Redemption 2',
        oldPrice: '$30.00',
        price: '$19.99',
        badge: 'BESTSELLER',
        badgeColor: 'bg-[#9225CF]/20 text-purple-300 border-[#9225CF]/30',
        categories: ['bestseller', 'onsale'],
        image: '/store/RDR2-GOLD.webp',
        link: '/store?game=rdr2',
    },
];

const DEFAULT_REVIEWS = [
    {
        author: 'Alex_Viper',
        badge: 'Verified Buyer',
        stars: 5,
        game: 'GTA V Online',
        text: 'Bought the $500M cash package. Took literally 8 minutes to complete. Account safe and money in the bank. 10/10 service!',
        time: '2 hours ago',
    },
    {
        author: 'GhostRider99',
        badge: 'Verified Buyer',
        stars: 5,
        game: 'RDR 2 Online',
        text: 'Maxed out all roles and got 100 gold bars safely. Best support on Discord, answered all my questions within a minute.',
        time: '5 hours ago',
    },
    {
        author: 'ShadowKev',
        badge: 'Verified Buyer',
        stars: 5,
        game: 'GTA V Modded Acc',
        text: 'The modded account came with 200 custom outfits and billions. Legit seller, haven’t had any bans or resets.',
        time: '1 day ago',
    },
    {
        author: 'ZeroTolerance',
        badge: 'Verified Buyer',
        stars: 5,
        game: 'CS2 Premier',
        text: 'Boosted my rank from 10k to 17k smoothly. The booster played like a pro without looking suspicious at all.',
        time: '1 day ago',
    },
    {
        author: 'Matheus_BR',
        badge: 'Verified Buyer',
        stars: 5,
        game: 'GTA V Online',
        text: 'Entrega super rápida! Recomiendo a toda la comunidad, el mejor precio con diferencia y cero riesgo de baneo.',
        time: '2 days ago',
    },
    {
        author: 'KryptonX',
        badge: 'Verified Buyer',
        stars: 5,
        game: 'GTA V Online',
        text: 'Incredible speed. Got 1 billion added without any issue. Operator communicated throughout the whole process.',
        time: '3 days ago',
    },
];

const PROCESS_STEPS = [
    {
        step: '01',
        title: 'Select Service',
        description: 'Choose your title, target edition, and exact custom package.',
        icon: <GameController size={22} weight="duotone" className="text-purple-400" />,
    },
    {
        step: '02',
        title: 'Fast Checkout',
        description: 'Encrypted payment with immediate order receipt & ticket code.',
        icon: <CreditCard size={22} weight="duotone" className="text-purple-400" />,
    },
    {
        step: '03',
        title: 'Queue Execution',
        description: 'Operators initiate the boost safely with real-time status alerts.',
        icon: <Lightning size={22} weight="duotone" className="text-purple-400" />,
    },
    {
        step: '04',
        title: 'Ready to Play',
        description: 'Log in with fully delivered assets, backed by 24/7 warranty.',
        icon: <RocketLaunch size={22} weight="duotone" className="text-purple-400" />,
    },
];

const DEFAULT_FAQS = [
    {
        q: 'Is it safe for my account? Can I receive a ban?',
        a: 'Our methods use battle-tested stealth injection protocols that emulate official in-game rewards. We maintain a 99.8% safety track record and offer a full replacement warranty.',
    },
    {
        q: 'How fast is order delivery after payment?',
        a: 'Most services (cash drops, rank upgrades, modded accounts) start within 15 to 30 minutes. Once confirmed, you receive direct status tracking and operator support.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept major international credit/debit cards (Visa, Mastercard, AMEX), PayPal, Apple Pay, Google Pay, and leading cryptocurrencies with buyer protection.',
    },
    {
        q: 'Do I need to share my main account credentials?',
        a: 'For direct recovery injections, temporary protected credentials are used. We never ask for your recovery email. Pre-modded accounts ready to play are also available.',
    },
    {
        q: 'What if I need help or have questions about my order?',
        a: 'Our dedicated customer support team operates 24/7 via live support ticket, on-site contact, and our official Discord server.',
    },
];

export default function NewStyleLanding({
    dbGames = [],
    dbProducts = [],
    dbReviews = [],
    faqs = DEFAULT_FAQS,
}) {
    const router = useRouter();
    const [serviceFilter, setServiceFilter] = useState('all');
    const [openFaq, setOpenFaq] = useState(0);

    // Filter services
    const filterButtons = [
        { id: 'all', label: 'All Services' },
        { id: 'bestseller', label: 'Best Seller' },
        { id: 'featured', label: 'Featured' },
        { id: 'new', label: 'New' },
        { id: 'onsale', label: 'On Sale' },
    ];

    const activeServicesList = useMemo(() => {
        if (dbProducts && dbProducts.length > 0) {
            return dbProducts.map((p, idx) => {
                const isSale = p.price && p.original_price && Number(p.original_price) > Number(p.price);
                const isBest = idx % 3 === 0;
                const isNew = idx % 4 === 1;
                const cats = ['featured'];
                if (isBest) cats.push('bestseller');
                if (isNew) cats.push('new');
                if (isSale) cats.push('onsale');

                let badge = 'HOT';
                let badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                if (isBest) {
                    badge = 'BESTSELLER';
                    badgeColor = 'bg-[#9225CF]/20 text-purple-300 border-[#9225CF]/30';
                } else if (isNew) {
                    badge = 'NEW';
                    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
                }

                return {
                    id: p.id,
                    title: p.name,
                    subtitle: p.features ? String(p.features).split('\n')[0] : (p.game ? `${p.game} Package` : 'Instant Delivery'),
                    game: p.game,
                    oldPrice: isSale ? `$${Number(p.original_price).toFixed(2)}` : null,
                    price: `$${Number(p.price || 0).toFixed(2)}`,
                    badge,
                    badgeColor,
                    categories: cats,
                    image: p.image_url || '/store/GTAV-CASHBOOST.webp',
                    link: `/store/${p.id}`,
                };
            });
        }
        return DEFAULT_SERVICES;
    }, [dbProducts]);

    const displayedServices = useMemo(() => {
        if (serviceFilter === 'all') return activeServicesList.slice(0, 9);
        return activeServicesList.filter((s) => s.categories.includes(serviceFilter)).slice(0, 9);
    }, [activeServicesList, serviceFilter]);

    // Active reviews indexed from admin panel / database
    const activeReviews = useMemo(() => {
        if (dbReviews && dbReviews.length > 0) {
            return dbReviews.map((r) => {
                const author = r.author || r.name || 'Verified Player';
                const stars = Math.min(5, Math.max(1, Number(r.rating) || 5));
                const text = r.content || r.comment || r.text || r.title || 'Super fast and reliable service!';
                const title = r.title && r.title.trim().toLowerCase() !== text.trim().toLowerCase() ? r.title : null;
                const game = r.game || r.productName || 'GTA V Online';

                let time = 'Recently';
                if (r.created_at) {
                    try {
                        const date = new Date(r.created_at);
                        const diffMs = Date.now() - date.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);
                        if (diffHours < 1) time = 'Just now';
                        else if (diffHours < 24) time = `${diffHours}h ago`;
                        else if (diffDays < 30) time = `${diffDays}d ago`;
                        else time = date.toLocaleDateString();
                    } catch {
                        time = 'Recently';
                    }
                }

                return {
                    id: r.id,
                    author,
                    badge: 'Verified Buyer',
                    stars,
                    game,
                    title,
                    text,
                    time,
                };
            });
        }
        return DEFAULT_REVIEWS;
    }, [dbReviews]);

    const loopReviews = useMemo(() => {
        if (activeReviews.length < 8) {
            return [...activeReviews, ...activeReviews, ...activeReviews];
        }
        return [...activeReviews, ...activeReviews];
    }, [activeReviews]);

    // Draggable reviews track refs & handlers
    const reviewTrackRef = useRef(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isDraggingRef = useRef(false);
    const startPosRef = useRef({ x: 0, scrollLeft: 0 });

    const handleMouseDown = (e) => {
        if (!reviewTrackRef.current) return;
        isDraggingRef.current = true;
        setIsMouseDown(true);
        startPosRef.current = {
            x: e.pageX - reviewTrackRef.current.offsetLeft,
            scrollLeft: reviewTrackRef.current.scrollLeft,
        };
    };

    const handleMouseLeaveOrUp = () => {
        isDraggingRef.current = false;
        setIsMouseDown(false);
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current || !reviewTrackRef.current) return;
        e.preventDefault();
        const x = e.pageX - reviewTrackRef.current.offsetLeft;
        const walk = (x - startPosRef.current.x) * 1.5;
        reviewTrackRef.current.scrollLeft = startPosRef.current.scrollLeft - walk;
    };

    // Global drag listener so dragging doesn't stutter or break if mouse leaves review container
    useEffect(() => {
        if (!isMouseDown) return;

        const onGlobalMove = (e) => {
            if (!isDraggingRef.current || !reviewTrackRef.current) return;
            const x = e.pageX - reviewTrackRef.current.offsetLeft;
            const walk = (x - startPosRef.current.x) * 1.5;
            reviewTrackRef.current.scrollLeft = startPosRef.current.scrollLeft - walk;
        };

        const onGlobalUp = () => {
            isDraggingRef.current = false;
            setIsMouseDown(false);
        };

        window.addEventListener('mousemove', onGlobalMove, { passive: true });
        window.addEventListener('mouseup', onGlobalUp);
        return () => {
            window.removeEventListener('mousemove', onGlobalMove);
            window.removeEventListener('mouseup', onGlobalUp);
        };
    }, [isMouseDown]);

    const scrollReviews = (dir) => {
        if (!reviewTrackRef.current) return;
        const amount = dir === 'left' ? -380 : 380;
        reviewTrackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    // Auto scroll when idle
    useEffect(() => {
        if (isMouseDown || isHovered) return;
        const interval = setInterval(() => {
            if (!reviewTrackRef.current) return;
            const el = reviewTrackRef.current;
            if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
                el.scrollLeft = 0;
            } else {
                el.scrollLeft += 1;
            }
        }, 30);
        return () => clearInterval(interval);
    }, [isMouseDown, isHovered]);

    // All available games list
    const allGamesList = useMemo(() => {
        if (dbGames && dbGames.length > 0) {
            return dbGames.map((g) => ({
                name: g.name,
                image: g.image_url || `/store/${g.name}.webp`,
                count: `${g.services || 1} services`,
                slug: gameToSlug(g.name),
            }));
        }
        return [
            { name: 'GTA V', image: '/store/GTA V.webp', count: '18 services', slug: 'gta-5' },
            { name: 'Red Dead 2', image: '/store/rdr2.webp', count: '12 services', slug: 'rdr2' },
            { name: 'Counter-Strike 2', image: '/store/cs2.webp', count: '9 services', slug: 'cs2' },
            { name: 'FC 27 / FIFA', image: '/store/fc27.webp', count: '14 services', slug: 'ea-sports-fc' },
            { name: 'Call of Duty', icon: '🎖️', count: '11 services', slug: 'call-of-duty' },
            { name: 'Rust', icon: '⚡', count: '8 services', slug: 'rust' },
            { name: 'Apex Legends', icon: '🛡️', count: '10 services', slug: 'apex-legends' },
            { name: 'Fortnite', icon: '🏆', count: '15 services', slug: 'fortnite' },
            { name: 'Valorant', icon: '🔥', count: '7 services', slug: 'valorant' },
            { name: 'Rainbow Six', icon: '💣', count: '6 services', slug: 'rainbow-six' },
            { name: 'Overwatch 2', icon: '🌀', count: '5 services', slug: 'overwatch-2' },
            { name: 'Steam Keys', icon: '🔑', count: '25+ offers', slug: 'steam-keys' },
        ];
    }, [dbGames]);

    return (
        <div className="relative w-full bg-zinc-950 text-zinc-100 selection:bg-[#9225CF]/30 selection:text-purple-300">
            {/* ── 1. HERO SECTION WITH DOTGRID CANVAS ── */}
            <section className="relative overflow-hidden border-b border-white/[0.06] bg-zinc-950 pt-16 pb-20 sm:pt-24 sm:pb-28 md:pt-32 md:pb-36">
                {/* DotGrid Canvas Background */}
                <DotGrid
                    dotSize={1.5}
                    gap={28}
                    baseColor="rgba(255, 255, 255, 0.08)"
                    glowColor="rgba(192, 132, 252, 0.45)"
                />

                {/* Soft ambient radial glow */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(146,37,207,0.09),transparent_70%)]"
                />

                <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-6 text-center">
                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                        Dominate Your Favorite Games{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-[#c084fc]">
                            Without The Endless Grind.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed font-light">
                        Safe boosting services, cash injection packages, pre-modded accounts & unlock all.
                        Instant automated fulfillment with 24/7 direct operator support.
                    </p>

                    {/* Explore Store CTA Button */}
                    <div className="mt-9 flex justify-center text-center">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            as="button"
                            onClick={() => router.push('/store')}
                            className="bg-black text-white flex items-center space-x-2.5 px-6 py-3 font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(146,37,207,0.35)] cursor-pointer"
                        >
                            <AceternityLogo />
                            <span>EXPLORE STORE</span>
                        </HoverBorderGradient>
                    </div>
                </div>
            </section>

            {/* ── 2. POPULAR GAMES SECTION ── */}
            <section id="popular-games" className="border-b border-white/[0.06] bg-zinc-950 py-16">
                <div className="mx-auto max-w-7xl px-5 sm:px-6">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
                                FEATURED CATALOG
                            </h2>
                            <p className="mt-1 text-2xl font-bold tracking-tight text-white">Popular Games</p>
                        </div>
                        <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                            Direct Rockstar & Steam Servers
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CURATED_GAMES.map((game) => (
                            <motion.div
                                key={game.name}
                                whileHover={{ y: -3, borderColor: 'rgba(146, 37, 207, 0.4)' }}
                                transition={{ duration: 0.2 }}
                                className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center transition-all hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-black/60"
                            >
                                <Link href={`/store/game/${game.slug}`} className="absolute inset-0 z-20" aria-label={game.name} />

                                <div className="absolute top-3 right-3 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 group-hover:bg-[#9225CF]/15 group-hover:text-purple-300 transition-colors">
                                    {game.tag}
                                </div>

                                <div className="flex h-20 w-32 items-center justify-center">
                                    <img
                                        src={game.image}
                                        alt={game.name}
                                        width={128}
                                        height={80}
                                        loading="lazy"
                                        decoding="async"
                                        className="max-h-full max-w-full object-contain filter drop-shadow transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>

                                <span className="mt-3 text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                    {game.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. BROWSE ALL GAMES (COMPACT GRID) ── */}
            <section id="browse-games" className="border-b border-white/[0.06] bg-zinc-950/60 py-16">
                <div className="mx-auto max-w-7xl px-5 sm:px-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                                EXPLORE EVERYTHING
                            </h2>
                            <p className="mt-1 text-2xl font-bold tracking-tight text-white">Browse All Games</p>
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">
                            {allGamesList.length} Titles Available
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {allGamesList.map((g) => (
                            <Link
                                key={g.name}
                                href={`/store/game/${g.slug || 'gta-5'}`}
                                className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-zinc-900/40 p-2.5 text-left text-zinc-300 hover:border-[#9225CF]/40 hover:bg-zinc-900/80 hover:text-white transition-all duration-150 hover:-translate-y-0.5"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 p-1 border border-white/5">
                                    {g.image ? (
                                        <img
                                            src={g.image}
                                            alt={g.name}
                                            width={36}
                                            height={36}
                                            loading="lazy"
                                            decoding="async"
                                            className="max-h-full max-w-full object-contain filter drop-shadow"
                                        />
                                    ) : (
                                        <span className="text-sm">{g.icon || '🎮'}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold leading-tight">{g.name}</p>
                                    <p className="truncate text-[10px] text-zinc-500 font-mono">{g.count}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. TOP BOOSTING SERVICES (WITH ANIMATED FILTER PILL) ── */}
            <section id="top-services" className="border-b border-white/[0.06] bg-zinc-950 py-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
                                <Fire size={14} weight="fill" />
                                <span>MOST DEMANDED PACKAGES</span>
                            </div>
                            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                                Top Boosting Services
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono">
                            Guaranteed 100% Delivery • Discretion Assured
                        </p>
                    </div>

                    {/* Filter Buttons with Animated LayoutId Pill */}
                    <div className="mb-8 flex flex-wrap items-center gap-2">
                        {filterButtons.map((btn) => {
                            const isActive = serviceFilter === btn.id;
                            return (
                                <motion.button
                                    key={btn.id}
                                    type="button"
                                    onClick={() => setServiceFilter(btn.id)}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative rounded-xl px-4 py-2 text-xs font-semibold tracking-wide cursor-pointer transition-colors duration-200 outline-none select-none border ${
                                        isActive
                                            ? 'text-white border-transparent'
                                            : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:bg-zinc-800 hover:text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="category-filter-pill"
                                            className="absolute inset-0 rounded-xl bg-[#9225CF] shadow-[0_0_20px_rgba(146,37,207,0.35)]"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 260,
                                                damping: 26,
                                                mass: 0.7,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10">{btn.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Service Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedServices.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ y: -2, borderColor: 'rgba(146, 37, 207, 0.4)' }}
                                className="group relative flex items-center gap-3.5 rounded-2xl border border-white/10 bg-zinc-900/70 p-3.5 shadow-lg backdrop-blur-sm transition-all hover:bg-zinc-900 hover:shadow-black/50"
                            >
                                <Link href={item.link || '/store'} className="absolute inset-0 z-20" aria-label={item.title} />

                                {/* Left square thumbnail */}
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        width={64}
                                        height={64}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>

                                {/* Right details */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="truncate text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        <span
                                            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${item.badgeColor}`}
                                        >
                                            {item.badge}
                                        </span>
                                    </div>

                                    <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                                        {item.subtitle}
                                    </p>

                                    <div className="mt-2 flex items-baseline gap-2">
                                        {item.oldPrice && (
                                            <span className="text-[11px] text-zinc-500 line-through font-mono">
                                                {item.oldPrice}
                                            </span>
                                        )}
                                        <span className="text-sm font-extrabold text-white font-mono">
                                            {item.price}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5. HOW IT WORKS (CONNECTING PULSING LINE) ── */}
            <section id="features" className="border-b border-white/[0.06] bg-zinc-950 py-16 relative overflow-hidden">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(146,37,207,0.06),transparent_70%)]"
                />

                <div className="mx-auto max-w-7xl px-5 sm:px-6 relative z-10">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                            <Sparkle size={13} weight="fill" />
                            <span>HOW IT WORKS</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Everything you need to level up
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                            A frictionless, fully encrypted workflow from purchase to delivery.
                        </p>
                    </div>

                    <div className="relative">
                        <HoverEffect
                            items={PROCESS_STEPS}
                            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-0"
                        />
                    </div>
                </div>
            </section>

            {/* ── 6. MOVING REVIEWS (DRAGGABLE HORIZONTAL TRACK) ── */}
            <section id="reviews" className="border-b border-white/[0.06] bg-zinc-950 py-20 overflow-hidden">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 mb-2">
                            <Star size={14} weight="fill" />
                            <span>COMMUNITY FEEDBACK</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">
                            Real Reviews from Real Players
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                            Verified customer feedback moderated from our control room. Drag or click arrows to explore.
                        </p>
                    </div>

                    {/* Navigation Arrows for left/right */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollReviews('left')}
                            aria-label="Scroll reviews left"
                            className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-300 hover:border-[#9225CF]/50 hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                        >
                            <CaretLeft size={18} weight="bold" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollReviews('right')}
                            aria-label="Scroll reviews right"
                            className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-300 hover:border-[#9225CF]/50 hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                        >
                            <CaretRight size={18} weight="bold" />
                        </button>
                    </div>
                </div>

                <div
                    className="relative w-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        handleMouseLeaveOrUp();
                    }}
                >
                    {/* Gradient edge masks */}
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-24 bg-gradient-to-l from-zinc-950 to-transparent" />

                    <div
                        ref={reviewTrackRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseLeaveOrUp}
                        onMouseMove={handleMouseMove}
                        className={`flex gap-4 overflow-x-auto no-scrollbar px-6 sm:px-10 py-2 select-none will-change-scroll ${
                            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {loopReviews.map((r, i) => (
                            <div
                                key={`${r.id || r.author}-${i}`}
                                className="w-[300px] sm:w-[360px] shrink-0 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-[#9225CF]/40 hover:bg-zinc-900/90"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-white truncate max-w-[170px]">{r.author}</p>
                                        <span className="text-[10px] text-purple-400 font-mono font-medium">
                                            ✓ {r.badge}
                                        </span>
                                    </div>
                                    <div className="flex text-amber-400 text-xs">
                                        {Array.from({ length: r.stars }).map((_, si) => (
                                            <Star key={si} size={12} weight="fill" />
                                        ))}
                                    </div>
                                </div>

                                {r.title && (
                                    <h4 className="mt-2.5 text-xs font-bold text-zinc-100 truncate">
                                        {r.title}
                                    </h4>
                                )}

                                <p className="mt-2 text-xs leading-relaxed text-zinc-300 line-clamp-4">
                                    &ldquo;{r.text}&rdquo;
                                </p>

                                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-zinc-500 font-mono">
                                    <span className="text-purple-300/80 truncate max-w-[180px]">{r.game}</span>
                                    <span>{r.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 7. FAQS (COLLAPSIBLE ACCORDION) ── */}
            <section id="faqs" className="border-b border-white/[0.06] bg-zinc-950 py-20">
                <div className="mx-auto max-w-4xl px-5 sm:px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 mb-2">
                            <span>HELP & ANSWERS</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                            Everything you need to know about our safety, delivery, and guarantees.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={faq.q || idx}
                                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                                        isOpen
                                            ? 'border-[#9225CF]/50 bg-zinc-900/90 shadow-[0_0_25px_rgba(146,37,207,0.12)]'
                                            : 'border-white/10 bg-zinc-900/60 hover:border-white/20'
                                    }`}
                                >
                                    <button
                                        id={`faq-btn-${idx}`}
                                        type="button"
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${idx}`}
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-purple-300 transition-colors cursor-pointer"
                                    >
                                        <span className="pr-4">{faq.q}</span>
                                        <CaretDown
                                            size={18}
                                            weight="bold"
                                            className={`shrink-0 transition-transform duration-300 ease-out ${
                                                isOpen ? 'rotate-180 text-purple-400' : 'text-zinc-500'
                                            }`}
                                        />
                                    </button>

                                    <div
                                        id={`faq-answer-${idx}`}
                                        role="region"
                                        aria-labelledby={`faq-btn-${idx}`}
                                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed text-zinc-400 border-t border-white/5">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 8. CLOSING CONVERSION BANNER ── */}
            <section className="bg-zinc-950 py-20">
                <div className="mx-auto max-w-5xl px-5 sm:px-6">
                    <div className="relative overflow-hidden rounded-3xl border border-[#9225CF]/30 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-8 sm:p-12 md:p-16 text-center shadow-2xl">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#9225CF]/15 blur-[80px]"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-600/10 blur-[80px]"
                        />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9225CF]/10 border border-[#9225CF]/25 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                                <span>VERIFIED BOOSTING MARKETPLACE</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
                                Ready to climb the leaderboard?
                            </h2>
                            <p className="mt-4 text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
                                Choose your package, place your order safely, and enjoy instant fulfillment with 24/7 dedicated support.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/store"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#9225CF] px-7 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#a83ff0] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#9225CF]/30"
                                >
                                    <span>Explore Store</span>
                                    <ArrowRight size={16} weight="bold" />
                                </Link>
                                <a
                                    href="https://discord.gg/qwyQjn4Aqx"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <DiscordLogo size={18} weight="fill" className="text-[#5865F2]" />
                                    <span>Join Discord</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { NewStyleLanding };
