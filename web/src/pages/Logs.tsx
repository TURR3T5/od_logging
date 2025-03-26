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
	details: any;
}

export default function LogsPage() {
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const router = useRouter();

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

			let query = supabase
				.from('logs')
				.select('*', { count: 'exact' })
				.order('created_at', { ascending: false })
				.range((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE - 1);

			if (currentFilters.eventType) {
				query = query.eq('event_type', currentFilters.eventType);
			}

			if (currentFilters.serverId) {
				query = query.eq('server_id', currentFilters.serverId);
			}

			if (currentFilters.playerId) {
				query = query.eq('player_id', currentFilters.playerId);
			}

			if (currentFilters.playerName) {
				query = query.ilike('player_name', `%${currentFilters.playerName}%`);
			}

			if (currentFilters.category) {
				query = query.eq('category', currentFilters.category);
			}

			if (currentFilters.type) {
				query = query.eq('type', currentFilters.type);
			}

			const { data, count, error } = await query;

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
	}, [page, LOGS_PER_PAGE, getQueryFilters]);

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
						/>
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}