import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '@tanstack/react-router';
import { Container, Title, Text, Paper, Group, Box, Tabs, Menu, Button, Tooltip, SimpleGrid, Card, Badge } from '../components/mantine';
import { Download, ChartPie, List, Bookmark } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import LogTable from '../components/LogTable';
import { useLogsSearch, SearchFilters } from '../hooks/useLogsSearch';
import { applyLogsFilters } from '../utils/queryHelper';
import { EmptyState } from '../components/common/EmptyState';

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
	const { searchFilters, handleSearch } = useLogsSearch();
	const [activeTab, setActiveTab] = useState<string | null>('table');
	const [categoryStats, setCategoryStats] = useState<any[]>([]);
	const [eventTypeStats, setEventTypeStats] = useState<any[]>([]);
	const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

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

	const fetchDashboardStats = async () => {
		try {
			const { data: logs, error } = await supabase.from('logs').select('category, event_type, created_at').order('created_at', { ascending: false }).limit(1000);

			if (error) {
				console.error('Error fetching logs for stats:', error);
				return;
			}

			if (!logs || logs.length === 0) {
				return <EmptyState title='Ingen logs fundet' message='Ingen logs er tilgængelige i databasen.' />;
			}

			const categoryCount: Record<string, number> = {};
			logs.forEach((log) => {
				const category = log.category || 'Unknown';
				categoryCount[category] = (categoryCount[category] || 0) + 1;
			});

			const formattedCategoryData = Object.entries(categoryCount)
				.map(([name, value]) => ({ name, value }))
				.sort((a, b) => (b.value as number) - (a.value as number));

			setCategoryStats(formattedCategoryData);

			const eventTypeCount: Record<string, number> = {};
			logs.forEach((log) => {
				const eventType = log.event_type || 'Unknown';
				eventTypeCount[eventType] = (eventTypeCount[eventType] || 0) + 1;
			});

			const formattedEventTypeData = Object.entries(eventTypeCount)
				.map(([name, value]) => ({ name, value }))
				.sort((a, b) => (b.value as number) - (a.value as number));

			setEventTypeStats(formattedEventTypeData);

			const today = new Date();
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(today.getDate() - 7);

			const dailyCounts: Record<string, number> = {};
			for (let i = 0; i < 7; i++) {
				const date = new Date();
				date.setDate(today.getDate() - i);
				const dateString = date.toISOString().split('T')[0];
				dailyCounts[dateString] = 0;
			}

			logs.forEach((log) => {
				const dateString = new Date(log.created_at).toISOString().split('T')[0];
				if (dailyCounts[dateString] !== undefined) {
					dailyCounts[dateString]++;
				}
			});

			const formattedTimeData = Object.entries(dailyCounts)
				.map(([date, count]) => ({
					date,
					count: count as number,
				}))
				.sort((a, b) => a.date.localeCompare(b.date));

			setTimeSeriesData(formattedTimeData);
		} catch (err) {
			console.error('Failed to fetch dashboard stats:', err);
		}
	};

	const fetchLogs = useCallback(async () => {
		setLoading(true);

		try {
			const currentFilters = getQueryFilters();

			let query = supabase.from('logs').select('*', { count: 'exact' }).order('created_at', { ascending: false });

			query = applyLogsFilters(query, currentFilters, searchFilters);

			let countQuery = supabase.from('logs').select('*', { count: 'exact' });
			countQuery = applyLogsFilters(countQuery, currentFilters, searchFilters);

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

	const handleUrlChange = useCallback(() => {
		setPage(1);
		fetchLogs();
	}, [fetchLogs]);

	useEffect(() => {
		fetchLogs();
		fetchDashboardStats();

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

	const manageSearch = (newFilters: SearchFilters) => {
		handleSearch(newFilters);
		setPage(1);
	};

	const applyFilterPreset = (preset: FilterPreset) => {
		handleSearch(preset.filters);
		setPage(1);

		let navigateUrl = '/logs';
		const params = new URLSearchParams();

		if (preset.category) params.set('category', preset.category);
		if (preset.type) params.set('type', preset.type);

		const queryString = params.toString();
		if (queryString) navigateUrl += `?${queryString}`;

		router.navigate({ to: navigateUrl });
	};

	const exportLogs = () => {
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

		const headers = Object.keys(exportData[0]).join(',');
		const rows = exportData.map((row) => Object.values(row).join(','));
		const csv = [headers, ...rows].join('\n');

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

		if (secondLast === 0) return 100;

		return ((last - secondLast) / secondLast) * 100;
	}, [timeSeriesData]);

	return (
		<MainLayout>
			<Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
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

							<Group>
								<Menu shadow='md' width={200}>
									<Menu.Target>
										<Button variant='subtle' leftSection={<Bookmark size={18} />}>
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
									<Button variant='subtle' onClick={exportLogs} leftSection={<Download size={18} />}>
										Eksporter
									</Button>
								</Tooltip>
							</Group>
						</Group>

						<Tabs value={activeTab} onChange={setActiveTab} mb='md'>
							<Tabs.List>
								<Tabs.Tab value='table' leftSection={<List size={16} />}>
									Tabeller
								</Tabs.Tab>
								<Tabs.Tab value='dashboard' leftSection={<ChartPie size={16} />}>
									Dashboard
								</Tabs.Tab>
							</Tabs.List>
						</Tabs>

						{activeTab === 'table' && (
							<LogTable
								data={logs}
								isLoading={loading}
								pagination={{
									page,
									totalPages,
									onPageChange: setPage,
								}}
								onSearch={manageSearch}
							/>
						)}

						{activeTab === 'dashboard' && (
							<Box>
								<SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 4 }} spacing='md' mb='md'>
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
							</Box>
						)}
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
