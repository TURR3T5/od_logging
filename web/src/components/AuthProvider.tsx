import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, getUserPermissionLevel, hasPermission, PermissionLevel } from '../lib/discord';

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
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			setSession(session);

			const discordUser = (session?.user?.user_metadata as DiscordUser) || null;
			setUser(discordUser);

			if (discordUser) {
				console.log('User:', discordUser);

				if (discordUser.guilds) {
					console.log(
						'Discord Servers:',
						discordUser.guilds.map((g) => ({
							id: g.id,
							name: g.name,
							hasRoles: !!g.roles,
						}))
					);

					// Find your target server and log roles
					const targetServer = discordUser.guilds.find((g) => g.id === 'YOUR_DISCORD_SERVER_ID');
					if (targetServer) {
						console.log('Target Server:', targetServer.name);
						console.log(
							'Roles in target server:',
							targetServer.roles?.map((r) => ({
								id: r.id,
								name: r.name,
							}))
						);
					} else {
						console.log("Target server not found in user's guilds");
					}
				} else {
					console.log('No guilds found in Discord user data - check scopes');
				}

				const level = await getUserPermissionLevel(discordUser);
				setPermissionLevel(level);
				setIsAuthorized(level !== 'none');
			}

			setIsLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);

			const discordUser = (session?.user?.user_metadata as DiscordUser) || null;
			setUser(discordUser);

			if (discordUser) {
				const level = await getUserPermissionLevel(discordUser);
				setPermissionLevel(level);
				setIsAuthorized(level !== 'none');
			} else {
				setPermissionLevel('none');
				setIsAuthorized(false);
			}

			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signInWithDiscord = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				scopes: 'identify email guilds guilds.members.read',
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
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
