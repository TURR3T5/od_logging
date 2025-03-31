import { useState } from 'react';
import { Group, ActionIcon } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { X } from '../components/icons';

interface DateFilterProps {
	column?: any;
	onDateRangeChange: (range: { start: string; end: string } | null) => void;
}

export function DateFilter({ onDateRangeChange }: DateFilterProps) {
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);

	const handleStartDateChange = (date: Date | null) => {
		setStartDate(date);
		if (date && endDate) {
			onDateRangeChange({
				start: date.toISOString(),
				end: endDate.toISOString(),
			});
		} else if (!date && !endDate) {
			onDateRangeChange(null);
		}
	};

	const handleEndDateChange = (date: Date | null) => {
		setEndDate(date);
		if (startDate && date) {
			onDateRangeChange({
				start: startDate.toISOString(),
				end: date.toISOString(),
			});
		} else if (!startDate && !date) {
			onDateRangeChange(null);
		}
	};

	return (
		<Group gap='xs'>
			<DateTimePicker
				placeholder='Start date'
				valueFormat='DD MMM YYYY HH:mm'
				clearable
				size='sm'
				value={startDate}
				onChange={handleStartDateChange}
				rightSection={
					startDate ? (
						<ActionIcon
							size='xs'
							onClick={(e) => {
								e.stopPropagation();
								setStartDate(null);
								if (!endDate) {
									onDateRangeChange(null);
								}
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
				size='sm'
				value={endDate}
				onChange={handleEndDateChange}
				rightSection={
					endDate ? (
						<ActionIcon
							size='xs'
							onClick={(e) => {
								e.stopPropagation();
								setEndDate(null);
								if (!startDate) {
									onDateRangeChange(null);
								}
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
