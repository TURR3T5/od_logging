import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '@tanstack/react-router';
import { Container, Title, Text, Paper, Group, Box, Tabs, Menu, Button, Tooltip, SimpleGrid, Card, Badge } from '@mantine/core';
import { DownloadSimple, ChartPie, ListBullets, BookmarkSimple } from '@phosphor-icons/react';
import { AreaChart, BarChart, PieChart } from '@mantine/charts';
import MainLayout from '../layouts/MainLayout';
import LogTable from '../components/LogTable';

export interface Log {
	id: string;
	created_at: string;
	server_id: string;
	event_type: string;
	category?: string;
	type?: string;
	player_id?: string;
	player_name?: string;
	discord_id?: string;
	details: any;
}

export interface SearchFilters {
	playerSearch: string;
	eventTypeSearch: string;
	dateRange: { start: string; end: string } | null;
}

export interface FilterPreset {
	id: string;
	name: string;
	filters: SearchFilters;
	category?: string;
	type?: string;
}

export default function LogsPage() {
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const router = useRouter();
	const [searchFilters, setSearchFilters] = useState<SearchFilters>({
		playerSearch: '',
		eventTypeSearch: '',
		dateRange: null,
	});
	const [activeTab, setActiveTab] = useState<string | null>('table');
	const [categoryStats, setCategoryStats] = useState<any[]>([]);
	const [eventTypeStats, setEventTypeStats] = useState<any[]>([]);
	const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

	// Filter presets
	const filterPresets: FilterPreset[] = [
		{
			id: 'recent-logins',
			name: 'Seneste Logins',
			filters: {
				playerSearch: '',
				eventTypeSearch: 'login',
				dateRange: null,
			},
			category: 'player',
			type: 'join_leave',
		},
		{
			id: 'money-transactions',
			name: 'Penge Transaktioner',
			filters: {
				playerSearch: '',
				eventTypeSearch: 'transaction',
				dateRange: null,
			},
			category: 'economy',
			type: 'bank',
		},
		{
			id: 'suspicious-activity',
			name: 'Mistænkelig Aktivitet',
			filters: {
				playerSearch: '',
				eventTypeSearch: '',
				dateRange: null,
			},
			category: 'admin',
			type: 'detection',
		},
	];

	const LOGS_PER_PAGE = 8;
	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6B66FF'];

	const getQueryFilters = useCallback(() => {
		const params = new URLSearchParams(window.location.search);
		return {
			category: params.get('category') || '',
			type: params.get('type') || '',
			eventType: params.get('eventType') || '',
			serverId: params.get('serverId') || '',
			discordId: params.get('discordId') || '',
		};
	}, []);

	const filters = getQueryFilters();
	const pageTitle = filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Logs` : 'Server Logs';

	const fetchLogs = useCallback(async () => {
		setLoading(true);

		try {
			const currentFilters = getQueryFilters();

			let query = supabase.from('logs').select('*', { count: 'exact' }).order('created_at', { ascending: false });

			const appliedFilters = [];

			if (currentFilters.category) {
				query = query.eq('category', currentFilters.category);
				appliedFilters.push(`Category: ${currentFilters.category}`);
			}

			if (currentFilters.type) {
				query = query.eq('type', currentFilters.type);
				appliedFilters.push(`Type: ${currentFilters.type}`);
			}

			if (currentFilters.eventType) {
				query = query.eq('event_type', currentFilters.eventType);
				appliedFilters.push(`Event type: ${currentFilters.eventType}`);
			}

			if (searchFilters.eventTypeSearch) {
				query = query.ilike('event_type', `%${searchFilters.eventTypeSearch}%`);
				appliedFilters.push(`Event type search: ${searchFilters.eventTypeSearch}`);
			}

			if (currentFilters.serverId) {
				query = query.eq('server_id', currentFilters.serverId);
				appliedFilters.push(`Server ID: ${currentFilters.serverId}`);
			}

			if (currentFilters.discordId) {
				const discordId = currentFilters.discordId.trim();
				if (discordId) {
					query = query.ilike('discord_id', `%${discordId}%`);
					appliedFilters.push(`Discord ID: ${discordId}`);
				}
			}

			// Build filter for player search
			if (searchFilters.playerSearch) {
				const searchTerm = searchFilters.playerSearch.trim();
				if (searchTerm) {
					appliedFilters.push(`Player search: ${searchTerm}`);

					// Use a different approach for OR conditions that works with PostgREST
					const filterConditions = [`player_name.ilike.%${searchTerm}%`, `server_id.ilike.%${searchTerm}%`, `discord_id.ilike.%${searchTerm}%`];

					// For player_id, only include it if the search term could be a number
					if (!isNaN(Number(searchTerm))) {
						filterConditions.push(`player_id.ilike.%${searchTerm}%`);
					}

					// Join the conditions and apply them
					query = query.or(filterConditions.join(','));
				}
			}

			if (searchFilters.dateRange) {
				query = query.gte('created_at', searchFilters.dateRange.start).lte('created_at', searchFilters.dateRange.end);
				const startDate = new Date(searchFilters.dateRange.start).toLocaleDateString();
				const endDate = new Date(searchFilters.dateRange.end).toLocaleDateString();
				appliedFilters.push(`Date range: ${startDate} - ${endDate}`);
			}

			// Count query with same filters
			const countQuery = supabase.from('logs').select('*', { count: 'exact' });

			if (currentFilters.category) {
				countQuery.eq('category', currentFilters.category);
			}
			if (currentFilters.type) {
				countQuery.eq('type', currentFilters.type);
			}
			if (currentFilters.eventType) {
				countQuery.eq('event_type', currentFilters.eventType);
			}
			if (searchFilters.eventTypeSearch) {
				countQuery.ilike('event_type', `%${searchFilters.eventTypeSearch}%`);
			}
			if (currentFilters.serverId) {
				countQuery.eq('server_id', currentFilters.serverId);
			}

			if (currentFilters.discordId) {
				const discordId = currentFilters.discordId.trim();
				if (discordId) {
					countQuery.ilike('discord_id', `%${discordId}%`);
				}
			}

			// Apply same player search to count query
			if (searchFilters.playerSearch) {
				const searchTerm = searchFilters.playerSearch.trim();
				if (searchTerm) {
					const filterConditions = [`player_name.ilike.%${searchTerm}%`, `server_id.ilike.%${searchTerm}%`, `discord_id.ilike.%${searchTerm}%`];

					// For player_id, only include it if the search term could be a number
					if (!isNaN(Number(searchTerm))) {
						filterConditions.push(`player_id.ilike.%${searchTerm}%`);
					}

					// Join the conditions and apply them
					countQuery.or(filterConditions.join(','));
				}
			}

			if (searchFilters.dateRange) {
				countQuery.gte('created_at', searchFilters.dateRange.start).lte('created_at', searchFilters.dateRange.end);
			}

			const { count, error: countError } = await countQuery;

			if (countError) {
				console.error('Error getting count:', countError);
				return;
			}

			query = query.range((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE - 1);

			const { data, error } = await query;

			if (error) {
				console.error('Error fetching logs:', error);
				return;
			}

			setLogs(data || []);
			setTotalPages(Math.ceil((count || 0) / LOGS_PER_PAGE));
		} catch (err) {
			console.error('Failed to fetch logs:', err);
		} finally {
			setLoading(false);
		}
	}, [page, LOGS_PER_PAGE, getQueryFilters, searchFilters]);

	// Fetch stats for dashboard visualizations
	const fetchStatsData = useCallback(async () => {
		try {
			// Fetch data for category distribution
			const { data: categoryData, error: categoryError } = await supabase
				.from('logs')
				.select('category, count:count(*)')
				.not('category', 'is', null)
				.select('category, count:count(*)', { head: false }).group('category');

			if (categoryError) {
				console.error('Error fetching category stats:', categoryError);
			} else {
				const formattedCategoryData = categoryData.map((item) => ({
					name: item.category,
					value: item.count,
					color: COLORS[categoryData.indexOf(item) % COLORS.length],
				}));
				setCategoryStats(formattedCategoryData);
			}

			// Fetch data for event type distribution
			const { data: eventTypeData, error: eventTypeError } = await supabase.from('logs').select('event_type, count').group('event_type').order('count', { ascending: false }).limit(8);

			if (eventTypeError) {
				console.error('Error fetching event type stats:', eventTypeError);
			} else {
				const formattedEventTypeData = eventTypeData.map((item) => ({
					name: item.event_type,
					value: item.count,
					color: COLORS[eventTypeData.indexOf(item) % COLORS.length],
				}));
				setEventTypeStats(formattedEventTypeData);
			}

			// Fetch time series data (last 7 days)
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);

			const { data: timeData, error: timeError } = await supabase.from('logs').select('created_at').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());

			if (timeError) {
				console.error('Error fetching time series data:', timeError);
			} else {
				// Group by day
				const groupedData = timeData.reduce((acc, log) => {
					const date = new Date(log.created_at).toLocaleDateString();
					acc[date] = (acc[date] || 0) + 1;
					return acc;
				}, {});

				// Format for chart
				const formattedTimeData = Object.entries(groupedData).map(([date, count]) => ({
					date,
					count: count as number,
				}));

				setTimeSeriesData(formattedTimeData);
			}
		} catch (err) {
			console.error('Failed to fetch stats data:', err);
		}
	}, [COLORS]);

	const handleUrlChange = useCallback(() => {
		setPage(1);
		fetchLogs();
		fetchStatsData();
	}, [fetchLogs, fetchStatsData]);

	useEffect(() => {
		fetchLogs();
		fetchStatsData();

		const handlePopState = () => {
			handleUrlChange();
		};

		window.addEventListener('popstate', handlePopState);

		const unsubscribe = router.subscribe('onBeforeNavigate', () => {
			setTimeout(() => {
				handleUrlChange();
			}, 50);
		});

		return () => {
			window.removeEventListener('popstate', handlePopState);
			unsubscribe();
		};
	}, [handleUrlChange, router]);

	useEffect(() => {
		fetchLogs();
	}, [page, fetchLogs]);

	const handleSearch = (newFilters: SearchFilters) => {
		setSearchFilters(newFilters);
		setPage(1);
	};

	const applyFilterPreset = (preset: FilterPreset) => {
		setSearchFilters(preset.filters);
		setPage(1);

		// Build the navigate URL
		let navigateUrl = '/logs';
		const params = new URLSearchParams();

		if (preset.category) params.set('category', preset.category);
		if (preset.type) params.set('type', preset.type);

		const queryString = params.toString();
		if (queryString) navigateUrl += `?${queryString}`;

		router.navigate({ to: navigateUrl });
	};

	const exportLogs = () => {
		// Format logs for export
		const exportData = logs.map((log) => ({
			ID: log.id,
			Timestamp: new Date(log.created_at).toLocaleString(),
			Category: log.category || '',
			Type: log.type || '',
			EventType: log.event_type,
			PlayerName: log.player_name || 'System',
			PlayerID: log.player_id || '',
			ServerID: log.server_id || '',
			DiscordID: log.discord_id || '',
			Details: JSON.stringify(log.details),
		}));

		// Convert to CSV
		const headers = Object.keys(exportData[0]).join(',');
		const rows = exportData.map((row) => Object.values(row).join(','));
		const csv = [headers, ...rows].join('\n');

		// Create download
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `odessa_logs_${new Date().toISOString().split('T')[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// Analytics overview calculations
	const totalLogs = useMemo(() => {
		return categoryStats.reduce((total, category) => total + category.value, 0);
	}, [categoryStats]);

	const topCategory = useMemo(() => {
		return categoryStats.length > 0 ? categoryStats.reduce((top, current) => (current.value > top.value ? current : top), categoryStats[0]) : null;
	}, [categoryStats]);

	const topEventType = useMemo(() => {
		return eventTypeStats.length > 0 ? eventTypeStats[0] : null;
	}, [eventTypeStats]);

	const recentActivity = useMemo(() => {
		return timeSeriesData.length > 0 ? timeSeriesData[timeSeriesData.length - 1].count : 0;
	}, [timeSeriesData]);

	const activityTrend = useMemo(() => {
		if (timeSeriesData.length < 2) return 0;

		const last = timeSeriesData[timeSeriesData.length - 1].count;
		const secondLast = timeSeriesData[timeSeriesData.length - 2].count;

		if (secondLast === 0) return 100; // Avoid division by zero

		return ((last - secondLast) / secondLast) * 100;
	}, [timeSeriesData]);

	// Format data for Mantine charts
	const formattedTimeSeriesData = useMemo(() => {
		return timeSeriesData.map((item) => ({
			date: item.date,
			Aktivitet: item.count,
		}));
	}, [timeSeriesData]);

	return (
		<MainLayout>
			<Box
				style={{
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Container size='xl' style={{ maxWidth: '1600px', width: '100%' }}>
					<Paper p='md' mb='md' bg='dark.8' style={{ backgroundColor: '', width: '100%' }}>
						<Group justify='space-between' mb='md'>
							<Box>
								<Title order={2}>{pageTitle}</Title>
								{filters.category && (
									<Text c='dimmed' size='sm'>
										Category: {filters.category}
									</Text>
								)}
							</Box>

							{/* Action buttons */}
							<Group>
								<Menu shadow='md' width={200}>
									<Menu.Target>
										<Button variant='subtle' leftSection={<BookmarkSimple size={18} />}>
											Gemte Filtre
										</Button>
									</Menu.Target>
									<Menu.Dropdown>
										{filterPresets.map((preset) => (
											<Menu.Item key={preset.id} onClick={() => applyFilterPreset(preset)}>
												{preset.name}
											</Menu.Item>
										))}
										<Menu.Divider />
										<Menu.Item>Gem nuværende filter</Menu.Item>
									</Menu.Dropdown>
								</Menu>

								<Tooltip label='Eksporter logs'>
									<Button variant='subtle' onClick={exportLogs} leftSection={<DownloadSimple size={18} />}>
										Eksporter
									</Button>
								</Tooltip>
							</Group>
						</Group>

						{/* View type tabs */}
						<Tabs value={activeTab} onChange={setActiveTab} mb='md'>
							<Tabs.List>
								<Tabs.Tab value='table' leftSection={<ListBullets size={16} />}>
									Tabeller
								</Tabs.Tab>
								<Tabs.Tab value='dashboard' leftSection={<ChartPie size={16} />}>
									Dashboard
								</Tabs.Tab>
							</Tabs.List>
						</Tabs>

						{/* Table View */}
						{activeTab === 'table' && (
							<LogTable
								data={logs}
								isLoading={loading}
								pagination={{
									page,
									totalPages,
									onPageChange: setPage,
								}}
								onSearch={handleSearch}
							/>
						)}

						{/* Dashboard View */}
						{activeTab === 'dashboard' && (
							<Box>
								<SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 4 }} spacing='md' mb='md'>
									{/* Total Logs Card */}
									<Card withBorder p='md' radius='md'>
										<Text size='xs' tt='uppercase' fw={700} c='dimmed'>
											Total Logs
										</Text>
										<Text fw={700} size='xl' mt='sm'>
											{totalLogs.toLocaleString()}
										</Text>
										<Text size='xs' c='dimmed' mt='sm'>
											Samlet antal logs i databasen
										</Text>
									</Card>

									{/* Top Category Card */}
									<Card withBorder p='md' radius='md'>
										<Text size='xs' tt='uppercase' fw={700} c='dimmed'>
											Top Kategori
										</Text>
										<Group justify='space-between' mt='sm'>
											<Text fw={700} size='xl'>
												{topCategory?.name || 'N/A'}
											</Text>
											<Badge variant='light'>{topCategory?.value || 0}</Badge>
										</Group>
										<Text size='xs' c='dimmed' mt='sm'>
											Mest aktive loggede kategori
										</Text>
									</Card>

									{/* Top Event Type Card */}
									<Card withBorder p='md' radius='md'>
										<Text size='xs' tt='uppercase' fw={700} c='dimmed'>
											Top Hændelse
										</Text>
										<Group justify='space-between' mt='sm'>
											<Text fw={700} size='xl'>
												{topEventType?.name || 'N/A'}
											</Text>
											<Badge variant='light'>{topEventType?.value || 0}</Badge>
										</Group>
										<Text size='xs' c='dimmed' mt='sm'>
											Mest frekvente hændelsestype
										</Text>
									</Card>

									{/* Recent Activity Card */}
									<Card withBorder p='md' radius='md'>
										<Text size='xs' tt='uppercase' fw={700} c='dimmed'>
											Seneste Aktivitet
										</Text>
										<Group justify='space-between' mt='sm'>
											<Text fw={700} size='xl'>
												{recentActivity}
											</Text>
											<Badge variant='light' color={activityTrend >= 0 ? 'green' : 'red'}>
												{activityTrend >= 0 ? '+' : ''}
												{activityTrend.toFixed(1)}%
											</Badge>
										</Group>
										<Text size='xs' c='dimmed' mt='sm'>
											Log aktivitet i de seneste 24 timer
										</Text>
									</Card>
								</SimpleGrid>

								<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md' mb='md'>
									{/* Category Distribution Chart */}
									<Card withBorder p='md' radius='md' style={{ height: '400px' }}>
										<Text fw={700} size='sm' mb='md'>
											Kategori Fordeling
										</Text>
										<Box style={{ height: 320 }}>
											<PieChart data={categoryStats} size={240} withLabels labelsPosition='outside' labelsType='percent' tooltipDataSource='segment' withTooltip />
										</Box>
									</Card>

									{/* Event Type Distribution Chart */}
									<Card withBorder p='md' radius='md' style={{ height: '400px' }}>
										<Text fw={700} size='sm' mb='md'>
											Top Hændelsestyper
										</Text>
										<Box style={{ height: 320 }}>
											<BarChart
												h={280}
												data={eventTypeStats}
												dataKey='name'
												series={[{ name: 'value', color: 'blue.6' }]}
												orientation='vertical'
												withTooltip
												tooltipProps={{ offset: 10 }}
												tickLine='x'
												yAxisProps={{
													tickLength: 5,
													tickRotation: -45,
													autoScale: true,
												}}
												xAxisProps={{ domain: [0, 'auto'] }}
											/>
										</Box>
									</Card>
								</SimpleGrid>

								{/* Time Series Chart */}
								<Card withBorder p='md' radius='md' mb='md'>
									<Text fw={700} size='sm' mb='md'>
										Aktivitets Trend (Sidste 7 Dage)
									</Text>
									<Box style={{ height: 300 }}>
										<AreaChart
											h={250}
											data={formattedTimeSeriesData}
											dataKey='date'
											series={[{ name: 'Aktivitet', color: 'blue.6' }]}
											curveType='linear'
											withDots={false}
											withTooltip
											withLegend
											gridAxis='x'
											tickLine='y'
											xAxisProps={{
												tickRotation: -45,
												tickLength: 10,
												paddingTop: 20,
											}}
											yAxisProps={{ domain: [0, 'auto'] }}
										/>
									</Box>
								</Card>
							</Box>
						)}
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
