import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Paper, Group, Avatar, TextInput, Button, Tabs, Card, Timeline, Badge, Divider, PasswordInput, Switch, Grid, SimpleGrid } from '@mantine/core';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Shield, Trash, PencilSimple, User, ClockCounterClockwise, CreditCard, Clock, Gear } from '@phosphor-icons/react';
import { notifications } from '@mantine/notifications';

interface UserProfile {
	id: string;
	username: string;
	email: string;
	avatar: string;
	joinDate: string;
	characters: Character[];
	preferences: {
		notifications: boolean;
		twoFactorAuth: boolean;
		emailUpdates: boolean;
	};
	stats: {
		playTime: number;
		charactersCreated: number;
		jobsCompleted: number;
		crimesCommitted: number;
		moneyEarned: number;
		reputation: number;
	};
	recentActivity: Activity[];
	achievements: Achievement[];
}

interface Character {
	id: string;
	name: string;
	job: string;
	level: number;
	money: number;
	createdAt: string;
	lastPlayed: string;
}

interface Activity {
	id: string;
	type: string;
	description: string;
	timestamp: string;
}

interface Achievement {
	id: string;
	name: string;
	description: string;
	completed: boolean;
	progress: number;
	maxProgress: number;
}

export default function ProfilePage() {
	const { user, isAuthorized } = useAuth();
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
						characters: [
							{
								id: 'char1',
								name: 'Marcus Jensen',
								job: 'Police Officer',
								level: 28,
								money: 342500,
								createdAt: '2023-06-16',
								lastPlayed: '2025-03-25',
							},
							{
								id: 'char2',
								name: 'Alex Smith',
								job: 'Criminal',
								level: 19,
								money: 175300,
								createdAt: '2023-08-22',
								lastPlayed: '2025-03-27',
							},
						],
						preferences: {
							notifications: true,
							twoFactorAuth: false,
							emailUpdates: true,
						},
						stats: {
							playTime: 347,
							charactersCreated: 2,
							jobsCompleted: 156,
							crimesCommitted: 89,
							moneyEarned: 1456785,
							reputation: 78,
						},
						recentActivity: [
							{
								id: 'act1',
								type: 'login',
								description: 'Logged in to the server',
								timestamp: '2025-03-27T18:45:23',
							},
							{
								id: 'act2',
								type: 'job',
								description: 'Completed police patrol job',
								timestamp: '2025-03-27T19:12:56',
							},
							{
								id: 'act3',
								type: 'purchase',
								description: 'Purchased vehicle: Police Cruiser',
								timestamp: '2025-03-27T20:05:12',
							},
							{
								id: 'act4',
								type: 'login',
								description: 'Logged in to the server',
								timestamp: '2025-03-25T17:32:45',
							},
						],
						achievements: [
							{
								id: 'ach1',
								name: 'First Day on the Job',
								description: 'Complete your first job',
								completed: true,
								progress: 1,
								maxProgress: 1,
							},
							{
								id: 'ach2',
								name: 'Seasoned Officer',
								description: 'Complete 200 police jobs',
								completed: false,
								progress: 156,
								maxProgress: 200,
							},
							{
								id: 'ach3',
								name: 'Property Tycoon',
								description: 'Own 5 properties',
								completed: false,
								progress: 2,
								maxProgress: 5,
							},
							{
								id: 'ach4',
								name: 'High Roller',
								description: 'Accumulate $1,000,000 across all characters',
								completed: false,
								progress: 517800,
								maxProgress: 1000000,
							},
						],
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

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(amount);
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('da-DK');
	};

	const formatDateTime = (dateTimeString: string): string => {
		return new Date(dateTimeString).toLocaleString('da-DK');
	};

	const formatPlayTime = (hours: number): string => {
		const days = Math.floor(hours / 24);
		const remainingHours = Math.floor(hours % 24);

		if (days > 0) {
			return `${days} dage, ${remainingHours} timer`;
		} else {
			return `${hours} timer`;
		}
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

	if (isLoading || !profile) {
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
								<Avatar src={profile.avatar} size={120} radius={120} mx='auto' mb='md' />

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
										<Title order={3}>{profile.username}</Title>
										<Text c='dimmed'>{profile.email}</Text>
										<Text size='sm' c='dimmed' mt='xs'>
											Medlem siden {formatDate(profile.joinDate)}
										</Text>
										<Button leftSection={<PencilSimple size={16} />} variant='outline' mt='md' onClick={() => setIsEditing(true)}>
											Rediger profil
										</Button>
									</>
								)}
							</Box>

							<Divider my='md' label='Statistik' labelPosition='center' />

							<Box>
								<Group mb='xs'>
									<Clock size={18} />
									<Text fw={500}>Spilletid</Text>
									<Text ml='auto'>{formatPlayTime(profile.stats.playTime)}</Text>
								</Group>

								<Group mb='xs'>
									<User size={18} />
									<Text fw={500}>Karakterer</Text>
									<Text ml='auto'>{profile.stats.charactersCreated}</Text>
								</Group>

								<Group mb='xs'>
									<Shield size={18} />
									<Text fw={500}>Jobs gennemført</Text>
									<Text ml='auto'>{profile.stats.jobsCompleted}</Text>
								</Group>

								<Group mb='xs'>
									<Trash size={18} />
									<Text fw={500}>Kriminalitet</Text>
									<Text ml='auto'>{profile.stats.crimesCommitted}</Text>
								</Group>

								<Group mb='xs'>
									<CreditCard size={18} />
									<Text fw={500}>Tjent i alt</Text>
									<Text ml='auto'>{formatCurrency(profile.stats.moneyEarned)}</Text>
								</Group>
							</Box>
						</Paper>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 8 }}>
						<Paper withBorder p='md' radius='md' mb='md'>
							<Tabs defaultValue='characters'>
								<Tabs.List mb='md'>
									<Tabs.Tab value='characters' leftSection={<User size={16} />}>
										Karakterer
									</Tabs.Tab>
									<Tabs.Tab value='activity' leftSection={<ClockCounterClockwise size={16} />}>
										Aktivitet
									</Tabs.Tab>
									<Tabs.Tab value='settings' leftSection={<Gear size={16} />}>
										Indstillinger
									</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value='characters'>
									<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
										{profile.characters.map((character) => (
											<Card key={character.id} withBorder shadow='sm' p='md' radius='md'>
												<Group justify='space-between' mb='xs'>
													<Text fw={700} size='lg'>
														{character.name}
													</Text>
													<Badge color='blue'>{character.job}</Badge>
												</Group>

												<Group mb='xs'>
													<Text fw={500}>Level:</Text>
													<Text>{character.level}</Text>
												</Group>

												<Group mb='xs'>
													<Text fw={500}>Penge:</Text>
													<Text>{formatCurrency(character.money)}</Text>
												</Group>

												<Group mb='xs'>
													<Text fw={500}>Oprettet:</Text>
													<Text>{formatDate(character.createdAt)}</Text>
												</Group>

												<Group mb='xs'>
													<Text fw={500}>Sidst spillet:</Text>
													<Text>{formatDate(character.lastPlayed)}</Text>
												</Group>

												<Button variant='light' fullWidth mt='md'>
													Se detaljer
												</Button>
											</Card>
										))}
									</SimpleGrid>
								</Tabs.Panel>

								<Tabs.Panel value='activity'>
									<Timeline active={0} bulletSize={24} lineWidth={2}>
										{profile.recentActivity.map((activity) => (
											<Timeline.Item key={activity.id} bullet={activity.type === 'login' ? <User size={12} /> : activity.type === 'job' ? <Shield size={12} /> : <CreditCard size={12} />} title={activity.description}>
												<Text size='sm' c='dimmed'>
													{formatDateTime(activity.timestamp)}
												</Text>
											</Timeline.Item>
										))}
									</Timeline>
								</Tabs.Panel>

								<Tabs.Panel value='settings'>
									<Box mb='xl'>
										<Title order={4} mb='md'>
											Konto Indstillinger
										</Title>

										<Box mb='md'>
											<TextInput label='Email' value={profile.email} disabled mb='xs' />
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

										<Switch label='Discord Notifikationer' description='Modtag notifikationer på Discord om server events og nyheder' checked={profile.preferences.notifications} onChange={() => handleTogglePreference('notifications')} mb='md' />

										<Switch label='Email Opdateringer' description='Modtag email opdateringer om store server ændringer' checked={profile.preferences.emailUpdates} onChange={() => handleTogglePreference('emailUpdates')} mb='md' />

										<Switch label='To-Faktor Autentificering' description='Forøg sikkerheden på din konto med 2FA' checked={profile.preferences.twoFactorAuth} onChange={() => handleTogglePreference('twoFactorAuth')} mb='md' />
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
