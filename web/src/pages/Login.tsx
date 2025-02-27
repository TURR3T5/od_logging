import { useAuth } from '../components/AuthProvider';
import { Button, Container, Title, Text, Center } from '@mantine/core';
import { Navigate } from '@tanstack/react-router';

export default function LoginPage() {
	const { signInWithDiscord, isAuthorized, isLoading } = useAuth();

	if (isAuthorized && !isLoading) {
		return <Navigate to='/logs' />;
	}

	return (
		<Container size='sm'>
			<Center h='100vh' style={{ flexDirection: 'column' }}>
				<Title order={1} mb='md'>
					FiveM Logging System
				</Title>
				<Text mb='xl'>Login with your Discord account to access the logs.</Text>
				<Button onClick={signInWithDiscord} color='indigo' size='lg' loading={isLoading}>
					Login with Discord
				</Button>
			</Center>
		</Container>
	);
}
