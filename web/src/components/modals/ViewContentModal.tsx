import { Box, Group, Text, Badge, Modal, Button, Divider, ActionIcon } from '@mantine/core';
import { CalendarCheck, Calendar, Pin, Pencil, Trash, Star, Bell, Megaphone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ContentItem } from '../../lib/NewsEventsService';

interface ViewContentModalProps {
	opened: boolean;
	onClose: () => void;
	item: ContentItem | null;
	isAuthorized: boolean;
	onPin: (id: string) => void;
	onEdit: (item: ContentItem) => void;
	onDelete: (id: string) => void;
}

export function ViewContentModal({ opened, onClose, item, isAuthorized, onPin, onEdit, onDelete }: ViewContentModalProps) {
	if (!item) return null;

	const getTypeDetails = (contentItem: ContentItem) => {
		console.log('Modal - Content type:', contentItem.type, 'Event type:', contentItem.event_type, 'News type:', contentItem.news_type);

		if (contentItem.type === 'news') {
			if (contentItem.news_type === 'update') {
				return { color: 'blue', label: 'Opdatering', icon: <Bell size={16} /> };
			} else if (contentItem.news_type === 'announcement') {
				return { color: 'orange', label: 'Meddelelse', icon: <Megaphone size={16} /> };
			} else if (contentItem.news_type === 'changelog') {
				return { color: 'green', label: 'Changelog', icon: <FileText size={16} /> };
			} else {
				return { color: 'gray', label: 'Nyhed', icon: <Bell size={16} /> };
			}
		} else {
			if (contentItem.event_type === 'official') {
				return { color: 'blue', label: 'Officiel', icon: <CalendarCheck size={16} /> };
			} else if (contentItem.event_type === 'community') {
				return { color: 'green', label: 'Fællesskab', icon: <CalendarCheck size={16} /> };
			} else if (contentItem.event_type === 'special') {
				return { color: 'purple', label: 'Special', icon: <Star size={16} /> };
			} else {
				return { color: 'gray', label: 'Event', icon: <Calendar size={16} /> };
			}
		}
	};

	const typeDetails = getTypeDetails(item);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group>
					<Badge color={typeDetails.color} size='lg' leftSection={typeDetails.icon}>
						{typeDetails.label}
					</Badge>
					<Text fw={700}>{item.title}</Text>
					{item.is_pinned && (
						<ActionIcon color='blue' variant='subtle'>
							<Pin size={16} />
						</ActionIcon>
					)}
				</Group>
			}
			size='lg'
			centered
		>
			<Box>
				{item.type === 'event' ? (
					<Group mb='md'>
						<CalendarCheck size={18} />
						<Text fw={500}>{item.event_date ? format(new Date(item.event_date), 'd. MMMM yyyy') : 'Dato ikke tilgængelig'}</Text>
						<Text>kl. {item.event_date ? format(new Date(item.event_date), 'HH:mm') : 'N/A'}</Text>
					</Group>
				) : (
					<Group mb='md'>
						<Calendar size={18} />
						<Text>
							{format(new Date(item.created_at), 'd. MMMM yyyy')}
							{item.last_updated && new Date(item.last_updated) > new Date(item.created_at) && <> (opdateret {format(new Date(item.last_updated), 'd. MMMM yyyy')})</>}
						</Text>
					</Group>
				)}

				{item.type === 'event' && item.location && (
					<Group mb='md'>
						<Text fw={500}>Sted:</Text>
						<Text>
							{item.location}
							{item.address && `, ${item.address}`}
						</Text>
					</Group>
				)}

				{item.created_by && (
					<Text size='sm' c='dimmed' mb='md'>
						Oprettet af: {item.created_by}
					</Text>
				)}

				<Divider my='md' />

				<Text style={{ whiteSpace: 'pre-line' }}>{item.content || item.description}</Text>

				<Group justify='space-between' mt='xl'>
					<Group>
						{isAuthorized && (
							<>
								<Button variant='subtle' leftSection={<Pin size={16} />} onClick={() => onPin(item.id)}>
									{item.is_pinned ? 'Fjern fastgørelse' : 'Fastgør'}
								</Button>
								<Button variant='subtle' leftSection={<Pencil size={16} />} onClick={() => onEdit(item)}>
									Rediger
								</Button>
								<Button
									color='red'
									variant='subtle'
									leftSection={<Trash size={16} />}
									onClick={() => {
										onDelete(item.id);
										onClose();
									}}
								>
									Slet
								</Button>
							</>
						)}
					</Group>
					<Button onClick={onClose}>Luk</Button>
				</Group>

				{item.type === 'event' && (
					<Button fullWidth variant='light' mt='md' onClick={onClose}>
						Se alle begivenheder
					</Button>
				)}
			</Box>
		</Modal>
	);
}

export default ViewContentModal;
