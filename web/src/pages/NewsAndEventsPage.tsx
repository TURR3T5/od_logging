import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Group, Button, Modal, TextInput, Textarea, Paper, Badge, ActionIcon, Card, Menu, Indicator, Divider, Grid, SegmentedControl, Tabs, Checkbox, Switch } from '@mantine/core';
import { DatePickerInput, Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Plus, DotsThree, CalendarCheck, Trash, CheckCircle, Calendar as CalendarIcon, Star, Bell, PushPin, Pencil, FileText, Megaphone } from '@phosphor-icons/react';
import 'dayjs/locale/da';
import { format, isSameDay } from 'date-fns';
import { da } from 'date-fns/locale';
import { ContentItem, NewsEventsService } from '../lib/NewsEventsService';

export default function NewsAndEventsPage() {
	const [activeTab, setActiveTab] = useState<string | null>('news');
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [items, setItems] = useState<ContentItem[]>([]);
	const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
	const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('list');
	const [opened, { open, close }] = useDisclosure(false);
	const [itemModalOpened, { open: openItemModal, close: closeItemModal }] = useDisclosure(false);
	const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
	const [showPinnedOnly, setShowPinnedOnly] = useState(false);
	const [createType, setCreateType] = useState<'news' | 'event'>('news');
	const [_isLoading, setIsLoading] = useState(true);
	const { isAuthorized, user } = useAuth();

	const [newItem, setNewItem] = useState<Partial<ContentItem>>({
		title: '',
		description: '',
		content: '',
		type: 'news',
		news_type: 'announcement',
		is_pinned: false,
	});

	useEffect(() => {
		fetchItems();
	}, []);

	useEffect(() => {
		filterItems(items);
	}, [selectedDate, activeTab, showPinnedOnly]);

	const fetchItems = async () => {
		setIsLoading(true);
		try {
			const allItems = await NewsEventsService.getAllContent();
			setItems(allItems);
			filterItems(allItems);
		} catch (error) {
			console.error('Error fetching content:', error);
			notifications.show({
				title: 'Error fetching content',
				message: 'There was an error loading the content. Please try again later.',
				color: 'red',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const filterItems = (itemsList: ContentItem[] = items) => {
		let filtered = [...itemsList];

		if (activeTab === 'news') {
			filtered = filtered.filter((item) => item.type === 'news');
		} else if (activeTab === 'events') {
			filtered = filtered.filter((item) => item.type === 'event');
		}

		if (showPinnedOnly) {
			filtered = filtered.filter((item) => item.is_pinned);
		}

		if (activeTab === 'events' && selectedDate && viewMode === 'calendar') {
			filtered = filtered.filter((item) => {
				if (item.type === 'event' && item.event_date) {
					const eventDate = typeof item.event_date === 'string' ? new Date(item.event_date) : item.event_date;
					return eventDate && isSameDay(eventDate, selectedDate);
				}
				return false;
			});
		}

		filtered = filtered.sort((a, b) => {
			const dateA = a.type === 'event' && a.event_date ? (typeof a.event_date === 'string' ? new Date(a.event_date) : a.event_date) : new Date(a.created_at);
			const dateB = b.type === 'event' && b.event_date ? (typeof b.event_date === 'string' ? new Date(b.event_date) : b.event_date) : new Date(b.created_at);

			if (!dateA) return 1;
			if (!dateB) return -1;

			return dateB.getTime() - dateA.getTime();
		});

		setFilteredItems(filtered);
	};

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	const handleCreateItem = async () => {
		if (!user) {
			notifications.show({
				title: 'Unauthorized',
				message: 'You must be logged in to create content',
				color: 'red',
			});
			return;
		}

		if (!newItem.title || !newItem.description) {
			notifications.show({
				title: 'Missing information',
				message: 'Please fill in all required fields',
				color: 'red',
			});
			return;
		}

		try {
			const contentItem: Omit<ContentItem, 'id' | 'created_at'> = {
				title: newItem.title || '',
				description: newItem.description || '',
				content: newItem.content || newItem.description || '',
				type: newItem.type || 'news',
				category: newItem.type === 'news' ? 'announcement' : 'event',
				created_by: user.username || 'Unknown',
				is_pinned: newItem.is_pinned || false,
			};

			if (newItem.type === 'news' && newItem.news_type) {
				contentItem.news_type = newItem.news_type;
			}

			if (newItem.type === 'event') {
				if (!newItem.event_date) {
					notifications.show({
						title: 'Missing information',
						message: 'Please select an event date',
						color: 'red',
					});
					return;
				}

				contentItem.event_type = newItem.event_type as 'community' | 'official' | 'special';
				contentItem.event_date = newItem.event_date instanceof Date ? newItem.event_date.toISOString() : typeof newItem.event_date === 'string' ? newItem.event_date : null;

				contentItem.location = newItem.location;
				contentItem.address = newItem.address;
			}

			const contentId = await NewsEventsService.createContent(contentItem, user);

			if (contentId) {
				notifications.show({
					title: `${newItem.type === 'event' ? 'Event' : 'News'} created`,
					message: `Your content has been added to ${newItem.type === 'event' ? 'the calendar' : 'news'}`,
					color: 'green',
				});

				fetchItems();

				setNewItem({
					title: '',
					description: '',
					content: '',
					type: 'news',
					news_type: 'announcement',
					is_pinned: false,
				});

				close();
			} else {
				throw new Error('Failed to create content');
			}
		} catch (error) {
			console.error('Error creating content:', error);

			if (error instanceof Error && error.message.includes('Insufficient permissions')) {
				notifications.show({
					title: 'Unauthorized',
					message: 'You do not have permission to create this content',
					color: 'red',
				});
			} else {
				notifications.show({
					title: 'Error',
					message: 'There was an error creating the content. Please try again.',
					color: 'red',
				});
			}
		}
	};

	const handleDeleteItem = async (id: string) => {
		try {
			const success = await NewsEventsService.deleteContent(id, user);

			if (success) {
				const updatedItems = items.filter((item) => item.id !== id);
				setItems(updatedItems);
				filterItems(updatedItems);

				if (selectedItem?.id === id) {
					closeItemModal();
				}

				notifications.show({
					title: 'Item deleted',
					message: 'The content has been removed',
					color: 'red',
				});
			} else {
				throw new Error('Failed to delete content');
			}
		} catch (error) {
			console.error('Error deleting content:', error);
			notifications.show({
				title: 'Error',
				message: 'There was an error deleting the content. Please try again.',
				color: 'red',
			});
		}
	};

	const handleOpenItemModal = (item: ContentItem) => {
		setSelectedItem(item);
		openItemModal();
	};

	const togglePinItem = async (id: string) => {
		try {
			const item = items.find((i) => i.id === id);
			if (!item) return;

			const success = await NewsEventsService.updateContent(
				id,
				{
					is_pinned: !item.is_pinned,
					updated_by: user?.username || 'Unknown',
				},
				user
			);

			if (success) {
				const updatedItems = items.map((item) => (item.id === id ? { ...item, is_pinned: !item.is_pinned } : item));
				setItems(updatedItems);
				filterItems(updatedItems);

				if (selectedItem?.id === id) {
					setSelectedItem({ ...selectedItem, is_pinned: !selectedItem.is_pinned });
				}

				notifications.show({
					title: 'Status updated',
					message: `The item is now ${updatedItems.find((i) => i.id === id)?.is_pinned ? 'pinned' : 'unpinned'}`,
					color: 'blue',
				});
			} else {
				throw new Error('Failed to update content');
			}
		} catch (error) {
			console.error('Error updating content:', error);
			notifications.show({
				title: 'Error',
				message: 'There was an error updating the content. Please try again.',
				color: 'red',
			});
		}
	};

	const getTypeDetails = (item: ContentItem) => {
		if (item.type === 'news') {
			switch (item.news_type) {
				case 'update':
					return { color: 'blue', label: 'Update', icon: <Bell size={16} weight='fill' /> };
				case 'announcement':
					return { color: 'orange', label: 'Announcement', icon: <Megaphone size={16} weight='fill' /> };
				case 'changelog':
					return { color: 'green', label: 'Changelog', icon: <FileText size={16} weight='fill' /> };
				default:
					return { color: 'gray', label: 'News', icon: <Bell size={16} weight='fill' /> };
			}
		} else {
			switch (item.event_type) {
				case 'official':
					return { color: 'blue', label: 'Official', icon: <CalendarCheck size={16} weight='fill' /> };
				case 'community':
					return { color: 'green', label: 'Community', icon: <CalendarCheck size={16} weight='fill' /> };
				case 'special':
					return { color: 'purple', label: 'Special', icon: <Star size={16} weight='fill' /> };
				default:
					return { color: 'gray', label: 'Event', icon: <CalendarIcon size={16} weight='fill' /> };
			}
		}
	};

	const renderDayContent = (date: Date) => {
		const dayEvents = items.filter((item) => item.type === 'event' && item.event_date && isSameDay(new Date(item.event_date), date));

		if (dayEvents.length === 0) {
			return null;
		}

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

	const pinnedItems = items
		.filter((item) => item.is_pinned)
		.sort((a, b) => {
			const dateA = a.type === 'event' && a.event_date ? new Date(a.event_date) : new Date(a.created_at);
			const dateB = b.type === 'event' && b.event_date ? new Date(b.event_date) : new Date(b.created_at);
			return dateA.getTime() - dateB.getTime();
		})
		.slice(0, 4);

	return (
		<MainLayout requireAuth={true} requiredPermission='admin'>
			<Container size='xl' py='xs'>
				<Group justify='space-between' mb='md'>
					<Box>
						<Title order={1}>Nyheder og Events</Title>
						<Text c='dimmed'>Hold dig opdateret med de seneste nyheder og events fra OdessaRP</Text>
					</Box>
					{isAuthorized && (
						<Button onClick={open} variant='gradient' gradient={{ from: 'blue', to: 'cyan' }} leftSection={<Plus size={16} />}>
							Opret
						</Button>
					)}
				</Group>

				<Paper shadow='md' radius='md' p='md' withBorder mb='xl'>
					<Group justify='space-between' mb='md'>
						<Tabs value={activeTab} onChange={setActiveTab}>
							<Tabs.List>
								<Tabs.Tab value='all' leftSection={<Bell size={16} />}>
									Alle
								</Tabs.Tab>
								<Tabs.Tab value='news' leftSection={<FileText size={16} />}>
									Nyheder
								</Tabs.Tab>
								<Tabs.Tab value='events' leftSection={<CalendarIcon size={16} />}>
									Events
								</Tabs.Tab>
							</Tabs.List>
						</Tabs>

						<Group>
							{activeTab === 'events' && (
								<SegmentedControl
									value={viewMode}
									onChange={(value) => setViewMode(value as any)}
									data={[
										{ label: 'Liste', value: 'list' },
										{ label: 'Kalender', value: 'calendar' },
										{ label: 'Grid', value: 'grid' },
									]}
								/>
							)}

							<Group gap='xs'>
								<Text size='sm'>Kun fastgjorte</Text>
								<Switch checked={showPinnedOnly} onChange={(event) => setShowPinnedOnly(event.currentTarget.checked)} />
							</Group>
						</Group>
					</Group>

					{pinnedItems.length > 0 && !showPinnedOnly && (
						<Box mb='xl'>
							<Divider
								label={
									<Group gap='xs'>
										<PushPin size={16} />
										<Text fw={500}>FASTGJORTE</Text>
									</Group>
								}
								labelPosition='center'
								mb='md'
							/>

							<Grid>
								{pinnedItems.map((item) => (
									<Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
										<Card withBorder shadow='sm' padding='md' radius='md' style={{ height: '100%' }}>
											<Card.Section withBorder inheritPadding py='xs'>
												<Group justify='space-between'>
													<Badge color={getTypeDetails(item).color} leftSection={getTypeDetails(item).icon}>
														{getTypeDetails(item).label}
													</Badge>
													<ActionIcon color='blue' variant='subtle' onClick={() => togglePinItem(item.id)}>
														<PushPin size={16} weight='fill' />
													</ActionIcon>
												</Group>
											</Card.Section>

											<Text fw={700} size='lg' mt='md' mb='xs' lineClamp={1}>
												{item.title}
											</Text>

											{item.type === 'event' && (
												<Text size='sm' c='dimmed' mb='xs'>
													{item.event_date ? format(new Date(item.event_date || new Date()), 'd. MMMM yyyy, HH:mm', { locale: da }) : 'Dato ikke tilgængelig'}
												</Text>
											)}

											<Text size='sm' lineClamp={2} mb='md'>
												{item.description}
											</Text>

											<Button variant='light' fullWidth mt='auto' onClick={() => handleOpenItemModal(item)}>
												Læs mere
											</Button>
										</Card>
									</Grid.Col>
								))}
							</Grid>
						</Box>
					)}

					{activeTab === 'events' && viewMode === 'calendar' && (
						<Grid gutter='md' align='stretch'>
							<Grid.Col span={{ base: 12, md: 5 }}>
								<Calendar
									date={selectedDate || undefined}
									onDateChange={handleDateChange}
									locale='da'
									size='xl'
									styles={(theme) => ({
										calendarHeader: {
											minWidth: '100%',
										},
										monthCell: {
											padding: theme.spacing.xs,
										},
									})}
									getDayProps={(date) => ({
										onClick: () => handleDateChange(date),
									})}
									renderDay={(date) => renderDayContent(date)}
								/>
							</Grid.Col>

							<Grid.Col span={{ base: 12, md: 7 }}>
								<Paper withBorder p='md' radius='md' h='100%'>
									<Group justify='space-between' mb='md'>
										<Title order={3}>{selectedDate ? <>Events {format(selectedDate, 'd. MMMM yyyy', { locale: da })}</> : <>Vælg en dato</>}</Title>
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
																<DotsThree size={20} />
															</ActionIcon>
														</Menu.Target>
														<Menu.Dropdown>
															<Menu.Item onClick={() => handleOpenItemModal(item)} leftSection={<CheckCircle size={14} />}>
																Se detaljer
															</Menu.Item>
															{isAuthorized && (
																<>
																	<Menu.Item onClick={() => togglePinItem(item.id)} leftSection={<PushPin size={14} />}>
																		{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
																	</Menu.Item>
																	<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => handleDeleteItem(item.id)}>
																		Slet
																	</Menu.Item>
																</>
															)}
														</Menu.Dropdown>
													</Menu>
												</Group>
												{item.type === 'event' && (
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
												)}
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
					)}

					{(activeTab !== 'events' || (activeTab === 'events' && viewMode !== 'calendar')) && (
						<>
							{viewMode === 'grid' ? (
								<Grid>
									{filteredItems.length > 0 ? (
										filteredItems.map((item) => (
											<Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={item.id}>
												<Card withBorder shadow='sm' padding='md' radius='md' style={{ height: '100%' }}>
													<Card.Section withBorder inheritPadding py='xs'>
														<Group justify='space-between'>
															<Badge color={getTypeDetails(item).color} leftSection={getTypeDetails(item).icon}>
																{getTypeDetails(item).label}
															</Badge>
															{item.is_pinned && (
																<ActionIcon color='blue' variant='subtle'>
																	<PushPin size={16} weight='fill' />
																</ActionIcon>
															)}
														</Group>
													</Card.Section>

													<Text fw={700} size='lg' mt='md' mb='xs' lineClamp={1}>
														{item.title}
													</Text>

													{item.type === 'event' && (
														<Text size='sm' c='dimmed' mb='xs'>
															{item.event_date ? format(new Date(item.event_date), 'd. MMMM yyyy, HH:mm', { locale: da }) : 'Dato ikke tilgængelig'}
														</Text>
													)}

													{item.type === 'news' && (
														<Text size='sm' c='dimmed' mb='xs'>
															{format(item.created_at, 'd. MMMM yyyy', { locale: da })}
															{item.last_updated && item.last_updated > item.created_at && <> (opdateret {format(item.last_updated, 'd. MMMM', { locale: da })})</>}
														</Text>
													)}

													<Text size='sm' lineClamp={3} mb='md'>
														{item.description}
													</Text>

													<Group mt='auto' justify='space-between'>
														<Button variant='light' onClick={() => handleOpenItemModal(item)}>
															Læs mere
														</Button>
														{isAuthorized && (
															<Menu shadow='md' width={200} position='bottom-end'>
																<Menu.Target>
																	<ActionIcon>
																		<DotsThree size={20} />
																	</ActionIcon>
																</Menu.Target>
																<Menu.Dropdown>
																	<Menu.Item onClick={() => togglePinItem(item.id)} leftSection={<PushPin size={14} />}>
																		{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
																	</Menu.Item>
																	<Menu.Item leftSection={<Pencil size={14} />}>Rediger</Menu.Item>
																	<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => handleDeleteItem(item.id)}>
																		Slet
																	</Menu.Item>
																</Menu.Dropdown>
															</Menu>
														)}
													</Group>
												</Card>
											</Grid.Col>
										))
									) : (
										<Grid.Col>
											<Text ta='center' py='xl' c='dimmed'>
												Ingen {activeTab === 'news' ? 'nyheder' : activeTab === 'events' ? 'begivenheder' : 'indhold'} fundet
											</Text>
										</Grid.Col>
									)}
								</Grid>
							) : (
								<Box>
									{filteredItems.length > 0 ? (
										filteredItems.map((item, index, arr) => {
											const currentMonth = item.type === 'event' ? format(new Date(item.event_date ?? ''), 'MMMM yyyy', { locale: da }) : format(new Date(item.created_at ?? ''), 'MMMM yyyy', { locale: da });

											const previousMonth = index > 0 ? (arr[index - 1].type === 'event' ? format(new Date(arr[index - 1].event_date ?? ''), 'MMMM yyyy', { locale: da }) : format(new Date(arr[index - 1].created_at ?? ''), 'MMMM yyyy', { locale: da })) : '';

											const showMonthDivider = index === 0 || currentMonth !== previousMonth;

											return (
												<Box key={item.id}>
													{showMonthDivider && (
														<Divider
															label={
																<Group gap='xs'>
																	<CalendarIcon size={16} />
																	<Text tt='uppercase' fw={500}>
																		{currentMonth}
																	</Text>
																</Group>
															}
															labelPosition='center'
															mb='md'
															mt={index > 0 ? 'xl' : 0}
														/>
													)}

													<Card mb='md' padding='md' radius='md' withBorder>
														<Group justify='space-between' mb='xs'>
															<Group>
																<Badge color={getTypeDetails(item).color} leftSection={getTypeDetails(item).icon}>
																	{getTypeDetails(item).label}
																</Badge>
																<Text fw={700}>{item.title}</Text>
																{item.is_pinned && (
																	<ActionIcon color='blue' variant='subtle' onClick={() => togglePinItem(item.id)}>
																		<PushPin size={16} weight='fill' />
																	</ActionIcon>
																)}
															</Group>
															<Group>
																{item.type === 'event' && item.event_date ? <Badge variant='outline'>{format(typeof item.event_date === 'string' ? new Date(item.event_date) : item.event_date, 'd. MMM, HH:mm', { locale: da })}</Badge> : <Badge variant='outline'>{format(new Date(item.created_at), 'd. MMM', { locale: da })}</Badge>}
																<Menu shadow='md' width={200} position='bottom-end'>
																	<Menu.Target>
																		<ActionIcon>
																			<DotsThree size={20} />
																		</ActionIcon>
																	</Menu.Target>
																	<Menu.Dropdown>
																		<Menu.Item onClick={() => handleOpenItemModal(item)} leftSection={<CheckCircle size={14} />}>
																			Se detaljer
																		</Menu.Item>
																		{isAuthorized && (
																			<>
																				<Menu.Item onClick={() => togglePinItem(item.id)} leftSection={<PushPin size={14} />}>
																					{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
																				</Menu.Item>
																				<Menu.Item leftSection={<Pencil size={14} />}>Rediger</Menu.Item>
																				<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => handleDeleteItem(item.id)}>
																					Slet
																				</Menu.Item>
																			</>
																		)}
																	</Menu.Dropdown>
																</Menu>
															</Group>
														</Group>
														<Group>
															{item.type === 'event' && item.location && (
																<Text c='dimmed' size='sm'>
																	Lokation: {item.location}
																</Text>
															)}
															{item.created_by && (
																<Text c='dimmed' size='sm'>
																	Oprettet af: {item.created_by}
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
												</Box>
											);
										})
									) : (
										<Text ta='center' py='xl' c='dimmed'>
											Ingen {activeTab === 'news' ? 'nyheder' : activeTab === 'events' ? 'begivenheder' : 'indhold'} fundet
										</Text>
									)}
								</Box>
							)}
						</>
					)}
				</Paper>

				{/* Create Modal */}
				<Modal opened={opened} onClose={close} title='Opret nyt indhold' size='lg' centered>
					<Box>
						<Tabs value={createType} onChange={(value) => setCreateType(value as 'news' | 'event')}>
							<Tabs.List mb='md'>
								<Tabs.Tab value='news' leftSection={<FileText size={16} />}>
									Nyhed
								</Tabs.Tab>
								<Tabs.Tab value='event' leftSection={<CalendarIcon size={16} />}>
									Begivenhed
								</Tabs.Tab>
							</Tabs.List>
						</Tabs>

						<TextInput label='Titel' placeholder='Skriv en titel' mb='md' required value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />

						<TextInput label='Kort beskrivelse' placeholder='Kort beskrivelse (vises i oversigten)' mb='md' required value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />

						{createType === 'news' && (
							<Box mb='md'>
								<Text fw={500} size='sm' mb='xs'>
									Nyhedstype
								</Text>
								<SegmentedControl
									value={newItem.type === 'news' ? newItem.news_type || 'announcement' : 'announcement'}
									onChange={(value) => setNewItem({ ...newItem, news_type: value as any })}
									data={[
										{ label: 'Meddelelse', value: 'announcement' },
										{ label: 'Opdatering', value: 'update' },
										{ label: 'Changelog', value: 'changelog' },
									]}
									fullWidth
								/>
							</Box>
						)}

						{createType === 'event' && (
							<>
								<DatePickerInput label='Dato og tidspunkt' placeholder='Vælg dato og tidspunkt' valueFormat='DD MMM YYYY HH:mm' mb='md' required value={(newItem as any).event_date instanceof Date ? (newItem as any).event_date : (newItem as any).event_date ? new Date((newItem as any).event_date) : new Date()} onChange={(date) => setNewItem({ ...newItem, event_date: date })} locale='da' clearable={false} />

								<Box mb='md'>
									<Text fw={500} size='sm' mb='xs'>
										Begivenhedstype
									</Text>
									<SegmentedControl
										value={(newItem as any).eventType || 'community'}
										onChange={(value) => setNewItem({ ...newItem, event_type: value as any })}
										data={[
											{ label: 'Fællesskab', value: 'community' },
											{ label: 'Officiel', value: 'official' },
											{ label: 'Special', value: 'special' },
										]}
										fullWidth
									/>
								</Box>

								<TextInput label='Lokation' placeholder='Hvor afholdes begivenheden?' mb='md' value={(newItem as any).location || ''} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />

								<TextInput label='Adresse' placeholder='Specifik adresse (valgfri)' mb='md' value={(newItem as any).address || ''} onChange={(e) => setNewItem({ ...newItem, address: e.target.value })} />
							</>
						)}

						<Textarea label='Indhold' placeholder='Detaljeret beskrivelse af indholdet' minRows={6} mb='md' value={newItem.content || ''} onChange={(e) => setNewItem({ ...newItem, content: e.target.value })} />

						<Checkbox label='Fastgør dette indhold (vises i toppen og på forsiden)' checked={newItem.is_pinned} onChange={(e) => setNewItem({ ...newItem, is_pinned: e.currentTarget.checked })} mb='lg' />

						<Group justify='flex-end'>
							<Button variant='outline' onClick={close}>
								Annuller
							</Button>
							<Button onClick={handleCreateItem}>Opret</Button>
						</Group>
					</Box>
				</Modal>

				{/* View Item Modal */}
				<Modal
					opened={itemModalOpened}
					onClose={closeItemModal}
					title={
						<Group>
							{selectedItem && (
								<>
									<Badge color={selectedItem ? getTypeDetails(selectedItem).color : 'gray'} size='lg' leftSection={selectedItem ? getTypeDetails(selectedItem).icon : undefined}>
										{selectedItem ? getTypeDetails(selectedItem).label : ''}
									</Badge>
									<Text fw={700}>{selectedItem?.title}</Text>
									{selectedItem.is_pinned && (
										<ActionIcon color='blue' variant='subtle'>
											<PushPin size={16} weight='fill' />
										</ActionIcon>
									)}
								</>
							)}
						</Group>
					}
					size='lg'
					centered
				>
					{selectedItem && (
						<Box>
							{selectedItem.type === 'event' ? (
								<Group mb='md'>
									<CalendarCheck size={18} />
									<Text fw={500}>{selectedItem.event_date ? format(new Date(selectedItem.event_date), 'd. MMMM yyyy', { locale: da }) : 'Dato ikke tilgængelig'}</Text>
									<Text>kl. {selectedItem.event_date ? format(new Date(selectedItem.event_date), 'HH:mm') : 'N/A'}</Text>
								</Group>
							) : (
								<Group mb='md'>
									<CalendarIcon size={18} />
									<Text>
										{format(selectedItem.created_at, 'd. MMMM yyyy', { locale: da })}
										{selectedItem.last_updated && selectedItem.last_updated > selectedItem.created_at && <> (opdateret {format(selectedItem.last_updated, 'd. MMMM yyyy', { locale: da })})</>}
									</Text>
								</Group>
							)}

							{selectedItem.type === 'event' && selectedItem.location && (
								<Group mb='md'>
									<Text fw={500}>Sted:</Text>
									<Text>
										{selectedItem.location}
										{selectedItem.address && `, ${selectedItem.address}`}
									</Text>
								</Group>
							)}

							{selectedItem.created_by && (
								<Text size='sm' c='dimmed' mb='md'>
									Oprettet af: {selectedItem.created_by}
								</Text>
							)}

							<Divider my='md' />

							<Text style={{ whiteSpace: 'pre-line' }}>{selectedItem.content || selectedItem.description}</Text>

							<Group justify='space-between' mt='xl'>
								<Group>
									{isAuthorized && (
										<>
											<Button variant='subtle' leftSection={<PushPin size={16} />} onClick={() => togglePinItem(selectedItem.id)}>
												{selectedItem.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
											</Button>
											<Button variant='subtle' leftSection={<Pencil size={16} />}>
												Rediger
											</Button>
											<Button
												color='red'
												variant='subtle'
												leftSection={<Trash size={16} />}
												onClick={() => {
													handleDeleteItem(selectedItem.id);
													closeItemModal();
												}}
											>
												Slet
											</Button>
										</>
									)}
								</Group>
								<Button onClick={closeItemModal}>Luk</Button>
							</Group>

							{selectedItem.type === 'event' && (
								<Button
									fullWidth
									variant='light'
									mt='md'
									onClick={() => {
										setActiveTab('events');
										setViewMode('calendar');
										closeItemModal();
									}}
								>
									Se alle begivenheder
								</Button>
							)}
						</Box>
					)}
				</Modal>
			</Container>
		</MainLayout>
	);
}
