import { useState, useEffect } from 'react';
import { Container, Box, Title, Text, Button, Group, Paper, Grid, Card, Badge, Center, rgba, darken } from '@mantine/core';
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

	// Slideshow images - replace with actual server images
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
		{ value: '24/7', label: 'Personalestøtte' },
	];

	return (
		<MainLayout requireAuth={false}>
			{/* Hero Section with Slideshow */}
			<Box className='relative overflow-hidden' style={{ height: '80vh', minHeight: '600px' }}>
				{slides.map((slide, index) => (
					<Box
						key={index}
						className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
						style={{
							zIndex: currentSlide === index ? 1 : 0,
						}}
					>
						<Center className='h-full px-6'>
							<Box
								className='absolute w-11/12 h-4/5 rounded-2xl overflow-hidden'
								style={{
									maxWidth: '1800px',
								}}
							>
								<Box
									className='absolute inset-0 w-full h-full'
									style={{
										backgroundImage: `url(${slide.image})`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										filter: 'brightness(0.5) blur(2px)',
										transition: 'transform 6s ease-in-out',
										transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
									}}
								/>
							</Box>

							<Container size='xl' className='relative z-10'>
								<Box
									className='flex flex-col justify-center h-full text-white max-w-3xl my-24'
									style={{
										opacity: isLoaded ? 1 : 0,
										transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
										transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
									}}
								>
									<Box className='text-center'>
										<Badge size='xl' radius='sm' color='blue' className='mb-5' variant='light'>
											FiveM Rollespil Server
										</Badge>
										<Title className='text-6xl font-bold mb-6' style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
											{slide.title}
										</Title>
										<Text className='text-2xl mb-10' style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
											{slide.subtitle}
										</Text>
										<Group justify='center' className='mt-6'>
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
				<Box className='absolute bottom-8 left-0 right-0 z-10 flex justify-center'>
					{slides.map((_, index) => (
						<Box
							key={index}
							className='h-1.5 rounded-full mx-1 cursor-pointer transition-all'
							style={{
								width: currentSlide === index ? '2rem' : '1rem',
								backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
							}}
							onClick={() => setCurrentSlide(index)}
						/>
					))}
				</Box>
			</Box>

			{/* About Server Section */}
			<Box className='py-20 bg-[#0a0a0a]'>
				<Container size='xl'>
					<Box className='mx-auto max-w-4xl text-center'>
						<Badge size='lg' radius='sm' color='blue' className='mb-2' variant='light'>
							Om Vores Server
						</Badge>
						<Title order={2} className='text-3xl font-bold mb-4 text-center'>
							Oplev OdessaRP
						</Title>
						<Text size='lg' className='mb-6 text-gray-300 text-center'>
							OdessaRP tilbyder en fordybende rollespilsoplevelse i et omhyggeligt udformet bymiljø. Vores server har tilpassede scripts, unikke jobs, spillerejet virksomheder, realistisk økonomi og et dedikeret fællesskab af rollespillere.
						</Text>
						<Text size='lg' className='mb-8 text-gray-300 text-center'>
							Uanset om du vil bekæmpe kriminalitet som politibetjent, redde liv som paramediciner, opbygge et forretningsimperium eller leve livet på kanten i den kriminelle underverden, tilbyder OdessaRP endeløse muligheder for din karakters historie.
						</Text>

						{isAuthorized && (
							<Center>
								<Button variant='gradient' gradient={{ from: 'blue', to: 'indigo' }} size='lg' onClick={() => navigate({ to: '/logs' })} className='mt-4'>
									Tilgå Admin Dashboard
								</Button>
							</Center>
						)}
					</Box>
				</Container>
			</Box>

			{/* Server Features Section */}
			<Box className='py-20'>
				<Container size='xl'>
					<Box className='text-center mb-16'>
						<Badge size='lg' radius='sm' color='blue' className='mb-2' variant='light'>
							Server Funktioner
						</Badge>
						<Title order={2} className='text-3xl font-bold mb-4 text-center'>
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
									className='h-full transition-all duration-300 hover:translate-y-[-5px]'
									style={(theme) => ({
										backgroundColor: theme.colors.dark[8],
										borderColor: theme.colors.dark[5],
										'&:hover': {
											borderColor: theme.colors.blue[5],
										},
									})}
								>
									<Box
										className='flex justify-center items-center mb-4 p-3 rounded-full mx-auto'
										style={(theme) => ({
											backgroundColor: rgba(theme.colors.blue[9], 0.1),
											color: theme.colors.blue[5],
											width: '70px',
											height: '70px',
										})}
									>
										{feature.icon}
									</Box>
									<Title order={4} className='text-center mb-3'>
										{feature.title}
									</Title>
									<Text className='text-center text-gray-400'>{feature.description}</Text>
								</Card>
							</Grid.Col>
						))}
					</Grid>
				</Container>
			</Box>

			{/* Statistics Section */}
			<Box
				className='py-20 relative overflow-hidden'
				style={(theme) => ({
					backgroundColor: darken(theme.colors.dark[9], 0.2),
				})}
			>
				<Box
					className='absolute inset-0'
					style={{
						backgroundImage: 'url("/api/placeholder/1920/1080")',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						opacity: 0.2,
						filter: 'blur(8px)',
					}}
				/>

				<Container size='xl' className='relative z-10'>
					<Box className='text-center mb-16'>
						<Badge size='lg' radius='sm' color='blue' className='mb-2' variant='light'>
							Server Statistikker
						</Badge>
						<Title order={2} className='text-3xl font-bold mb-4 text-center'>
							Bliv en Del af Vores Voksende Fællesskab
						</Title>
						<Text size='lg' className='max-w-3xl mx-auto text-gray-300 text-center'>
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
									className='h-full flex flex-col items-center justify-center transition-transform hover:scale-105'
									style={(theme) => ({
										backgroundColor: rgba(theme.colors.dark[8], 0.7),
										backdropFilter: 'blur(10px)',
										borderColor: theme.colors.dark[5],
									})}
								>
									<Text size='3rem' fw={800} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }} className='mb-2 text-center'>
										{stat.value}
									</Text>
									<Text size='lg' c='dimmed' className='text-center'>
										{stat.label}
									</Text>
								</Paper>
							</Grid.Col>
						))}
					</Grid>
				</Container>
			</Box>

			{/* Call to Action Section */}
			<Box className='py-20 text-center'>
				<Container size='md'>
					<Title order={2} className='text-4xl font-bold mb-6 text-center'>
						Klar til at Starte Din Rejse?
					</Title>
					<Text size='xl' className='mb-10 text-gray-300 max-w-2xl mx-auto text-center'>
						Forbind med andre spillere, deltag i events og skab uforglemmelige rollespilsoplevelser i vores fordybende FiveM server.
					</Text>

					<Group justify='center' gap='xl'>
						<Button component='a' href='https://discord.gg/odessarp' target='_blank' size='xl' leftSection={<DiscordLogo size={24} />} variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} className='px-8'>
							Tilslut Vores Discord
						</Button>
						<Button component='a' href='fivem://connect/play.odessarp.com' size='xl' variant='outline' rightSection={<ArrowRight size={24} />} color='blue' className='px-8'>
							Forbind til Server
						</Button>
					</Group>
				</Container>
			</Box>
		</MainLayout>
	);
}
