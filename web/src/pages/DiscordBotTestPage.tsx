// src/pages/DiscordBotTestPage.tsx
import { Container, Title, Alert, Text } from '@mantine/core';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import DiscordBotDebug from '../components/debug/DiscordBotDebug';

export default function DiscordBotTestPage() {
	const { isAuthorized, hasPermission } = useAuth();

	// Only allow admins to access this page
	const canAccessPage = isAuthorized && hasPermission('admin');

	return (
		<MainLayout>
			<Container size='xl' py='xl'>
				<Title order={1} mb='xl'>
					Discord Bot Test Page
				</Title>

				{!canAccessPage ? (
					<Alert title='Access Denied' color='red'>
						You do not have permission to access this page. This page is restricted to administrators.
					</Alert>
				) : (
					<>
						<Alert title='⚠️ Debug Mode' color='yellow' mb='lg'>
							<Text>This is a debug/testing page for the Discord bot integration. Be careful when testing on production.</Text>
							<Text size='sm' mt='xs'>
								All operations are logged and some may have side effects on the database.
							</Text>
						</Alert>

						<DiscordBotDebug />
					</>
				)}
			</Container>
		</MainLayout>
	);
}
