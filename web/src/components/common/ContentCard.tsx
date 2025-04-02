import { Card, Text, Badge, Group, Button, ActionIcon, Menu, Box } from '@mantine/core';
import { Ellipsis, Pin, Pencil, Trash, CalendarCheck, Bell, Star, FileText, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { ContentItem } from '../../lib/NewsEventsService';

interface ContentCardProps {
	item: ContentItem;
	viewMode?: 'grid';
	onView: (item: ContentItem) => void;
	onPin?: (id: string) => void;
	onEdit?: (item: ContentItem) => void;
	onDelete?: (id: string) => void;
	isAuthorized?: boolean;
}

export function ContentCard({ item, onView, onPin, onEdit, onDelete, isAuthorized = false }: ContentCardProps) {
	const getTypeDetails = (contentItem: ContentItem) => {
		if (contentItem.type === 'news') {
			switch (contentItem.news_type) {
				case 'update':
					return { color: 'blue', label: 'Opdatering', icon: <Bell size={16} /> };
				case 'announcement':
					return { color: 'orange', label: 'Meddelelse', icon: <Megaphone size={16} /> };
				case 'changelog':
					return { color: 'green', label: 'Changelog', icon: <FileText size={16} /> };
				default:
					return { color: 'gray', label: 'Nyhed', icon: <Bell size={16} /> };
			}
		} else {
			switch (contentItem.event_type) {
				case 'official':
					return { color: 'blue', label: 'Officiel', icon: <CalendarCheck size={16} /> };
				case 'community':
					return { color: 'green', label: 'Fællesskab', icon: <CalendarCheck size={16} /> };
				case 'special':
					return { color: 'purple', label: 'Special', icon: <Star size={16} /> };
				default:
					return { color: 'gray', label: 'Event', icon: <CalendarCheck size={16} /> };
			}
		}
	};
	const typeDetails = getTypeDetails(item);

	return (
		<Card withBorder shadow='sm' padding='md' radius='md' h='100%'>
			<Card.Section withBorder py='xs'>
				<Group justify='space-between' align='center' wrap='nowrap' p={6}>
					<Badge color={typeDetails.color} variant='light' leftSection={typeDetails.icon}>
						{typeDetails.label}
					</Badge>
					<Box w={20} h={20} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						{item.is_pinned && (
							<ActionIcon size='sm' color='blue' variant='subtle' p={2} radius={4}>
								<Pin size={16} />
							</ActionIcon>
						)}
					</Box>
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

			{item.type === 'event' && item.location && (
				<Text size='xs' c='dimmed' mb='xs'>
					Lokation: {item.location}
				</Text>
			)}
			{item.created_by && (
				<Text size='xs' c='dimmed' mb='xs'>
					Oprettet af: {item.created_by}
				</Text>
			)}

			<Text size='sm' lineClamp={3} mb='md'>
				{item.description}
			</Text>
			<Group mt='auto' justify='space-between'>
				<Button variant='light' onClick={() => onView(item)} radius={4}>
					Læs mere
				</Button>
				{isAuthorized && (
					<Menu shadow='md' width={200} position='bottom-end'>
						<Menu.Target>
							<ActionIcon radius={4}>
								<Ellipsis size={20} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							{onPin && (
								<Menu.Item onClick={() => onPin(item.id)} leftSection={<Pin size={14} />}>
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
