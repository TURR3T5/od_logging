import { EditContentModal } from '../components/modals/EditContentModal';
import { useState, useEffect } from 'react';
import { Container, Text, Box, Group, Button, Paper, Badge, ActionIcon, Card, Divider, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Plus, CalendarCheck, Calendar as CalendarIcon, Star, Bell, PushPin, FileText, Megaphone } from '../components/icons';
import 'dayjs/locale/da';
import { format } from 'date-fns';
import { ContentItem } from '../lib/NewsEventsService';

import { CreateContentModal } from '../components/modals/CreateContentModal';
import { ViewContentModal } from '../components/modals/ViewContentModal';
import { ContentCard } from '../components/common/ContentCard';
import { useContentManagement } from '../hooks/useContentManagement';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ContentFilters } from '../components/news/ContentFilter';
import { EventCalendarView } from '../components/news/EventCalendarView';
import { MemoizedContentCard } from '../components/common/MemoizedContentCard';
import { usePermission } from '../hooks/usePermissions';
import { useModalState } from '../hooks/useModalState';

export default function NewsAndEventsPage() {
	const [activeTab, setActiveTab] = useState<string | null>('news');
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('list');
	const [showPinnedOnly, setShowPinnedOnly] = useState(false);
	const { user } = useAuth();
	const { hasPermission: isAuthorized, isChecking: checkingPermission } = usePermission('content');
	const { items, filteredItems, setFilteredItems, isLoading, fetchItems, filterItems, createItem, updateItem, deleteItem } = useContentManagement(user);
	const editModal = useModalState<ContentItem>();
	const viewModal = useModalState<ContentItem>();
	const createModal = useModalState();

	const handleOpenItemModal = (item: ContentItem) => {
		viewModal.open(item);
	};

	const handleOpenEditModal = (item: ContentItem) => {
		editModal.open(item);
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

	const pinnedItems = items
		.filter((item) => item.is_pinned)
		.sort((a, b) => {
			const dateA = a.type === 'event' && a.event_date ? new Date(a.event_date) : new Date(a.created_at);
			const dateB = b.type === 'event' && b.event_date ? new Date(b.event_date) : new Date(b.created_at);
			return dateA.getTime() - dateB.getTime();
		})
		.slice(0, 4);

	const renderItems = () => {
		if (isLoading || checkingPermission) {
			return <LoadingState text='Indlæser indhold...' />;
		}

		if (filteredItems.length === 0) {
			return <EmptyState title='Ingen indhold fundet' message='Der er ingen indhold at vise med de valgte filtre.' actionLabel={isAuthorized ? 'Opret nyt' : undefined} onAction={isAuthorized ? createModal.open : undefined} />;
		}

		if (viewMode === 'grid') {
			return (
				<Grid>
					{filteredItems.map((item) => (
						<MemoizedContentCard key={item.id} item={item} viewMode='list' onView={handleOpenItemModal} onPin={isAuthorized ? togglePinItem : undefined} onEdit={isAuthorized ? handleOpenEditModal : undefined} onDelete={isAuthorized ? handleDeleteItem : undefined} isAuthorized={isAuthorized} />
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
									onClick: createModal.open,
									icon: <Plus size={16} />,
							  }
							: undefined
					}
				/>

				<Paper shadow='md' radius='md' p='md' withBorder mb='xl'>
					<ContentFilters activeTab={activeTab} setActiveTab={setActiveTab} viewMode={viewMode} setViewMode={setViewMode} showPinnedOnly={showPinnedOnly} setShowPinnedOnly={setShowPinnedOnly} />

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

					{activeTab === 'events' && viewMode === 'calendar' && <EventCalendarView selectedDate={selectedDate} setSelectedDate={handleDateChange} filteredItems={filteredItems} items={items} isAuthorized={isAuthorized} handleOpenItemModal={handleOpenItemModal} togglePinItem={togglePinItem} handleOpenEditModal={handleOpenEditModal} handleDeleteItem={handleDeleteItem} />}

					{(activeTab !== 'events' || (activeTab === 'events' && viewMode !== 'calendar')) && <>{renderItems()}</>}
				</Paper>

				<CreateContentModal opened={createModal.isOpen} onClose={createModal.close} onCreate={createItem} />

				<ViewContentModal opened={viewModal.isOpen} onClose={viewModal.close} item={viewModal.data} isAuthorized={isAuthorized} onPin={togglePinItem} onEdit={handleOpenEditModal} onDelete={handleDeleteItem} />

				<EditContentModal item={editModal.data} opened={editModal.isOpen} onClose={editModal.close} onUpdate={handleUpdateItem} />
			</Container>
		</MainLayout>
	);
}
