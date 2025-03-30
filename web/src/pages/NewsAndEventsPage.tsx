import { EditContentModal } from '../components/modals/EditContentModal';
import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Group, Button, Paper, Badge, ActionIcon, Card, Menu, Indicator, Divider, Grid, SegmentedControl, Tabs, Switch } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Plus, DotsThree, CalendarCheck, Trash, CheckCircle, Calendar as CalendarIcon, Star, Bell, PushPin, Pencil, FileText, Megaphone } from '@phosphor-icons/react';
import 'dayjs/locale/da';
import { format, isSameDay } from 'date-fns';
import { ContentItem } from '../lib/NewsEventsService';

import { CreateContentModal } from '../components/modals/CreateContentModal';
import { ViewContentModal } from '../components/modals/ViewContentModal';
import { ContentCard } from '../components/common/ContentCard';
import { useContentManagement } from '../hooks/useContentManagement';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export default function NewsAndEventsPage() {
	const [activeTab, setActiveTab] = useState<string | null>('news');
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('list');
	const [showPinnedOnly, setShowPinnedOnly] = useState(false);
	const { isAuthorized, user } = useAuth();
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [itemToEdit, setItemToEdit] = useState<ContentItem | null>(null);
	const { items, filteredItems, setFilteredItems, isLoading, selectedItem, setSelectedItem, fetchItems, filterItems, createItem, updateItem, deleteItem } = useContentManagement(user);
	const [itemModalOpened, { open: openItemModal, close: closeItemModal }] = useDisclosure(false);
	const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

	const handleCloseEditModal = () => {
		setEditModalOpened(false);
		setItemToEdit(null);
	};

	const handleUpdateItem = async (id: string, updates: Partial<ContentItem>) => {
		const success = await updateItem(id, updates);

		if (success) {
			notifications.show({
				title: 'Item Updated',
				message: 'The content has been updated successfully',
				color: 'green',
			});
			return true;
		} else {
			notifications.show({
				title: 'Update Failed',
				message: 'Failed to update the content. Please try again.',
				color: 'red',
			});
			return false;
		}
	};

	useEffect(() => {
		fetchItems();
	}, []);

	useEffect(() => {
		const filtered = filterItems(items, {
			contentType: activeTab === 'news' ? 'news' : activeTab === 'events' ? 'event' : 'all',
			showPinnedOnly,
			selectedDate,
			viewMode,
		});
		setFilteredItems(filtered);
	}, [activeTab, selectedDate, showPinnedOnly, viewMode, items, filterItems]);

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	const handleDeleteItem = (id: string) => {
		deleteItem(id);
		notifications.show({
			title: 'Sletning gennemført',
			message: 'Indholdet er blevet slettet.',
			color: 'red',
		});
	};

	const handleOpenItemModal = (item: ContentItem) => {
		setSelectedItem(item);
		openItemModal();
	};

	const togglePinItem = (id: string) => {
		const item = items.find((item) => item.id === id);
		if (item) {
			updateItem(id, { is_pinned: !item.is_pinned });
			notifications.show({
				title: 'Fastgørelse ændret',
				message: item.is_pinned ? 'Indholdet er blevet fjernet fra fastgjorte.' : 'Indholdet er blevet fastgjort.',
				color: item.is_pinned ? 'red' : 'green',
			});
		}
	};

	const handleOpenEditModal = (item: ContentItem) => {
		setItemToEdit(item);
		setEditModalOpened(true);
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
			return <EmptyState title='Ingen events' message='Ingen events på denne dato' />;
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

	const renderItems = () => {
		if (isLoading) {
			return <LoadingState text='Indlæser indhold...' />;
		}

		if (filteredItems.length === 0) {
			return <EmptyState title='Ingen indhold fundet' message='Der er ingen indhold at vise med de valgte filtre.' actionLabel={isAuthorized ? 'Opret nyt' : undefined} onAction={isAuthorized ? openCreateModal : undefined} />;
		}

		if (viewMode === 'grid') {
			return (
				<Grid>
					{filteredItems.map((item) => (
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={item.id}>
							<ContentCard item={item} viewMode='grid' onView={handleOpenItemModal} onPin={isAuthorized ? togglePinItem : undefined} onEdit={isAuthorized ? handleOpenEditModal : undefined} onDelete={isAuthorized ? handleDeleteItem : undefined} isAuthorized={isAuthorized} />
						</Grid.Col>
					))}
				</Grid>
			);
		}

		return filteredItems.map((item) => <ContentCard key={item.id} item={item} viewMode='list' onView={handleOpenItemModal} onPin={isAuthorized ? togglePinItem : undefined} onEdit={isAuthorized ? handleOpenEditModal : undefined} onDelete={isAuthorized ? handleDeleteItem : undefined} isAuthorized={isAuthorized} />);
	};

	return (
		<MainLayout requireAuth={true} requiredPermission='admin'>
			<Container size='xl' py='xs'>
				<PageHeader
					title='Nyheder og Events'
					description='Hold dig opdateret med de seneste nyheder og events fra OdessaRP'
					primaryAction={
						isAuthorized
							? {
									label: 'Opret',
									onClick: openCreateModal,
									icon: <Plus size={16} />,
							  }
							: undefined
					}
				/>

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
													{item.event_date ? format(new Date(item.event_date || new Date()), 'd. MMMM yyyy, HH:mm') : 'Dato ikke tilgængelig'}
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

					{(activeTab !== 'events' || (activeTab === 'events' && viewMode !== 'calendar')) && <>{renderItems()}</>}
				</Paper>

				<CreateContentModal opened={createModalOpened} onClose={closeCreateModal} onCreate={createItem} />
				<ViewContentModal opened={itemModalOpened} onClose={closeItemModal} item={selectedItem} isAuthorized={isAuthorized} onPin={togglePinItem} onEdit={handleOpenEditModal} onDelete={handleDeleteItem} />
				<EditContentModal item={itemToEdit} opened={editModalOpened} onClose={handleCloseEditModal} onUpdate={handleUpdateItem} />
			</Container>
		</MainLayout>
	);
}
