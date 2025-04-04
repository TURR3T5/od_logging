import { useState, lazy, Suspense } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, ColumnDef, flexRender } from '@tanstack/react-table';
import { Table, ScrollArea, Paper, TextInput, Group, Box, Text, Pagination, Center, Badge, Button } from '@mantine/core';
import { ArrowUp, ArrowDown, Eye, Search } from 'lucide-react';
import { Log } from '../pages/Logs';
import { SearchFilters } from '../hooks/useLogsSearch';
import { format } from 'date-fns';
import { useDataTable } from '../hooks/useDataTable';
import { DateFilter } from '../filters/DateFilter';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useModalState } from '../hooks/useModalState';

const LogDetailsModal = lazy(() => import(/*webpackChunkName: "log-details"*/ './LogDetailsModal'));

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

const playerFilterFn = (row: any, filterValue: any) => {
	if (!filterValue) return true;

	const searchTerm = String(filterValue).toLowerCase();
	const txname = String(row.original.txname || '').toLowerCase();
	const charname = String(row.original.charname || '').toLowerCase();
	const citizenid = String(row.original.citizenid || '').toLowerCase();
	const discord = String(row.original.discord || '').toLowerCase();

	return txname.includes(searchTerm) || charname.includes(searchTerm) || citizenid.includes(searchTerm) || discord.includes(searchTerm);
};

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
	onSearch?: (filters: SearchFilters) => void;
}

export default function LogTable({ data, isLoading, pagination, extraColumns = [], onSearch }: LogTableProps) {
	const logDetailsModal = useModalState<Log>();
	const [playerSearchTerm, setPlayerSearchTerm] = useState('');
	const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
	const { sorting, setSorting, columnFilters, setColumnFilters, globalFilter, setGlobalFilter } = useDataTable({
		initialSorting: [{ id: 'timestamp', desc: true }],
	});

	const handleOpenModal = (log: Log) => {
		logDetailsModal.open(log);
	};

	const handleCloseModal = () => {
		logDetailsModal.close();
	};

	const handleSearchSubmit = () => {
		if (onSearch) {
			onSearch({
				playerSearch: playerSearchTerm,
				eventTypeSearch: eventTypeSearchTerm,
				dateRange: dateRange,
			});
		}
	};

	const handleClearSearch = () => {
		setPlayerSearchTerm('');
		setEventTypeSearchTerm('');
		setDateRange(null);
		if (onSearch) {
			onSearch({
				playerSearch: '',
				eventTypeSearch: '',
				dateRange: null,
			});
		}
	};

	const commonColumns: ColumnDef<Log>[] = [
		{
			id: 'player',
			header: 'Spiller',
			accessorFn: (row) => row.charname || 'System',
			cell: ({ row }) => (
				<Box style={{ width: '250px', minWidth: '250px' }}>
					{row.original.txname || row.original.charname ? (
						<>
							<Text size='sm' fw={500}>
								{row.original.charname ? row.original.charname : 'Unknown'}
							</Text>
							{row.original.txname && (
								<Text size='xs' c='dimmed'>
									{row.original.txname} {row.original.source ? `(${row.original.source})` : ''}
								</Text>
							)}
							{row.original.charname && (
								<Text size='xs' c='dimmed'>
									{row.original.charname} {row.original.citizenid ? `(${row.original.citizenid})` : ''}
								</Text>
							)}
							{row.original.discord && (
								<Text size='xs' c='dimmed'>
									Discord: {row.original.discord}
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
			header: 'Event',
			accessorFn: (row) => row.event,
			cell: ({ row }) => {
				const eventType = row.original.event;
				return (
					<Box style={{ width: '180px', minWidth: '180px' }}>
						<Badge color='blue' variant='light'>
							{eventType}
						</Badge>
					</Box>
				);
			},
		},
		{
			id: 'timestamp',
			header: 'Tidspunkt',
			accessorFn: (row) => new Date(row.created_at),
			cell: ({ row }) => {
				const date = new Date(row.original.created_at);
				return (
					<Box style={{ width: '180px', minWidth: '180px' }}>
						<Text size='sm'>{format(date, 'yyyy-MM-dd HH:mm:ss')}</Text>
					</Box>
				);
			},
			filterFn: dateRangeFilterFn,
		},
		{
			id: 'actions',
			header: 'Handlinger',
			cell: ({ row }) => {
				return (
					<Box style={{ width: '100px', minWidth: '100px' }}>
						<Button variant='subtle' size='xs' leftSection={<Eye size={14} />} onClick={() => handleOpenModal(row.original)}>
							Detaljer
						</Button>
					</Box>
				);
			},
		},
	];

	const columns = [...commonColumns, ...extraColumns];

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

	if (isLoading) {
		return <LoadingState text='Indlæser data...' />;
	}

	if (data.length === 0) {
		return <EmptyState title='Ingen data' message='Der er ingen data at vise.' />;
	}

	if (data.length === 0 && !isLoading) {
		return (
			<Box>
				<Paper shadow='xs' p='md' radius='md' withBorder style={{ borderColor: '#2C2E33' }}>
					<Box mb='md'>
						<Group justify='space-between' mb='xs'>
							<Text fw={500}>Search Logs</Text>
							<Group>
								<Button size='xs' variant='outline' color='gray' onClick={handleClearSearch}>
									Clear
								</Button>
								<Button size='xs' color='blue' leftSection={<Search size={14} />} onClick={handleSearchSubmit}>
									Search
								</Button>
							</Group>
						</Group>
						<Group mb='xs' gap='xs'>
							<TextInput placeholder='Search players, IDs, Discord...' size='sm' value={playerSearchTerm} onChange={(e) => setPlayerSearchTerm(e.target.value)} style={{ flex: 1 }} />
							<TextInput placeholder='Event type' size='sm' value={eventTypeSearchTerm} onChange={(e) => setEventTypeSearchTerm(e.target.value)} style={{ flex: 1 }} />
							<DateFilter
								column={null}
								onDateRangeChange={(range) => {
									setDateRange(range);
								}}
							/>
						</Group>
					</Box>
					<Center p='xl'>
						<Text>No logs found. Try adjusting your search or check back later.</Text>
					</Center>
				</Paper>
			</Box>
		);
	}

	return (
		<Box>
			<Paper shadow='xs' p={0} style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #2C2E33' }}>
				<Box p='md' style={{ borderBottom: '1px solid #2C2E33', backgroundColor: '#1a1a1a' }}>
					<Group justify='space-between' mb='xs'>
						<Text fw={500}>Search Logs</Text>
						<Group>
							<Button size='xs' variant='outline' color='gray' onClick={handleClearSearch}>
								Clear
							</Button>
							<Button size='xs' color='blue' leftSection={<Search size={14} />} onClick={handleSearchSubmit}>
								Search
							</Button>
						</Group>
					</Group>
					<Group mb='xs' style={{ gap: 8, display: 'flex' }}>
						<TextInput placeholder='Search players, IDs, Discord...' size='sm' value={playerSearchTerm} onChange={(e) => setPlayerSearchTerm(e.target.value)} style={{ flex: 1 }} />
						<TextInput placeholder='Event type' size='sm' value={eventTypeSearchTerm} onChange={(e) => setEventTypeSearchTerm(e.target.value)} style={{ flex: 1 }} />
						<DateFilter
							column={null}
							onDateRangeChange={(range) => {
								setDateRange(range);
							}}
						/>
					</Group>
				</Box>

				<ScrollArea>
					<Table striped highlightOnHover style={{ minWidth: 800, tableLayout: 'fixed' }}>
						<thead style={{ backgroundColor: '#1E1E1E' }}>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											style={{
												padding: '12px 16px',
												borderBottom: '1px solid #2C2E33',
												width: header.id === 'player' ? '250px' : header.id === 'event_type' ? '180px' : header.id === 'timestamp' ? '180px' : header.id === 'actions' ? '100px' : 'auto',
												minWidth: header.id === 'player' ? '250px' : header.id === 'event_type' ? '180px' : header.id === 'timestamp' ? '180px' : header.id === 'actions' ? '100px' : 'auto',
											}}
										>
											{header.isPlaceholder ? null : (
												<Group gap={4} align='center' style={{ cursor: 'pointer' }} onClick={header.column.getToggleSortingHandler()}>
													<Text fw={500} size='sm'>
														{flexRender(header.column.columnDef.header, header.getContext())}
													</Text>
													<SortingIndicator column={header.column} />
												</Group>
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
										<td
											key={cell.id}
											style={{
												padding: '12px 16px',
												width: cell.column.id === 'player' ? '250px' : cell.column.id === 'event_type' ? '180px' : cell.column.id === 'timestamp' ? '180px' : cell.column.id === 'actions' ? '100px' : 'auto',
												minWidth: cell.column.id === 'player' ? '250px' : cell.column.id === 'event_type' ? '180px' : cell.column.id === 'timestamp' ? '180px' : cell.column.id === 'actions' ? '100px' : 'auto',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
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

			<Suspense>
				<LogDetailsModal opened={logDetailsModal.isOpen} onClose={handleCloseModal} selectedLog={logDetailsModal.data} />
			</Suspense>
		</Box>
	);
}
