import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DiscordUser, /* getUserPermissionLevel, */ hasPermission, PermissionLevel } from '../lib/discord';
/* import { TARGET_SERVER_ID } from '../lib/discord.ts'; */

interface AuthContextType {
	user: any;
	session: any;
	isLoading: boolean;
	isAuthorized: boolean;
	permissionLevel: PermissionLevel;
	signInWithDiscord: () => Promise<void>; // Keeping Discord method, but will be commented in implementation
	signUpWithEmail: (email: string, password: string) => Promise<any>;
	signInWithEmail: (email: string, password: string) => Promise<any>;
	signOut: () => Promise<void>;
	hasPermission: (requiredLevel: PermissionLevel) => Promise<boolean>;
	debugInfo: string;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	isLoading: true,
	isAuthorized: false,
	permissionLevel: 'none',
	signInWithDiscord: async () => {},
	signUpWithEmail: async () => Promise.resolve(null),
	signInWithEmail: async () => Promise.resolve(null),
	signOut: async () => {},
	hasPermission: async () => Promise.resolve(false),
	debugInfo: '',
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<any>(null);
	const [userRole, setUserRole] = useState('');
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('none');
	const [debugInfo, setDebugInfo] = useState<string>('');

	/* Discord auth useEffect - commented out but preserved
  useEffect(() => {
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

	// Email auth useEffect
	useEffect(() => {
		let mounted = true;

		// Set a timeout to prevent infinite loading
		const loadingTimeout = setTimeout(() => {
			if (mounted && isLoading) {
				console.log('Loading timeout reached - forcing state update');
				setIsLoading(false);
			}
		}, 5000); // 5 second timeout as a fallback

		const checkInitialSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (!mounted) return;

				if (session?.user) {
					setSession(session);
					setUser(session.user);

					let debugLog = `Email from session: ${session.user.email}\n`;

					if (session.user.email) {
						try {
							// Use lowercase to ensure case-insensitive email comparison
							const userEmail = session.user.email.toLowerCase();
							debugLog += `Looking for role with email: ${userEmail}\n`;

							// First check if the table exists
							try {
								// Fetch the user's role by email (case-insensitive)
								const { data: roleData, error } = await supabase.from('user_roles_email').select('role').eq('email', userEmail).single();

								if (error) {
									debugLog += `Error fetching role: ${error.message}\n`;

									// Handle table not found or other errors
									debugLog += `Setting admin role for emergency access\n`;
									// For the specific user, grant admin privileges
									if (userEmail === 'casper.truberg@outlook.dk') {
										debugLog += `Emergency admin access granted for ${userEmail}\n`;
										setPermissionLevel('admin');
										setIsAuthorized(true);
										setUserRole('admin');
									} else {
										debugLog += `No role found and table may not exist. Using default: viewer\n`;
										setPermissionLevel('viewer');
										setIsAuthorized(true);
										setUserRole('viewer');
									}
								} else {
									if (roleData) {
										debugLog += `Found role: ${roleData.role}\n`;
										setPermissionLevel(roleData.role as PermissionLevel);
										setIsAuthorized(roleData.role !== 'none');
										setUserRole(roleData.role);
									} else {
										// Hardcoded admin for specific email as fallback
										if (userEmail === 'casper.truberg@outlook.dk') {
											debugLog += `Admin role set for ${userEmail}\n`;
											setPermissionLevel('admin');
											setIsAuthorized(true);
											setUserRole('admin');
										} else {
											debugLog += `No role found for this email. Using default: viewer\n`;
											// Default to viewer if no specific role is set
											setPermissionLevel('viewer');
											setIsAuthorized(true);
											setUserRole('viewer');
										}
									}
								}
							} catch (error) {
								const errorMessage = error instanceof Error ? error.message : String(error);
								debugLog += `Error getting user permission level: ${errorMessage}\n`;
								console.error('Error getting user permission level by email:', error);

								// Emergency fallback for specific email
								if (userEmail === 'casper.truberg@outlook.dk') {
									debugLog += `Emergency admin access granted after error for ${userEmail}\n`;
									setPermissionLevel('admin');
									setIsAuthorized(true);
									setUserRole('admin');
								} else {
									setPermissionLevel('viewer'); // Default fallback
									setIsAuthorized(true);
								}
							}
						} catch (error) {
							const errorMessage = error instanceof Error ? error.message : String(error);
							debugLog += `Error in user email processing: ${errorMessage}\n`;
							console.error('Error processing user email:', error);

							// Emergency fallback for specific email
							if (session.user.email.toLowerCase() === 'casper.truberg@outlook.dk') {
								setPermissionLevel('admin');
								setIsAuthorized(true);
								setUserRole('admin');
							} else {
								setPermissionLevel('viewer'); // Default fallback
								setIsAuthorized(true);
							}
						}
					}

					setDebugInfo(debugLog);
				}
			} catch (error) {
				console.error('Session check error:', error);
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		checkInitialSession();

		const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('Auth state change:', event);

			if (event === 'SIGNED_IN' && session) {
				setSession(session);
				setUser(session.user);

				let debugLog = `Auth state change: ${event}\n`;
				debugLog += `Email from session: ${session.user.email}\n`;

				if (session.user.email) {
					try {
						// Use lowercase to ensure case-insensitive email comparison
						const userEmail = session.user.email.toLowerCase();
						debugLog += `Looking for role with email: ${userEmail}\n`;

						// Fetch the user's role by email (case-insensitive)
						try {
							const { data: roleData, error } = await supabase.from('user_roles_email').select('role').eq('email', userEmail).single();

							if (error) {
								debugLog += `Error fetching role: ${error.message}\n`;

								// Emergency override for specific email
								if (userEmail === 'casper.truberg@outlook.dk') {
									debugLog += `Emergency admin access granted for ${userEmail}\n`;
									setPermissionLevel('admin');
									setIsAuthorized(true);
									setUserRole('admin');
								} else {
									debugLog += `No role found, defaulting to: viewer\n`;
									setPermissionLevel('viewer');
									setIsAuthorized(true);
									setUserRole('viewer');
								}
							} else {
								debugLog += `Result of role query: ${JSON.stringify(roleData)}\n`;

								if (roleData) {
									debugLog += `Setting permission level to: ${roleData.role}\n`;
									setPermissionLevel(roleData.role as PermissionLevel);
									setIsAuthorized(roleData.role !== 'none');
									setUserRole(roleData.role);
								} else {
									// Hardcoded admin for specific email
									if (userEmail === 'casper.truberg@outlook.dk') {
										debugLog += `Admin role set for ${userEmail}\n`;
										setPermissionLevel('admin');
										setIsAuthorized(true);
										setUserRole('admin');
									} else {
										debugLog += `No role found, defaulting to: viewer\n`;
										setPermissionLevel('viewer');
										setIsAuthorized(true);
										setUserRole('viewer');
									}
								}
							}
						} catch (innerError) {
							debugLog += `Exception during role check: ${innerError}\n`;

							// Emergency override for specific email
							if (userEmail === 'casper.truberg@outlook.dk') {
								debugLog += `Emergency admin access granted for ${userEmail}\n`;
								setPermissionLevel('admin');
								setIsAuthorized(true);
								setUserRole('admin');
							} else {
								debugLog += `Exception occurred, defaulting to: viewer\n`;
								setPermissionLevel('viewer');
								setIsAuthorized(true);
								setUserRole('viewer');
							}
						}
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						debugLog += `Error getting user permission level: ${errorMessage}\n`;
						console.error('Error getting user permission level by email:', error);
						setPermissionLevel('viewer'); // Default fallback
						setIsAuthorized(true);
					}
				}

				setDebugInfo(debugLog);
			} else if (event === 'SIGNED_OUT') {
				setSession(null);
				setUser(null);
				setPermissionLevel('none');
				setIsAuthorized(false);
				setUserRole('');
				setDebugInfo('Signed out');
			}
		});

		return () => {
			mounted = false;
			clearTimeout(loadingTimeout);
			data.subscription.unsubscribe();
		};
	}, []);

	/* Discord sign-in method - commented out but preserved
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
  }; */

	// Email sign-in method (implemented)
	const signInWithDiscord = async () => {
		// This is now a placeholder that redirects to the login page
		window.location.href = '/login';
	};

	// Function to handle user signup
	const signUpWithEmail = async (email: string, password: string) => {
		try {
			// Normalize email to lowercase
			const normalizedEmail = email.toLowerCase();

			// First, check if this email has a pre-assigned role
			const { data: roleData } = await supabase.from('user_roles_email').select('role').ilike('email', normalizedEmail).single();

			// Sign up the user
			const { data, error } = await supabase.auth.signUp({
				email: normalizedEmail,
				password,
			});

			if (error) throw error;

			// If no pre-assigned role was found, assign default 'viewer' role
			if (!roleData) {
				const { error: insertError } = await supabase.from('user_roles_email').insert({ email: normalizedEmail, role: 'viewer' });

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
			// Normalize email to lowercase
			const normalizedEmail = email.toLowerCase();

			const { data, error } = await supabase.auth.signInWithPassword({
				email: normalizedEmail,
				password,
			});

			if (error) throw error;

			// After successful signin, fetch the role to update state immediately
			try {
				try {
					const { data: roleData, error } = await supabase.from('user_roles_email').select('role').eq('email', normalizedEmail).single();

					if (error) {
						console.error('Error fetching role:', error);

						// Emergency override for specific email
						if (normalizedEmail === 'casper.truberg@outlook.dk') {
							console.log('Emergency admin access granted for', normalizedEmail);
							setPermissionLevel('admin');
							setIsAuthorized(true);
							setUserRole('admin');
						}
					} else if (roleData) {
						console.log('Found role on signin:', roleData.role);
						setPermissionLevel(roleData.role as PermissionLevel);
						setIsAuthorized(roleData.role !== 'none');
						setUserRole(roleData.role);
					} else {
						// Hardcoded admin for specific email
						if (normalizedEmail === 'casper.truberg@outlook.dk') {
							console.log('Admin role set for', normalizedEmail);
							setPermissionLevel('admin');
							setIsAuthorized(true);
							setUserRole('admin');
						}
					}
				} catch (innerError) {
					console.error('Exception in role check:', innerError);

					// Emergency override for specific email
					if (normalizedEmail === 'casper.truberg@outlook.dk') {
						console.log('Emergency admin access granted for', normalizedEmail);
						setPermissionLevel('admin');
						setIsAuthorized(true);
						setUserRole('admin');
					}
				}
			} catch (error) {
				console.error('Error in outer role handling:', error);
			}

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
				signInWithDiscord,
				signOut,
				hasPermission: (level) => hasPermission(user, level),
				debugInfo,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
