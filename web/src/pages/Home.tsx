import { useState, useEffect } from 'react';
import { Container, Box, Title, Text, Button, Group, Grid, Card, Badge, Center, Avatar, Timeline, Modal, Divider, SimpleGrid, ActionIcon } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Users, Car, Buildings, Calendar, ShieldCheck, GameController, ArrowRight, DiscordLogo, Bell, Star, CalendarCheck, PushPin, Megaphone } from '@phosphor-icons/react';
import axios from 'axios';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface NewsItem {
	id: number;
	title: string;
	content: string;
	fullContent?: string;
	date: string;
	type: 'update' | 'event' | 'announcement';
	locationName?: string;
	locationAddress?: string;
	organizer?: string;
	imageUrl?: string;
}

interface FeaturedPlayer {
	id: number;
	name: string;
	avatarUrl: string;
	role: string;
	description: string;
}

interface PinnedItem {
	id: string;
	type: 'news' | 'event';
	title: string;
	description: string;
	date: Date;
	newsType?: 'update' | 'announcement' | 'changelog';
	eventType?: 'community' | 'official' | 'special';
	eventDate?: Date;
	location?: string;
}

export default function HomePage() {
	const { isAuthorized } = useAuth();
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const [serverStats, setServerStats] = useState({
		onlinePlayers: 0,
		maxPlayers: 0,
		whitelistCount: 0,
		status: 'offline',
	});
	const [newsModalOpen, setNewsModalOpen] = useState(false);
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
	const [pinnedItems, _setPinnedItems] = useState<PinnedItem[]>([
		{
			id: '1',
			type: 'news',
			title: 'Server Update 3.5',
			description: 'New vehicles, weapons, and optimizations have been added to the server.',
			date: new Date('2025-03-25'),
			newsType: 'update',
		},
		{
			id: '3',
			type: 'news',
			title: 'New Police Chief Appointed',
			description: 'Congratulations to Officer Johnson on being appointed as the new Police Chief!',
			date: new Date('2025-03-22'),
			newsType: 'announcement',
		},
		{
			id: '4',
			type: 'event',
			title: 'Bilshow i Vinewood',
			description: 'Det årlige vinewood bilshow hvor du kan vise dine bedste biler frem.',
			date: new Date('2025-03-20'),
			eventType: 'official',
			eventDate: new Date('2025-03-29T18:00:00'),
			location: 'Vinewood Bowl',
		},
	]);

	const newsItems: NewsItem[] = [
		{
			id: 1,
			title: 'Server Update 3.5',
			content: 'New vehicles, weapons, and optimizations have been added to the server.',
			fullContent: 'Vi er glade for at annoncere den nyeste opdatering til OdessaRP, version 3.5! Denne opdatering bringer en række spændende forbedringer til serveren. \n\nNye køretøjer inkluderer Übermacht Cypher, Pfister Comet S2 og Dinka Jester RR. Alle køretøjer kommer med komplette tuningmuligheder og unikke handlinger. \n\nVi har også tilføjet nye våben, herunder Heavy Rifle og Combat Shotgun, som kan købes lovligt med de rette licenser. Våbenmodifikationer er også blevet opdateret, så du kan tilpasse dine våben endnu mere. \n\nServeroptimeringer omfatter forbedret performance i Downtown-området, reduceret ressourceforbrug, og forbedrede NPC-rutiner der giver en mere realistisk oplevelse. \n\nHusk at melde eventuelle bugs i vores Discord under #bug-rapport kanalen.',
			date: '2025-03-25',
			type: 'update',
			organizer: 'OdessaRP Admin Team',
		},
		{
			id: 2,
			title: 'Weekend Event: Car Show',
			content: 'Join us at the Vinewood Bowl for a car show this weekend. Cash prizes for best vehicles!',
			fullContent: 'Vinewood Bowl Car Show - den mest ventede bilbegivenhed i byen! \n\nKom og vis din bedste bil frem og deltag i konkurrencen om store pengepræmier! Vi har flere kategorier: Bedste Muscle Car, Bedste Sport/Super, Bedste Import, Bedste Klassiker, og Bedste Modification. \n\nHovedpræmien er $50.000 i spilpenge til vinderne, plus ekstra bonuspræmier fra vores sponsorer. Alle deltagende køretøjer vil blive bedømt af et panel af erfarne bilentusiaster fra serveren. \n\nUd over konkurrencen vil der være livemusik, mad og drikkevarer, plus mulighed for at netværke med andre bilentusiaster og forhandlere i byen. \n\nTilmelding starter en time før showet begynder, så kom i god tid for at sikre dig en plads!',
			date: '2025-03-30',
			type: 'event',
			locationName: 'Vinewood Bowl',
			locationAddress: 'Vinewood Hills, Los Santos',
			organizer: 'Los Santos Car Club',
			imageUrl: '/api/placeholder/400/200',
		},
		{
			id: 3,
			title: 'New Police Chief Appointed',
			content: 'Congratulations to Officer Johnson on being appointed as the new Police Chief!',
			fullContent: 'Det er med stor glæde at OdessaRP kan annoncere udnævnelsen af Sarah Johnson som vores nye politichef! \n\nEfter flere års dedikeret tjeneste på serveren, har Sarah bevist sit værd gennem eksemplarisk lederskab, retfærdig håndhævelse af loven, og en stærk forpligtelse til samfundet. \n\nUnder hendes ledelse planlægger politistyrken at implementere flere community-orienterede initiativer, herunder regelmæssige "Mød din betjent"-begivenheder, udvidede patruljeringer i højrisikoområder, og nye rekrutteringsprogrammer. \n\nVi ønsker Sarah tillykke med denne velfortjente udnævnelse, og ser frem til at opleve hendes vision for byens sikkerhed og retfærdighed udfolde sig.',
			date: '2025-03-22',
			type: 'announcement',
			organizer: 'Byrådet',
		},
	];

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

	useEffect(() => {
		const fetchServerStats = async () => {
			try {
				const response = await axios.get('/api/server-stats');
				setServerStats(response.data);
				console.log('Server stats:', response.data);
			} catch (error) {
				console.error('Failed to fetch server stats:', error);

				setServerStats({
					onlinePlayers: 0,
					maxPlayers: 0,
					whitelistCount: 0,
					status: 'offline',
				});
			}
		};

		fetchServerStats();
	}, []);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

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

	const openNewsModal = (news: NewsItem) => {
		setSelectedNews(news);
		setNewsModalOpen(true);
	};

	const closeNewsModal = () => {
		setNewsModalOpen(false);
		setTimeout(() => setSelectedNews(null), 300);
	};

	const getNewsTypeColor = (type: string) => {
		switch (type) {
			case 'update':
				return 'blue';
			case 'event':
				return 'green';
			case 'announcement':
				return 'orange';
			default:
				return 'gray';
		}
	};

	const getNewsTypeLabel = (type: string) => {
		switch (type) {
			case 'update':
				return 'Opdatering';
			case 'event':
				return 'Begivenhed';
			case 'announcement':
				return 'Meddelelse';
			default:
				return 'Info';
		}
	};

	return (
		<MainLayout requireAuth={false}>
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
									width: '99.666667%',
									height: '88%',
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

			{pinnedItems.length > 0 && (
				<Box
					style={{
						backgroundColor: '#070707',
						padding: '40px 0',
						borderBottom: '1px solid #222',
					}}
				>
					<Container size='xl'>
						<Group justify='space-between' mb='md'>
							<Group>
								<PushPin size={24} />
								<Title order={3}>Vigtige Meddelelser</Title>
							</Group>
							<Button variant='subtle' rightSection={<ArrowRight size={16} />} onClick={() => navigate({ to: '/events' })}>
								Se alle nyheder og events
							</Button>
						</Group>

						<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
							{pinnedItems.map((item) => (
								<Card key={item.id} withBorder shadow='sm' padding='md' radius='md' bg='dark.8'>
									<Card.Section withBorder inheritPadding py='xs'>
										<Group justify='space-between'>
											<Badge color={item.type === 'news' ? (item.newsType === 'update' ? 'blue' : item.newsType === 'changelog' ? 'green' : 'orange') : item.eventType === 'official' ? 'blue' : item.eventType === 'community' ? 'green' : 'purple'} leftSection={item.type === 'news' ? <Megaphone size={14} /> : <CalendarCheck size={14} />}>
												{item.type === 'news' ? (item.newsType === 'update' ? 'Opdatering' : item.newsType === 'changelog' ? 'Changelog' : 'Meddelelse') : item.eventType === 'official' ? 'Officiel Begivenhed' : item.eventType === 'community' ? 'Fællesskab' : 'Special Event'}
											</Badge>
											<ActionIcon color='blue' variant='subtle'>
												<PushPin size={16} weight='fill' />
											</ActionIcon>
										</Group>
									</Card.Section>

									<Text fw={700} size='lg' mt='md' mb='xs' lineClamp={1}>
										{item.title}
									</Text>

									{item.type === 'event' && item.eventDate && (
										<Text size='sm' c='dimmed' mb='xs'>
											{format(item.eventDate, 'd. MMMM yyyy, HH:mm', { locale: da })}
											{item.location && ` • ${item.location}`}
										</Text>
									)}

									{item.type === 'news' && (
										<Text size='sm' c='dimmed' mb='xs'>
											{format(item.date, 'd. MMMM yyyy', { locale: da })}
										</Text>
									)}

									<Text size='sm' lineClamp={2} mb='md'>
										{item.description}
									</Text>

									<Button
										variant='light'
										fullWidth
										mt='auto'
										onClick={() => {
											navigate({ to: '/events' });
										}}
									>
										Læs mere
									</Button>
								</Card>
							))}
						</SimpleGrid>
					</Container>
				</Box>
			)}

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
									<Button variant='subtle' rightSection={<ArrowRight size={16} />} onClick={() => navigate({ to: '/events' })}>
										Se alle begivenheder
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
													<Badge size='sm' variant='light' color={getNewsTypeColor(item.type)}>
														{getNewsTypeLabel(item.type)}
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
											<Button variant='subtle' size='xs' mt='sm' onClick={() => openNewsModal(item)}>
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
										<Card key={player.id} withBorder mb='md' padding='sm' bg='dark.8'>
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
									h={240}
									bg='dark.8'
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

			<Modal
				opened={newsModalOpen}
				onClose={closeNewsModal}
				title={
					<Group>
						<Badge color={selectedNews ? getNewsTypeColor(selectedNews.type) : 'gray'} size='lg'>
							{selectedNews ? getNewsTypeLabel(selectedNews.type) : ''}
						</Badge>
						<Text fw={700}>{selectedNews?.title}</Text>
					</Group>
				}
				size='lg'
				centered
			>
				{selectedNews && (
					<Box>
						<Group mb='md'>
							<CalendarCheck size={18} />
							<Text>{format(new Date(selectedNews.date), 'd. MMMM yyyy', { locale: da })}</Text>
						</Group>

						{selectedNews.organizer && (
							<Text size='sm' c='dimmed' mb='md'>
								Arrangør: {selectedNews.organizer}
							</Text>
						)}

						{selectedNews.locationName && (
							<Group mb='md'>
								<Text fw={500}>Sted:</Text>
								<Text>
									{selectedNews.locationName}
									{selectedNews.locationAddress && `, ${selectedNews.locationAddress}`}
								</Text>
							</Group>
						)}

						{selectedNews.imageUrl && (
							<Box mb='md'>
								<img
									src={selectedNews.imageUrl}
									alt={selectedNews.title}
									style={{
										width: '100%',
										borderRadius: '8px',
										marginBottom: '16px',
									}}
								/>
							</Box>
						)}

						<Divider my='md' />

						<Text style={{ whiteSpace: 'pre-line' }}>{selectedNews.fullContent || selectedNews.content}</Text>

						{selectedNews.type === 'event' && (
							<Button
								fullWidth
								variant='gradient'
								gradient={{ from: 'blue', to: 'cyan' }}
								mt='xl'
								onClick={() => {
									closeNewsModal();
									navigate({ to: '/events' });
								}}
							>
								Se alle begivenheder
							</Button>
						)}
					</Box>
				)}
			</Modal>
		</MainLayout>
	);
}
