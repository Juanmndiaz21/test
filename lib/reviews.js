import { promises as fs } from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const DATA_DIR = path.join(process.cwd(), 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

const EXAMPLE_REVIEWS = [
  {
    id: 'review-example-1',
    product_id: 'auriculares-bluetooth',
    rating: 5,
    title: 'Excelente calidad de sonido',
    content:
      'Los audífonos superaron mis expectativas. El bajo es profundo y la batería dura varios días.',
    author: 'Ana Martínez',
    status: 'approved',
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'review-example-2',
    product_id: 'smartwatch-fitpro',
    rating: 4,
    title: 'Muy buen reloj inteligente',
    content:
      'Gran monitorización de actividad y notificaciones. La pantalla se ve muy bien.',
    author: 'Carlos Ruiz',
    status: 'approved',
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'review-example-3',
    product_id: 'teclado-mecanico',
    rating: 5,
    title: 'Ideal para teletrabajo',
    content:
      'Las teclas mecánicas son cómodas y silenciosas. Excelente relación calidad-precio.',
    author: 'Laura Gómez',
    status: 'approved',
    created_at: new Date(0).toISOString(),
  },
];

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

let memoryReviewsCache = null;
let lastMtime = 0;

async function syncDisk(reviews) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    const stat = await fs.stat(REVIEWS_FILE).catch(() => null);
    if (stat) {
      lastMtime = stat.mtimeMs;
    }
  } catch (err) {
    console.error('Failed to sync reviews to disk:', err);
  }
}

export async function getReviews() {
  try {
    const stat = await fs.stat(REVIEWS_FILE).catch(() => null);
    const mtime = stat ? stat.mtimeMs : 0;
    if (memoryReviewsCache && mtime > 0 && mtime <= lastMtime) {
      return memoryReviewsCache;
    }
    lastMtime = mtime;
  } catch {
    // If stat fails, continue to read file
  }

  const raw = await readFileSafe(REVIEWS_FILE);
  if (!raw) {
    memoryReviewsCache = [];
    return memoryReviewsCache;
  }
  try {
    const parsed = JSON.parse(raw);
    memoryReviewsCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    memoryReviewsCache = [];
  }
  return memoryReviewsCache;
}

export async function getApprovedReviews() {
  const reviews = await getReviews();
  return reviews
    .filter((review) => review.status === 'approved')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function createReview(data) {
  const reviews = await getReviews();
  const review = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `review-${Date.now()}`,
    product_id: data.product_id,
    rating: Number(data.rating) || 5,
    title: String(data.title || '').trim(),
    content: String(data.content || '').trim(),
    author: String(data.author || '').trim(),
    status: data.status || 'approved',
    created_at: new Date().toISOString(),
  };
  reviews.push(review);
  memoryReviewsCache = [...reviews];
  await syncDisk(memoryReviewsCache);
  return { ok: true, review };
}

export async function updateReview(id, data) {
  const reviews = await getReviews();
  const index = reviews.findIndex((review) => String(review.id) === String(id));
  if (index === -1) {
    return { ok: false, error: 'Review not found' };
  }
  reviews[index] = {
    ...reviews[index],
    product_id: data.product_id !== undefined ? data.product_id : reviews[index].product_id,
    rating: Number(data.rating) || reviews[index].rating,
    title: data.title !== undefined ? String(data.title).trim() : reviews[index].title,
    content: data.content !== undefined ? String(data.content).trim() : reviews[index].content,
    author: data.author !== undefined ? String(data.author).trim() : reviews[index].author,
    status: data.status !== undefined ? String(data.status).trim() : reviews[index].status,
    updated_at: new Date().toISOString(),
  };
  memoryReviewsCache = [...reviews];
  await syncDisk(memoryReviewsCache);
  return { ok: true, review: reviews[index] };
}

export async function updateReviewStatus(id, status) {
  const reviews = await getReviews();
  const index = reviews.findIndex((review) => review.id === id);
  if (index === -1) {
    return { ok: false, error: 'Reseña no encontrada' };
  }
  reviews[index].status = status;
  memoryReviewsCache = [...reviews];
  await syncDisk(memoryReviewsCache);
  return { ok: true };
}

export async function approveAllReviews() {
  const reviews = await getReviews();
  let changed = false;
  const updated = reviews.map((review) => {
    if (review.status !== 'approved') {
      changed = true;
      return {
        ...review,
        status: 'approved',
        updated_at: new Date().toISOString(),
      };
    }
    return review;
  });

  if (changed) {
    memoryReviewsCache = [...updated];
    await syncDisk(memoryReviewsCache);
  }
  return { ok: true, count: updated.filter((r) => r.status === 'approved').length };
}

export async function deleteReview(id) {
  const reviews = await getReviews();
  const filtered = reviews.filter((review) => review.id !== id);
  if (filtered.length === reviews.length) {
    return { ok: false, error: 'Reseña no encontrada' };
  }
  memoryReviewsCache = [...filtered];
  await syncDisk(memoryReviewsCache);
  return { ok: true };
}

export async function seedReviewsIfEmpty() {
  const reviews = await getReviews();
  if (reviews.length > 0) {
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.inventory, c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;
  if (rows.length === 0) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      REVIEWS_FILE,
      JSON.stringify(EXAMPLE_REVIEWS, null, 2),
      'utf8',
    );
    return;
  }
  const seededReviews = rows.map((row, i) => ({
    id: `existing-${i + 1}`,
    product_id: row.id,
    rating: 4 + (i % 2),
    title: 'Gran título',
    content: `Excelente relación calidad-precio para ${row.name}.`,
    author: 'Cliente verificado',
    status: 'approved',
    created_at: new Date(0).toISOString(),
  }));

  await fs.writeFile(REVIEWS_FILE, JSON.stringify(seededReviews, null, 2), 'utf8');
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    REVIEWS_FILE,
    JSON.stringify(EXAMPLE_REVIEWS, null, 2),
    'utf8',
  );
  revalidatePath('/');
}
