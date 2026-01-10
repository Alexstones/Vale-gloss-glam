import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import {
  buildTimeSlots,
  dateTimeLocal,
  durationFor,
  addMinutes,
  overlaps,
  WORK_END
} from '$lib/server/scheduling';

export async function GET({ url }) {
  const date = url.searchParams.get('date'); // YYYY-MM-DD
  const service = url.searchParams.get('service') ?? 'social';
  if (!date) return json({ error: 'Missing date' }, { status: 400 });

  const durationMin = durationFor(service);
  const times = buildTimeSlots();

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const bookings = await prisma.booking.findMany({
    where: {
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart }
    },
    select: { startAt: true, endAt: true }
  });

  const endLimit = new Date(`${date}T${WORK_END}:00`);

  const available = times.filter((time) => {
    const startAt = dateTimeLocal(date, time);
    const endAt = addMinutes(startAt, durationMin);

    if (endAt > endLimit) return false;

    for (const b of bookings) {
      if (overlaps(startAt, endAt, b.startAt, b.endAt)) return false;
    }
    return true;
  });

  return json({ date, service, durationMin, available });
}
