import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Group, Button, Modal, TextInput, Textarea, Paper, Badge, ActionIcon, Card, Menu, Indicator, Divider, Grid, SegmentedControl, Tabs, Checkbox, Switch } from '@mantine/core';
import { DatePickerInput, Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../components/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import { Plus, DotsThree, CalendarCheck, Trash, CheckCircle, Calendar as CalendarIcon, Star, Bell, PushPin, Pencil, FileText, Megaphone, ShieldCheck } from '@phosphor-icons/react';
import 'dayjs/locale/da';
import { format, isSameDay, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';

interface BaseContentItem {
	id: string;
	title: string;
	description: string;
	content?: string;
	createdAt: Date;
	createdBy?: string;
	isPinned: boolean;
	lastUpdated?: Date;
}

interface EventItem extends BaseContentItem {
	type: 'event';
	eventType: 'community' | 'official' | 'special';
	eventDate: Date;
	location?: string;
	address?: string;
}

interface NewsItem extends BaseContentItem {
	type: 'news';
	newsType: 'update' | 'announcement' | 'changelog';
}

type ContentItem = EventItem | NewsItem;

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
	const { isAuthorized, user } = useAuth();

	const [newItem, setNewItem] = useState<Partial<ContentItem>>({
		title: '',
		description: '',
		content: '',
		type: 'news',
		newsType: 'announcement',
		isPinned: false,
	});

	useEffect(() => {
		const mockItems: ContentItem[] = [
			{
				id: '1',
				title: 'Server Update 3.5',
				description: 'New vehicles, weapons, and optimizations have been added to the server.',
				content: 'Vi er glade for at annoncere den nyeste opdatering til OdessaRP, version 3.5! Denne opdatering bringer en række spændende forbedringer til serveren.\n\nNye køretøjer inkluderer Übermacht Cypher, Pfister Comet S2 og Dinka Jester RR. Alle køretøjer kommer med komplette tuningmuligheder og unikke handlinger.\n\nVi har også tilføjet nye våben, herunder Heavy Rifle og Combat Shotgun, som kan købes lovligt med de rette licenser. Våbenmodifikationer er også blevet opdateret, så du kan tilpasse dine våben endnu mere.\n\nServeroptimeringer omfatter forbedret performance i Downtown-området, reduceret ressourceforbrug, og forbedrede NPC-rutiner der giver en mere realistisk oplevelse.\n\nHusk at melde eventuelle bugs i vores Discord under #bug-rapport kanalen.',
				createdAt: parseISO('2025-03-25'),
				type: 'news',
				newsType: 'update',
				isPinned: true,
				createdBy: 'Admin Team',
				lastUpdated: parseISO('2025-03-25'),
			},
			{
				id: '2',
				title: 'Velkommen til v3.0',
				description: 'Vi har lanceret version 3.0 af OdessaRP med en helt ny map og mange nye features!',
				content: 'Vi er stolte af at præsentere version 3.0 af OdessaRP! Efter måneders hårdt arbejde kan vi endelig lancere denne store opdatering.\n\nHvad er nyt i version 3.0?\n\n- Helt ny map med unikke lokationer\n- Omdesignet politi- og hospitalssystem\n- Nye jobs og muligheder\n- Forbedret økonomi og handelssystem\n- Optimeret serverperformance\n- Opgraderet våben- og køretøjssystem\n\nVi håber I vil nyde de mange nye features og forbedringer. Husk at rapportere eventuelle bugs på vores Discord server.',
				createdAt: parseISO('2025-03-10'),
				type: 'news',
				newsType: 'changelog',
				isPinned: false,
				createdBy: 'Admin Team',
				lastUpdated: parseISO('2025-03-10'),
			},
			{
				id: '3',
				title: 'New Police Chief Appointed',
				description: 'Congratulations to Officer Johnson on being appointed as the new Police Chief!',
				content: 'Det er med stor glæde at OdessaRP kan annoncere udnævnelsen af Sarah Johnson som vores nye politichef!\n\nEfter flere års dedikeret tjeneste på serveren, har Sarah bevist sit værd gennem eksemplarisk lederskab, retfærdig håndhævelse af loven, og en stærk forpligtelse til samfundet.\n\nUnder hendes ledelse planlægger politistyrken at implementere flere community-orienterede initiativer, herunder regelmæssige "Mød din betjent"-begivenheder, udvidede patruljeringer i højrisikoområder, og nye rekrutteringsprogrammer.\n\nVi ønsker Sarah tillykke med denne velfortjente udnævnelse, og ser frem til at opleve hendes vision for byens sikkerhed og retfærdighed udfolde sig.',
				createdAt: parseISO('2025-03-22'),
				type: 'news',
				newsType: 'announcement',
				isPinned: true,
				createdBy: 'Byrådet',
				lastUpdated: parseISO('2025-03-22'),
			},
			{
				id: '4',
				title: 'Bilshow i Vinewood',
				description: 'Det årlige vinewood bilshow hvor du kan vise dine bedste biler frem.',
				content: 'Det årlige vinewood bilshow hvor du kan vise dine bedste biler frem, der er præmie for den bedste og mest stilfulde bil. Mød op i din mest imponerende bil og deltag i konkurrencen. Vi har inviteret en række lokale virksomheder som sponsorer, og der vil være forfriskninger og mad til alle deltagere.',
				createdAt: parseISO('2025-03-20'),
				type: 'event',
				eventType: 'official',
				eventDate: parseISO('2025-03-29T18:00:00'),
				isPinned: true,
				location: 'Vinewood Bowl',
				address: 'Vinewood Hills, Los Santos',
				createdBy: 'Event Team',
			},
			{
				id: '5',
				title: 'Politiåben-hus dag',
				description: 'Kom og mød politistyrken og lær om deres arbejde.',
				content: 'Kom og mød politistyrken og lær om deres arbejde. Der vil være fremvisning af udstyr, køretøjer og mulighed for at stille spørgsmål til betjentene. Arrangementet er for alle borgere i byen og er en del af politiets arbejde med at forbedre forholdet til lokalsamfundet.',
				createdAt: parseISO('2025-03-15'),
				type: 'event',
				eventType: 'community',
				eventDate: parseISO('2025-03-21T14:00:00'),
				isPinned: false,
				location: 'Politistationen',
				address: 'Downtown, Los Santos',
				createdBy: 'Politiet',
			},
			{
				id: '6',
				title: 'Paleto Bay Festival',
				description: 'Årlig festival i Paleto Bay med musik, mad og underholdning.',
				content: 'Årlig festival i Paleto Bay med musik, mad og underholdning. Der vil være livemusik fra lokale bands, madstande fra byens bedste restauranter, og forskellige aktiviteter for både børn og voksne. Festivalen varer hele dagen, så kom forbi når det passer dig!',
				createdAt: parseISO('2025-03-18'),
				type: 'event',
				eventType: 'special',
				eventDate: parseISO('2025-04-05T10:00:00'),
				isPinned: false,
				location: 'Paleto Bay Town Square',
				address: 'Paleto Bay, Blaine County',
				createdBy: 'Event Team',
			},
		];

		setItems(mockItems);
		filterItems(mockItems);
	}, []);

	useEffect(() => {
		filterItems(items);
	}, [selectedDate, activeTab, showPinnedOnly]);

	const filterItems = (itemsList: ContentItem[] = items) => {
		let filtered = [...itemsList];

		if (activeTab === 'news') {
			filtered = filtered.filter((item) => item.type === 'news');
		} else if (activeTab === 'events') {
			filtered = filtered.filter((item) => item.type === 'event');
		}

		if (showPinnedOnly) {
			filtered = filtered.filter((item) => item.isPinned);
		}

		if (activeTab === 'events' && selectedDate && viewMode === 'calendar') {
			filtered = filtered.filter((item) => {
				if (item.type === 'event') {
					return isSameDay(item.eventDate, selectedDate);
				}
				return false;
			});
		}

		filtered = filtered.sort((a, b) => {
			const dateA = a.type === 'event' ? a.eventDate : a.createdAt;
			const dateB = b.type === 'event' ? b.eventDate : b.createdAt;
			return dateB.getTime() - dateA.getTime();
		});

		setFilteredItems(filtered);
	};

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	const handleCreateItem = () => {
		if (!newItem.title || !newItem.description) {
			notifications.show({
				title: 'Manglende information',
				message: 'Venligst udfyld alle felter',
				color: 'red',
			});
			return;
		}

		const currentDate = new Date();

		const item: ContentItem =
			newItem.type === 'event'
				? {
						id: Date.now().toString(),
						title: newItem.title || '',
						description: newItem.description || '',
						content: newItem.content || newItem.description || '',
						createdAt: currentDate,
						isPinned: newItem.isPinned || false,
						type: 'event',
						eventType: (newItem.eventType as 'community' | 'official' | 'special') || 'community',
						eventDate: (newItem as any).eventDate || currentDate,
						location: (newItem as any).location,
						address: (newItem as any).address,
						createdBy: user?.username || 'Unknown',
				  }
				: {
						id: Date.now().toString(),
						title: newItem.title || '',
						description: newItem.description || '',
						content: newItem.content || newItem.description || '',
						createdAt: currentDate,
						isPinned: newItem.isPinned || false,
						type: 'news',
						newsType: newItem.type === 'news' ? (newItem.newsType as 'update' | 'announcement' | 'changelog') || 'announcement' : 'announcement',
						createdBy: user?.username || 'Unknown',
				  };

		const updatedItems = [...items, item];
		setItems(updatedItems);
		filterItems(updatedItems);

		setNewItem({
			title: '',
			description: '',
			content: '',
			type: 'news',
			newsType: 'announcement',
			isPinned: false,
		});

		close();

		notifications.show({
			title: newItem.type === 'event' ? 'Begivenhed oprettet' : 'Nyhed oprettet',
			message: `Dit indhold er blevet tilføjet til ${newItem.type === 'event' ? 'kalenderen' : 'nyheder'}`,
			color: 'green',
		});
	};

	const handleDeleteItem = (id: string) => {
		const updatedItems = items.filter((item) => item.id !== id);
		setItems(updatedItems);
		filterItems(updatedItems);

		if (selectedItem?.id === id) {
			closeItemModal();
		}

		notifications.show({
			title: 'Element slettet',
			message: 'Indholdet er blevet fjernet',
			color: 'red',
		});
	};

	const handleOpenItemModal = (item: ContentItem) => {
		setSelectedItem(item);
		openItemModal();
	};

	const togglePinItem = (id: string) => {
		const updatedItems = items.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item));
		setItems(updatedItems);
		filterItems(updatedItems);

		if (selectedItem?.id === id) {
			setSelectedItem({ ...selectedItem, isPinned: !selectedItem.isPinned });
		}

		notifications.show({
			title: 'Status opdateret',
			message: `Elementet er nu ${updatedItems.find((i) => i.id === id)?.isPinned ? 'fastgjort' : 'løsnet'}`,
			color: 'blue',
		});
	};

	const getTypeDetails = (item: ContentItem) => {
		if (item.type === 'news') {
			switch (item.newsType) {
				case 'update':
					return { color: 'blue', label: 'Opdatering', icon: <Bell size={16} weight='fill' /> };
				case 'announcement':
					return { color: 'orange', label: 'Meddelelse', icon: <Megaphone size={16} weight='fill' /> };
				case 'changelog':
					return { color: 'green', label: 'Changelog', icon: <FileText size={16} weight='fill' /> };
				default:
					return { color: 'gray', label: 'Nyhed', icon: <Bell size={16} weight='fill' /> };
			}
		} else {
			switch (item.eventType) {
				case 'official':
					return { color: 'blue', label: 'Officiel', icon: <ShieldCheck size={16} weight='fill' /> };
				case 'community':
					return { color: 'green', label: 'Fællesskab', icon: <CalendarCheck size={16} weight='fill' /> };
				case 'special':
					return { color: 'purple', label: 'Special', icon: <Star size={16} weight='fill' /> };
				default:
					return { color: 'gray', label: 'Begivenhed', icon: <CalendarIcon size={16} weight='fill' /> };
			}
		}
	};

	const renderDayContent = (date: Date) => {
		const dayEvents = items.filter((item) => item.type === 'event' && isSameDay((item as EventItem).eventDate, date));

		if (dayEvents.length === 0) {
			return null;
		}

		const colors = dayEvents.map((item) => {
			if (item.type === 'event') {
				switch (item.eventType) {
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
		.filter((item) => item.isPinned)
		.sort((a, b) => {
			const dateA = a.type === 'event' ? a.eventDate : a.createdAt;
			const dateB = b.type === 'event' ? b.eventDate : b.createdAt;
			return dateA.getTime() - dateB.getTime();
		})
		.slice(0, 4);

	return (
		<MainLayout requireAuth={false}>
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
													{format(item.eventDate, 'd. MMMM yyyy, HH:mm', { locale: da })}
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
																		{item.isPinned ? 'Fjern fastgørelse' : 'Fastgør'}
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
															{format(item.eventDate, 'HH:mm')}
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
															{item.isPinned && (
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
															{format(item.eventDate, 'd. MMMM yyyy, HH:mm', { locale: da })}
														</Text>
													)}

													{item.type === 'news' && (
														<Text size='sm' c='dimmed' mb='xs'>
															{format(item.createdAt, 'd. MMMM yyyy', { locale: da })}
															{item.lastUpdated && item.lastUpdated > item.createdAt && <> (opdateret {format(item.lastUpdated, 'd. MMMM', { locale: da })})</>}
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
																		{item.isPinned ? 'Fjern fastgørelse' : 'Fastgør'}
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
											const currentMonth = item.type === 'event' ? format(item.eventDate, 'MMMM yyyy', { locale: da }) : format(item.createdAt, 'MMMM yyyy', { locale: da });

											const previousMonth = index > 0 ? (arr[index - 1].type === 'event' ? format((arr[index - 1] as EventItem).eventDate, 'MMMM yyyy', { locale: da }) : format(arr[index - 1].createdAt, 'MMMM yyyy', { locale: da })) : '';

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
																{item.isPinned && (
																	<ActionIcon color='blue' variant='subtle' onClick={() => togglePinItem(item.id)}>
																		<PushPin size={16} weight='fill' />
																	</ActionIcon>
																)}
															</Group>
															<Group>
																{item.type === 'event' ? <Badge variant='outline'>{format((item as EventItem).eventDate, 'd. MMM, HH:mm', { locale: da })}</Badge> : <Badge variant='outline'>{format(item.createdAt, 'd. MMM', { locale: da })}</Badge>}
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
																					{item.isPinned ? 'Fjern fastgørelse' : 'Fastgør'}
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
															{item.createdBy && (
																<Text c='dimmed' size='sm'>
																	Oprettet af: {item.createdBy}
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
									value={newItem.type === 'news' ? newItem.newsType || 'announcement' : 'announcement'}
									onChange={(value) => setNewItem({ ...newItem, newsType: value as any })}
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
								<DatePickerInput label='Dato og tidspunkt' placeholder='Vælg dato og tidspunkt' valueFormat='DD MMM YYYY HH:mm' mb='md' required value={(newItem as any).eventDate || new Date()} onChange={(date) => setNewItem({ ...newItem, eventDate: date || new Date() })} locale='da' clearable={false} />

								<Box mb='md'>
									<Text fw={500} size='sm' mb='xs'>
										Begivenhedstype
									</Text>
									<SegmentedControl
										value={(newItem as any).eventType || 'community'}
										onChange={(value) => setNewItem({ ...newItem, eventType: value as any })}
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

						<Checkbox label='Fastgør dette indhold (vises i toppen og på forsiden)' checked={newItem.isPinned} onChange={(e) => setNewItem({ ...newItem, isPinned: e.currentTarget.checked })} mb='lg' />

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
									{selectedItem.isPinned && (
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
									<Text fw={500}>{format(selectedItem.eventDate, 'd. MMMM yyyy', { locale: da })}</Text>
									<Text>kl. {format(selectedItem.eventDate, 'HH:mm')}</Text>
								</Group>
							) : (
								<Group mb='md'>
									<CalendarIcon size={18} />
									<Text>
										{format(selectedItem.createdAt, 'd. MMMM yyyy', { locale: da })}
										{selectedItem.lastUpdated && selectedItem.lastUpdated > selectedItem.createdAt && <> (opdateret {format(selectedItem.lastUpdated, 'd. MMMM yyyy', { locale: da })})</>}
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

							{selectedItem.createdBy && (
								<Text size='sm' c='dimmed' mb='md'>
									Oprettet af: {selectedItem.createdBy}
								</Text>
							)}

							<Divider my='md' />

							<Text style={{ whiteSpace: 'pre-line' }}>{selectedItem.content || selectedItem.description}</Text>

							<Group justify='space-between' mt='xl'>
								<Group>
									{isAuthorized && (
										<>
											<Button variant='subtle' leftSection={<PushPin size={16} />} onClick={() => togglePinItem(selectedItem.id)}>
												{selectedItem.isPinned ? 'Fjern fastgørelse' : 'Fastgør'}
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
