import {
	CLOUD_STORAGE_KEY,
	type UserProfile,
	type UserProfileResponse,
	type ApiResponse,
} from '@ramo-libre/shared';
import { DefaultStore } from './default';
import { supabase } from '$lib/utils/supabase';
import { type Session, type Provider } from '@supabase/supabase-js';

const DEFAULT_CLOUD: Session | null = null;
const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'https://ramolibre.vercel.app';

class CloudSessionManager extends DefaultStore<Session | null> {
	API_URL: string = API_URL;

	constructor() {
		super(CLOUD_STORAGE_KEY, DEFAULT_CLOUD, true);
		supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				this.set(session);
			}
		});
	}

	private async getToken(): Promise<string | null> {
		const session = await supabase.auth.getSession();
		const token = session.data.session?.access_token;
		if (!token) {
			throw new Error('No active session found');
		}
		return token;
	}

	async signIn(provider: Provider): Promise<void> {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: window.location.origin + '/configuracion',
			},
		});

		if (error) {
			throw new Error(`Sign in failed: ${error.message}`);
		}
	}

	async signOut(): Promise<void> {
		const { error } = await supabase.auth.signOut();

		if (error) {
			throw new Error(`Sign out failed: ${error.message}`);
		}
	}

	async push(profile: UserProfile): Promise<ApiResponse<void>> {
		const token = await this.getToken();
		// POST /api/push/ on API
		const response = await fetch(`${this.API_URL}/api/push/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ profile }),
		});
		if (!response.ok) {
			return { ok: false, error: `Failed to push data: ${response.statusText}` };
		}
		return { ok: true };
	}

	async pull(): Promise<ApiResponse<UserProfileResponse>> {
		const token = await this.getToken();
		// POST /api/pull/ on API
		const response = await fetch(`${this.API_URL}/api/pull/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			return { ok: false, error: `Failed to pull data: ${response.statusText}` };
		}
		return (await response.json()) as ApiResponse<UserProfileResponse>;
	}

	async forget(): Promise<ApiResponse<void>> {
		const token = await this.getToken();
		// POST /api/forget/ on API
		const response = await fetch(`${this.API_URL}/api/forget/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			return { ok: false, error: `Failed to forget data: ${response.statusText}` };
		}
		return { ok: true };
	}
}

export const cloudSession = new CloudSessionManager();
