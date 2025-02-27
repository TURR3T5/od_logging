import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from '@tanstack/react-router';
import { Container, Title, Table, Group, Button, Text, TextInput, Select, Pagination, Loader, Paper, Box, Center } from '@mantine/core';

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
	const { isAuthorized, isLoading, user, signOut } = useAuth();
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filter, setFilter] = useState('');
	const [eventType, setEventType] = useState<string | null>(null);

	const LOGS_PER_PAGE = 15;

	// Redirect if not authorized
	if (!isLoading && !isAuthorized) {
		return <Navigate to='/login' />;
	}

	useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true);
			let query = supabase
				.from('logs')
				.select('*', { count: 'exact' })
				.order('created_at', { ascending: false })
				.range((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE - 1);

			// Apply filters if set
			if (filter) {
				query = query.or(`player_name.ilike.%${filter}%,player_id.ilike.%${filter}%,details.ilike.%${filter}%`);
			}

			if (eventType) {
				query = query.eq('event_type', eventType);
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
	}, [page, filter, eventType]);

	// Get unique event types for filter dropdown
	const [eventTypes, setEventTypes] = useState<string[]>([]);

	useEffect(() => {
		const fetchEventTypes = async () => {
			const { data, error } = await supabase.from('logs').select('event_type').limit(1000);

			if (error || !data) return;

			const uniqueTypes = [...new Set(data.map((log) => log.event_type))];
			setEventTypes(uniqueTypes);
		};

		fetchEventTypes();
	}, []);

	return (
		<Container size='xl' p='md'>
			<Group justify='space-between' mb='lg'>
				<Title order={2}>FiveM Server Logs</Title>
				<Group>
					{user && (
						<Text>
							Logged in as <b>{user.username}</b>
						</Text>
					)}
					<Button onClick={signOut} color='red' variant='outline'>
						Logout
					</Button>
				</Group>
			</Group>

			<Paper shadow='sm' p='md' mb='lg'>
				<Group justify='space-between'>
					<Group>
						<TextInput placeholder='Search logs' value={filter} onChange={(e) => setFilter(e.target.value)} width={250} />
						<Select placeholder='Filter by event type' value={eventType} onChange={setEventType} data={eventTypes.map((type) => ({ value: type, label: type }))} clearable width={200} />
					</Group>
				</Group>
			</Paper>

			{loading ? (
				<Center h={200}>
					<Loader size='xl' />
				</Center>
			) : logs.length === 0 ? (
				<Text size='lg' ta='center' p='xl'>
					No logs found. Adjust your filters or check back later.
				</Text>
			) : (
				<>
					<Box style={{ overflowX: 'auto' }}>
						<Table striped highlightOnHover>
							<thead>
								<tr>
									<th>Timestamp</th>
									<th>Event Type</th>
									<th>Player</th>
									<th>Details</th>
								</tr>
							</thead>
							<tbody>
								{logs.map((log) => (
									<tr key={log.id}>
										<td>{new Date(log.created_at).toLocaleString()}</td>
										<td>{log.event_type}</td>
										<td>
											{log.player_name ? (
												<>
													{log.player_name}
													{log.player_id && (
														<Text size='xs' color='dimmed'>
															ID: {log.player_id}
														</Text>
													)}
												</>
											) : (
												'System'
											)}
										</td>
										<td>
											<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}</pre>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</Box>

					<Group justify='center' mt='md'>
						<Pagination total={totalPages} value={page} onChange={setPage} size='sm' />
					</Group>
				</>
			)}
		</Container>
	);
}
