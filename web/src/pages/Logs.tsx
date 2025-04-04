import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '@tanstack/react-router';
import { Container, Title, Text, Paper, Group, Box, Button, Tooltip } from '@mantine/core';
import { Download } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import LogTable from '../components/LogTable';
import { useLogsSearch, SearchFilters } from '../hooks/useLogsSearch';
import { applyLogsFilters } from '../utils/queryHelper';

export interface Log {
	id: string;
	created_at: string;
	source: string;
	event: string;
	category?: string;
	type?: string;
	txname?: string | null;	
	charname?: string | null;
	discord?: string | null;
	details: any;
	citizenid?: string | null;
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
	const previousUrl = useRef(router.state.location.search);
	const LOGS_PER_PAGE = 8;

	const getQueryFilters = () => {
		const search = router.state.location.search;
		const params = new URLSearchParams(search);
		return {
			category: params.get('category') || '',
			type: params.get('type') || '',
			eventType: params.get('eventType') || '',
			serverId: params.get('serverId') || '',
			discordId: params.get('discordId') || '',
		};
	};

	const fetchLogs = async (resetPage = false) => {
		if (resetPage) {
			setPage(1);
		}

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

			const currentPage = resetPage ? 1 : page;
			query = query.range((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE - 1);
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
	};

	useEffect(() => {
		const currentUrl = router.state.location.search;
		if (currentUrl !== previousUrl.current) {
			previousUrl.current = currentUrl;
			fetchLogs(true);
		}
	}, [router.state.location.search]);

	useEffect(() => {
		fetchLogs(false);
	}, [page]);

	useEffect(() => {
		fetchLogs(true);
	}, [searchFilters]);

	useEffect(() => {
		const unsubscribe = router.subscribe('onResolved', () => {
			fetchLogs(true);
		});

		return () => {
			unsubscribe();
		};
	}, []);

	const filters = getQueryFilters();
	const pageTitle = filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Logs` : 'Server Logs';

	const manageSearch = (newFilters: SearchFilters) => {
		handleSearch(newFilters);
	};

	const exportLogs = () => {
		const exportData = logs.map((log) => ({
			ID: log.id,
			Timestamp: new Date(log.created_at).toLocaleString(),
			Category: log.category || '',
			Type: log.type || '',
			EventType: log.event,
			PlayerName: log.charname || 'System',
			PlayerID: log.txname || '',
			ServerID: log.source || '',
			DiscordID: log.discord || '',
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
