import { Container, Box, Title, Text, Button, Group, Paper } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';

export default function HomePage() {
	const { isAuthorized } = useAuth();
	const navigate = useNavigate();

	return (
		<MainLayout requireAuth={false} showSidebar={false}>
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

					<Group grow className='w-full max-w-3xl'>
						<Paper p='md' radius='md' withBorder>
							<Title order={3} c='blue' className='mb-2'>
								Features
							</Title>
							<Text component='ul' className='list-disc pl-5'>
								<li>Player connection tracking</li>
								<li>Inventory and item management logs</li>
								<li>Vehicle spawn and purchase records</li>
								<li>Administrator actions and reports</li>
								<li>Searchable and filterable logs</li>
							</Text>
						</Paper>

						<Paper p='md' radius='md' withBorder>
							<Title order={3} c='blue' className='mb-2'>
								About
							</Title>
							<Text>This system was developed specifically for the Odessa FiveM server to provide administrators with enhanced visibility and accountability. The system is protected by Discord authentication to ensure only authorized personnel can access sensitive server information.</Text>
						</Paper>
					</Group>
				</Box>
			</Container>
		</MainLayout>
	);
}
