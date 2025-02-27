// src/pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import { Center, Loader, Text, Code } from '@mantine/core';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
	const { isAuthorized, isLoading, user } = useAuth();
	const [debugInfo, setDebugInfo] = useState<any>(null);

	useEffect(() => {
		// Add debug information
		const getSession = async () => {
			const { data } = await supabase.auth.getSession();
			setDebugInfo({
				session: data.session,
				user: data.session?.user,
				metadata: data.session?.user?.user_metadata,
			});
		};

		getSession();
	}, []);

	// After auth completes, redirect based on authorization
	if (!isLoading) {
		console.log('Auth completed, authorized:', isAuthorized);
		console.log('User:', user);

		if (isAuthorized) {
			return <Navigate to='/logs' />;
		}
	}

	return (
		<Center h='100vh' style={{ flexDirection: 'column' }}>
			<Loader size='xl' mb='md' />
			<Text>Completing authentication...</Text>

			{/* Debug info */}
			{debugInfo && (
				<div style={{ marginTop: '20px', maxWidth: '600px', overflow: 'auto' }}>
					<Text size='sm'>Debug Info:</Text>
					<Code block>{JSON.stringify(debugInfo, null, 2)}</Code>
				</div>
			)}
		</Center>
	);
}
