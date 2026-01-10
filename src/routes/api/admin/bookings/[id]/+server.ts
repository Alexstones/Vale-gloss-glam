import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function DELETE({ params, url }) {
  const key = url.searchParams.get('key');
  if (!key || key !== process.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.booking.delete({ where: { id: params.id } });
  return json({ ok: true });
}
