import { useState, useEffect } from 'react';
import { Container, Box, Title, Text, Button, Group, Paper, Grid, Card, Image, Badge, rgba, darken } from '@mantine/core';
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

	const slides = [
		{
			image: './2.webp',
			title: 'Welcome to OdessaRP',
			subtitle: 'Experience Immersive Roleplay',
		},
		{
			image: './4.webp',
			title: 'Dynamic Economy',
			subtitle: 'Build Your Empire in Our City',
		},
		{
			image: './8.webp',
			title: 'Custom Vehicles',
			subtitle: 'Drive in Style with Exclusive Cars',
		},
		{
			image: './15.webp',
			title: 'Join Our Community',
			subtitle: 'Create Unforgettable Stories',
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
			title: 'Active Community',
			description: 'Join our thriving community of roleplayers creating immersive experiences together.',
		},
		{
			icon: <Car size={36} weight='duotone' />,
			title: 'Custom Vehicles',
			description: 'Choose from our extensive collection of custom vehicles with unique handling and modifications.',
		},
		{
			icon: <Buildings size={36} weight='duotone' />,
			title: 'Economy System',
			description: 'Engage in a realistic economy with jobs, businesses, and property ownership.',
		},
		{
			icon: <ShieldCheck size={36} weight='duotone' />,
			title: 'Professional Staff',
			description: '24/7 support from our dedicated staff team ensuring a safe and enjoyable experience.',
		},
		{
			icon: <Calendar size={36} weight='duotone' />,
			title: 'Regular Events',
			description: 'Participate in weekly community events, competitions, and special roleplay scenarios.',
		},
		{
			icon: <GameController size={36} weight='duotone' />,
			title: 'Custom Scripts',
			description: 'Enjoy unique gameplay features with our custom-developed server scripts.',
		},
	];

	const serverStats = [
		{ value: '5000+', label: 'Registered Players' },
		{ value: '100+', label: 'Custom Vehicles' },
		{ value: '50+', label: 'Business Options' },
		{ value: '24/7', label: 'Staff Support' },
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
						<Box
							className='absolute inset-0 w-full h-full'
							style={{
								backgroundImage: `url(${slide.image})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								filter: 'brightness(0.6)',
								transition: 'transform 6s ease-in-out',
								transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
							}}
						/>
						<Container size='xl' className='relative h-full z-10'>
							<Box
								className='flex flex-col justify-center h-full text-white max-w-3xl'
								style={{
									opacity: isLoaded ? 1 : 0,
									transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
									transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
								}}
							>
								<Box>
									<Badge size='xl' radius='sm' color='blue' className='mb-4' variant='filled'>
										FiveM Roleplay Server
									</Badge>
									<Title className='text-6xl font-bold mb-4' style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
										{slide.title}
									</Title>
									<Text className='text-2xl mb-8' style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
										{slide.subtitle}
									</Text>
									<Group>
										<Button component='a' href='https://discord.gg/odessarp' target='_blank' size='lg' leftSection={<DiscordLogo size={20} />} variant='gradient' gradient={{ from: 'indigo', to: 'blue' }}>
											Join Our Discord
										</Button>
										<Button component='a' href='fivem://connect/play.odessarp.com' size='lg' variant='outline' color='white' rightSection={<ArrowRight size={20} />}>
											Connect to Server
										</Button>
									</Group>
								</Box>
							</Box>
						</Container>
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
					<Grid gutter='xl'>
						<Grid.Col span={{ base: 12, md: 6 }} className='flex flex-col justify-center'>
							<Badge size='lg' radius='sm' color='blue' className='mb-2' variant='filled'>
								About Our Server
							</Badge>
							<Title order={2} className='text-3xl font-bold mb-4'>
								Experience OdessaRP
							</Title>
							<Text size='lg' className='mb-6 text-gray-300'>
								OdessaRP provides an immersive roleplaying experience in a meticulously crafted city environment. Our server features custom scripts, unique jobs, player-owned businesses, realistic economy, and a dedicated community of roleplayers.
							</Text>
							<Text size='lg' className='mb-6 text-gray-300'>
								Whether you want to fight crime as a police officer, save lives as a paramedic, build a business empire, or live life on the edge in the criminal underworld, OdessaRP offers endless possibilities for your character's story.
							</Text>

							{isAuthorized && (
								<Button variant='gradient' gradient={{ from: 'blue', to: 'indigo' }} size='lg' onClick={() => navigate({ to: '/logs' })} className='mt-4 self-start'>
									Access Admin Dashboard
								</Button>
							)}
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 6 }}>
							<Box className='rounded-xl overflow-hidden relative'>
								<Image src='/api/placeholder/800/600' alt='OdessaRP Gameplay' className='w-full h-full object-cover' />
								<Box className='absolute inset-0 flex items-center justify-center'>
									<Box
										className='w-20 h-20 rounded-full flex items-center justify-center cursor-pointer'
										style={(theme) => ({
											backgroundColor: theme.colors.blue[5],
											'&:hover': {
												backgroundColor: theme.colors.blue[6],
											},
										})}
									>
										<Box
											className='w-0 h-0 ml-2'
											style={{
												borderTop: '15px solid transparent',
												borderBottom: '15px solid transparent',
												borderLeft: '25px solid white',
											}}
										/>
									</Box>
								</Box>
							</Box>
						</Grid.Col>
					</Grid>
				</Container>
			</Box>

			{/* Server Features Section */}
			<Box className='py-20'>
				<Container size='xl'>
					<Box className='text-center mb-16'>
						<Badge size='lg' radius='sm' color='blue' className='mb-2' variant='filled'>
							Server Features
						</Badge>
						<Title order={2} className='text-3xl font-bold mb-4'>
							What Makes OdessaRP Special
						</Title>
						<Text size='lg' className='max-w-3xl mx-auto text-gray-300'>
							Our server offers a premium roleplaying experience with custom scripts, vehicles, and locations. Explore what makes our community stand out.
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
										backgroundColor: 'dark.8',
										borderColor: 'dark.5',
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
						<Badge size='lg' radius='sm' color='blue' className='mb-2' variant='filled'>
							Server Statistics
						</Badge>
						<Title order={2} className='text-3xl font-bold mb-4'>
							Join Our Growing Community
						</Title>
						<Text size='lg' className='max-w-3xl mx-auto text-gray-300'>
							OdessaRP continues to expand with new players, features, and experiences. Become part of our story today.
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
									<Text size='3rem' fw={800} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }} className='mb-2'>
										{stat.value}
									</Text>
									<Text size='lg' c='dimmed'>
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
					<Title order={2} className='text-4xl font-bold mb-6'>
						Ready to Start Your Journey?
					</Title>
					<Text size='xl' className='mb-10 text-gray-300 max-w-2xl mx-auto'>
						Connect with other players, participate in events, and create unforgettable roleplay experiences in our immersive FiveM server.
					</Text>

					<Group justify='center' gap='xl'>
						<Button component='a' href='https://discord.gg/odessarp' target='_blank' size='xl' leftSection={<DiscordLogo size={24} />} variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} className='px-8'>
							Join Our Discord
						</Button>
						<Button component='a' href='fivem://connect/play.odessarp.com' size='xl' variant='outline' rightSection={<ArrowRight size={24} />} color='blue' className='px-8'>
							Connect to Server
						</Button>
					</Group>
				</Container>
			</Box>
		</MainLayout>
	);
}
