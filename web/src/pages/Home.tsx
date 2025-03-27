import { useState, useEffect } from 'react';
import { Container, Box, Title, Text, Button, Group, Paper, Grid, Card, Badge, Center } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Users, Car, Buildings, Calendar, ShieldCheck, GameController, ArrowRight, DiscordLogo } from '@phosphor-icons/react';

export default function HomePage() {
	const { isAuthorized } = useAuth();
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);

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

	const serverStats = [
		{ value: '5000+', label: 'Registrerede Spillere' },
		{ value: '100+', label: 'Tilpassede Køretøjer' },
		{ value: '50+', label: 'Virksomhedsmuligheder' },
		{ value: '24/7', label: 'Mulighed for support' },
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

			{/* Statistics Section */}
			<Box
				style={() => ({
					padding: '80px 0',
					position: 'relative',
					overflow: 'hidden',
					backgroundColor: '#090909',
				})}
			>
				<Box
					style={{
						position: 'absolute',
						inset: 0,
						backgroundImage: 'url("./1.webp")',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						opacity: 0.2,
						filter: 'blur(8px)',
					}}
				/>

				<Container size='xl' style={{ position: 'relative', zIndex: 10 }}>
					<Box style={{ textAlign: 'center', marginBottom: '64px' }}>
						<Badge size='lg' radius='sm' color='blue' variant='light' style={{ marginBottom: '8px' }}>
							Server Statistikker
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
							Bliv en Del af Vores Voksende Fællesskab
						</Title>
						<Text
							size='lg'
							style={{
								maxWidth: '48rem',
								margin: '0 auto',
								color: '#d1d5db',
								textAlign: 'center',
							}}
						>
							OdessaRP fortsætter med at udvide med nye spillere, funktioner og oplevelser. Bliv en del af vores historie i dag.
						</Text>
					</Box>

					<Grid>
						{serverStats.map((stat, index) => (
							<Grid.Col span={{ base: 6, md: 3 }} key={index}>
								<Paper
									p='xl'
									radius='md'
									withBorder
									style={(theme) => ({
										backgroundColor: 'rgba(26, 26, 26, 0.7)',
										backdropFilter: 'blur(10px)',
										borderColor: theme.colors.dark[5],
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										transition: 'transform 0.3s',
										'&:hover': {
											transform: 'scale(1.05)',
										},
									})}
								>
									<Text
										style={{
											fontSize: '3rem',
											fontWeight: 800,
											marginBottom: '8px',
											textAlign: 'center',
										}}
										variant='gradient'
										gradient={{ from: 'blue', to: 'cyan' }}
									>
										{stat.value}
									</Text>
									<Text size='lg' c='dimmed' style={{ textAlign: 'center' }}>
										{stat.label}
									</Text>
								</Paper>
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
