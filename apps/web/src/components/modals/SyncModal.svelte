<script lang="ts">
    export let isOpen = false;

    function handleBackdropClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('backdrop')) {
            isOpen = false;
        }
    }
</script>
{#if isOpen}
<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop" on:click={handleBackdropClick}>
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center" on:click|stopPropagation>
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Funcionalidad en desarrollo</h2>
        <p class="text-gray-600 mb-6">Esta característica estará disponible próximamente.</p>
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" on:click={() => {
            isOpen = false;
        }}>Cerrar</button>
    </div>
</div>
{/if}
