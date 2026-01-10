import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ url }) {
  const key = url.searchParams.get('key');
  const date = url.searchParams.get('date'); // YYYY-MM-DD

  if (!key || key !== process.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!date) return json({ error: 'Missing date' }, { status: 400 });

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const bookings = await prisma.booking.findMany({
    where: { startAt: { gte: dayStart, lte: dayEnd } },
    orderBy: { startAt: 'asc' }
  });

  return json({ date, bookings });
}

