<script lang="ts">
  let date = new Date().toISOString().slice(0, 10);
  let key = '';
  let bookings: any[] = [];
  let loading = false;
  let error = '';

  async function load() {
    loading = true;
    error = '';
    bookings = [];

    const res = await fetch(`/api/admin/bookings?date=${date}&key=${encodeURIComponent(key)}`);
    const data = await res.json();
    loading = false;

    if (!res.ok) {
      error = data.error ?? 'Error';
      return;
    }
    bookings = data.bookings ?? [];
  }

  async function cancel(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}?key=${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? 'Error cancelando');
      return;
    }
    await load();
  }

  function hhmm(d: string) {
    return new Date(d).toISOString().slice(11, 16);
  }
</script>

<h2 class="text-3xl font-bold mb-8">Admin · Citas</h2>

<div class="grid gap-4 max-w-2xl">
  <div class="grid sm:grid-cols-2 gap-4">
    <label class="block">
      <span class="text-sm text-neutral-400">Fecha</span>
      <input type="date" bind:value={date}
        class="mt-2 w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3" />
    </label>

    <label class="block">
      <span class="text-sm text-neutral-400">Clave</span>
      <input type="password" bind:value={key} placeholder="ADMIN_KEY"
        class="mt-2 w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3" />
    </label>
  </div>

  <button on:click={load}
    class="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-black hover:bg-pink-400 transition">
    Ver citas
  </button>

  {#if loading}
    <p class="text-neutral-400">Cargando…</p>
  {:else if error}
    <p class="text-red-400">{error}</p>
  {:else if bookings.length === 0}
    <p class="text-neutral-400">No hay citas.</p>
  {:else}
    <div class="space-y-3">
      {#each bookings as b}
        <div class="rounded-2xl border border-white/10 bg-neutral-900 p-4 flex items-start justify-between gap-4">
          <div>
            <div class="font-semibold">{b.name} · {b.phone}</div>
            <div class="text-sm text-neutral-400">
              {new Date(b.startAt).toLocaleString()} — {new Date(b.endAt).toLocaleTimeString()}
            </div>
            <div class="text-sm text-neutral-300 mt-1 capitalize">{b.service}</div>
            {#if b.notes}
              <div class="text-sm text-neutral-500 mt-1">{b.notes}</div>
            {/if}
          </div>

          <button on:click={() => cancel(b.id)}
            class="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-red-500 hover:text-black transition">
            Cancelar
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
