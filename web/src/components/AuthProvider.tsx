import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, hasPermission, getUserPermissionLevel, PermissionLevel } from '../lib/discord';

interface AuthContextType {
	user: DiscordUser | null;
	session: any;
	isLoading: boolean;
	isAuthorized: boolean;
	permissionLevel: PermissionLevel;
	signInWithDiscord: () => Promise<void>;
	signOut: () => Promise<void>;
	hasPermission: (requiredLevel: PermissionLevel) => boolean;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	isLoading: true,
	isAuthorized: false,
	permissionLevel: 'none',
	signInWithDiscord: async () => {},
	signOut: async () => {},
	hasPermission: () => false,
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

	const checkPermission = (requiredLevel: PermissionLevel): boolean => {
		return hasPermission(user, requiredLevel);
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
