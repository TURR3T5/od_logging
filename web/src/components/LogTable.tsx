import { useMemo, useState, useEffect, useCallback } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, ColumnDef, flexRender, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { Table, ScrollArea, Paper, TextInput, Group, Box, Text, ActionIcon, Pagination, Center, Badge, Button, Modal } from '@mantine/core';
import { ArrowUp, ArrowDown, X, Eye } from '@phosphor-icons/react';
import { Log } from '../pages/Logs';
import { format } from 'date-fns';
import { DateTimePicker } from '@mantine/dates';

// Custom filter function for date range
const dateRangeFilterFn = (row: any, columnId: string, filterValue: [string, string]) => {
	// The filterValue is expected to be an array of two ISO date strings: [startDate, endDate]
	if (!filterValue || !Array.isArray(filterValue) || filterValue.length !== 2) {
		return true; // Invalid filter value, show all rows
	}

	const [startIso, endIso] = filterValue;

	try {
		const cellValue = row.getValue(columnId);

		// If the cell value isn't a valid date, always include the row
		if (!cellValue) return true;

		const cellDate = cellValue instanceof Date ? cellValue : new Date(cellValue);

		const startDate = new Date(startIso);
		const endDate = new Date(endIso);

		// Check if the cell date is within the range
		return cellDate >= startDate && cellDate <= endDate;
	} catch (e) {
		console.error('Error in date range filter:', e);
		return true; // On error, include the row
	}
};

// Component for the details modal
function DetailsModal({ isOpen, onClose, log }: { isOpen: boolean; onClose: () => void; log: Log | null }) {
	if (!log) return null;

	const formattedDetails = typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details || '');

	return (
		<Modal opened={isOpen} onClose={onClose} title={<Text fw={700}>Log Details</Text>} size='lg'>
			<Box mb='md'>
				<Group mb='xs'>
					<Text fw={500}>Event Type:</Text>
					<Badge color='blue'>{log.event_type}</Badge>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Player:</Text>
					<Text>{log.player_name || 'System'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Player ID:</Text>
					<Text>{log.player_id || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Time:</Text>
					<Text>{log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss') : 'Unknown'}</Text>
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
		</Modal>
	);
}

const createCommonColumns = (onViewDetails: (log: Log) => void): ColumnDef<Log>[] => [
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
					</>
				) : (
					<Badge color='gray' variant='light'>
						System
					</Badge>
				)}
			</Box>
		),
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
				<Button
					variant='subtle'
					size='xs'
					leftSection={<Eye size={14} />}
					onClick={(e) => {
						e.stopPropagation();
						onViewDetails(row.original);
					}}
				>
					Details
				</Button>
			);
		},
	},
];

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
		<Box style={{ width: '100%' }}>
			<Group style={{ width: '100%' }}>
				<Box style={{ width: '50%' }}>
					<DateTimePicker
						placeholder='Start date'
						valueFormat='DD MMM YYYY HH:mm'
						clearable
						size='xs'
						value={startDate}
						onChange={handleStartDateChange}
						style={{ width: '100%' }}
						rightSection={
							startDate ? (
								<ActionIcon
									size='xs'
									onClick={() => {
										setStartDate(null);
										applyFilters(null, endDate);
									}}
								>
									<X size={12} />
								</ActionIcon>
							) : null
						}
					/>
				</Box>

				<Box style={{ width: '50%' }}>
					<DateTimePicker
						placeholder='End date'
						valueFormat='DD MMM YYYY HH:mm'
						clearable
						size='xs'
						value={endDate}
						onChange={handleEndDateChange}
						style={{ width: '100%' }}
						rightSection={
							endDate ? (
								<ActionIcon
									size='xs'
									onClick={() => {
										setEndDate(null);
										applyFilters(startDate, null);
									}}
								>
									<X size={12} />
								</ActionIcon>
							) : null
						}
					/>
				</Box>
			</Group>
		</Box>
	);
}

// Component for displaying the sort indicator
function SortingIndicator({ column }: { column: any }) {
	if (!column.getIsSorted()) {
		return null;
	}

	return column.getIsSorted() === 'asc' ? <ArrowUp size={14} style={{ marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ marginLeft: '4px' }} />;
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
}

export default function LogTable({ data, isLoading, pagination, extraColumns = [] }: LogTableProps) {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
	const [selectedLog, setSelectedLog] = useState<Log | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	// Set hasAttemptedLoad to true after first load attempt
	useEffect(() => {
		if (isLoading) {
			setHasAttemptedLoad(true);
		}
	}, [isLoading]);

	// Direct handler for viewing details
	const handleViewDetails = useCallback((log: Log) => {
		setSelectedLog(log);
		setModalOpen(true);
	}, []);

	// Close modal
	const handleCloseDetails = useCallback(() => {
		setModalOpen(false);
	}, []);

	// Combine common columns with any extra columns specific to this log type
	const columns = useMemo(() => {
		return [...createCommonColumns(handleViewDetails), ...extraColumns];
	}, [extraColumns, handleViewDetails]);

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
			{/* Details modal */}
			<DetailsModal isOpen={modalOpen} onClose={handleCloseDetails} log={selectedLog} />


			<Paper shadow='xs' p={0} style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #2C2E33' }}>
				<ScrollArea>
					<Table striped highlightOnHover style={{ minWidth: 800 }}>
						<thead style={{ backgroundColor: '#1E1E1E' }}>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id} style={{ padding: '12px 16px', borderBottom: '1px solid #2C2E33' }}>
											{header.isPlaceholder ? null : (
												<Box onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
													<Text fw={500} size='sm'>
														{flexRender(header.column.columnDef.header, header.getContext())}
														<SortingIndicator column={header.column} />
													</Text>
												</Box>
											)}

											{header.column.id === 'player' && (
												<Box mt={8}>
													<TextInput
														placeholder='Search player...'
														value={(header.column.getFilterValue() as string) ?? ''}
														onChange={(e) => header.column.setFilterValue(e.target.value)}
														size='xs'
														rightSection={
															header.column.getFilterValue() ? (
																<ActionIcon size='xs' onClick={() => header.column.setFilterValue(undefined)}>
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
																<ActionIcon size='xs' onClick={() => header.column.setFilterValue(undefined)}>
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
		</Box>
	);
}
