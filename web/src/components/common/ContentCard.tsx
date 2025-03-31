import { Card, Text, Badge, Group, Button, ActionIcon, Menu } from '../mantine';
import { DotsThree, PushPin, Pencil, Trash, CheckCircle, CalendarCheck, Bell, Star, FileText, Megaphone } from '../icons';
import { format } from 'date-fns';
import { ContentItem } from '../../lib/NewsEventsService';
interface ContentCardProps {
	item: ContentItem;
	viewMode?: 'list' | 'grid';
	onView: (item: ContentItem) => void;
	onPin?: (id: string) => void;
	onEdit?: (item: ContentItem) => void;
	onDelete?: (id: string) => void;
	isAuthorized?: boolean;
}
export function ContentCard({ item, viewMode = 'list', onView, onPin, onEdit, onDelete, isAuthorized = false }: ContentCardProps) {
	const getTypeDetails = (contentItem: ContentItem) => {
		if (contentItem.type === 'news') {
			switch (contentItem.news_type) {
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
			switch (contentItem.event_type) {
				case 'official':
					return { color: 'blue', label: 'Officiel', icon: <CalendarCheck size={16} weight='fill' /> };
				case 'community':
					return { color: 'green', label: 'Fællesskab', icon: <CalendarCheck size={16} weight='fill' /> };
				case 'special':
					return { color: 'purple', label: 'Special', icon: <Star size={16} weight='fill' /> };
				default:
					return { color: 'gray', label: 'Event', icon: <CalendarCheck size={16} weight='fill' /> };
			}
		}
	};
	const typeDetails = getTypeDetails(item);
	if (viewMode === 'grid') {
		return (
			<Card withBorder shadow='sm' padding='md' radius='md' style={{ height: '100%' }}>
				<Card.Section withBorder inheritPadding py='xs'>
					<Group justify='space-between'>
						<Badge color={typeDetails.color} leftSection={typeDetails.icon}>
							{typeDetails.label}
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
						{item.event_date ? format(new Date(item.event_date), 'd. MMMM yyyy, HH:mm') : 'Dato ikke tilgængelig'}
					</Text>
				)}
				{item.type === 'news' && (
					<Text size='sm' c='dimmed' mb='xs'>
						{format(new Date(item.created_at), 'd. MMMM yyyy')}
						{item.last_updated && new Date(item.last_updated) > new Date(item.created_at) && <> (opdateret {format(new Date(item.last_updated), 'd. MMMM')})</>}
					</Text>
				)}
				<Text size='sm' lineClamp={3} mb='md'>
					{item.description}
				</Text>
				<Group mt='auto' justify='space-between'>
					<Button variant='light' onClick={() => onView(item)}>
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
								{onPin && (
									<Menu.Item onClick={() => onPin(item.id)} leftSection={<PushPin size={14} />}>
										{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
									</Menu.Item>
								)}
								{onEdit && (
									<Menu.Item leftSection={<Pencil size={14} />} onClick={() => onEdit(item)}>
										Rediger
									</Menu.Item>
								)}
								{onDelete && (
									<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => onDelete(item.id)}>
										Slet
									</Menu.Item>
								)}
							</Menu.Dropdown>
						</Menu>
					)}
				</Group>
			</Card>
		);
	}
		return (
		<Card mb='md' padding='md' radius='md' withBorder>
			<Group justify='space-between' mb='xs'>
				<Group>
					<Badge color={typeDetails.color} leftSection={typeDetails.icon}>
						{typeDetails.label}
					</Badge>
					<Text fw={700}>{item.title}</Text>
					{item.is_pinned && (
						<ActionIcon color='blue' variant='subtle' onClick={() => onPin && onPin(item.id)}>
							<PushPin size={16} weight='fill' />
						</ActionIcon>
					)}
				</Group>
				<Group>
					{item.type === 'event' && item.event_date ? <Badge variant='outline'>{format(new Date(item.event_date), 'd. MMM, HH:mm')}</Badge> : <Badge variant='outline'>{format(new Date(item.created_at), 'd. MMM')}</Badge>}
					<Menu shadow='md' width={200} position='bottom-end'>
						<Menu.Target>
							<ActionIcon>
								<DotsThree size={20} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item onClick={() => onView(item)} leftSection={<CheckCircle size={14} />}>
								Se detaljer
							</Menu.Item>
							{isAuthorized && (
								<>
									{onPin && (
										<Menu.Item onClick={() => onPin(item.id)} leftSection={<PushPin size={14} />}>
											{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
										</Menu.Item>
									)}
									{onEdit && (
										<Menu.Item leftSection={<Pencil size={14} />} onClick={() => onEdit(item)}>
											Rediger
										</Menu.Item>
									)}
									{onDelete && (
										<Menu.Item color='red' leftSection={<Trash size={14} />} onClick={() => onDelete(item.id)}>
											Slet
										</Menu.Item>
									)}
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
			<Button variant='subtle' size='sm' mt='sm' onClick={() => onView(item)}>
				Læs mere
			</Button>
		</Card>
	);
}
