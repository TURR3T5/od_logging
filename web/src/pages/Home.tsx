import { Container, Box, Title, Text, Button, Group, Paper } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';

export default function HomePage() {
	const { isAuthorized } = useAuth();
	const navigate = useNavigate();

	return (
		<MainLayout requireAuth={false}>
			<Container size='lg' my='xl'>
				<Box className='flex flex-col items-center justify-center' style={{ minHeight: 'calc(100vh - 160px)' }}>
					<Title order={1} className='text-center mb-6' c='blue'>
						FiveM Logging System
					</Title>

					<Paper p='xl' radius='md' className='w-full max-w-3xl mb-10'>
						<Text size='lg' className='mb-4'>
							Welcome to the FiveM Logging System for Odessa, a comprehensive tool that allows server administrators to monitor and track various in-game activities.
						</Text>

						<Text className='mb-8'>This logging system utilizes Supabase to securely store and manage logs of player activities, inventory changes, vehicle spawns, and administrator actions.</Text>

						{isAuthorized ? (
							<Button variant='gradient' gradient={{ from: 'blue', to: 'indigo' }} size='lg' onClick={() => navigate({ to: '/logs' })}>
								View Server Logs
							</Button>
						) : (
							<Group>
								<Button variant='gradient' gradient={{ from: 'blue', to: 'indigo' }} size='lg' onClick={() => navigate({ to: '/login' })}>
									Login to Access Logs
								</Button>
							</Group>
						)}
					</Paper>

				</Box>
			</Container>
		</MainLayout>
	);
}
