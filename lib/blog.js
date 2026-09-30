import { neon } from '@neondatabase/serverless';

function getSql(providedSql) {
    if (providedSql) return providedSql;
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }
    return neon(process.env.DATABASE_URL);
}

export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function ensureBlogTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            excerpt TEXT,
            content TEXT NOT NULL,
            category VARCHAR(100) NOT NULL DEFAULT 'Guides',
            image_url TEXT,
            is_featured BOOLEAN DEFAULT FALSE,
            published BOOLEAN DEFAULT TRUE,
            author VARCHAR(100) DEFAULT 'OGmodz Specialist',
            read_time VARCHAR(50) DEFAULT '5 min read',
            meta_title VARCHAR(255),
            meta_description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author VARCHAR(100) DEFAULT 'OGmodz Specialist'`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS read_time VARCHAR(50) DEFAULT '5 min read'`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255)`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;

    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON blog_posts (published, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category)`;

    // Seed default articles if table is empty
    await seedDefaultBlogPosts(sql);
}

export async function seedDefaultBlogPosts(sql) {
    const existing = await sql`SELECT COUNT(*)::int as count FROM blog_posts`;
    if (existing[0]?.count > 0) return;

    const initialPosts = [
        {
            title: 'GTA 6 Release Date, Vice City Map & Gameplay Leaks: Everything We Know',
            slug: 'gta-6-release-date-vice-city-map-gameplay-leaks',
            excerpt: 'From Vice City return to next-gen dual protagonists, here is the complete breakdown of verified Rockstar intel, rumors, and what to expect in GTA VI.',
            category: 'GTA 6',
            image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
            is_featured: true,
            published: true,
            author: 'Marcus Vance',
            read_time: '6 min read',
            meta_title: 'GTA 6 Release Date, Map & Gameplay Leaks | OGmodz Blog',
            meta_description: 'Complete breakdown of verified GTA 6 intel, Vice City map details, dual protagonists, and gameplay leaks from Rockstar Games.',
            content: `
# GTA 6: Vice City Reborn and the Next Era of Open-World Gaming

Rockstar Games has officially shifted the gaming world's attention toward Florida's neon-lit horizon. With **Grand Theft Auto VI** slated as one of the most anticipated releases in entertainment history, millions of players are dissecting every trailer frame and leak.

Here is everything confirmed, verified, and analyzed about GTA 6.

---

## 1. The Setting: Leonida & Modern Vice City

GTA VI takes players back to the state of **Leonida**, home to the vice-fueled streets of Vice City and surrounding wetlands, keys, and suburban outskirts. 

Unlike the 1980s nostalgia of original Vice City, GTA 6 is set firmly in the **hyper-modern, social-media obsessed present day**. Expect:
* Dynamic weather systems with tropical storms and hurricanes.
* Unprecedented pedestrian crowd density and NPC memory.
* Deeply detailed interiors—from high-end clubs to gritty back-alley hideouts.

---

## 2. Dual Protagonists: Lucia and Jason

Following GTA V's multi-protagonist innovation, GTA 6 introduces **Lucia and Jason**, a Bonnie-and-Clyde style duo navigating crime, trust, and survival in South Florida.

* **Lucia:** The franchise's first female playable lead in the 3D/HD era, starting her arc entangled with correctional facilities before jumping into major syndicates.
* **Jason:** Tactical, grounded, and skilled in high-intensity heists and tactical coordination.

Seamless character swapping returns with deeper tactical synergies and cooperative heist mechanics.

---

## 3. Economy & Vehicle Customization

Rockstar has revolutionized the in-game economy. Car culture plays a monumental role, inspired by real-world Miami underground racing. Expect extensive visual mods, engine tuning, and custom plate trackers.

> "The fidelity and physics of vehicle handling in GTA 6 reflect years of R&D, blending arcade adrenaline with weight and traction precision."

---

## 4. Preparing for GTA 6: What Happens to GTA 5 Online?

While GTA 6 is on the horizon, **GTA Online** remains the undisputed king of active multiplayer lobbies. Veteran players know that mastering mechanics, building liquid capital, and honing driving reflexes now gives you a decisive competitive edge on launch day.

Need to gear up or build your dream fleet in GTA 5 Online without hundreds of hours of repetitive grinding? OGmodz provides fast, 100% ban-safe **GTA 5 Boosts & Cash Packages** delivered instantly by verified pros.
`
        },
        {
            title: 'CS2 Premier Rating System Explained: How CSR, Elo & Calibration Work',
            slug: 'cs2-premier-rating-system-explained',
            excerpt: 'Understand how CS Rating (CSR) calculations, round differentials, loss streaks, and the 20,000+ rank thresholds operate in Counter-Strike 2.',
            category: 'CS2',
            image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
            is_featured: false,
            published: true,
            author: 'Alex "KRONOS" Diaz',
            read_time: '5 min read',
            meta_title: 'CS2 Premier Rating System & Calibration Guide | OGmodz',
            meta_description: 'Master Counter-Strike 2 Premier mode. Detailed guide on how CSR rating, Elo gain/loss calculations, and Premier ladder calibration work.',
            content: `
# CS2 Premier Rating System: The Definitive Guide to Climbing the Ladder

Counter-Strike 2 discarded the archaic Silver-to-Global Elite nomenclature in favor of **CS Rating (CSR)**—a visible, precise numeric Elo rating that updates match-by-match.

If you are stuck in the 10,000-14,000 rating bracket or trying to break into the purple/pink 15,000+ tiers, this guide breaks down the underlying math.

---

## The Rating Color Tiers

| CS Rating Range | Color Band | Global Percentile Equiv. |
|---|---|---|
| **0 – 4,999** | Grey | Silver 1 - Silver Elite |
| **5,000 – 9,999** | Light Blue | Gold Nova I - Master Guardian |
| **10,000 – 14,999** | Blue / Purple | MGE - Legendary Eagle |
| **15,000 – 19,999** | Violet | Supreme First Master |
| **20,000 – 24,999** | Pink | Global Elite / Level 8 Faceit |
| **25,000 – 29,999** | Red | Top 1% Global Leaderboard |
| **30,000+** | Gold | Semi-Pro & Professional |

---

## How Rating Gain and Loss are Determined

Before match freeze-time concludes, CS2 displays the prospective points:
* **Base Win/Loss:** Typically +100 to +350 for a win, and -100 to -250 for a loss.
* **Streak Multiplier:** Consecutive wins increase your win yield up to +350+ pts per match. Conversely, losing streaks worsen rating deductions.
* **Opponent Team Average:** Beating higher-average rating teams awards significant bonuses.

### Promotion and Relegation Matches
Whenever your rating touches a 5,000 threshold (e.g. 4,999 or 9,999), your next match is a **Promotion Match**. You must win to ascend into the next color tier.

---

## 3 Tips to Elevate Your Solo Queue Winrate

1. **Master Utility on Mirage & Inferno:** Executing smoke line-ups consistently ensures free plant rounds even with uncommunicative teammates.
2. **Prioritize Round Differential:** Rounds won cushion your team MMR calculations even on a narrow loss.
3. **Queue with Verified Teammates:** Solo-queue variance is the #1 killer of win streaks.

*Tired of teammate coin-flips dragging down your hard-earned rating? Partner with our verified Faceit Level 10 boosters at OGmodz for fast, clean Premier Rank Boosting.*
`
        },
        {
            title: 'Top 5 Fastest Money Making Methods in GTA 5 Online (2026 Updated)',
            slug: 'fastest-money-making-methods-gta-5-online',
            excerpt: 'The most profitable solo and co-op money grinds in Los Santos ranked by dollars per hour. Maximize your millions without wasting precious time.',
            category: 'GTA 5',
            image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
            is_featured: false,
            published: true,
            author: 'OGmodz Specialist',
            read_time: '7 min read',
            meta_title: 'Fastest Money Making Methods in GTA Online (2026) | OGmodz',
            meta_description: 'Complete breakdown of the top 5 solo and co-op GTA Online money methods ranked by profit per hour.',
            content: `
# Top 5 Fastest Money Methods in GTA Online

Whether you are saving up for the latest supercar, high-tech weaponized vehicle, or luxury penthouse, acquiring millions in GTA Online requires strategy. 

Here are the highest yield activities ranked by **hourly net profit ($/hr)**.

---

## 1. The Cayo Perico Heist (Solo or Duo)
* **Average Payout:** $1,100,000 – $1,800,000 per run
* **Time Required:** 45 - 60 minutes (including preps)
* **Solo Friendly:** Yes

Even after cooldown adjustments, **Cayo Perico** remains the king of solo cash generation. Utilizing the Kosatka submarine with the Sparrow chopper cuts prep time down to under 35 minutes. Always scout the drainage tunnel and target cocaine or gold for secondary loot bags.

---

## 2. The Cluckin' Bell Farm Raid
* **Average Payout:** $500,000 Flat + First-Time Bonuses
* **Time Required:** 40 - 50 minutes
* **Startup Cost:** $0 (No business purchase required)

Vincent's railway depot heist is the best non-investment starting point for newer or recovering accounts. It requires zero property buy-in and guarantees half a million dollars every single cycle.

---

## 3. Nightclub Passive Production & Warehouse Sales
* **Average Payout:** $800,000 – $1,500,000 per 24h
* **Active Time Required:** 15 minutes sale mission
* **Best Strategy:** South American Imports, Cargo & Shipments, Sporting Goods

Link your Bunker, Cocaine Lockup, Meth Lab, and Cash Factory to the Nightclub basement technicians. Keep popularity topped off with safe collections ($50k every 48 mins) and sell full product loads in private lobbies for guaranteed zero-grief profits.

---

## 4. Acid Lab Remote Runs
* **Average Payout:** $335,000 (Boosted in public lobbies up to $500,000+)
* **Prep Time:** Minimal with Mutt speed boost

The Brickade 6x6 Acid Lab produces valuable shipments rapidly. Calling Mutt via your phone to resupply keeps the machinery turning while you run other contracts.

---

## Skip the 100-Hour Grind
Why spend entire weekends repeating repetitive delivery trucks when you can dive straight into high-stakes fun? Explore **OGmodz GTA Online Cash & Boost packages**—fast delivery, maximum discretion, and 24/7 specialist support.
`
        },
        {
            title: 'Is Game Boosting Safe? Everything You Need to Know About Account Security',
            slug: 'is-game-boosting-safe-account-security-guide',
            excerpt: 'How modern safety protocols, VPN masking, non-intrusive self-play lobbies, and private encryption prevent account bans and preserve your integrity.',
            category: 'Guides',
            image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
            is_featured: false,
            published: true,
            author: 'Security Team',
            read_time: '4 min read',
            meta_title: 'Is Game Boosting Safe? Account Protection & Ban Prevention | OGmodz',
            meta_description: 'Discover how professional boosting services protect your account credentials, use VPN proxying, and guarantee anti-cheat compliance.',
            content: `
# Is Game Boosting Safe? The Truth About Account Protection

When gamers consider boosting services to jump-start their rank or unlock coveted achievements, safety is naturally the number one question: **Will my account be safe from bans or compromised credentials?**

The short answer: **With professional, verified platforms using strict security protocols, boosting is exceptionally safe.** Here is how industry-grade safety mechanisms work behind the scenes.

---

## 1. Self-Play (Duo Queue) vs. Account Sharing

Legitimate boosting services provide two distinct fulfillment modes:

* **Self-Play (Duo/Lobby):** You remain in full control of your account, password, and computer. You join a private lobby with verified high-tier players who carry the squad to victory. Zero risk to your login details.
* **Piloted (Account Play):** When you prefer a specialist to complete tasks on your behalf while you sleep or work.

---

## 2. VPN Geo-Targeting & Hardware Masking

For piloted orders, professional boosters never connect directly from distant international IPs. 

At **OGmodz**, boosters run dedicated VPN connections tailored to your home city or state. To game publishers and anti-cheat watchdogs, session telemetry appears as a normal local session on your familiar ISP node.

---

## 3. Strict Proscription of 3rd Party Injections

Untrusted amateur sellers often rely on illicit memory injectors or unauthorized scripts to speed up games—which leads directly to anti-cheat bans.

True professionals win through **game sense, mechanics, map knowledge, and macro teamwork**. No cheats, no scripts, no memory modification—ever.

---

## The OGmodz Security Guarantee

* **SSL 256-Bit Encrypted Data Transfer**
* **Instant Password Reset Recommendation** upon job completion
* **Full Order Tracking & Direct Support** in our Discord

Play smart, climb faster, and protect your investments with OGmodz.
`
        }
    ];

    for (const post of initialPosts) {
        await sql`
            INSERT INTO blog_posts (
                title, slug, excerpt, content, category, image_url,
                is_featured, published, author, read_time,
                meta_title, meta_description
            ) VALUES (
                ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content},
                ${post.category}, ${post.image_url}, ${post.is_featured},
                ${post.published}, ${post.author}, ${post.read_time},
                ${post.meta_title}, ${post.meta_description}
            )
            ON CONFLICT (slug) DO NOTHING
        `;
    }
}

export async function getBlogPosts(options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    const {
        category,
        search,
        publishedOnly = true,
        limit = 50,
        offset = 0
    } = options;

    let posts;

    if (category && category !== 'All' && search) {
        const pattern = `%${search.trim().toLowerCase()}%`;
        posts = publishedOnly
            ? await sql`
                SELECT * FROM blog_posts 
                WHERE published = true 
                  AND LOWER(category) = LOWER(${category})
                  AND (LOWER(title) LIKE ${pattern} OR LOWER(excerpt) LIKE ${pattern} OR LOWER(content) LIKE ${pattern})
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `
            : await sql`
                SELECT * FROM blog_posts 
                WHERE LOWER(category) = LOWER(${category})
                  AND (LOWER(title) LIKE ${pattern} OR LOWER(excerpt) LIKE ${pattern} OR LOWER(content) LIKE ${pattern})
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `;
    } else if (category && category !== 'All') {
        posts = publishedOnly
            ? await sql`
                SELECT * FROM blog_posts 
                WHERE published = true AND LOWER(category) = LOWER(${category})
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `
            : await sql`
                SELECT * FROM blog_posts 
                WHERE LOWER(category) = LOWER(${category})
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `;
    } else if (search) {
        const pattern = `%${search.trim().toLowerCase()}%`;
        posts = publishedOnly
            ? await sql`
                SELECT * FROM blog_posts 
                WHERE published = true 
                  AND (LOWER(title) LIKE ${pattern} OR LOWER(excerpt) LIKE ${pattern} OR LOWER(content) LIKE ${pattern})
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `
            : await sql`
                SELECT * FROM blog_posts 
                WHERE (LOWER(title) LIKE ${pattern} OR LOWER(excerpt) LIKE ${pattern} OR LOWER(content) LIKE ${pattern})
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `;
    } else {
        posts = publishedOnly
            ? await sql`
                SELECT * FROM blog_posts 
                WHERE published = true 
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `
            : await sql`
                SELECT * FROM blog_posts 
                ORDER BY created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `;
    }

    return posts;
}

export async function getBlogPostBySlug(slug, options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    const posts = await sql`
        SELECT * FROM blog_posts 
        WHERE slug = ${slug}
        LIMIT 1
    `;
    return posts[0] || null;
}

export async function getFeaturedBlogPost(options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    const posts = await sql`
        SELECT * FROM blog_posts 
        WHERE published = true AND is_featured = true 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    if (posts.length > 0) return posts[0];

    // Fallback to latest published
    const fallback = await sql`
        SELECT * FROM blog_posts 
        WHERE published = true 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    return fallback[0] || null;
}

export async function getBlogCategories(options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    const rows = await sql`
        SELECT DISTINCT category 
        FROM blog_posts 
        WHERE published = true 
        ORDER BY category ASC
    `;
    return rows.map((r) => r.category).filter(Boolean);
}

export async function createBlogPost(data, options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    const title = data.title?.trim();
    if (!title) throw new Error('Title is required');

    let slug = (data.slug?.trim() || slugify(title));
    if (!slug) slug = `post-${Date.now()}`;

    // Ensure slug uniqueness
    const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const excerpt = data.excerpt || '';
    const content = data.content || '';
    const category = data.category?.trim() || 'Guides';
    const image_url = data.image_url?.trim() || null;
    const is_featured = Boolean(data.is_featured);
    const published = data.published !== false && data.published !== 'false';
    const author = data.author?.trim() || 'OGmodz Specialist';
    const read_time = data.read_time?.trim() || '5 min read';
    const meta_title = data.meta_title?.trim() || title;
    const meta_description = data.meta_description?.trim() || excerpt;

    // If marked as featured, optionally unfeature other posts
    if (is_featured) {
        await sql`UPDATE blog_posts SET is_featured = false WHERE is_featured = true`;
    }

    const rows = await sql`
        INSERT INTO blog_posts (
            title, slug, excerpt, content, category, image_url,
            is_featured, published, author, read_time,
            meta_title, meta_description
        ) VALUES (
            ${title}, ${slug}, ${excerpt}, ${content}, ${category}, ${image_url},
            ${is_featured}, ${published}, ${author}, ${read_time},
            ${meta_title}, ${meta_description}
        )
        RETURNING *
    `;

    return rows[0];
}

export async function updateBlogPost(id, data, options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    const title = data.title?.trim();
    if (!title) throw new Error('Title is required');

    let slug = data.slug?.trim() || slugify(title);
    // Check if slug taken by someone else
    const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${slug} AND id != ${id} LIMIT 1`;
    if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const excerpt = data.excerpt || '';
    const content = data.content || '';
    const category = data.category?.trim() || 'Guides';
    const image_url = data.image_url?.trim() || null;
    const is_featured = Boolean(data.is_featured);
    const published = data.published !== false && data.published !== 'false';
    const author = data.author?.trim() || 'OGmodz Specialist';
    const read_time = data.read_time?.trim() || '5 min read';
    const meta_title = data.meta_title?.trim() || title;
    const meta_description = data.meta_description?.trim() || excerpt;

    if (is_featured) {
        await sql`UPDATE blog_posts SET is_featured = false WHERE is_featured = true AND id != ${id}`;
    }

    const rows = await sql`
        UPDATE blog_posts
        SET 
            title = ${title},
            slug = ${slug},
            excerpt = ${excerpt},
            content = ${content},
            category = ${category},
            image_url = ${image_url},
            is_featured = ${is_featured},
            published = ${published},
            author = ${author},
            read_time = ${read_time},
            meta_title = ${meta_title},
            meta_description = ${meta_description},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
    `;

    return rows[0];
}

export async function deleteBlogPost(id, options = {}) {
    const sql = getSql(options.sql);
    await ensureBlogTable(sql);

    await sql`DELETE FROM blog_posts WHERE id = ${id}`;
    return true;
}
