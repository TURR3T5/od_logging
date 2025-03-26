import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '@tanstack/react-router';
import { Container, Title, Text, Paper, Group, Box } from '@mantine/core';
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

	const LOGS_PER_PAGE = 15;

	const getQueryFilters = useCallback(() => {
		const params = new URLSearchParams(window.location.search);
		return {
			category: params.get('category') || '',
			type: params.get('type') || '',
			eventType: params.get('eventType') || '',
			serverId: params.get('serverId') || '',
			playerId: params.get('playerId') || '',
			playerName: params.get('playerName') || '',
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

			if (searchFilters.playerSearch) {
				const searchTerm = searchFilters.playerSearch.trim();
				if (searchTerm) {
					appliedFilters.push(`Player search: ${searchTerm}`);

					query = query.or(`player_name.ilike.%${searchTerm}%,` + `player_id.ilike.%${searchTerm}%,` + `server_id.ilike.%${searchTerm}%,` + `discord_id.ilike.%${searchTerm}%`);

					try {
						const detailsQuery = supabase.from('logs').select('id').filter('details::text', 'ilike', `%${searchTerm}%`);

						if (currentFilters.category) {
							detailsQuery.eq('category', currentFilters.category);
						}

						if (currentFilters.type) {
							detailsQuery.eq('type', currentFilters.type);
						}

						const { data: detailsMatches, error: detailsError } = await detailsQuery;

						if (!detailsError && detailsMatches && detailsMatches.length > 0) {
							const matchingIds = detailsMatches.map((row) => row.id);
							console.log(`Found ${matchingIds.length} matches in details field`);

							query = query.or(`id.in.(${matchingIds.join(',')})`);
						}
					} catch (e) {
						console.warn('Error searching in details field:', e);
					}
				}
			}

			if (currentFilters.playerId) {
				const playerId = currentFilters.playerId.trim();
				if (playerId) {
					appliedFilters.push(`Player ID: ${playerId}`);
					query = query.or(`player_id.ilike.%${playerId}%,server_id.ilike.%${playerId}%`);
				}
			}

			if (currentFilters.playerName) {
				const playerName = currentFilters.playerName.trim();
				if (playerName) {
					appliedFilters.push(`Player name: ${playerName}`);
					query = query.ilike('player_name', `%${playerName}%`);
				}
			}

			if (searchFilters.dateRange) {
				query = query.gte('created_at', searchFilters.dateRange.start).lte('created_at', searchFilters.dateRange.end);
				const startDate = new Date(searchFilters.dateRange.start).toLocaleDateString();
				const endDate = new Date(searchFilters.dateRange.end).toLocaleDateString();
				appliedFilters.push(`Date range: ${startDate} - ${endDate}`);
			}

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
			if (searchFilters.playerSearch) {
				const searchTerm = searchFilters.playerSearch.trim();
				if (searchTerm) {
					countQuery.or(`player_name.ilike.%${searchTerm}%,` + `player_id.ilike.%${searchTerm}%,` + `server_id.ilike.%${searchTerm}%,` + `discord_id.ilike.%${searchTerm}%`);
				}
			}
			if (currentFilters.playerId) {
				const playerId = currentFilters.playerId.trim();
				if (playerId) {
					countQuery.or(`player_id.ilike.%${playerId}%,server_id.ilike.%${playerId}%`);
				}
			}
			if (currentFilters.playerName) {
				const playerName = currentFilters.playerName.trim();
				if (playerName) {
					countQuery.ilike('player_name', `%${playerName}%`);
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

	const handleSearch = (newFilters: SearchFilters) => {
		setSearchFilters(newFilters);
		setPage(1);
	};

	return (
		<MainLayout>
			<Box
				style={{
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					padding: '20px 0',
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
						</Group>

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
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
