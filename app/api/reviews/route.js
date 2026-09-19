import { NextResponse } from 'next/server';
import { createReview, getReviews } from '../../../lib/reviews';
import { applyCorsHeaders, handleOptions } from '../../../lib/cors';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const options = handleOptions(request);
  if (options) return options;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const product_id = searchParams.get('product_id');
  const limit = Number(searchParams.get('limit')) || 50;

  let reviews = await getReviews();
  if (status) {
    reviews = reviews.filter((r) => r.status === status);
  }
  if (product_id) {
    reviews = reviews.filter((r) => r.product_id === product_id);
  }
  reviews = reviews.slice(0, limit);
  return applyCorsHeaders(NextResponse.json(reviews));
}

export async function POST(request) {
  const options = handleOptions(request);
  if (options) return options;

  const body = await request.json();
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'La valoración debe ser un número entre 1 y 5' },
        { status: 400 },
      ),
    );
  }
  const content = String(body.content || '').trim();
  if (!content) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'El contenido de la reseña es obligatorio' },
        { status: 400 },
      ),
    );
  }
  if (!body.product_id) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'El ID del producto es obligatorio' },
        { status: 400 },
      ),
    );
  }

  const review = await createReview({
    product_id: String(body.product_id),
    rating,
    title: String(body.title || '').trim(),
    content,
    author: String(body.author || '').trim(),
  });

  return applyCorsHeaders(NextResponse.json(review, { status: 201 }));
}
