import { Group, Text, Button, Box, Container, Menu, Badge, ActionIcon } from '@mantine/core';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from '@tanstack/react-router';
import { House, LogOut, List, Book, Calendar, User, ChevronDown, ShieldUser, Wrench, Menu as MenuIcon } from 'lucide-react';

export default function Header() {
	const { isAuthorized, isLoading, signOut, permissionLevel, user } = useAuth();
	const navigate = useNavigate();

	const isAdmin = permissionLevel === 'admin';
	const isStaff = permissionLevel === 'admin' || permissionLevel === 'staff';

	const publicMenuItems = [
		{ label: 'Home', icon: House, onClick: () => navigate({ to: '/' }) },
		{ label: 'Regler', icon: Book, onClick: () => navigate({ to: '/rules' }) },
	];

	const wipMenuItems = [
		{ label: 'Nyheder og Events', icon: Calendar, onClick: () => navigate({ to: '/events' }) },
		{ label: 'Ansøgninger', icon: User, onClick: () => navigate({ to: '/whitelist' }) },
	];

	const adminMenuItems = [
		{ label: 'Server Logs', icon: List, onClick: () => navigate({ to: '/logs' }) },
		{ label: 'Role Management', icon: ShieldUser, onClick: () => navigate({ to: '/admin/roles' }) },
	];

	const renderMobileMenu = () => (
		<Menu shadow='md' width={250}>
			<Menu.Target>
				<ActionIcon variant='transparent' hiddenFrom='sm'>
					<MenuIcon size={24} color='white' />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{publicMenuItems.map((item, index) => (
					<Menu.Item key={index} leftSection={<item.icon size={16} />} onClick={item.onClick}>
						{item.label}
					</Menu.Item>
				))}

				{(isAdmin || isStaff) && (
					<>
						<Menu.Divider />
						<Menu.Label>WIP</Menu.Label>
						{wipMenuItems.map((item, index) => (
							<Menu.Item key={index} leftSection={<item.icon size={16} />} onClick={item.onClick}>
								{item.label}
							</Menu.Item>
						))}
					</>
				)}

				{isAdmin && (
					<>
						<Menu.Divider />
						<Menu.Label>Admin</Menu.Label>
						{adminMenuItems.map((item, index) => (
							<Menu.Item key={index} leftSection={<item.icon size={16} />} onClick={item.onClick}>
								{item.label}
							</Menu.Item>
						))}
					</>
				)}

				{isAuthorized && (
					<>
						<Menu.Divider />
						<Menu.Item leftSection={<User size={16} />} onClick={() => navigate({ to: '/profile' })}>
							Profil
						</Menu.Item>
						<Menu.Item color='red' leftSection={<LogOut size={16} />} onClick={signOut}>
							Logout
						</Menu.Item>
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);

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

						<Group ml='xl' gap='xl' visibleFrom='sm'>
							{publicMenuItems.map((item, index) => (
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

							{isAdmin && (
								<Menu shadow='md' width={200}>
									<Menu.Target>
										<Group
											gap='xs'
											style={(theme) => ({
												cursor: 'pointer',
												transition: 'color 200ms ease',
												'&:hover': {
													color: theme.colors.blue[4],
												},
												alignItems: 'center',
											})}
										>
											<Wrench size={22} style={{ display: 'flex', alignItems: 'center' }} />
											<Text c='gray.0' style={{ display: 'flex', alignItems: 'center' }}>
												WIP
											</Text>
											<ChevronDown size={14} />
										</Group>
									</Menu.Target>
									<Menu.Dropdown>
										{wipMenuItems.map((item, index) => (
											<Menu.Item key={index} leftSection={<item.icon size={16} />} onClick={item.onClick}>
												{item.label}
											</Menu.Item>
										))}
									</Menu.Dropdown>
								</Menu>
							)}

							{isAdmin && (
								<Menu shadow='md' width={200}>
									<Menu.Target>
										<Group
											gap='xs'
											style={(theme) => ({
												cursor: 'pointer',
												transition: 'color 200ms ease',
												'&:hover': {
													color: theme.colors.blue[4],
												},
												alignItems: 'center',
											})}
										>
											<ShieldUser size={22} style={{ display: 'flex', alignItems: 'center' }} />
											<Text c='gray.0' style={{ display: 'flex', alignItems: 'center' }}>
												Admin
											</Text>
											<ChevronDown size={14} />
										</Group>
									</Menu.Target>
									<Menu.Dropdown>
										{adminMenuItems.map((item, index) => (
											<Menu.Item key={index} leftSection={<item.icon size={16} />} onClick={item.onClick}>
												{item.label}
											</Menu.Item>
										))}
									</Menu.Dropdown>
								</Menu>
							)}

							{renderMobileMenu()}
						</Group>
					</Group>

					<Group>
						{isLoading ? (
							<Text>Loading...</Text>
						) : isAuthorized ? (
							<Group visibleFrom='sm'>
								{isAdmin && (
									<Badge color='red' variant='filled' size='sm'>
										Admin
									</Badge>
								)}
								{isStaff && !isAdmin && (
									<Badge color='blue' variant='filled' size='sm'>
										Staff
									</Badge>
								)}

								<Button variant='subtle' color='blue' onClick={() => navigate({ to: '/profile' })} leftSection={<User size={16} style={{ display: 'flex', alignItems: 'center' }} />}>
									Profil
								</Button>
								<Button variant='outline' color='red' onClick={signOut} leftSection={<LogOut size={16} style={{ display: 'flex', alignItems: 'center' }} />}>
									Logout
								</Button>
							</Group>
						) : (
							<Button variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={() => navigate({ to: '/login' })}>
								Login
							</Button>
						)}

						{renderMobileMenu()}
					</Group>
				</Group>
			</Container>
		</Box>
	);
}
