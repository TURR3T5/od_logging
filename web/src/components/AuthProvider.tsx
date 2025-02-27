import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, hasPermission } from '../lib/discord';

interface AuthContextType {
	user: DiscordUser | null;
	session: any;
	isLoading: boolean;
	isAuthorized: boolean;
	signInWithDiscord: () => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	isLoading: true,
	isAuthorized: false,
	signInWithDiscord: async () => {},
	signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<DiscordUser | null>(null);
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);

			const discordUser = (session?.user?.user_metadata as DiscordUser) || null;
			setUser(discordUser);
			setIsAuthorized(hasPermission(discordUser));
			setIsLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);

			const discordUser = (session?.user?.user_metadata as DiscordUser) || null;
			setUser(discordUser);
			setIsAuthorized(hasPermission(discordUser));
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
				signInWithDiscord,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
