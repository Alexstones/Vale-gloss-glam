<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_WA_NUMBER } from '$env/static/public';

  let date = new Date().toISOString().slice(0, 10);
  let service = 'social';

  let slots: string[] = [];
  let selectedTime = '';

  let name = '';
  let phone = '';
  let notes = '';

  let loading = false;
  let error = '';
  let success = '';

  async function loadAvailability() {
    loading = true;
    error = '';
    success = '';
    selectedTime = '';

    const res = await fetch(`/api/availability?date=${date}&service=${service}`);
    const data = await res.json();

    loading = false;

    if (!res.ok) {
      error = data.error ?? 'Error cargando disponibilidad';
      slots = [];
      return;
    }

    slots = data.available ?? [];
  }

  async function book() {
    error = '';
    success = '';

    if (!selectedTime) {
      error = 'Selecciona un horario.';
      return;
    }
    if (!name || !phone) {
      error = 'Completa nombre y WhatsApp.';
      return;
    }

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        service,
        date,
        time: selectedTime,
        notes
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error = data.error ?? 'No se pudo apartar la cita';
      return;
    }

    success = '✅ Cita apartada. Pago en efectivo el día del servicio.';

    // Abrir WhatsApp con mensaje (si está configurado PUBLIC_WA_NUMBER)
    if (PUBLIC_WA_NUMBER) {
      const text = encodeURIComponent(
        `Hola! Soy ${name}. Acabo de apartar cita:\n` +
          `Fecha: ${date}\n` +
          `Hora: ${selectedTime}\n` +
          `Servicio: ${service}\n` +
          (notes ? `Notas: ${notes}\n` : '') +
          `\nPago en efectivo. ¡Gracias!`
      );
      window.open(`https://wa.me/${PUBLIC_WA_NUMBER}?text=${text}`, '_blank');
    }

    // refrescar horarios para que ya no aparezca disponible
    await loadAvailability();
  }

  // ✅ Solo en cliente (evita SSR crash)
  onMount(() => {
    loadAvailability();
  });

  // ✅ Recargar cuando cambie fecha/servicio (solo en cliente)
  let mounted = false;
  onMount(() => {
    mounted = true;
  });

  $: if (mounted) {
    // cuando cambie date o service, recarga
    date, service;
    loadAvailability();
  }
</script>

<h2 class="text-3xl font-bold mb-8">Reserva tu cita 💄</h2>

<div class="grid gap-10 md:grid-cols-2">
  <div class="space-y-6">
    <div>
      <label for="service" class="block text-sm mb-2 text-neutral-400">Servicio</label>
      <select
        id="service"
        bind:value={service}
        class="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3"
      >
        <option value="social">Maquillaje social (90 min)</option>
        <option value="novia">Novia (150 min)</option>
        <option value="evento">Evento (120 min)</option>
      </select>
    </div>

    <div>
      <label for="date" class="block text-sm mb-2 text-neutral-400">Fecha</label>
      <input
        id="date"
        type="date"
        bind:value={date}
        class="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3"
      />
    </div>

    <div class="rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-neutral-400">
      Horario fijo: <span class="text-neutral-200">10:00 – 19:00</span><br />
      Pago: <span class="text-neutral-200">efectivo</span>
    </div>
  </div>

  <div>
    <h3 class="text-lg font-semibold mb-4">Horarios disponibles</h3>

    {#if loading}
      <p class="text-neutral-400">Cargando…</p>
    {:else if error}
      <p class="text-red-400">{error}</p>
    {:else if slots.length === 0}
      <p class="text-neutral-400">No hay espacios disponibles este día.</p>
    {:else}
      <div class="grid grid-cols-3 gap-3">
        {#each slots as time}
          <button
            type="button"
            on:click={() => (selectedTime = time)}
            class="rounded-xl border px-4 py-3 text-sm font-medium transition
            {selectedTime === time
              ? 'bg-pink-500 text-black border-pink-500'
              : 'bg-neutral-900 border-white/10 hover:border-pink-400'}"
          >
            {time}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

{#if selectedTime}
  <div class="mt-12 rounded-3xl border border-white/10 bg-neutral-900 p-8">
    <h3 class="text-xl font-bold mb-2">Confirmar cita</h3>
    <p class="text-sm text-neutral-400 mb-6">
      {date} · {selectedTime} · <span class="capitalize">{service}</span>
    </p>

    {#if success}
      <p class="mb-4 text-emerald-400 font-semibold">{success}</p>
    {/if}
    {#if error}
      <p class="mb-4 text-red-400 font-semibold">{error}</p>
    {/if}

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="name" class="block text-sm text-neutral-400">Nombre</label>
        <input
          id="name"
          bind:value={name}
          placeholder="Tu nombre"
          class="mt-2 w-full rounded-xl bg-black px-4 py-3 border border-white/10"
        />
      </div>

      <div>
        <label for="phone" class="block text-sm text-neutral-400">WhatsApp</label>
        <input
          id="phone"
          bind:value={phone}
          placeholder="Ej. 6141234567"
          class="mt-2 w-full rounded-xl bg-black px-4 py-3 border border-white/10"
        />
      </div>
    </div>

    <div class="mt-4">
      <label for="notes" class="block text-sm text-neutral-400">Notas (opcional)</label>
      <textarea
        id="notes"
        bind:value={notes}
        class="mt-2 w-full rounded-xl bg-black px-4 py-3 border border-white/10"
        placeholder="Dirección, referencias, etc."
      ></textarea>
    </div>

    <button
      type="button"
      on:click={book}
      disabled={!name || !phone}
      class="mt-6 rounded-2xl px-8 py-4 font-semibold transition
      {(!name || !phone)
        ? 'bg-white/10 text-neutral-500 cursor-not-allowed'
        : 'bg-pink-500 text-black hover:bg-pink-400'}"
    >
      Apartar cita
    </button>
  </div>
{/if}
