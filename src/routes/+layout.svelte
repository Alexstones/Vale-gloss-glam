<script lang="ts">
  import '../app.css';
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
  <!-- Navbar -->
  <header class="border-b border-white/10">
    <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold tracking-wide text-pink-500">
        Vale Gloss Glam
      </h1>

      <nav class="hidden sm:flex gap-6 text-sm text-neutral-300">
        <a href="/" class="hover:text-pink-400">Inicio</a>
        <a href="/reservar" class="hover:text-pink-400">Reservar</a>
      </nav>
    </div>
  </header>

  <!-- Page -->
  <main class="mx-auto max-w-6xl px-6 py-12">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="border-t border-white/10 mt-20">
    <div class="mx-auto max-w-6xl px-6 py-6 text-sm text-neutral-500">
      © {new Date().getFullYear()} Vale Gloss Glam · Makeup Artist
    </div>
  </footer>
</div>
