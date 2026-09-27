import { NextResponse } from 'next/server';
import { createReview, getReviews } from '../../../lib/reviews';
import { applyCorsHeaders, handleOptions } from '../../../lib/cors';
import { rateLimit } from '../../../lib/rateLimit';
import { getAdminSession } from '../../../lib/guard';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const options = handleOptions(request);
  if (options) return options;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const product_id = searchParams.get('product_id');
  const limit = Number(searchParams.get('limit')) || 50;

  const session = await getAdminSession();
  const isAdmin = Boolean(session);

  let reviews = await getReviews();
  if (!isAdmin) {
    // Public visitors can only view approved reviews
    reviews = reviews.filter((r) => r.status === 'approved');
  } else if (status) {
    reviews = reviews.filter((r) => r.status === status);
  }
  if (product_id) {
    reviews = reviews.filter((r) => r.product_id === product_id);
  }
  reviews = reviews.slice(0, limit);
  return applyCorsHeaders(NextResponse.json(reviews), request);
}

export async function POST(request) {
  const options = handleOptions(request);
  if (options) return options;

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');

  if (!(await rateLimit(`review:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 }))) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      ),
      request,
    );
  }

  const body = await request.json();
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 },
      ),
      request,
    );
  }

  const content = String(body.content || '').trim().slice(0, 1500);
  if (content.length < 5) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Review content must be at least 5 characters (maximum 1500).' },
        { status: 400 },
      ),
      request,
    );
  }

  const productId = String(body.product_id || '').trim().slice(0, 100);
  if (!productId) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      ),
      request,
    );
  }

  const title = String(body.title || '').trim().slice(0, 100);
  const author = String(body.author || '').trim().slice(0, 60) || 'Customer';

  const review = await createReview({
    product_id: productId,
    rating,
    title,
    content,
    author,
    status: 'pending',
  });

  return applyCorsHeaders(
    NextResponse.json(
      { ...review, message: 'Review submitted successfully and pending moderation.' },
      { status: 201 },
    ),
    request,
  );
}
