import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Paper, Group, SimpleGrid, Card, RingProgress, Tabs, Loader, Center, SegmentedControl, Badge } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../components/AuthProvider';
import { Users, Car, DoorOpen, Clock, ShoppingBag, CreditCard, Handshake, Siren, Heartbeat, Money } from '@phosphor-icons/react';
import { format, subDays } from 'date-fns';

interface ServerStats {
	totalPlayers: number;
	newPlayers24h: number;
	activePlayers7d: number;
	totalPlaytime: number;
	averagePlaytime: number;
	totalVehicles: number;
	totalMoney: number;
	totalProperties: number;
}

interface ActivityData {
	date: string;
	value: number;
	category: string;
}

interface PlayerDistribution {
	category: string;
	count: number;
	color: string;
}

export default function PlayerStatisticsPage() {
	const { isAuthorized } = useAuth();
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
	const [activeTab, setActiveTab] = useState<string | null>('overview');
	const [serverStats, setServerStats] = useState<ServerStats>({
		totalPlayers: 0,
		newPlayers24h: 0,
		activePlayers7d: 0,
		totalPlaytime: 0,
		averagePlaytime: 0,
		totalVehicles: 0,
		totalMoney: 0,
		totalProperties: 0,
	});

	const [_activityData, setActivityData] = useState<ActivityData[]>([]);
	const [playerDistribution, setPlayerDistribution] = useState<PlayerDistribution[]>([]);

	useEffect(() => {
		fetchStats();
	}, []);

	useEffect(() => {
		fetchActivityData(timeRange);
	}, [timeRange]);

	const fetchStats = async () => {
		setLoading(true);
		try {
			setTimeout(() => {
				setServerStats({
					totalPlayers: 2453,
					newPlayers24h: 34,
					activePlayers7d: 752,
					totalPlaytime: 13450,
					averagePlaytime: 42,
					totalVehicles: 5891,
					totalMoney: 243567890,
					totalProperties: 892,
				});

				setPlayerDistribution([
					{ category: 'Civilian', count: 870, color: '#4299E1' },
					{ category: 'Criminal', count: 523, color: '#F56565' },
					{ category: 'Police', count: 245, color: '#3182CE' },
					{ category: 'EMS', count: 178, color: '#ED64A6' },
					{ category: 'Mechanic', count: 134, color: '#ECC94B' },
					{ category: 'Other', count: 503, color: '#A0AEC0' },
				]);

				setLoading(false);
			}, 1000);
		} catch (error) {
			console.error('Error fetching server stats:', error);
			setLoading(false);
		}
	};

	const fetchActivityData = (range: '24h' | '7d' | '30d') => {
		const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;
		const data: ActivityData[] = [];

		for (let i = days; i >= 0; i--) {
			const date = subDays(new Date(), i);
			const dateStr = format(date, 'yyyy-MM-dd');

			data.push({
				date: dateStr,
				value: Math.floor(Math.random() * 120) + 50,
				category: 'Logins',
			});

			data.push({
				date: dateStr,
				value: Math.floor(Math.random() * 40) + 10,
				category: 'Crimes',
			});

			data.push({
				date: dateStr,
				value: Math.floor(Math.random() * 200) + 100,
				category: 'Transactions',
			});
		}

		setActivityData(data);
	};

	const formatNumber = (num: number): string => {
		return new Intl.NumberFormat('da-DK').format(num);
	};

	const formatCurrency = (num: number): string => {
		return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(num);
	};

	const formatTime = (minutes: number): string => {
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days} dage`;
		} else {
			return `${hours} timer`;
		}
	};

	if (loading) {
		return (
			<MainLayout requireAuth={isAuthorized}>
				<Center style={{ height: 'calc(100vh - 100px)' }}>
					<Loader size='xl' />
				</Center>
			</MainLayout>
		);
	}

	const calculatePercentage = (count: number): number => {
		const total = playerDistribution.reduce((acc, item) => acc + item.count, 0);
		return Math.round((count / total) * 100);
	};

	return (
		<MainLayout requireAuth={true} requiredPermission='admin'>
			<Container size='xl' py='xl'>
				<Paper shadow='md' p='md' radius='md' withBorder mb='xl'>
					<Group justify='space-between' mb='md'>
						<Box>
							<Title order={2}>Spiller Statistik</Title>
							<Text c='dimmed'>Detaljeret oversigt over spiller aktivitet og tendenser</Text>
						</Box>

						<SegmentedControl
							value={timeRange}
							onChange={(value: string) => setTimeRange(value as '24h' | '7d' | '30d')}
							data={[
								{ label: 'Seneste 24 timer', value: '24h' },
								{ label: 'Seneste 7 dage', value: '7d' },
								{ label: 'Seneste 30 dage', value: '30d' },
							]}
						/>
					</Group>

					<Tabs value={activeTab} onChange={setActiveTab}>
						<Tabs.List mb='md'>
							<Tabs.Tab value='overview' leftSection={<Users size={16} />}>
								Overblik
							</Tabs.Tab>
							<Tabs.Tab value='activity' leftSection={<Clock size={16} />}>
								Aktivitet
							</Tabs.Tab>
							<Tabs.Tab value='economy' leftSection={<Money size={16} />}>
								Økonomi
							</Tabs.Tab>
							<Tabs.Tab value='jobs' leftSection={<Handshake size={16} />}>
								Jobs
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='overview'>
							<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md' mb='md'>
								<Card shadow='sm' p='lg' radius='md' withBorder>
									<Group>
										<Box style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(66, 153, 225, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<Users size={28} color='#4299E1' />
										</Box>
										<Box>
											<Text c='dimmed' size='xs' tt='uppercase' fw={700}>
												Total Spillere
											</Text>
											<Text fw={700} size='xl'>
												{formatNumber(serverStats.totalPlayers)}
											</Text>
										</Box>
									</Group>
								</Card>

								<Card shadow='sm' p='lg' radius='md' withBorder>
									<Group>
										<Box style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(72, 187, 120, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<DoorOpen size={28} color='#48BB78' />
										</Box>
										<Box>
											<Text c='dimmed' size='xs' tt='uppercase' fw={700}>
												Nye Spillere (24t)
											</Text>
											<Text fw={700} size='xl'>
												{formatNumber(serverStats.newPlayers24h)}
											</Text>
										</Box>
									</Group>
								</Card>

								<Card shadow='sm' p='lg' radius='md' withBorder>
									<Group>
										<Box style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(237, 100, 166, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<Clock size={28} color='#ED64A6' />
										</Box>
										<Box>
											<Text c='dimmed' size='xs' tt='uppercase' fw={700}>
												Gns. Spilletid
											</Text>
											<Text fw={700} size='xl'>
												{formatTime(serverStats.averagePlaytime)}
											</Text>
										</Box>
									</Group>
								</Card>

								<Card shadow='sm' p='lg' radius='md' withBorder>
									<Group>
										<Box style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(236, 201, 75, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<ShoppingBag size={28} color='#ECC94B' />
										</Box>
										<Box>
											<Text c='dimmed' size='xs' tt='uppercase' fw={700}>
												Aktive Spillere (7d)
											</Text>
											<Text fw={700} size='xl'>
												{formatNumber(serverStats.activePlayers7d)}
											</Text>
										</Box>
									</Group>
								</Card>
							</SimpleGrid>

							<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
								<Card shadow='sm' radius='md' withBorder p='md'>
									<Title order={4} mb='md'>
										Spillerfordeling
									</Title>
									<Group align='flex-start'>
										<Box style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
											{playerDistribution.map((item, index) => (
												<Card key={index} p='xs' radius='md' style={{ flex: '1 0 45%', minWidth: '120px' }}>
													<Group>
														<RingProgress
															size={60}
															thickness={5}
															roundCaps
															sections={[{ value: calculatePercentage(item.count), color: item.color }]}
															label={
																<Text ta='center' size='xs' fw={700}>
																	{calculatePercentage(item.count)}%
																</Text>
															}
														/>
														<Box>
															<Text fw={500}>{item.category}</Text>
															<Text size='sm' c='dimmed'>
																{formatNumber(item.count)} spillere
															</Text>
														</Box>
													</Group>
												</Card>
											))}
										</Box>
									</Group>
								</Card>

								<Card shadow='sm' radius='md' withBorder p='md'>
									<Title order={4} mb='md'>
										Ressource Statistik
									</Title>
									<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
										<Card p='xs' radius='md'>
											<Group>
												<Car size={24} color='#4299E1' />
												<Box>
													<Text fw={500}>Køretøjer</Text>
													<Text size='lg'>{formatNumber(serverStats.totalVehicles)}</Text>
												</Box>
											</Group>
										</Card>

										<Card p='xs' radius='md'>
											<Group>
												<CreditCard size={24} color='#48BB78' />
												<Box>
													<Text fw={500}>Total Økonomi</Text>
													<Text size='lg'>{formatCurrency(serverStats.totalMoney)}</Text>
												</Box>
											</Group>
										</Card>

										<Card p='xs' radius='md'>
											<Group>
												<ShoppingBag size={24} color='#F56565' />
												<Box>
													<Text fw={500}>Ejede Ejendomme</Text>
													<Text size='lg'>{formatNumber(serverStats.totalProperties)}</Text>
												</Box>
											</Group>
										</Card>

										<Card p='xs' radius='md'>
											<Group>
												<Clock size={24} color='#ED64A6' />
												<Box>
													<Text fw={500}>Total Spilletid</Text>
													<Text size='lg'>{formatTime(serverStats.totalPlaytime)}</Text>
												</Box>
											</Group>
										</Card>
									</SimpleGrid>
								</Card>
							</SimpleGrid>
						</Tabs.Panel>

						<Tabs.Panel value='activity'>
							<Paper withBorder p='md' radius='md' mb='md'>
								<Title order={4} mb='md'>
									Spiller Aktivitet over tid
								</Title>
								<Box h={300}>
									<Text ta='center' c='dimmed'>
										[Chart would be displayed here with player activity data]
									</Text>
								</Box>
							</Paper>

							<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
								<Card withBorder p='md' radius='md'>
									<Group mb='xs'>
										<DoorOpen size={20} color='#4299E1' />
										<Text fw={500}>Logins Fordeling</Text>
									</Group>
									<Box h={200}>
										<Text ta='center' c='dimmed'>
											[Login distribution chart]
										</Text>
									</Box>
								</Card>

								<Card withBorder p='md' radius='md'>
									<Group mb='xs'>
										<Siren size={20} color='#F56565' />
										<Text fw={500}>Kriminel Aktivitet</Text>
									</Group>
									<Box h={200}>
										<Text ta='center' c='dimmed'>
											[Criminal activity chart]
										</Text>
									</Box>
								</Card>

								<Card withBorder p='md' radius='md'>
									<Group mb='xs'>
										<Heartbeat size={20} color='#48BB78' />
										<Text fw={500}>Ambulance Udkald</Text>
									</Group>
									<Box h={200}>
										<Text ta='center' c='dimmed'>
											[Ambulance callout chart]
										</Text>
									</Box>
								</Card>
							</SimpleGrid>
						</Tabs.Panel>

						<Tabs.Panel value='economy'>
							<Paper withBorder p='md' radius='md' mb='md'>
								<Title order={4} mb='md'>
									Økonomisk Aktivitet
								</Title>
								<Box h={300}>
									<Text ta='center' c='dimmed'>
										[Economic activity chart]
									</Text>
								</Box>
							</Paper>

							<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
								<Card withBorder p='md' radius='md'>
									<Title order={4} mb='md'>
										Største Transaktioner
									</Title>
									<Text c='dimmed'>Data under udarbejdelse...</Text>
								</Card>

								<Card withBorder p='md' radius='md'>
									<Title order={4} mb='md'>
										Rigeste Spillere
									</Title>
									<Text c='dimmed'>Data under udarbejdelse...</Text>
								</Card>
							</SimpleGrid>
						</Tabs.Panel>

						<Tabs.Panel value='jobs'>
							<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md' mb='md'>
								<Card withBorder p='md' radius='md'>
									<Title order={4} mb='md'>
										Job Popularitet
									</Title>
									<Box h={300}>
										<Text ta='center' c='dimmed'>
											[Job popularity chart]
										</Text>
									</Box>
								</Card>

								<Card withBorder p='md' radius='md'>
									<Title order={4} mb='md'>
										Job Indtjening (Gennemsnit)
									</Title>
									<Box h={300}>
										<Text ta='center' c='dimmed'>
											[Average job earnings chart]
										</Text>
									</Box>
								</Card>
							</SimpleGrid>

							<Card withBorder p='md' radius='md'>
								<Title order={4} mb='md'>
									Kommende Job Begivenheder
								</Title>
								<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
									<Card shadow='sm' p='md' radius='md' withBorder>
										<Group justify='space-between' mb='xs'>
											<Text fw={500}>Politiet Rekrutterer</Text>
											<Badge color='blue'>Mandag 21:00</Badge>
										</Group>
										<Text size='sm' c='dimmed' mb='md'>
											Informationsmøde og optagelsesprøve for nye politibetjente. Mødested: Mission Row PD
										</Text>
									</Card>

									<Card shadow='sm' p='md' radius='md' withBorder>
										<Group justify='space-between' mb='xs'>
											<Text fw={500}>EMS Workshop</Text>
											<Badge color='pink'>Tirsdag 19:30</Badge>
										</Group>
										<Text size='sm' c='dimmed' mb='md'>
											Oplæring i avanceret førstehjælp for medicstuderende. Mødested: Pillbox Hospital
										</Text>
									</Card>

									<Card shadow='sm' p='md' radius='md' withBorder>
										<Group justify='space-between' mb='xs'>
											<Text fw={500}>Mekaniker Certificering</Text>
											<Badge color='yellow'>Torsdag 20:00</Badge>
										</Group>
										<Text size='sm' c='dimmed' mb='md'>
											Certificeringsforløb for nye mekanikere. Mødested: Benny's Original Motor Works
										</Text>
									</Card>
								</SimpleGrid>
							</Card>
						</Tabs.Panel>
					</Tabs>
				</Paper>
			</Container>
		</MainLayout>
	);
}
