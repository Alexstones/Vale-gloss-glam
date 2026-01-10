export const WORK_START = '10:00';
export const WORK_END = '19:00';
export const STEP_MIN = 30;

export const DURATION_MIN: Record<string, number> = {
  social: 90,
  novia: 150,
  evento: 120
};

export function durationFor(service: string) {
  return DURATION_MIN[service] ?? 90;
}

export function dateTimeLocal(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export function addMinutes(d: Date, min: number) {
  return new Date(d.getTime() + min * 60_000);
}

export function buildTimeSlots() {
  const [sh, sm] = WORK_START.split(':').map(Number);
  const [eh, em] = WORK_END.split(':').map(Number);

  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  const slots: string[] = [];
  for (let t = start; t < end; t += STEP_MIN) {
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
