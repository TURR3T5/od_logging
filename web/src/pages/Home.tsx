import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import { Center, Loader, Container, Title, Text, Button, Group, Paper, Box } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';
import { DiscordLogo } from '@phosphor-icons/react';

export default function HomePage() {
	const { isAuthorized, isLoading, signInWithDiscord } = useAuth();
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
					<Paper withBorder shadow='md' p='xl' radius='md' className='max-w-2xl w-full'>
						<Title order={1} ta='center' mb='lg'>
							Welcome to FiveM Logging System
						</Title>

						<Text size='lg' ta='center' mb='xl'>
							This system provides comprehensive logging capabilities for FiveM servers, allowing server admins to track player activity, inventory changes, and administrative actions.
						</Text>

						<Group justify='center' mb='xl' gap='xl'>
							<Paper withBorder p='md' radius='md' className='w-full'>
								<Title order={3} mb='md' ta='center'>
									Features
								</Title>
								<Box className='space-y-2'>
									<Text>✓ Real-time player activity monitoring</Text>
									<Text>✓ Inventory and item tracking</Text>
									<Text>✓ Vehicle spawning and ownership logs</Text>
									<Text>✓ Administrative action records</Text>
									<Text>✓ Advanced filtering and searching capabilities</Text>
								</Box>
							</Paper>
						</Group>

						{!isAuthorized && (
							<Group justify='center'>
								<Button size='lg' leftSection={<DiscordLogo size={20} />} variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={() => signInWithDiscord()}>
									Login with Discord to View Logs
								</Button>
							</Group>
						)}
					</Paper>
				</Box>
			</Container>
		</MainLayout>
	);
}
