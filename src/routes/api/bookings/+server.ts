import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import {
  durationFor,
  dateTimeLocal,
  addMinutes,
  overlaps,
  WORK_START,
  WORK_END
} from '$lib/server/scheduling';

export async function POST({ request }) {
  const { name, phone, service, date, time, notes } = await request.json();

  if (!name || !phone || !service || !date || !time) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }

  const durationMin = durationFor(service);
  const startAt = dateTimeLocal(date, time);
  const endAt = addMinutes(startAt, durationMin);

  const open = new Date(`${date}T${WORK_START}:00`);
  const close = new Date(`${date}T${WORK_END}:00`);
  if (startAt < open || endAt > close) {
    return json({ error: 'Outside working hours' }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const conflicts = await tx.booking.findMany({
      where: {
        startAt: { lt: endAt },
        endAt: { gt: startAt }
      },
      select: { startAt: true, endAt: true }
    });

    for (const c of conflicts) {
      if (overlaps(startAt, endAt, c.startAt, c.endAt)) return null;
    }

    return tx.booking.create({
      data: {
        name,
        phone,
        service,
        notes: notes ?? null,
        startAt,
        endAt
      }
    });
  });

  if (!created) return json({ error: 'Slot already taken' }, { status: 409 });

  return json({ ok: true, bookingId: created.id });
}
