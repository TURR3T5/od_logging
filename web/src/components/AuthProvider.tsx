import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { PermissionLevel } from '../lib/discord';
interface AuthContextType {
	user: any;
	session: any;
	isLoading: boolean;
	isAuthorized: boolean;
	permissionLevel: PermissionLevel;
	signInWithDiscord: () => Promise<void>;
	signUpWithEmail: (email: string, password: string) => Promise<any>;
	signInWithEmail: (email: string, password: string) => Promise<any>;
	signOut: () => Promise<void>;
	hasPermission: (requiredLevel: PermissionLevel) => boolean;
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
	hasPermission: () => false,
	debugInfo: '',
});
const ADMIN_EMAILS = ['casper.truberg@outlook.dk'];
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<any>(null);
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('none');
	const [debugInfo, setDebugInfo] = useState<string>('');
	const hasPermission = (requiredLevel: PermissionLevel): boolean => {
		const permissionHierarchy: PermissionLevel[] = ['none', 'viewer', 'content', 'staff', 'admin'];
		const userPermissionIndex = permissionHierarchy.indexOf(permissionLevel);
		const requiredPermissionIndex = permissionHierarchy.indexOf(requiredLevel);
		return userPermissionIndex >= requiredPermissionIndex;
	};
	useEffect(() => {
		let isMounted = true;
		let debugLog = 'Session check started\n';
		const initializeAuth = async () => {
			try {
								const { data: sessionData } = await supabase.auth.getSession();
				debugLog += `Got session data: ${sessionData.session ? 'session exists' : 'no session'}\n`;
				if (sessionData.session) {
					if (isMounted) {
						setSession(sessionData.session);
						setUser(sessionData.session.user);
						debugLog += `User set: ${sessionData.session.user.email}\n`;
												const userEmail = sessionData.session.user.email?.toLowerCase();
						if (userEmail) {
							if (ADMIN_EMAILS.includes(userEmail)) {
								debugLog += `Admin email match found: ${userEmail}\n`;
								setPermissionLevel('admin');
								setIsAuthorized(true);
							} else {
																try {
									const { data: roleData, error } = await supabase.from('user_roles_email').select('role').eq('email', userEmail).single();
									if (error) {
										debugLog += `Error fetching role: ${error.message}\n`;
																				setPermissionLevel('viewer');
										setIsAuthorized(true);
									} else if (roleData) {
										debugLog += `Role found in database: ${roleData.role}\n`;
										setPermissionLevel(roleData.role as PermissionLevel);
										setIsAuthorized(roleData.role !== 'none');
									} else {
										debugLog += 'No role found, setting to viewer\n';
										setPermissionLevel('viewer');
										setIsAuthorized(true);
									}
								} catch (error) {
									debugLog += `Error in role check: ${error}\n`;
									setPermissionLevel('viewer');
									setIsAuthorized(true);
								}
							}
						}
					}
				}
			} catch (error) {
				debugLog += `Error in session check: ${error}\n`;
			} finally {
				if (isMounted) {
					setIsLoading(false);
					setDebugInfo(debugLog);
				}
			}
		};
		initializeAuth();
				const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
			debugLog += `Auth state change: ${event}\n`;
			if (event === 'SIGNED_IN' && newSession) {
				if (isMounted) {
					setSession(newSession);
					setUser(newSession.user);
					debugLog += `Signed in: ${newSession.user.email}\n`;
										const userEmail = newSession.user.email?.toLowerCase();
					if (userEmail) {
						if (ADMIN_EMAILS.includes(userEmail)) {
							debugLog += `Admin email match: ${userEmail}\n`;
							setPermissionLevel('admin');
							setIsAuthorized(true);
						} else {
														try {
								const { data: roleData, error } = await supabase.from('user_roles_email').select('role').eq('email', userEmail).single();
								if (error) {
									debugLog += `Error fetching role: ${error.message}\n`;
									setPermissionLevel('viewer');
									setIsAuthorized(true);
								} else if (roleData) {
									debugLog += `Role found: ${roleData.role}\n`;
									setPermissionLevel(roleData.role as PermissionLevel);
									setIsAuthorized(roleData.role !== 'none');
								} else {
									debugLog += 'No role found, setting to viewer\n';
									setPermissionLevel('viewer');
									setIsAuthorized(true);
								}
							} catch (error) {
								debugLog += `Error in role fetch: ${error}\n`;
								setPermissionLevel('viewer');
								setIsAuthorized(true);
							}
						}
					}
				}
			} else if (event === 'SIGNED_OUT') {
				if (isMounted) {
					setSession(null);
					setUser(null);
					setPermissionLevel('none');
					setIsAuthorized(false);
					debugLog += 'User signed out\n';
				}
			} else if (event === 'TOKEN_REFRESHED' && newSession) {
				if (isMounted) {
					setSession(newSession);
					debugLog += 'Token refreshed\n';
				}
			}
			if (isMounted) {
				setDebugInfo(debugLog);
			}
		});
		return () => {
			isMounted = false;
			if (authListener && authListener.subscription) {
				authListener.subscription.unsubscribe();
			}
		};
	}, []);
	const signInWithDiscord = async () => {
		window.location.href = '/login';
	};
	const signUpWithEmail = async (email: string, password: string) => {
		try {
			const normalizedEmail = email.toLowerCase();
						const { data, error } = await supabase.auth.signUp({
				email: normalizedEmail,
				password,
			});
			if (error) throw error;
						if (ADMIN_EMAILS.includes(normalizedEmail)) {
				const { error: roleError } = await supabase.from('user_roles_email').upsert({ email: normalizedEmail, role: 'admin' });
				if (roleError) console.error('Error setting admin role:', roleError);
			} else {
								const { error: roleError } = await supabase.from('user_roles_email').upsert({ email: normalizedEmail, role: 'viewer' });
				if (roleError) console.error('Error setting viewer role:', roleError);
			}
			return data;
		} catch (error) {
			console.error('Signup error:', error);
			throw error;
		}
	};
	const signInWithEmail = async (email: string, password: string) => {
		try {
			const normalizedEmail = email.toLowerCase();
			const { data, error } = await supabase.auth.signInWithPassword({
				email: normalizedEmail,
				password,
			});
			if (error) throw error;
						if (ADMIN_EMAILS.includes(normalizedEmail)) {
				setPermissionLevel('admin');
				setIsAuthorized(true);
			}
			return data;
		} catch (error) {
			console.error('Signin error:', error);
			throw error;
		}
	};
	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			setUser(null);
			setSession(null);
			setPermissionLevel('none');
			setIsAuthorized(false);
		} catch (error) {
			console.error('Signout error:', error);
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
				hasPermission,
				debugInfo,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
export const useAuth = () => useContext(AuthContext);
