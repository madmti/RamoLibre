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
    { href: "/", label: "Inicio", icon: "🏠", description: "Página principal de Ramo Libre" },
    { href: "/horario", label: "Horario", icon: "📅", description: "Gestión de horarios académicos" },
    { href: "/notas", label: "Notas", icon: "📊", description: "Seguimiento de calificaciones" },
    { href: "/eventos", label: "Eventos", icon: "🎯", description: "Eventos y fechas académicas" },
    { href: "/gestion", label: "Gestión", icon: "📚", description: "Gestión académica avanzada" },
    { href: "/configuracion", label: "Configuración", icon: "⚙️", description: "Configuración de la aplicación" },
  ];
</script>

<nav
  class="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50"
  aria-label="Navegación principal"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo y título -->
      <div class="flex items-center space-x-3">
        <span class="text-2xl" role="img" aria-label="Graduación">🎓</span>
        <h1 class="text-xl font-bold text-gray-800">
          <a href="/" class="hover:text-blue-600 transition-colors">Ramo Libre</a>
        </h1>
      </div>

      <!-- Navegación principal -->
      <div class="hidden md:flex items-center space-x-1" role="menubar">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 {$page
              .url.pathname === item.href
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900'}"
            role="menuitem"
            aria-label={item.description}
            aria-current={$page.url.pathname === item.href ? 'page' : undefined}
          >
            <span class="text-lg" role="img" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </div>

      <!-- Hora y fecha -->
      <div class="text-right" aria-live="polite">
        <time class="text-sm font-medium text-gray-800" datetime={currentTime.toISOString()}>
          {formattedTime}
        </time>
        <div class="text-xs text-gray-500 capitalize">{formattedDate}</div>
      </div>
    </div>

    <!-- Navegación móvil -->
    <div class="md:hidden pb-3">
      <div class="flex space-x-1 overflow-x-auto" role="tablist" aria-label="Navegación móvil">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all hover:bg-gray-100 {$page
              .url.pathname === item.href
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600'}"
            role="tab"
            aria-label={item.description}
            aria-selected={$page.url.pathname === item.href}
          >
            <span class="text-lg mb-1" role="img" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </div>
    </div>
  </div>
</nav>
