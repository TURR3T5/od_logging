import { useEffect } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import { Center, Loader, Text } from '@mantine/core';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
	const { isAuthorized, isLoading } = useAuth();

	useEffect(() => {
		const handleCodeExchange = async () => {
			const url = new URL(window.location.href);
			const code = url.searchParams.get('code');

			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);

				if (error) {
					console.error('Error exchanging code for session:', error);
				}
			}
		};

		handleCodeExchange();
	}, []);

	if (!isLoading) {
		if (isAuthorized) {
			return <Navigate to='/logs' />;
		} else {
			return <Navigate to='/login' />;
		}
	}

	return (
		<Center h='100vh' style={{ flexDirection: 'column' }}>
			<Loader size='xl' mb='md' />
			<Text>Completing authentication...</Text>
		</Center>
	);
}
