import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import { Center, Loader, Container, Box } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';

export default function HomePage() {
	const { isAuthorized, isLoading } = useAuth();
	const navigate = useNavigate();
	const [redirecting, setRedirecting] = useState(false);

	useEffect(() => {
		if (!isLoading && isAuthorized) {
			setRedirecting(true);
			const timeout = setTimeout(() => {
				navigate({ to: '/logs' });
			}, 1000);

			return () => clearTimeout(timeout);
		}
	}, [isAuthorized, isLoading, navigate]);

	if (isLoading || redirecting) {
		return (
			<MainLayout requireAuth={false}>
				<Center h='calc(100vh - 60px)'>
					<Loader size='xl' />
				</Center>
			</MainLayout>
		);
	}

	return (
		<MainLayout requireAuth={false}>
			<Container size='lg' my='xl'>
				<Box className='flex flex-col items-center justify-center' style={{ minHeight: 'calc(100vh - 160px)' }}>
					<h1>Welcome to the Home Page</h1>
					<p>This is the home page. You will be redirected to the logs page if you are authorized.</p>
				</Box>
			</Container>
		</MainLayout>
	);
}
