import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '@tanstack/react-router';
import { Container, Title, Text, Paper, Group, Box } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';
import LogTable from '../components/LogTable';
import { DEFAULT_THEME } from '@mantine/core';

export interface Log {
	id: string;
	created_at: string;
	server_id: string;
	event_type: string;
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

	// Parse URL query parameters for filtering
	const getQueryFilters = () => {
		const params = new URLSearchParams(router.state.location.search);
		return {
			category: params.get('category') || '',
			type: params.get('type') || '',
			eventType: params.get('eventType') || '',
			serverId: params.get('serverId') || '',
			playerId: params.get('playerId') || '',
			playerName: params.get('playerName') || '',
		};
	};

	const filters = getQueryFilters();
	const pageTitle = filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Logs` : 'Server Logs';

	// Fetch logs from Supabase based on current filters and pagination
	useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true);
			let query = supabase
				.from('logs')
				.select('*', { count: 'exact' })
				.order('created_at', { ascending: false })
				.range((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE - 1);

			// Apply filters from URL
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

			// We can add more specific filters based on category and type
			// This would depend on your specific data structure and event types
			if (filters.category && filters.type) {
				// Example for inventory items
				if (filters.category === 'inventory' && filters.type === 'items') {
					query = query.like('event_type', 'inventory%');
				}
				// Add more specific filters as needed
			}

			const { data, count, error } = await query;

			if (error) {
				console.error('Error fetching logs:', error);
				return;
			}

			setLogs(data || []);
			setTotalPages(Math.ceil((count || 0) / LOGS_PER_PAGE));
			setLoading(false);
		};

		fetchLogs();
	}, [page, filters]);

	return (
		<MainLayout>
			<Container size='xl'>
				<Paper p='md' mb='md' style={{ backgroundColor: DEFAULT_THEME.colors.dark[7] }}>
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
		</MainLayout>
	);
}
