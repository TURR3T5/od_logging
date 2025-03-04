import { Group, Text, Button, Box, Container, Burger, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from '@tanstack/react-router';
import { SignOut, Gauge, ListBullets } from '@phosphor-icons/react';

export default function Header() {
	const { isAuthorized, isLoading, user, signInWithDiscord, signOut } = useAuth();
	const navigate = useNavigate();
	const [opened, { toggle, close }] = useDisclosure(false);

	const menuItems = [
		{ label: 'Home', icon: Gauge, onClick: () => navigate({ to: '/' }) },
		{ label: 'Server Logs', icon: ListBullets, onClick: () => navigate({ to: '/logs' }) },
	];

	return (
		<Box component='header' className='bg-[#111] sticky top-0 z-[20] border-b border-[#222]' style={{ height: '60px', width: '100%' }}>
			<Container size='xl' py='sm' style={{ height: '100%', maxWidth: '1920px', margin: '0 auto' }}>
				<Group justify='space-between' style={{ height: '100%' }}>
					<Group>
						<Text fw={700} size='lg' variant='gradient' gradient={{ from: 'yellow', to: 'grape', deg: 90 }} onClick={() => navigate({ to: '/' })} className='cursor-pointer'>
							OdessaRP
						</Text>

						<Group ml='xl' gap='xl' className='hidden md:flex'>
							{menuItems.map((item, index) => (
								<Group key={index} gap='xs' className='cursor-pointer hover:text-blue-4 transition-colors duration-200' onClick={item.onClick}>
									<item.icon size={18} />
									<Text c='gray.0'>{item.label}</Text>
								</Group>
							))}
						</Group>
					</Group>

					{/* Mobile menu button */}
					<Burger opened={opened} onClick={toggle} size='sm' color='gray.0' className='md:hidden' />

					{/* Auth buttons on desktop */}
					<Group className='hidden md:flex'>
						{isLoading ? (
							<Text>Loading...</Text>
						) : isAuthorized ? (
							<Group>
								<Text c='gray.0'>{user?.username && `Welcome, ${user.username}`}</Text>
								<Button variant='outline' color='red' onClick={signOut} leftSection={<SignOut size={16} />}>
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

			{/* Mobile drawer */}
			<Drawer opened={opened} onClose={close} size='100%' padding='md' title='Menu' zIndex={1000} overlayProps={{ opacity: 0.5, blur: 4 }}>
				<Box className='flex flex-col h-full'>
					<Box className='flex-1'>
						{menuItems.map((item, index) => (
							<Box key={index} className='py-2.5 hover:bg-dark-6'>
								<Group
									gap='xs'
									onClick={() => {
										item.onClick();
										close();
									}}
									className='cursor-pointer px-2'
								>
									<item.icon size={20} />
									<Text size='lg'>{item.label}</Text>
								</Group>
							</Box>
						))}
					</Box>

					<Box py='md' className='border-t border-dark-5 mt-4'>
						{isLoading ? (
							<Text>Loading...</Text>
						) : isAuthorized ? (
							<>
								<Text c='gray.0' mb='xs'>
									{user?.username && `Logged in as ${user.username}`}
								</Text>
								<Button fullWidth variant='outline' color='red' onClick={signOut} leftSection={<SignOut size={16} />}>
									Logout
								</Button>
							</>
						) : (
							<Button fullWidth variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={signInWithDiscord}>
								Login with Discord
							</Button>
						)}
					</Box>
				</Box>
			</Drawer>
		</Box>
	);
}
