import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, /* getUserPermissionLevel, */ hasPermission, PermissionLevel } from '../lib/discord';
/* import { TARGET_SERVER_ID } from '../lib/discord.ts'; */

interface AuthContextType {
	user: DiscordUser | null;
	session: any;
	isLoading: boolean;
	isAuthorized: boolean;
	permissionLevel: PermissionLevel;
	/* signInWithDiscord: () => Promise<void>; */
	signUpWithEmail: (email: string, password: string) => Promise<any>;
	signInWithEmail: (email: string, password: string) => Promise<any>;
	signOut: () => Promise<void>;
	hasPermission: (requiredLevel: PermissionLevel) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	isLoading: true,
	isAuthorized: false,
	permissionLevel: 'none',
	/* signInWithDiscord: async () => {}, */
	signUpWithEmail: async () => Promise.resolve(null),
	signInWithEmail: async () => Promise.resolve(null),
	signOut: async () => {},
	hasPermission: async () => Promise.resolve(false),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<DiscordUser | null>(null);
	const [_userRole, setUserRole] = useState('');
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('none');

	/* useEffect(() => {
		try {
			supabase.auth.getSession().then(async ({ data: { session } }) => {
				setSession(session);

				if (session?.user) {
					const discordUser = (session.user.user_metadata as DiscordUser) || null;
					setUser(discordUser);

					console.log('==== DISCORD AUTH DEBUG ====');

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
	}, []); */

	/* const signInWithDiscord = async () => {
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
	}; */

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
			setUser(session?.user || null);

			if (session?.user?.email) {
				try {
					// Fetch the user's role by email
					const { data: roleData } = await supabase.from('user_roles_email').select('role').eq('email', session.user.email).single();

					if (roleData) {
						setPermissionLevel(roleData.role as PermissionLevel);
						setIsAuthorized(roleData.role !== 'none');
					}
				} catch (error) {
					console.error('Error getting user permission level by email:', error);
				}
			}

			setIsLoading(false);
		});

		checkUser();

		return () => {
			data.subscription.unsubscribe();
		};
	}, []);

	async function checkUser() {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		setUser(session?.user || null);

		if (session?.user?.email) {
			const { data: roleData } = await supabase.from('user_roles_email').select('role').eq('email', session.user.email).single();

			setUserRole(roleData?.role || 'viewer');
		}

		setIsLoading(false);
	}

	// Function to handle user signup
	const signUpWithEmail = async (email: string, password: string) => {
		try {
			// First, check if this email has a pre-assigned role
			const { data: roleData } = await supabase.from('user_roles_email').select('role').eq('email', email).single();

			// Sign up the user
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) throw error;

			// If no pre-assigned role was found, assign default 'viewer' role
			if (!roleData) {
				const { error: insertError } = await supabase.from('user_roles_email').insert({ email, role: 'viewer' });

				if (insertError) console.error('Error assigning default role:', insertError);
			}

			return data;
		} catch (error) {
			console.error('Error signing up:', error);
			throw error;
		}
	};

	// Sign in
	const signInWithEmail = async (email: string, password: string) => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Error signing in:', error);
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
				signInWithEmail,
				signUpWithEmail,
				/* signInWithDiscord, */
				signOut,
				hasPermission: (level) => hasPermission(user, level),
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
