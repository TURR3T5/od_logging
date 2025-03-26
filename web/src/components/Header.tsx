import { Group, Text, Button, Box, Container } from '@mantine/core';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from '@tanstack/react-router';
import { SignOut, House, ListBullets } from '@phosphor-icons/react';

export default function Header() {
	const { isAuthorized, isLoading, user, signInWithDiscord, signOut } = useAuth();
	const navigate = useNavigate();

	const menuItems = [
		{ label: 'Home', icon: House, onClick: () => navigate({ to: '/' }) },
		{
			label: 'Server Logs',
			icon: ListBullets,
			onClick: () => navigate({ to: '/logs' }),
			requireAuth: true,
		},
	];

	const filteredMenuItems = menuItems.filter((item) => !item.requireAuth || (item.requireAuth && isAuthorized));

	return (
		<Box
			w='100%'
			bg='#111'
			style={{
				borderBottom: '1px solid #222',
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				zIndex: 20,
				height: '60px',
			}}
		>
			<Container
				size='100%'
				py='sm'
				style={{
					height: '100%',
					maxWidth: '1920px',
					margin: '0 auto',
				}}
			>
				<Group justify='space-between' h='100%'>
					<Group>
						<Text fw={700} size='lg' variant='gradient' gradient={{ from: 'yellow', to: 'grape', deg: 90 }} onClick={() => navigate({ to: '/' })} style={{ cursor: 'pointer' }}>
							OdessaRP
						</Text>

						<Group ml='xl' gap='xl'>
							{filteredMenuItems.map((item, index) => (
								<Group
									key={index}
									gap='xs'
									onClick={item.onClick}
									style={(theme) => ({
										cursor: 'pointer',
										transition: 'color 200ms ease',
										'&:hover': {
											color: theme.colors.blue[4],
										},
										alignItems: 'center',
									})}
								>
									<item.icon size={22} style={{ display: 'flex', alignItems: 'center' }} />
									<Text c='gray.0' style={{ display: 'flex', alignItems: 'center' }}>
										{item.label}
									</Text>
								</Group>
							))}
						</Group>
					</Group>

					<Group>
						{isLoading ? (
							<Text>Loading...</Text>
						) : isAuthorized ? (
							<Group>
								<Text c='gray.0'>{user?.username && `Welcome, ${user.username}`}</Text>
								<Button variant='outline' color='red' onClick={signOut} leftSection={<SignOut size={16} style={{ display: 'flex', alignItems: 'center' }} />}>
									Logout
								</Button>
							</Group>
						) : (
							<Button variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={signInWithDiscord}>
								Login with Discord
							</Button>
						)}
					</Group>
				</Group>
			</Container>
		</Box>
	);
}
