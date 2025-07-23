import { supabase } from '../../utils/supabase';
import { type DatabaseAdapter } from '@ramo-libre/database';
import { type UserProfile } from '@ramo-libre/shared';

export function createSupabaseAdapter(): DatabaseAdapter {
	return {
		async push(profile: UserProfile, authId: string): Promise<void> {
			const { error: upsertError } = await supabase.from('user_profiles').upsert({
				id: profile.user.id,
				data: profile,
				updated_at: new Date().toISOString(),
			});

			if (upsertError)
				throw new Error(`Failed to upsert user profile: ${upsertError.message}`);

			const { error: linkError } = await supabase.from('auth_links').upsert({
				auth_id: authId,
				user_id: profile.user.id,
			});

			if (linkError)
				throw new Error(`Failed to link auth ID to user profile: ${linkError.message}`);
		},

		async pull(authId: string): Promise<UserProfile | null> {
			const { data: link, error: linkError } = await supabase
				.from('auth_links')
				.select('user_id')
				.eq('auth_id', authId)
				.maybeSingle();

			if (linkError) throw new Error(`Failed to retrieve user link: ${linkError.message}`);
			if (!link) return null;

			const { data: profile, error: profileError } = await supabase
				.from('user_profiles')
				.select('data')
				.eq('id', link.user_id)
				.maybeSingle();

			if (profileError)
				throw new Error(`Failed to retrieve user profile: ${profileError.message}`);
			return profile ? (profile.data as UserProfile) : null;
		},

		async delete(authId: string): Promise<void> {
			const { error } = await supabase
				.from('auth_links')
				.select('user_id')
				.eq('auth_id', authId)
				.single()
				.then(({ data }) => data?.user_id)
				.then((userId) => {
					if (!userId) throw new Error('User not found');
					return supabase.from('user_profiles').delete().eq('id', userId);
				});

			if (error) throw new Error(`Failed to delete user profile: ${error.message}`);
		},
	};
}
