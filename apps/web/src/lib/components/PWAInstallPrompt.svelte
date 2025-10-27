<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let deferredPrompt = null;
	let showInstallPrompt = false;
	let isInstallable = false;

	onMount(() => {
		if (!browser) return;

		// Detectar si la app ya está instalada
		const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
		const isInWebAppiOSMode = window.navigator.standalone === true;
		const isInstalled = isInStandaloneMode || isInWebAppiOSMode;

		if (isInstalled) {
			showInstallPrompt = false;
			return;
		}

		// Escuchar el evento beforeinstallprompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			isInstallable = true;

			// Mostrar el prompt después de un pequeño delay
			setTimeout(() => {
				showInstallPrompt = true;
			}, 3000);
		});

		// Escuchar cuando la app se instala
		window.addEventListener('appinstalled', () => {
			showInstallPrompt = false;
			deferredPrompt = null;
			console.log('PWA instalada exitosamente');
		});
	});

	async function handleInstall() {
		if (!deferredPrompt) return;

		showInstallPrompt = false;

		try {
			const result = await deferredPrompt.prompt();
			console.log('Resultado del prompt de instalación:', result.outcome);

			if (result.outcome === 'accepted') {
				console.log('Usuario aceptó instalar la PWA');
			} else {
				console.log('Usuario rechazó instalar la PWA');
			}
		} catch (error) {
			console.error('Error al mostrar el prompt de instalación:', error);
		}

		deferredPrompt = null;
	}

	function dismissPrompt() {
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt && isInstallable}
	<div class="pwa-install-prompt">
		<div class="pwa-prompt-content">
			<div class="pwa-prompt-header">
				<h3>¡Instala Ramo Libre!</h3>
				<button class="pwa-close-btn" on:click={dismissPrompt}>×</button>
			</div>
			<p>Instala la app para acceso rápido y funcionalidad offline.</p>
			<div class="pwa-prompt-actions">
				<button class="pwa-install-btn" on:click={handleInstall}>
					Instalar
				</button>
				<button class="pwa-dismiss-btn" on:click={dismissPrompt}>
					Más tarde
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.pwa-install-prompt {
		position: fixed;
		bottom: 20px;
		left: 20px;
		right: 20px;
		z-index: 1000;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		border: 1px solid #e5e7eb;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.pwa-prompt-content {
		padding: 16px;
	}

	.pwa-prompt-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.pwa-prompt-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.pwa-close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pwa-prompt-content p {
		margin: 0 0 16px 0;
		color: #6b7280;
		font-size: 0.9rem;
	}

	.pwa-prompt-actions {
		display: flex;
		gap: 8px;
	}

	.pwa-install-btn {
		flex: 1;
		background: #2563eb;
		color: white;
		border: none;
		padding: 10px 16px;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.pwa-install-btn:hover {
		background: #1d4ed8;
	}

	.pwa-dismiss-btn {
		flex: 1;
		background: transparent;
		color: #6b7280;
		border: 1px solid #d1d5db;
		padding: 10px 16px;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pwa-dismiss-btn:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	@media (min-width: 640px) {
		.pwa-install-prompt {
			left: auto;
			right: 20px;
			width: 320px;
		}
	}
</style>
