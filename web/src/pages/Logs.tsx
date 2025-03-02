import { useState, useEffect, useRef, useCallback } from 'react';
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
	details: any;
}

export default function LogsPage() {
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const router = useRouter();
	const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
	const previousFilters = useRef({ category: '', type: '' });
	const isInitialMount = useRef(true);
	const isFetchingRef = useRef(false); // Track if we're in the middle of a fetch

	const LOGS_PER_PAGE = 15;

	// Parse URL query parameters for filtering
	const getQueryFilters = useCallback(() => {
		const params = new URLSearchParams(router.state.location.search);
		return {
			category: params.get('category') || '',
			type: params.get('type') || '',
			eventType: params.get('eventType') || '',
			serverId: params.get('serverId') || '',
			playerId: params.get('playerId') || '',
			playerName: params.get('playerName') || '',
		};
	}, [router.state.location.search]);

	const filters = getQueryFilters();
	const pageTitle = filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Logs` : 'Server Logs';

	// Check if filters have changed
	const haveFiltersChanged = () => {
		return previousFilters.current.category !== filters.category || previousFilters.current.type !== filters.type;
	};

	// Fetch logs function
	const fetchLogs = useCallback(
		async (showLoading = true) => {
			// Prevent multiple simultaneous fetches
			if (isFetchingRef.current) return;

			isFetchingRef.current = true;
			if (showLoading) setLoading(true);

			try {
				let query = supabase
					.from('logs')
					.select('*', { count: 'exact' })
					.order('created_at', { ascending: false })
					.range((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE - 1);

				if (filters.eventType) {
					query = query.eq('event_type', filters.eventType);
				}

				if (filters.serverId) {
					query = query.eq('server_id', filters.serverId);
				}

				if (filters.playerId) {
					query = query.eq('player_id', filters.playerId);
				}

				if (filters.playerName) {
					query = query.ilike('player_name', `%${filters.playerName}%`);
				}

				if (filters.category) {
					query = query.eq('category', filters.category);
				}

				if (filters.type) {
					query = query.eq('type', filters.type);
				}

				const { data, count, error } = await query;

				if (error) {
					console.error('Error fetching logs:', error);
					return;
				}

				// Store current filters for comparison
				previousFilters.current = {
					category: filters.category,
					type: filters.type,
				};

				setLogs(data || []);
				setTotalPages(Math.ceil((count || 0) / LOGS_PER_PAGE));
			} catch (err) {
				console.error('Failed to fetch logs:', err);
			} finally {
				if (showLoading) setLoading(false);
				isFetchingRef.current = false;
			}
		},
		[filters, page, LOGS_PER_PAGE]
	);

	// Effect for filter and page changes
	useEffect(() => {
		// If this is not the initial mount and filters have changed,
		// reset to page 1 to prevent confusion
		if (!isInitialMount.current && haveFiltersChanged()) {
			setPage(1);
		}

		// Clear any existing fetch timer
		if (fetchTimerRef.current) {
			clearTimeout(fetchTimerRef.current);
		}

		// Fetch immediately on filter/page change
		fetchLogs(true);

		// Mark that we're no longer on initial mount
		isInitialMount.current = false;

		// No need to set up a timer here - we'll do that in a separate effect
	}, [fetchLogs, filters.category, filters.type, filters.eventType, filters.serverId, filters.playerId, filters.playerName, page]);

	// Set up periodic refresh, separate from the filter/page change effect
	useEffect(() => {
		// Setup periodic refresh (only every 30 seconds to avoid spamming)
		const startAutoRefresh = () => {
			fetchTimerRef.current = setInterval(() => {
				// Don't show loading indicator for auto-refreshes
				fetchLogs(false);
			}, 30000);
		};

		startAutoRefresh();

		// Cleanup function to clear the interval when component unmounts
		return () => {
			if (fetchTimerRef.current) {
				clearInterval(fetchTimerRef.current);
				fetchTimerRef.current = null;
			}
		};
	}, [fetchLogs]);

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
					<Paper p='md' mb='md' style={{ backgroundColor: '#1A1B1E', width: '100%' }}>
						<Group justify='space-between' mb='md'>
							<Box>
								<Group>
									<Title order={2}>{pageTitle}</Title>
								</Group>
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
						/>
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
