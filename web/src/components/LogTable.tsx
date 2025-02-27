import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, getFacetedMinMaxValues, ColumnDef, flexRender, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { Table, ScrollArea, Paper, TextInput, Group, Box, Text, Select, ActionIcon, Tooltip, Pagination, Center, useMantineTheme } from '@mantine/core';
import { Faders, ArrowUp, ArrowDown, X } from '@phosphor-icons/react';
import { Log } from '../pages/Logs';
import { formatDistanceToNow } from 'date-fns';

const createCommonColumns = (): ColumnDef<Log>[] => [
	{
		id: 'timestamp',
		header: 'Timestamp',
		accessorFn: (row) => new Date(row.created_at),
		cell: ({ row }) => {
			const date = new Date(row.original.created_at);
			return (
				<Tooltip label={date.toLocaleString()}>
					<Text size='sm'>{formatDistanceToNow(date, { addSuffix: true })}</Text>
				</Tooltip>
			);
		},
	},
	{
		id: 'server_id',
		header: 'Server',
		accessorFn: (row) => row.server_id,
	},
	{
		id: 'event_type',
		header: 'Event Type',
		accessorFn: (row) => row.event_type,
	},
	{
		id: 'player',
		header: 'Player',
		accessorFn: (row) => row.player_name || 'System',
		cell: ({ row }) => (
			<Box>
				<Text size='sm'>{row.original.player_name || 'System'}</Text>
				{row.original.player_id && (
					<Text size='xs' color='dimmed'>
						ID: {row.original.player_id}
					</Text>
				)}
			</Box>
		),
	},
	{
		id: 'details',
		header: 'Details',
		accessorFn: (row) => JSON.stringify(row.details),
		cell: ({ row }) => {
			const details = row.original.details;
			let formattedDetails: string;

			if (typeof details === 'object') {
				formattedDetails = JSON.stringify(details, null, 2);
			} else {
				formattedDetails = String(details || '');
			}

			return (
				<Box
					style={{
						fontFamily: 'monospace',
						whiteSpace: 'pre-wrap',
						maxHeight: '100px',
						overflow: 'auto',
					}}
				>
					{formattedDetails}
				</Box>
			);
		},
	},
];

interface FilterProps {
	column: any;
	table: any;
}

// Filter component for each column
function ColumnFilter({ column, table }: FilterProps) {
	const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

	const columnFilterValue = column.getFilterValue();

	// Numeric filter
	if (typeof firstValue === 'number') {
		return (
			<Group gap='xs'>
				<TextInput
					placeholder='Min'
					value={(columnFilterValue as [number, number])?.[0] ?? ''}
					onChange={(e) => {
						const val = e.target.value;
						column.setFilterValue((old: [number, number]) => [val ? parseInt(val, 10) : undefined, old?.[1]]);
					}}
					size='xs'
				/>
				<TextInput
					placeholder='Max'
					value={(columnFilterValue as [number, number])?.[1] ?? ''}
					onChange={(e) => {
						const val = e.target.value;
						column.setFilterValue((old: [number, number]) => [old?.[0], val ? parseInt(val, 10) : undefined]);
					}}
					size='xs'
				/>
			</Group>
		);
	}

	// Date filter
	if (firstValue instanceof Date) {
		return (
			<Group gap='xs'>
				<TextInput placeholder='Search...' value={(columnFilterValue as string) ?? ''} onChange={(e) => column.setFilterValue(e.target.value)} size='xs' />
			</Group>
		);
	}

	// Dropdown filter for columns with limited options
	const uniqueValues = Array.from(column.getFacetedUniqueValues().keys()).sort();
	if (uniqueValues.length <= 20) {
		const options = uniqueValues.map((value) => ({
			value: String(value),
			label: String(value),
		}));

		return <Select placeholder='Filter...' data={options} value={columnFilterValue?.toString() || ''} onChange={(value) => column.setFilterValue(value)} clearable size='xs' />;
	}

	// Default text filter
	return (
		<Group gap='xs'>
			<TextInput
				placeholder='Search...'
				value={(columnFilterValue as string) ?? ''}
				onChange={(e) => column.setFilterValue(e.target.value)}
				rightSection={
					columnFilterValue ? (
						<ActionIcon size='xs' onClick={() => column.setFilterValue(undefined)}>
							<X size={12} />
						</ActionIcon>
					) : null
				}
				size='xs'
			/>
		</Group>
	);
}

// Component for displaying the sort indicator
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
}

export default function LogTable({ data, isLoading, pagination, extraColumns = [] }: LogTableProps) {
	const theme = useMantineTheme();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	// Combine common columns with any extra columns specific to this log type
	const columns = useMemo(() => {
		return [...createCommonColumns(), ...extraColumns];
	}, [extraColumns]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
	});

	if (isLoading) {
		return (
			<Center p='xl'>
				<Text>Loading logs...</Text>
			</Center>
		);
	}

	if (data.length === 0) {
		return (
			<Center p='xl'>
				<Text>No logs found. Try adjusting your filters or check back later.</Text>
			</Center>
		);
	}

	return (
		<Paper shadow='xs' p={0}>
			<ScrollArea>
				<Table striped highlightOnHover style={{ minWidth: 800 }}>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th key={header.id}>
										<Box mb={8}>
											{header.isPlaceholder ? null : (
												<Group justify='space-between' gap='xs'>
													<Text fw={500} onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }}>
														{flexRender(header.column.columnDef.header, header.getContext())}
														<Box component='span' ml={4}>
															<SortingIndicator column={header.column} />
														</Box>
													</Text>
													{header.column.getCanFilter() && (
														<Box>
															<Faders size={14} color={theme.colors.gray[5]} />
														</Box>
													)}
												</Group>
											)}
										</Box>

										{/* Add filter inputs below the header text */}
										{header.column.getCanFilter() && (
											<Box>
												<ColumnFilter column={header.column} table={table} />
											</Box>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
								))}
							</tr>
						))}
					</tbody>
				</Table>
			</ScrollArea>

			{pagination && (
				<Group ta='center' mt='md' mb='md'>
					<Pagination total={pagination.totalPages} value={pagination.page} onChange={pagination.onPageChange} size='sm' />
				</Group>
			)}
		</Paper>
	);
}
