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

					console.log('==== DISCORD AUTH DEBUG ====');

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

						const targetGuild = discordUser.guilds.find((g) => g.id === TARGET_SERVER_ID);

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

			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange(async (event, session) => {
				if (event === 'SIGNED_IN' && session) {
					setSession(session);
					const discordUser = (session.user.user_metadata as DiscordUser) || null;
					setUser(discordUser);

					if (discordUser) {
						try {
							const level = await getUserPermissionLevel(discordUser);
							setPermissionLevel(level);
							setIsAuthorized(level !== 'none');
						} catch (error) {
							console.error('Error getting user permission level:', error);
							setPermissionLevel('none');
							setIsAuthorized(false);
						}
					}
				} else if (event === 'SIGNED_OUT') {
					setSession(null);
					setUser(null);
					setPermissionLevel('none');
					setIsAuthorized(false);
				}
			});

			return () => {
				subscription.unsubscribe();
			};
		} catch (error) {
			console.error('Error in auth setup:', error);
			setIsLoading(false);
		}
	}, []);

	const signInWithDiscord = async () => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
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
