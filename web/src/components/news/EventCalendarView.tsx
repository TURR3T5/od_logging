import { Grid, Box, Paper, Title, Group, Card, Badge, Text, Menu, ActionIcon, Button, Indicator } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { Ellipsis, CheckCircle, Pin, Pencil, Trash, CalendarCheck } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ContentItem } from '../../lib/NewsEventsService';

interface EventCalendarViewProps {
	selectedDate: Date | null;
	setSelectedDate: (date: Date | null) => void;
	filteredItems: ContentItem[];
	items: ContentItem[];
	isAuthorized: boolean;
	handleOpenItemModal: (item: ContentItem) => void;
	togglePinItem: (id: string) => void;
	handleOpenEditModal: (item: ContentItem) => void;
	handleDeleteItem: (id: string) => void;
}

export function EventCalendarView({ selectedDate, setSelectedDate, filteredItems, items, isAuthorized, handleOpenItemModal, togglePinItem, handleOpenEditModal, handleDeleteItem }: EventCalendarViewProps) {
	const getTypeDetails = (item: ContentItem) => {
		switch (item.event_type) {
			case 'official':
				return { color: 'blue', label: 'Official', icon: <CalendarCheck size={16} /> };
			case 'community':
				return { color: 'green', label: 'Community', icon: <CalendarCheck size={16} /> };
			case 'special':
				return { color: 'purple', label: 'Special', icon: <CalendarCheck size={16} /> };
			default:
				return { color: 'gray', label: 'Event', icon: <CalendarCheck size={16} /> };
		}
	};

	const renderDayContent = (date: Date) => {
		const dayEvents = items.filter((item) => item.type === 'event' && item.event_date && isSameDay(new Date(item.event_date), date));

		if (dayEvents.length === 0) return <Box>{date.getDate()}</Box>;

		const colors = dayEvents.map((item) => {
			if (item.type === 'event') {
				switch (item.event_type) {
					case 'official':
						return 'blue';
					case 'community':
						return 'green';
					case 'special':
						return 'purple';
					default:
						return 'gray';
				}
			}
			return 'gray';
		});

		const color = colors.includes('blue') ? 'blue' : colors.includes('purple') ? 'purple' : 'green';

		return (
			<Indicator size={8} color={color} offset={-2}>
				<Box>{date.getDate()}</Box>
			</Indicator>
		);
	};

	return (
		<Grid gutter='md' align='stretch'>
			<Grid.Col span={{ base: 12, md: 5 }}>
				<Calendar
					date={selectedDate || undefined}
					onDateChange={setSelectedDate}
					locale='da'
					size='lg'
					styles={(theme) => ({
						calendarHeader: {
							minWidth: '100%',
						},
						monthCell: {
							padding: theme.spacing.xs,
						},
					})}
					getDayProps={(date) => ({
						onClick: () => setSelectedDate(date),
					})}
					renderDay={(date) => renderDayContent(date)}
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 7 }}>
				<Paper withBorder p='md' radius='md' h='98%'>
					<Group justify='space-between' mb='md'>
						<Title order={3}>{selectedDate ? <>Events {format(selectedDate, 'd. MMMM yyyy')}</> : <>Vælg en dato</>}</Title>
					</Group>

					{filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<Card key={item.id} withBorder mb='md' padding='md' radius='md'>
								<Group justify='space-between' mb='xs'>
									<Group>
										<Badge color={getTypeDetails(item).color} leftSection={getTypeDetails(item).icon}>
											{getTypeDetails(item).label}
										</Badge>
										<Text fw={700}>{item.title}</Text>
									</Group>
									<Menu shadow='md' width={200} position='bottom-end'>
										<Menu.Target>
											<ActionIcon>
												<Ellipsis size={20} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Item onClick={() => handleOpenItemModal(item)} leftSection={<CheckCircle size={14} />}>
												Se detaljer
											</Menu.Item>
											{isAuthorized && (
												<>
													<Menu.Item onClick={() => togglePinItem(item.id)} leftSection={<Pin size={14} />}>
														{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
													</Menu.Item>
													<Menu.Item onClick={() => handleOpenEditModal(item)} leftSection={<Pencil size={14} />}>
														Rediger
													</Menu.Item>
													<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => handleDeleteItem(item.id)}>
														Slet
													</Menu.Item>
												</>
											)}
										</Menu.Dropdown>
									</Menu>
								</Group>
								<Group>
									<Text c='dimmed' size='sm'>
										{item.event_date ? format(new Date(item.event_date || new Date()), 'HH:mm') : ''}
									</Text>
									{item.location && (
										<Text c='dimmed' size='sm'>
											Lokation: {item.location}
										</Text>
									)}
								</Group>
								<Text lineClamp={2} mt='sm'>
									{item.description}
								</Text>
								<Button variant='subtle' size='sm' mt='sm' onClick={() => handleOpenItemModal(item)}>
									Læs mere
								</Button>
							</Card>
						))
					) : (
						<Text c='dimmed' ta='center'>
							Ingen events denne dag
						</Text>
					)}
				</Paper>
			</Grid.Col>
		</Grid>
	);
}
