import { useAuth } from '../components/AuthProvider';
import { Container, Title, Text, Button, Paper, Group, Box, useMantineTheme } from '@mantine/core';
import { Navigate } from '@tanstack/react-router';
import { DiscordLogo } from '@phosphor-icons/react';

export default function LoginPage() {
	const { signInWithDiscord, isAuthorized, isLoading } = useAuth();
	const theme = useMantineTheme();

	if (isAuthorized && !isLoading) {
		return <Navigate to='/logs' />;
	}

	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				backgroundColor: theme.colors.dark[9],
			}}
		>
			<Container size='xs' my='auto'>
				<Paper withBorder shadow='md' p='xl' radius='md'>
					<Group justify='center' mb='xl'>
						<DiscordLogo size={48} color={theme.colors.blue[5]} />
					</Group>

					<Title order={2} ta='center' c='gray.0' fw={700}>
						FiveM Logging System
					</Title>

					<Text c='dimmed' size='sm' ta='center' mt='sm' mb='xl'>
						Login with your Discord account to access the server logs
					</Text>

					<Button fullWidth leftSection={<DiscordLogo size={18} />} size='md' variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={signInWithDiscord} loading={isLoading}>
						Continue with Discord
					</Button>

					<Text size='xs' c='dimmed' ta='center' mt='md'>
						Only authorized users with appropriate Discord roles can access this system.
					</Text>
				</Paper>
			</Container>
		</Box>
	);
}
