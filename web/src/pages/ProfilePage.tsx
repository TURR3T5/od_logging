import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Paper, Group, Avatar, TextInput, Button, Tabs, Divider, PasswordInput, Switch, Grid } from '../components/mantine';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { PencilSimple, Gear } from '../components/icons';
import { notifications } from '@mantine/notifications';
import { usePermission } from '../hooks/usePermissions';

interface UserProfile {
	id: string;
	username: string;
	email: string;
	avatar: string;
	joinDate: string;
	preferences: {
		notifications: boolean;
		twoFactorAuth: boolean;
		emailUpdates: boolean;
	};
}

export default function ProfilePage() {
	const { user } = useAuth();
	const { hasPermission: isAuthorized, isChecking: checkingPermission } = usePermission('viewer');
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [editedUsername, setEditedUsername] = useState('');
	const [editedEmail, setEditedEmail] = useState('');

	useEffect(() => {
		const fetchProfile = async () => {
			setIsLoading(true);
			try {
				setTimeout(() => {
					setProfile({
						id: '123456789',
						username: user?.username || 'JohnDoe',
						email: 'john.doe@example.com',
						avatar: user?.avatar_url || '/api/placeholder/100/100',
						joinDate: '2023-06-15',
						preferences: {
							notifications: true,
							twoFactorAuth: false,
							emailUpdates: true,
						},
					});
					setIsLoading(false);
				}, 1000);
			} catch (error) {
				console.error('Error fetching profile:', error);
				setIsLoading(false);
			}
		};

		if (isAuthorized) {
			fetchProfile();
		}
	}, [isAuthorized, user]);

	useEffect(() => {
		if (profile) {
			setEditedUsername(profile.username);
			setEditedEmail(profile.email);
		}
	}, [profile]);

	const handleSaveProfile = () => {
		if (!profile) return;

		setProfile({
			...profile,
			username: editedUsername,
			email: editedEmail,
		});

		setIsEditing(false);

		notifications.show({
			title: 'Profil opdateret',
			message: 'Din profil er blevet opdateret med succes',
			color: 'green',
		});
	};

	const handleTogglePreference = (key: keyof UserProfile['preferences']) => {
		if (!profile) return;

		setProfile({
			...profile,
			preferences: {
				...profile.preferences,
				[key]: !profile.preferences[key],
			},
		});

		notifications.show({
			title: 'Indstillinger opdateret',
			message: 'Dine indstillinger er blevet opdateret',
			color: 'blue',
		});
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('da-DK');
	};

	if (!isAuthorized) {
		return (
			<MainLayout>
				<Container size='xl' py='xl'>
					<Paper withBorder p='xl' radius='md'>
						<Title order={2} ta='center' mb='md'>
							Log ind for at se din profil
						</Title>
						<Text ta='center'>Du skal være logget ind for at se denne side.</Text>
					</Paper>
				</Container>
			</MainLayout>
		);
	}

	if (isLoading || checkingPermission) {
		return (
			<MainLayout>
				<Container size='xl' py='xl'>
					<Paper withBorder p='xl' radius='md'>
						<Title order={2} ta='center' mb='md'>
							Indlæser profil...
						</Title>
					</Paper>
				</Container>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<Container size='xl' py='xl'>
				<Grid gutter='md'>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Paper withBorder p='md' radius='md' mb='md'>
							<Box ta='center' mb='md'>
								<Avatar src={profile?.avatar} size={120} radius={120} mx='auto' mb='md' />

								{isEditing ? (
									<>
										<TextInput label='Brugernavn' value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} mb='md' />
										<TextInput label='Email' value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} mb='md' />
										<Group justify='center'>
											<Button variant='outline' onClick={() => setIsEditing(false)}>
												Annuller
											</Button>
											<Button onClick={handleSaveProfile}>Gem ændringer</Button>
										</Group>
									</>
								) : (
									<>
										<Title order={3}>{profile?.username}</Title>
										<Text c='dimmed'>{profile?.email}</Text>
										<Text size='sm' c='dimmed' mt='xs'>
											Medlem siden {formatDate(profile?.joinDate || '')}
										</Text>
										<Button leftSection={<PencilSimple size={16} />} variant='outline' mt='md' onClick={() => setIsEditing(true)}>
											Rediger profil
										</Button>
									</>
								)}
							</Box>
						</Paper>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 8 }}>
						<Paper withBorder p='md' radius='md' mb='md'>
							<Tabs defaultValue='characters'>
								<Tabs.List mb='md'>
									<Tabs.Tab value='settings' leftSection={<Gear size={16} />}>
										Indstillinger
									</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value='settings'>
									<Box mb='xl'>
										<Title order={4} mb='md'>
											Konto Indstillinger
										</Title>

										<Box mb='md'>
											<TextInput label='Email' value={profile?.email} disabled mb='xs' />
											<Text size='xs' c='dimmed'>
												Kontakt en administrator for at ændre din email
											</Text>
										</Box>

										<Box mb='md'>
											<PasswordInput label='Nuværende adgangskode' placeholder='Indtast nuværende adgangskode' mb='xs' />
											<PasswordInput label='Ny adgangskode' placeholder='Indtast ny adgangskode' mb='xs' />
											<PasswordInput label='Bekræft ny adgangskode' placeholder='Gentag ny adgangskode' mb='md' />
											<Button variant='outline'>Skift adgangskode</Button>
										</Box>
									</Box>

									<Divider my='md' />

									<Box>
										<Title order={4} mb='md'>
											Notifikationer
										</Title>

										<Switch label='Discord Notifikationer' description='Modtag notifikationer på Discord om server events og nyheder' checked={profile?.preferences.notifications} onChange={() => handleTogglePreference('notifications')} mb='md' />

										<Switch label='Email Opdateringer' description='Modtag email opdateringer om store server ændringer' checked={profile?.preferences.emailUpdates} onChange={() => handleTogglePreference('emailUpdates')} mb='md' />

										<Switch label='To-Faktor Autentificering' description='Forøg sikkerheden på din konto med 2FA' checked={profile?.preferences.twoFactorAuth} onChange={() => handleTogglePreference('twoFactorAuth')} mb='md' />
									</Box>
								</Tabs.Panel>
							</Tabs>
						</Paper>
					</Grid.Col>
				</Grid>
			</Container>
		</MainLayout>
	);
}
