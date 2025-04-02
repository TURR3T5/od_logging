import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '@tanstack/react-router';
import { Container, Title, Text, Paper, Group, Box, Menu, Button, Tooltip } from '@mantine/core';
import { Download, Bookmark } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import LogTable from '../components/LogTable';
import { useLogsSearch, SearchFilters } from '../hooks/useLogsSearch';
import { applyLogsFilters } from '../utils/queryHelper';

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
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
