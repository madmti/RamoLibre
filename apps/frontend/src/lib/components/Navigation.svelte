<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let currentTime = new Date();
  let timeInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    // Actualizar la hora cada segundo
    timeInterval = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => {
      if (timeInterval) clearInterval(timeInterval);
    };
  });

  // Formatear la fecha
  $: formattedDate = currentTime.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Formatear la hora
  $: formattedTime = currentTime.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const navItems = [
    { href: "/", label: "Inicio", icon: "🏠" },
    { href: "/horario", label: "Horario", icon: "📅" },
    { href: "/notas", label: "Notas", icon: "📊" },
    { href: "/eventos", label: "Eventos", icon: "🎯" },
    { href: "/gestion", label: "Gestión", icon: "📚" },
    { href: "/configuracion", label: "Configuración", icon: "⚙️" },
  ];
</script>

<nav
  class="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo y título -->
      <div class="flex items-center space-x-3">
        <span class="text-2xl">🎓</span>
        <h1 class="text-xl font-bold text-gray-800">Ramo Libre</h1>
      </div>

      <!-- Navegación principal -->
      <div class="hidden md:flex items-center space-x-1">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 {$page
              .url.pathname === item.href
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900'}"
          >
            <span class="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </div>

      <!-- Hora y fecha -->
      <div class="text-right">
        <div class="text-sm font-medium text-gray-800">{formattedTime}</div>
        <div class="text-xs text-gray-500 capitalize">{formattedDate}</div>
      </div>
    </div>

    <!-- Navegación móvil -->
    <div class="md:hidden pb-3">
      <div class="flex space-x-1 overflow-x-auto">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all hover:bg-gray-100 {$page
              .url.pathname === item.href
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600'}"
          >
            <span class="text-lg mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </div>
    </div>
  </div>
</nav>
