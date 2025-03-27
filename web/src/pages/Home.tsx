import { useState, useEffect } from 'react';
import { Container, Box, Title, Text, Button, Group, Grid, Card, Badge, Center, Avatar, Timeline } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Users, Car, Buildings, Calendar, ShieldCheck, GameController, ArrowRight, DiscordLogo, Bell, ArrowSquareOut, Star } from '@phosphor-icons/react';

interface ServerStats {
	onlinePlayers: number;
	totalPlayers: number;
	whitelist: number;
	uptime: string;
}

interface NewsItem {
	id: number;
	title: string;
	content: string;
	date: string;
	type: 'update' | 'event' | 'announcement';
}

interface FeaturedPlayer {
	id: number;
	name: string;
	avatarUrl: string;
	role: string;
	description: string;
}

export default function HomePage() {
	const { isAuthorized } = useAuth();
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const [serverStats, setServerStats] = useState<ServerStats>({
		onlinePlayers: 0,
		totalPlayers: 0,
		whitelist: 0,
		uptime: '',
	});

	// Demo news items - would come from backend in production
	const newsItems: NewsItem[] = [
		{
			id: 1,
			title: 'Server Update 3.5',
			content: 'New vehicles, weapons, and optimizations have been added to the server.',
			date: '2025-03-25',
			type: 'update',
		},
		{
			id: 2,
			title: 'Weekend Event: Car Show',
			content: 'Join us at the Vinewood Bowl for a car show this weekend. Cash prizes for best vehicles!',
			date: '2025-03-24',
			type: 'event',
		},
		{
			id: 3,
			title: 'New Police Chief Appointed',
			content: 'Congratulations to Officer Johnson on being appointed as the new Police Chief!',
			date: '2025-03-22',
			type: 'announcement',
		},
	];

	// Demo featured players - would come from backend in production
	const featuredPlayers: FeaturedPlayer[] = [
		{
			id: 1,
			name: 'Michael Stone',
			avatarUrl: '/api/placeholder/100/100',
			role: 'Gang Leader',
			description: 'Leader of the Yellow Jack Gang, known for strategic territory.',
		},
		{
			id: 2,
			name: 'Sarah Johnson',
			avatarUrl: '/api/placeholder/100/100',
			role: 'Police Chief',
			description: 'Respected Police Chief dedicated to keeping Odessa safe.',
		},
		{
			id: 3,
			name: 'Alex Martinez',
			avatarUrl: '/api/placeholder/100/100',
			role: 'Business Owner',
			description: 'Owner of multiple successful businesses in the city center.',
		},
	];

	// Fetch server stats (simulated here)
	useEffect(() => {
		const fetchServerStats = async () => {
			// In production, this would be a real API call
			// Simulating API call for demo
			setTimeout(() => {
				setServerStats({
					onlinePlayers: 185,
					totalPlayers: 5240,
					whitelist: 4950,
					uptime: '98.7%',
				});
			}, 1000);
		};

		fetchServerStats();
	}, []);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	// Slideshow images
	const slides = [
		{
			image: './1.webp',
			title: 'Velkommen til OdessaRP',
			subtitle: 'Oplev fordybende rollespil',
		},
		{
			image: './2.webp',
			title: 'Dynamisk Økonomi',
			subtitle: 'Byg dit imperium i vores by',
		},
		{
			image: './3.webp',
			title: 'Tilpassede Køretøjer',
			subtitle: 'Kør med stil i eksklusive biler',
		},
		{
			image: './4.webp',
			title: 'Bliv en del af vores fællesskab',
			subtitle: 'Skab uforglemmelige historier',
		},
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 6000);

		return () => clearInterval(interval);
	}, [slides.length]);

	const serverFeatures = [
		{
			icon: <Users size={36} weight='duotone' />,
			title: 'Aktivt Fællesskab',
			description: 'Tilslut vores blomstrende fællesskab af rollespillere, der skaber fordybende oplevelser sammen.',
		},
		{
			icon: <Car size={36} weight='duotone' />,
			title: 'Tilpassede Køretøjer',
			description: 'Vælg fra vores omfattende samling af tilpassede køretøjer med unik håndtering og modifikationer.',
		},
		{
			icon: <Buildings size={36} weight='duotone' />,
			title: 'Økonomisk System',
			description: 'Deltag i en realistisk økonomi med jobs, virksomheder og ejendomsbesiddelse.',
		},
		{
			icon: <ShieldCheck size={36} weight='duotone' />,
			title: 'Professionelt Personale',
			description: '24/7 support fra vores dedikerede personale, der sikrer en sikker og behagelig oplevelse.',
		},
		{
			icon: <Calendar size={36} weight='duotone' />,
			title: 'Regelmæssige Events',
			description: 'Deltag i ugentlige fællesskabsbegivenheder, konkurrencer og særlige rollespilsscenarier.',
		},
		{
			icon: <GameController size={36} weight='duotone' />,
			title: 'Tilpassede Scripts',
			description: 'Nyd unikke gameplay-funktioner med vores specialudviklede server scripts.',
		},
	];

	return (
		<MainLayout requireAuth={false}>
			{/* Hero Section with Slideshow */}
			<Box
				style={{
					height: '80vh',
					minHeight: '600px',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{slides.map((slide, index) => (
					<Box
						key={index}
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							zIndex: currentSlide === index ? 1 : 0,
							opacity: currentSlide === index ? 1 : 0,
							transition: 'opacity 1s ease',
						}}
					>
						<Center style={{ height: '100%', padding: '0 24px' }}>
							<Box
								style={{
									position: 'absolute',
									width: '91.666667%',
									height: '80%',
									borderRadius: '16px',
									overflow: 'hidden',
									maxWidth: '1800px',
								}}
							>
								<Box
									style={{
										position: 'absolute',
										inset: 0,
										width: '100%',
										height: '100%',
										backgroundImage: `url(${slide.image})`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										filter: 'brightness(0.5) blur(2px)',
										transition: 'transform 6s ease-in-out',
										transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
									}}
								/>
							</Box>

							<Container size='xl' style={{ position: 'relative', zIndex: 10 }}>
								<Box
									style={{
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										height: '100%',
										color: 'white',
										maxWidth: '48rem',
										margin: '6rem 0',
										opacity: isLoaded ? 1 : 0,
										transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
										transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
									}}
								>
									<Box style={{ textAlign: 'center' }}>
										<Badge size='xl' radius='sm' color='blue' variant='light' style={{ marginBottom: '20px' }}>
											FiveM Rollespil Server
										</Badge>
										<Title
											style={{
												fontSize: '3.75rem',
												fontWeight: 'bold',
												marginBottom: '24px',
												textShadow: '0 2px 10px rgba(0,0,0,0.7)',
											}}
										>
											{slide.title}
										</Title>
										<Text
											style={{
												fontSize: '1.5rem',
												marginBottom: '40px',
												textShadow: '0 2px 6px rgba(0,0,0,0.8)',
											}}
										>
											{slide.subtitle}
										</Text>
										<Group justify='center' style={{ marginTop: '24px' }}>
											<Button component='a' href='https://discord.gg/odessarp' target='_blank' size='lg' leftSection={<DiscordLogo size={20} />} variant='gradient' gradient={{ from: 'indigo', to: 'blue' }}>
												Tilslut vores Discord
											</Button>
											<Button component='a' href='fivem://connect/play.odessarp.com' size='lg' variant='outline' color='white' rightSection={<ArrowRight size={20} />}>
												Forbind til server
											</Button>
										</Group>
									</Box>
								</Box>
							</Container>
						</Center>
					</Box>
				))}

				{/* Slide Indicators */}
				<Box
					style={{
						position: 'absolute',
						bottom: '32px',
						left: 0,
						right: 0,
						zIndex: 10,
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					{slides.map((_, index) => (
						<Box
							key={index}
							style={{
								height: '6px',
								borderRadius: '9999px',
								margin: '0 4px',
								cursor: 'pointer',
								transition: 'all 0.3s',
								width: currentSlide === index ? '2rem' : '1rem',
								backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
							}}
							onClick={() => setCurrentSlide(index)}
						/>
					))}
				</Box>
			</Box>

			{/* Latest Server Stats */}
			<Box
				style={{
					backgroundColor: '#0a0a0a',
					padding: '20px 0',
					borderBottom: '1px solid #222',
				}}
			>
				<Container size='xl'>
					<Grid>
						<Grid.Col span={{ base: 6, md: 3 }}>
							<Box style={{ textAlign: 'center' }}>
								<Text size='sm' c='dimmed'>
									ONLINE SPILLERE
								</Text>
								<Text size='xl' fw={700} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }}>
									{serverStats.onlinePlayers}
								</Text>
							</Box>
						</Grid.Col>
						<Grid.Col span={{ base: 6, md: 3 }}>
							<Box style={{ textAlign: 'center' }}>
								<Text size='sm' c='dimmed'>
									REGISTREREDE SPILLERE
								</Text>
								<Text size='xl' fw={700} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }}>
									{serverStats.totalPlayers}
								</Text>
							</Box>
						</Grid.Col>
						<Grid.Col span={{ base: 6, md: 3 }}>
							<Box style={{ textAlign: 'center' }}>
								<Text size='sm' c='dimmed'>
									WHITELIST MEDLEMMER
								</Text>
								<Text size='xl' fw={700} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }}>
									{serverStats.whitelist}
								</Text>
							</Box>
						</Grid.Col>
						<Grid.Col span={{ base: 6, md: 3 }}>
							<Box style={{ textAlign: 'center' }}>
								<Text size='sm' c='dimmed'>
									SERVER UPTIME
								</Text>
								<Text size='xl' fw={700} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }}>
									{serverStats.uptime}
								</Text>
							</Box>
						</Grid.Col>
					</Grid>
				</Container>
			</Box>

			{/* News & Announcements Section */}
			<Box style={{ padding: '60px 0', backgroundColor: '#070707' }}>
				<Container size='xl'>
					<Grid>
						<Grid.Col span={{ base: 12, md: 8 }}>
							<Box mb='lg'>
								<Group justify='space-between' mb='md'>
									<Title order={3}>
										<Group gap='xs'>
											<Bell size={24} />
											Seneste Nyheder & Meddelelser
										</Group>
									</Title>
									<Button size='sm' variant='subtle' rightSection={<ArrowSquareOut size={16} />}>
										Vis Alle
									</Button>
								</Group>

								<Timeline active={1} bulletSize={24} lineWidth={2}>
									{newsItems.map((item) => (
										<Timeline.Item
											key={item.id}
											bullet={item.type === 'update' ? <Bell size={14} /> : item.type === 'event' ? <Calendar size={14} /> : <Bell size={14} />}
											title={
												<Group>
													<Text fw={600}>{item.title}</Text>
													<Badge size='sm' variant='light' color={item.type === 'update' ? 'blue' : item.type === 'event' ? 'green' : 'orange'}>
														{item.type === 'update' ? 'Opdatering' : item.type === 'event' ? 'Begivenhed' : 'Meddelelse'}
													</Badge>
												</Group>
											}
										>
											<Text size='sm' c='dimmed' mt={4}>
												{new Date(item.date).toLocaleDateString('da-DK', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</Text>
											<Text size='sm' mt='sm'>
												{item.content}
											</Text>
											<Button variant='subtle' size='xs' mt='sm'>
												Læs mere
											</Button>
										</Timeline.Item>
									))}
								</Timeline>
							</Box>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 4 }}>
							<Box>
								<Group justify='space-between' mb='md'>
									<Title order={3}>
										<Group gap='xs'>
											<Star size={24} />
											Fremhævede Spillere
										</Group>
									</Title>
								</Group>

								<Box>
									{featuredPlayers.map((player) => (
										<Card key={player.id} withBorder mb='md' padding='sm'>
											<Group>
												<Avatar src={player.avatarUrl} size='lg' radius='md' />
												<Box>
													<Text fw={600}>{player.name}</Text>
													<Badge size='sm' variant='light' color='indigo'>
														{player.role}
													</Badge>
													<Text size='xs' c='dimmed' mt={4}>
														{player.description}
													</Text>
												</Box>
											</Group>
										</Card>
									))}
								</Box>
							</Box>
						</Grid.Col>
					</Grid>
				</Container>
			</Box>

			{/* About Server Section */}
			<Box
				style={{
					padding: '80px 0',
					backgroundColor: '#0a0a0a',
				}}
			>
				<Container size='xl'>
					<Box
						style={{
							maxWidth: '64rem',
							margin: '0 auto',
							textAlign: 'center',
						}}
					>
						<Badge size='lg' radius='sm' color='blue' variant='light' style={{ marginBottom: '8px' }}>
							Om Vores Server
						</Badge>
						<Title
							order={2}
							style={{
								fontSize: '1.875rem',
								fontWeight: 'bold',
								marginBottom: '16px',
								textAlign: 'center',
							}}
						>
							Oplev OdessaRP
						</Title>
						<Text
							size='lg'
							style={{
								marginBottom: '24px',
								color: '#d1d5db',
								textAlign: 'center',
							}}
						>
							OdessaRP tilbyder en fordybende rollespilsoplevelse i et omhyggeligt udformet bymiljø. Vores server har tilpassede scripts, unikke jobs, spillerejet virksomheder, realistisk økonomi og et dedikeret fællesskab af rollespillere.
						</Text>
						<Text
							size='lg'
							style={{
								marginBottom: '32px',
								color: '#d1d5db',
								textAlign: 'center',
							}}
						>
							Uanset om du vil bekæmpe kriminalitet som politibetjent, redde liv som paramediciner, opbygge et forretningsimperium eller leve livet på kanten i den kriminelle underverden, tilbyder OdessaRP endeløse muligheder for din karakters historie.
						</Text>

						{isAuthorized && (
							<Center>
								<Button variant='gradient' gradient={{ from: 'blue', to: 'indigo' }} size='lg' onClick={() => navigate({ to: '/logs' })} style={{ marginTop: '16px' }}>
									Tilgå Admin Dashboard
								</Button>
							</Center>
						)}
					</Box>
				</Container>
			</Box>

			{/* Server Features Section */}
			<Box style={{ padding: '80px 0' }}>
				<Container size='xl'>
					<Box style={{ textAlign: 'center', marginBottom: '64px' }}>
						<Badge size='lg' radius='sm' color='blue' variant='light' style={{ marginBottom: '8px' }}>
							Server Funktioner
						</Badge>
						<Title
							order={2}
							style={{
								fontSize: '1.875rem',
								fontWeight: 'bold',
								marginBottom: '16px',
								textAlign: 'center',
							}}
						>
							Hvad Gør OdessaRP Speciel
						</Title>
						<Text size='lg' ta='center' w='100%' c='gray.3'>
							Vores server tilbyder en førsteklasses rollespilsoplevelse med tilpassede scripts, køretøjer og lokationer. Udforsk hvad der gør vores fællesskab unikt.
						</Text>
					</Box>

					<Grid>
						{serverFeatures.map((feature, index) => (
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={index}>
								<Card
									padding='xl'
									radius='md'
									withBorder
									style={(theme) => ({
										backgroundColor: theme.colors.dark[8],
										borderColor: theme.colors.dark[5],
										height: '100%',
										transition: 'all 0.3s',
										'&:hover': {
											transform: 'translateY(-5px)',
											borderColor: theme.colors.blue[5],
										},
									})}
								>
									<Box
										style={(theme) => ({
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											marginBottom: '16px',
											padding: '12px',
											borderRadius: '9999px',
											margin: '0 auto',
											backgroundColor: 'rgba(24, 100, 171, 0.1)',
											color: theme.colors.blue[5],
											width: '70px',
											height: '70px',
										})}
									>
										{feature.icon}
									</Box>
									<Title
										order={4}
										style={{
											textAlign: 'center',
											marginBottom: '12px',
										}}
									>
										{feature.title}
									</Title>
									<Text
										style={{
											textAlign: 'center',
											color: '#9ca3af',
										}}
									>
										{feature.description}
									</Text>
								</Card>
							</Grid.Col>
						))}
					</Grid>
				</Container>
			</Box>

			{/* Call to Action Section */}
			<Box
				style={{
					padding: '80px 0',
					textAlign: 'center',
				}}
			>
				<Container size='md'>
					<Title
						order={2}
						style={{
							fontSize: '2.25rem',
							fontWeight: 'bold',
							marginBottom: '24px',
							textAlign: 'center',
						}}
					>
						Klar til at Starte Din Rejse?
					</Title>
					<Text
						size='xl'
						style={{
							marginBottom: '40px',
							color: '#d1d5db',
							maxWidth: '42rem',
							margin: '0 auto 40px',
							textAlign: 'center',
						}}
					>
						Forbind med andre spillere, deltag i events og skab uforglemmelige rollespilsoplevelser i vores fordybende FiveM server.
					</Text>

					<Group justify='center' gap='xl'>
						<Button component='a' href='https://discord.gg/odessarp' target='_blank' size='xl' leftSection={<DiscordLogo size={24} />} variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} style={{ padding: '0 32px' }}>
							Tilslut Vores Discord
						</Button>
						<Button component='a' href='fivem://connect/play.odessarp.com' size='xl' variant='outline' rightSection={<ArrowRight size={24} />} color='blue' style={{ padding: '0 32px' }}>
							Forbind til Server
						</Button>
					</Group>
				</Container>
			</Box>
		</MainLayout>
	);
}
