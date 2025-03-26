import { useMemo, useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, ColumnDef, flexRender, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { Table, ScrollArea, Paper, TextInput, Group, Box, Text, ActionIcon, Pagination, Center, Badge, Button, Modal } from '@mantine/core';
import { ArrowUp, ArrowDown, X, Eye } from '@phosphor-icons/react';
import { Log } from '../pages/Logs';
import { format } from 'date-fns';
import { DateTimePicker } from '@mantine/dates';

const dateRangeFilterFn = (row: any, columnId: string, filterValue: [string, string]) => {
	if (!filterValue || !Array.isArray(filterValue) || filterValue.length !== 2) {
		return true;
	}

	const [startIso, endIso] = filterValue;

	try {
		const cellValue = row.getValue(columnId);
		if (!cellValue) return true;

		const cellDate = cellValue instanceof Date ? cellValue : new Date(cellValue);
		const startDate = new Date(startIso);
		const endDate = new Date(endIso);

		return cellDate >= startDate && cellDate <= endDate;
	} catch (e) {
		console.error('Error in date range filter:', e);
		return true;
	}
};

const playerFilterFn = (row: any, columnId: string, filterValue: any) => {
	if (!filterValue) return true;

	const searchTerm = String(filterValue).toLowerCase();
	const playerName = String(row.original.player_name || '').toLowerCase();
	const serverId = String(row.original.server_id || '').toLowerCase();
	const playerId = String(row.original.player_id || '').toLowerCase();
	const discordId = String(row.original.details?.discord_id || '').toLowerCase();

	return playerName.includes(searchTerm) || serverId.includes(searchTerm) || playerId.includes(searchTerm) || discordId.includes(searchTerm);
};

function DateFilter({ column }: { column: any }) {
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);

	const handleStartDateChange = (date: Date | null) => {
		setStartDate(date);
		applyFilters(date, endDate);
	};

	const handleEndDateChange = (date: Date | null) => {
		setEndDate(date);
		applyFilters(startDate, date);
	};

	const applyFilters = (start: Date | null, end: Date | null) => {
		if (start && end) {
			column.setFilterValue([start.toISOString(), end.toISOString()]);
		} else if (start) {
			column.setFilterValue([start.toISOString(), new Date().toISOString()]);
		} else if (end) {
			column.setFilterValue(['1970-01-01T00:00:00.000Z', end.toISOString()]);
		} else {
			column.setFilterValue(undefined);
		}
	};

	return (
		<Group gap='xs'>
			<DateTimePicker
				placeholder='Start date'
				valueFormat='DD MMM YYYY HH:mm'
				clearable
				size='xs'
				value={startDate}
				onChange={handleStartDateChange}
				rightSection={
					startDate ? (
						<ActionIcon
							size='xs'
							onClick={(e) => {
								e.stopPropagation();
								setStartDate(null);
								applyFilters(null, endDate);
							}}
						>
							<X size={12} />
						</ActionIcon>
					) : null
				}
			/>
			<DateTimePicker
				placeholder='End date'
				valueFormat='DD MMM YYYY HH:mm'
				clearable
				size='xs'
				value={endDate}
				onChange={handleEndDateChange}
				rightSection={
					endDate ? (
						<ActionIcon
							size='xs'
							onClick={(e) => {
								e.stopPropagation();
								setEndDate(null);
								applyFilters(startDate, null);
							}}
						>
							<X size={12} />
						</ActionIcon>
					) : null
				}
			/>
		</Group>
	);
}

function SortingIndicator({ column }: { column: any }) {
	if (!column.getIsSorted()) {
		return null;
	}

	return column.getIsSorted() === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
}

interface LogTableProps {
	data: Log[];
	isLoading: boolean;
	pagination?: {
		page: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	};
	extraColumns?: ColumnDef<Log>[];
	onSearch?: (filters: { playerSearch?: string; eventTypeSearch?: string; dateRange?: { start: string; end: string } | null }) => void;
}

export default function LogTable({ data, isLoading, pagination, extraColumns = [] }: LogTableProps) {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
	const [selectedLog, setSelectedLog] = useState<Log | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [playerSearchTerm, setPlayerSearchTerm] = useState('');
	const [searchSubmitted, setSearchSubmitted] = useState(false);

	useEffect(() => {
		setHasAttemptedLoad(true);

		const params = new URLSearchParams(window.location.search);
		const playerName = params.get('playerName');
		const playerId = params.get('playerId');

		if (playerName || playerId) {
			const searchTerm = playerName || playerId || '';
			setPlayerSearchTerm(searchTerm);
			setColumnFilters([{ id: 'player', value: searchTerm }]);
		}
	}, []);

	const handleOpenModal = (log: Log) => {
		setSelectedLog(log);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setTimeout(() => {
			setSelectedLog(null);
		}, 300);
	};

	const formattedDetails = useMemo(() => {
		if (!selectedLog) return '';

		try {
			return typeof selectedLog.details === 'object' ? JSON.stringify(selectedLog.details, null, 2) : String(selectedLog.details || '');
		} catch (e) {
			console.error('Error formatting log details:', e);
			return '';
		}
	}, [selectedLog]);

	const commonColumns: ColumnDef<Log>[] = [
		{
			id: 'player',
			header: 'Player',
			accessorFn: (row) => row.player_name || 'System',
			cell: ({ row }) => (
				<Box>
					{row.original.player_name ? (
						<>
							<Text size='sm' fw={500}>
								{row.original.player_name}
							</Text>
							{row.original.server_id && (
								<Text size='xs' c='dimmed'>
									ID: {row.original.server_id}
								</Text>
							)}
							{row.original.player_id && (
								<Text size='xs' c='dimmed'>
									Steam: {row.original.player_id}
								</Text>
							)}
							{row.original.details?.discord_id && (
								<Text size='xs' c='dimmed'>
									Discord: {row.original.details.discord_id}
								</Text>
							)}
						</>
					) : (
						<Badge color='gray' variant='light'>
							System
						</Badge>
					)}
				</Box>
			),
			filterFn: playerFilterFn,
		},
		{
			id: 'event_type',
			header: 'Event Type',
			accessorFn: (row) => row.event_type,
			cell: ({ row }) => {
				const eventType = row.original.event_type;
				return (
					<Badge color='blue' variant='light'>
						{eventType}
					</Badge>
				);
			},
		},
		{
			id: 'timestamp',
			header: 'Timestamp',
			accessorFn: (row) => new Date(row.created_at),
			cell: ({ row }) => {
				const date = new Date(row.original.created_at);
				return <Text size='sm'>{format(date, 'yyyy-MM-dd HH:mm:ss')}</Text>;
			},
			filterFn: dateRangeFilterFn,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				return (
					<Button variant='subtle' size='xs' leftSection={<Eye size={14} />} onClick={() => handleOpenModal(row.original)}>
						Details
					</Button>
				);
			},
		},
	];

	const columns = useMemo(() => {
		return [...commonColumns, ...extraColumns];
	}, [extraColumns]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnFilters,
			globalFilter,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	if (isLoading && !hasAttemptedLoad) {
		return (
			<Box>
				<Center p='xl'>
					<Text>Loading logs...</Text>
				</Center>
			</Box>
		);
	}

	if (data.length === 0) {
		return (
			<Box>
				<Center p='xl'>
					<Text>No logs found. Try adjusting your search or check back later.</Text>
				</Center>
			</Box>
		);
	}

	return (
		<Box>
			<Paper shadow='xs' p={0} style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #2C2E33' }}>
				<ScrollArea>
					<Table striped highlightOnHover style={{ minWidth: 800 }}>
						<thead style={{ backgroundColor: '#1E1E1E' }}>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id} style={{ padding: '12px 16px', borderBottom: '1px solid #2C2E33' }}>
											{header.isPlaceholder ? null : (
												<Group gap={4} align='center' style={{ cursor: 'pointer' }} onClick={header.column.getToggleSortingHandler()}>
													<Text fw={500} size='sm'>
														{flexRender(header.column.columnDef.header, header.getContext())}
													</Text>
													<SortingIndicator column={header.column} />
												</Group>
											)}

											{header.column.id === 'player' && (
												<Box mt={8}>
													<TextInput
														placeholder='Search by name/ID/discord...'
														value={(header.column.getFilterValue() as string) ?? ''}
														onChange={(e) => header.column.setFilterValue(e.target.value)}
														size='xs'
														rightSection={
															header.column.getFilterValue() ? (
																<ActionIcon
																	size='xs'
																	onClick={(e) => {
																		e.stopPropagation();
																		header.column.setFilterValue(undefined);
																	}}
																>
																	<X size={12} />
																</ActionIcon>
															) : null
														}
													/>
												</Box>
											)}

											{header.column.id === 'event_type' && (
												<Box mt={8}>
													<TextInput
														placeholder='Search event type...'
														value={(header.column.getFilterValue() as string) ?? ''}
														onChange={(e) => header.column.setFilterValue(e.target.value)}
														size='xs'
														rightSection={
															header.column.getFilterValue() ? (
																<ActionIcon
																	size='xs'
																	onClick={(e) => {
																		e.stopPropagation();
																		header.column.setFilterValue(undefined);
																	}}
																>
																	<X size={12} />
																</ActionIcon>
															) : null
														}
													/>
												</Box>
											)}

											{header.column.id === 'timestamp' && (
												<Box mt={8}>
													<DateFilter column={header.column} />
												</Box>
											)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id} style={{ borderBottom: '1px solid #2C2E33' }}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} style={{ padding: '12px 16px' }}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</Table>
				</ScrollArea>

				{pagination && pagination.totalPages > 1 && (
					<Group justify='center' p='md' style={{ borderTop: '1px solid #2C2E33' }}>
						<Pagination total={pagination.totalPages} value={pagination.page} onChange={pagination.onPageChange} size='sm' radius='md' withEdges />
					</Group>
				)}
			</Paper>

			<Modal opened={modalOpen} onClose={handleCloseModal} title={<Text fw={700}>Log Details</Text>} size='lg'>
				{selectedLog && (
					<>
						<Box mb='md'>
							<Group mb='xs'>
								<Text fw={500}>Category:</Text>
								<Badge color='indigo'>{selectedLog.category || 'N/A'}</Badge>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Type:</Text>
								<Badge color='teal'>{selectedLog.type || 'N/A'}</Badge>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Event Type:</Text>
								<Badge color='blue'>{selectedLog.event_type}</Badge>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Player:</Text>
								<Text>{selectedLog.player_name || 'System'}</Text>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Server ID:</Text>
								<Text>{selectedLog.server_id || 'N/A'}</Text>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Steam ID:</Text>
								<Text>{selectedLog.player_id || 'N/A'}</Text>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Discord ID:</Text>
								<Text>{selectedLog.details?.discord_id || 'N/A'}</Text>
							</Group>

							<Group mb='xs'>
								<Text fw={500}>Time:</Text>
								<Text>{selectedLog.created_at ? format(new Date(selectedLog.created_at), 'MMM d, yyyy HH:mm:ss') : 'Unknown'}</Text>
							</Group>
						</Box>

						<Text fw={500} mb='xs'>
							Details:
						</Text>
						<Box
							style={{
								fontFamily: 'monospace',
								whiteSpace: 'pre-wrap',
								maxHeight: '400px',
								overflow: 'auto',
								backgroundColor: '#1E1E1E',
								padding: '12px',
								borderRadius: '4px',
								fontSize: '14px',
							}}
						>
							{formattedDetails}
						</Box>
					</>
				)}
			</Modal>
		</Box>
	);
}
