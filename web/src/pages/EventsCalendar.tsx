import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Group, Button, Modal, TextInput, Textarea, Paper, Badge, ActionIcon, Card, Menu, Indicator, Divider, Timeline, Grid } from '@mantine/core';
import { DatePickerInput, Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Plus, DotsThree, CalendarCheck, ArrowRight, Trash, CheckCircle } from '@phosphor-icons/react';
import 'dayjs/locale/da';
import { format, isSameDay } from 'date-fns';
import { da } from 'date-fns/locale';

interface EventType {
	id: string;
	title: string;
	description: string;
	date: Date;
	type: 'community' | 'official' | 'special';
	createdBy?: string;
}

export default function EventsCalendarPage() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [events, setEvents] = useState<EventType[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
	const [opened, { open, close }] = useDisclosure(false);
	const [eventModalOpened, { open: openEventModal, close: closeEventModal }] = useDisclosure(false);
	const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
	const { isAuthorized, user } = useAuth();
	const [newEvent, setNewEvent] = useState<Omit<EventType, 'id'>>({
		title: '',
		description: '',
		date: new Date(),
		type: 'community',
	});
	const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

	useEffect(() => {
		const mockEvents: EventType[] = [
			{
				id: '1',
				title: 'Bilshow i Vinewood',
				description: 'Det årlige vinewood bilshow hvor du kan vise dine bedste biler frem, der er præmie for den bedste og mest stilfulde bil. Mød op i din mest imponerende bil og deltag i konkurrencen. Vi har inviteret en række lokale virksomheder som sponsorer, og der vil være forfriskninger og mad til alle deltagere.',
				date: new Date(2025, 2, 29, 18, 0),
				type: 'official',
			},
			{
				id: '2',
				title: 'Politiåben-hus dag',
				description: 'Kom og mød politistyrken og lær om deres arbejde. Der vil være fremvisning af udstyr, køretøjer og mulighed for at stille spørgsmål til betjentene. Arrangementet er for alle borgere i byen og er en del af politiets arbejde med at forbedre forholdet til lokalsamfundet.',
				date: new Date(2025, 2, 21, 14, 0),
				type: 'community',
			},
			{
				id: '3',
				title: 'Paleto Bay Festival',
				description: 'Årlig festival i Paleto Bay med musik, mad og underholdning. Der vil være livemusik fra lokale bands, madstande fra byens bedste restauranter, og forskellige aktiviteter for både børn og voksne. Festivalen varer hele dagen, så kom forbi når det passer dig!',
				date: new Date(2025, 3, 5, 10, 0),
				type: 'special',
			},
		];

		setEvents(mockEvents);
		filterEventsByDate(selectedDate, mockEvents);
	}, []);

	const filterEventsByDate = (date: Date | null, eventsList = events) => {
		if (!date) {
			setFilteredEvents([]);
			return;
		}

		const filtered = eventsList.filter((event) => {
			const eventDate = new Date(event.date);
			return isSameDay(eventDate, date);
		});

		setFilteredEvents(filtered);
	};

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
		filterEventsByDate(date);
	};

	const handleCreateEvent = () => {
		if (!newEvent.title || !newEvent.description || !newEvent.date) {
			notifications.show({
				title: 'Manglende information',
				message: 'Venligst udfyld alle felter',
				color: 'red',
			});
			return;
		}

		const event: EventType = {
			id: Date.now().toString(),
			title: newEvent.title,
			description: newEvent.description,
			date: newEvent.date,
			type: newEvent.type,
			createdBy: user?.username || 'Unknown',
		};

		const updatedEvents = [...events, event];
		setEvents(updatedEvents);
		filterEventsByDate(selectedDate, updatedEvents);

		setNewEvent({
			title: '',
			description: '',
			date: new Date(),
			type: 'community',
		});

		close();

		notifications.show({
			title: 'Begivenhed oprettet',
			message: 'Din begivenhed er blevet tilføjet til kalenderen',
			color: 'green',
		});
	};

	const handleDeleteEvent = (id: string) => {
		const updatedEvents = events.filter((event) => event.id !== id);
		setEvents(updatedEvents);
		filterEventsByDate(selectedDate, updatedEvents);

		if (selectedEvent?.id === id) {
			closeEventModal();
		}

		notifications.show({
			title: 'Begivenhed slettet',
			message: 'Begivenheden er blevet fjernet fra kalenderen',
			color: 'red',
		});
	};

	const handleEventClick = (event: EventType) => {
		setSelectedEvent(event);
		openEventModal();
	};

	const getEventBadgeColor = (type: string) => {
		switch (type) {
			case 'official':
				return 'blue';
			case 'community':
				return 'green';
			case 'special':
				return 'purple';
			default:
				return 'gray';
		}
	};

	const renderDayContent = (date: Date) => {
		const dayEvents = events.filter((event) => isSameDay(new Date(event.date), date));

		if (dayEvents.length === 0) {
			return null;
		}

		return (
			<Indicator size={8} color={dayEvents[0].type === 'official' ? 'blue' : dayEvents[0].type === 'special' ? 'purple' : 'green'} offset={-2} disabled={dayEvents.length === 0}>
				<Box>{date.getDate()}</Box>
			</Indicator>
		);
	};

	return (
		<MainLayout requireAuth={false}>
			<Container size='xl' py='xl'>
				<Group justify='space-between' mb='xl'>
					<Title order={1}>Begivenheder Kalender</Title>
					{isAuthorized && (
						<Button onClick={open} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }} leftSection={<Plus size={16} />}>
							Opret Begivenhed
						</Button>
					)}
				</Group>

				<Group mb='md' align='center'>
					<Button.Group>
						<Button variant={viewMode === 'month' ? 'filled' : 'outline'} onClick={() => setViewMode('month')}>
							Måned
						</Button>
						<Button variant={viewMode === 'list' ? 'filled' : 'outline'} onClick={() => setViewMode('list')}>
							Liste
						</Button>
					</Button.Group>
				</Group>

				{viewMode === 'month' && (
					<Grid gutter='md'>
						<Grid.Col span={{ base: 12, md: 7 }}>
							<Paper shadow='md' radius='md' withBorder mb='xl'>
								<Box p='md'>
									<Calendar
										date={selectedDate || undefined}
										onDateChange={handleDateChange}
										locale='da'
										size='xl'
										styles={(theme) => ({
											day: {
												borderRadius: theme.radius.sm,
												'&[data-selected]': {
													backgroundColor: theme.colors.blue[6],
												},
												'&[data-in-range]': {
													backgroundColor: theme.colors.blue[5],
													color: theme.white,
												},
											},
										})}
										getDayProps={(date) => ({
											onClick: () => handleDateChange(date),
										})}
										renderDay={(date) => renderDayContent(date)}
									/>
								</Box>
							</Paper>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 5 }}>
							<Paper shadow='md' radius='md' withBorder mb='xl' p='md'>
								<Title order={3} mb='md'>
									<Group gap='xs'>
										<CalendarCheck size={22} />
										Kommende Begivenheder
									</Group>
								</Title>

								<Timeline active={0} bulletSize={24} lineWidth={2}>
									{events
										.filter((event) => new Date(event.date) >= new Date())
										.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
										.slice(0, 5)
										.map((event, _index) => (
											<Timeline.Item
												key={event.id}
												title={
													<Group gap='xs'>
														<Text fw={600}>{event.title}</Text>
														<Badge size='sm' color={getEventBadgeColor(event.type)}>
															{event.type === 'official' ? 'Officiel' : event.type === 'community' ? 'Fællesskab' : 'Special'}
														</Badge>
													</Group>
												}
											>
												<Text size='sm' c='dimmed' mb={4}>
													{format(new Date(event.date), 'd. MMMM yyyy, HH:mm', { locale: da })}
												</Text>
												<Text size='sm' lineClamp={2}>
													{event.description}
												</Text>
												<Button variant='subtle' size='xs' mt='xs' onClick={() => handleEventClick(event)}>
													Læs mere
												</Button>
											</Timeline.Item>
										))}

									{events.filter((event) => new Date(event.date) >= new Date()).length === 0 && (
										<Box py='md' ta='center'>
											<Text c='dimmed' fz='sm'>
												Ingen kommende begivenheder
											</Text>
										</Box>
									)}
								</Timeline>

								<Button variant='light' fullWidth mt='md' onClick={() => setViewMode('list')} rightSection={<ArrowRight size={16} />}>
									Vis alle begivenheder
								</Button>
							</Paper>
						</Grid.Col>
					</Grid>
				)}

				{selectedDate && filteredEvents.length > 0 && viewMode === 'month' && (
					<Paper shadow='md' radius='md' p='md' withBorder>
						<Group mb='md'>
							<CalendarCheck size={22} />
							<Title order={3}>Begivenheder d. {format(selectedDate, 'd. MMMM yyyy', { locale: da })}</Title>
						</Group>

						<Box>
							{filteredEvents.map((event) => (
								<Card key={event.id} mb='md' padding='md' radius='md' withBorder>
									<Group justify='space-between' mb='xs'>
										<Group>
											<Badge color={getEventBadgeColor(event.type)}>{event.type === 'official' ? 'Officiel' : event.type === 'community' ? 'Fællesskab' : 'Special'}</Badge>
											<Text fw={700}>{event.title}</Text>
										</Group>
										<Menu shadow='md' width={200} position='bottom-end'>
											<Menu.Target>
												<ActionIcon>
													<DotsThree size={20} />
												</ActionIcon>
											</Menu.Target>
											<Menu.Dropdown>
												<Menu.Item onClick={() => handleEventClick(event)} leftSection={<CheckCircle size={14} />}>
													Se detaljer
												</Menu.Item>
												{isAuthorized && (
													<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => handleDeleteEvent(event.id)}>
														Slet begivenhed
													</Menu.Item>
												)}
											</Menu.Dropdown>
										</Menu>
									</Group>
									<Group>
										<Text c='dimmed' size='sm'>
											{format(new Date(event.date), 'HH:mm')}
										</Text>
										{event.createdBy && (
											<Text c='dimmed' size='sm'>
												Oprettet af: {event.createdBy}
											</Text>
										)}
									</Group>
									<Text lineClamp={2} mt='sm'>
										{event.description}
									</Text>
									<Button variant='subtle' size='sm' mt='sm' onClick={() => handleEventClick(event)}>
										Læs mere
									</Button>
								</Card>
							))}
						</Box>
					</Paper>
				)}

				{viewMode === 'list' && (
					<Paper shadow='md' radius='md' p='md' withBorder>
						<Title order={3} mb='md'>
							Kommende Begivenheder
						</Title>

						{events.length === 0 ? (
							<Text ta='center' fz='sm' c='dimmed' py='xl'>
								Der er ingen kommende begivenheder
							</Text>
						) : (
							events
								.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
								.map((event, index, arr) => {
									const currentMonth = format(new Date(event.date), 'MMMM yyyy', { locale: da });
									const showMonthDivider = index === 0 || currentMonth !== format(new Date(arr[index - 1].date), 'MMMM yyyy', { locale: da });

									return (
										<Box key={event.id}>
											{showMonthDivider && <Divider label={currentMonth} labelPosition='center' mb='md' mt={index > 0 ? 'xl' : 0} />}

											<Card mb='md' padding='md' radius='md' withBorder>
												<Group justify='space-between' mb='xs'>
													<Group>
														<Badge color={getEventBadgeColor(event.type)}>{event.type === 'official' ? 'Officiel' : event.type === 'community' ? 'Fællesskab' : 'Special'}</Badge>
														<Text fw={700}>{event.title}</Text>
													</Group>
													<Group>
														<Badge variant='outline'>{format(new Date(event.date), 'd. MMM', { locale: da })}</Badge>
														<Menu shadow='md' width={200} position='bottom-end'>
															<Menu.Target>
																<ActionIcon>
																	<DotsThree size={20} />
																</ActionIcon>
															</Menu.Target>
															<Menu.Dropdown>
																<Menu.Item onClick={() => handleEventClick(event)} leftSection={<CheckCircle size={14} />}>
																	Se detaljer
																</Menu.Item>
																{isAuthorized && (
																	<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => handleDeleteEvent(event.id)}>
																		Slet begivenhed
																	</Menu.Item>
																)}
															</Menu.Dropdown>
														</Menu>
													</Group>
												</Group>
												<Group>
													<Text c='dimmed' size='sm'>
														{format(new Date(event.date), 'HH:mm')}
													</Text>
													{event.createdBy && (
														<Text c='dimmed' size='sm'>
															Oprettet af: {event.createdBy}
														</Text>
													)}
												</Group>
												<Text lineClamp={2} mt='sm'>
													{event.description}
												</Text>
												<Button variant='subtle' size='sm' mt='sm' onClick={() => handleEventClick(event)}>
													Læs mere
												</Button>
											</Card>
										</Box>
									);
								})
						)}
					</Paper>
				)}

				{/* Create Event Modal */}
				<Modal opened={opened} onClose={close} title='Opret Ny Begivenhed' size='lg' centered>
					<Box>
						<TextInput label='Titel' placeholder='Begivenhedens titel' mb='md' required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />

						<DatePickerInput label='Dato og tidspunkt' placeholder='Vælg dato og tidspunkt' valueFormat='DD MMM YYYY HH:mm' mb='md' required value={newEvent.date} onChange={(date) => setNewEvent({ ...newEvent, date: date || new Date() })} locale='da' clearable={false} />

						<Box mb='md'>
							<Text fw={500} size='sm' mb='xs'>
								Type
							</Text>
							<Button.Group>
								<Button variant={newEvent.type === 'community' ? 'filled' : 'outline'} onClick={() => setNewEvent({ ...newEvent, type: 'community' })} color='green'>
									Fællesskab
								</Button>
								<Button variant={newEvent.type === 'official' ? 'filled' : 'outline'} onClick={() => setNewEvent({ ...newEvent, type: 'official' })} color='blue'>
									Officiel
								</Button>
								<Button variant={newEvent.type === 'special' ? 'filled' : 'outline'} onClick={() => setNewEvent({ ...newEvent, type: 'special' })} color='purple'>
									Special
								</Button>
							</Button.Group>
						</Box>

						<Textarea label='Beskrivelse' placeholder='Beskriv begivenheden' minRows={4} mb='lg' required value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />

						<Group justify='flex-end'>
							<Button variant='outline' onClick={close}>
								Annuller
							</Button>
							<Button onClick={handleCreateEvent}>Opret Begivenhed</Button>
						</Group>
					</Box>
				</Modal>

				{/* Event Details Modal */}
				<Modal
					opened={eventModalOpened}
					onClose={closeEventModal}
					title={
						<Group>
							<Badge color={selectedEvent ? getEventBadgeColor(selectedEvent.type) : 'gray'} size='lg'>
								{selectedEvent?.type === 'official' ? 'Officiel' : selectedEvent?.type === 'community' ? 'Fællesskab' : 'Special'}
							</Badge>
							<Text fw={700}>{selectedEvent?.title}</Text>
						</Group>
					}
					size='lg'
					centered
				>
					{selectedEvent && (
						<Box>
							<Group mb='md' mt='md'>
								<CalendarCheck size={18} />
								<Text fw={500}>{format(new Date(selectedEvent.date), 'd. MMMM yyyy', { locale: da })}</Text>
								<Text>kl. {format(new Date(selectedEvent.date), 'HH:mm')}</Text>
							</Group>

							{selectedEvent.createdBy && (
								<Text size='sm' c='dimmed' mb='md'>
									Oprettet af: {selectedEvent.createdBy}
								</Text>
							)}

							<Divider my='md' />

							<Text>{selectedEvent.description}</Text>

							<Group justify='flex-end' mt='xl'>
								{isAuthorized && (
									<Button color='red' variant='outline' onClick={() => handleDeleteEvent(selectedEvent.id)} leftSection={<Trash size={16} />}>
										Slet Begivenhed
									</Button>
								)}
								<Button onClick={closeEventModal}>Luk</Button>
							</Group>
						</Box>
					)}
				</Modal>
			</Container>
		</MainLayout>
	);
}
