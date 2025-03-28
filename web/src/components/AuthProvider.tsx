import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, getUserPermissionLevel, PermissionLevel } from '../lib/discord';

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
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);

			const discordUser = (session?.user?.user_metadata as DiscordUser) || null;
			setUser(discordUser);

			const level = getUserPermissionLevel(discordUser);
			setPermissionLevel(level);

			setIsAuthorized(level !== 'none');
			setIsLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);

			const discordUser = (session?.user?.user_metadata as DiscordUser) || null;
			setUser(discordUser);

			const level = getUserPermissionLevel(discordUser);
			setPermissionLevel(level);

			setIsAuthorized(level !== 'none');
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

	const checkPermission = async (requiredLevel: PermissionLevel): Promise<boolean> => {
		if (!user) return false;

		const discordId = user.provider_id || user.sub || (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));

		if (!discordId) return false;

		const { data, error } = await supabase.from('user_permissions').select('permission_level').eq('user_id', discordId).single();

		if (error || !data) return false;

		const permissionLevels = {
			admin: 100,
			staff: 75,
			content: 50,
			viewer: 25,
			none: 0,
		};

		const userLevel = data.permission_level as keyof typeof permissionLevels;
		const requiredPriority = permissionLevels[requiredLevel] || 0;
		const userPriority = permissionLevels[userLevel] || 0;

		return userPriority >= requiredPriority;
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
				hasPermission: checkPermission,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
