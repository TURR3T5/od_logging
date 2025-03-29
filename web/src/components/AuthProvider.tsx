// src/components/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, getUserPermissionLevel, hasPermission, PermissionLevel } from '../lib/discord';
import { TARGET_SERVER_ID } from '../lib/discord.ts';

interface AuthContextType {
	user: DiscordUser | null;
	session: any;
	isLoading: boolean;
	isAuthorized: boolean;
	permissionLevel: PermissionLevel;
	signInWithDiscord: () => Promise<void>;
	signOut: () => Promise<void>;
	hasPermission: (requiredLevel: PermissionLevel) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	isLoading: true,
	isAuthorized: false,
	permissionLevel: 'none',
	signInWithDiscord: async () => {},
	signOut: async () => {},
	hasPermission: async () => Promise.resolve(false),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<DiscordUser | null>(null);
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('none');

	useEffect(() => {
		try {
			supabase.auth.getSession().then(async ({ data: { session } }) => {
				setSession(session);

				if (session?.user) {
					const discordUser = (session.user.user_metadata as DiscordUser) || null;
					setUser(discordUser);

					// Debug logging for user info
					console.log('==== DISCORD AUTH DEBUG ====');

					// Debug logging for guild info
					if (discordUser?.guilds) {
						console.log('Guild Count:', discordUser.guilds.length);
						console.log(
							'Guilds:',
							discordUser.guilds.map((g) => ({
								id: g.id,
								name: g.name,
								hasRoles: !!g.roles,
								roleCount: g.roles?.length || 0,
							}))
						);

						// Log the specific target guild we're looking for (from your discord.ts file)
						const targetGuild = discordUser.guilds.find(
							(g) => g.id === TARGET_SERVER_ID // Make sure to import TARGET_SERVER_ID from discord.ts
						);

						if (targetGuild) {
							console.log('Target Guild Found:', {
								name: targetGuild.name,
								id: targetGuild.id,
								hasRoles: !!targetGuild.roles,
								roleCount: targetGuild.roles?.length || 0,
								roles: targetGuild.roles?.map((r) => ({
									id: r.id,
									name: r.name,
									position: r.position,
								})),
							});
						} else {
							console.warn('Target Guild NOT FOUND:', TARGET_SERVER_ID);
							console.log(
								'Available guild IDs:',
								discordUser.guilds.map((g) => g.id)
							);
						}
					} else {
						console.warn('No guilds found in Discord user data. Check scopes permissions.');
						console.log('Full user data:', discordUser);
					}

					// Continue with permissions check
					if (discordUser) {
						try {
							const level = await getUserPermissionLevel(discordUser);
							console.log('Permission level:', level);
							setPermissionLevel(level);
							setIsAuthorized(level !== 'none');
						} catch (error) {
							console.error('Error getting user permission level:', error);
							setPermissionLevel('none');
							setIsAuthorized(false);
						}
					}
				} else {
					console.log('No session found or user not logged in');
				}

				setIsLoading(false);
			});

			// Rest of the code remains the same...
		} catch (error) {
			console.error('Error in auth setup:', error);
			setIsLoading(false);
		}
	}, []);

	const signInWithDiscord = async () => {
		try {
			// In your AuthProvider
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'discord',
				options: {
					scopes: 'identify email guilds guilds.members.read',
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});
			if (error) {
				console.error('SignIn error:', error);
				throw error;
			}
		} catch (error) {
			console.error('Error signing in with Discord:', error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			// Clear state after signout
			setUser(null);
			setSession(null);
			setIsAuthorized(false);
			setPermissionLevel('none');
		} catch (error) {
			console.error('Error signing out:', error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				isLoading,
				isAuthorized,
				permissionLevel,
				signInWithDiscord,
				signOut,
				hasPermission: (level) => hasPermission(user, level),
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
