import { useState, useEffect } from 'react';
import { Button, Group, TextInput, Textarea, Modal, SegmentedControl, Switch, Text, Box, DateTimePicker, notifications } from '../mantine';
import { ContentItem } from '../../lib/NewsEventsService';

interface EditContentModalProps {
	item: ContentItem | null;
	opened: boolean;
	onClose: () => void;
	onUpdate: (id: string, updates: Partial<ContentItem>) => Promise<boolean>;
}

export function EditContentModal({ item, opened, onClose, onUpdate }: EditContentModalProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [content, setContent] = useState('');
	const [isPinned, setIsPinned] = useState(false);
	const [newsType, setNewsType] = useState<'update' | 'announcement' | 'changelog'>('announcement');
	const [eventType, setEventType] = useState<'community' | 'official' | 'special'>('community');
	const [eventDate, setEventDate] = useState<Date | null>(null);
	const [location, setLocation] = useState('');
	const [address, setAddress] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (item) {
			setTitle(item.title || '');
			setDescription(item.description || '');
			setContent(item.content || '');
			setIsPinned(item.is_pinned || false);

			if (item.type === 'news' && item.news_type) {
				setNewsType(item.news_type);
			}

			if (item.type === 'event') {
				if (item.event_type) setEventType(item.event_type);
				if (item.event_date) setEventDate(new Date(item.event_date));
				if (item.location) setLocation(item.location || '');
				if (item.address) setAddress(item.address || '');
			}
		}
	}, [item, opened]);

	const handleSubmit = async () => {
		if (!item) return;
		if (!title || !description) {
			notifications.show({
				title: 'Manglende information',
				message: 'Udfyld venligst alle påkrævede felter',
				color: 'red',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const updates: Partial<ContentItem> = {
				title,
				description,
				content,
				is_pinned: isPinned,
			};

			if (item.type === 'news') {
				updates.news_type = newsType;
			}

			if (item.type === 'event') {
				updates.event_type = eventType;
				updates.event_date = eventDate;
				updates.location = location;
				updates.address = address;
			}

			const success = await onUpdate(item.id, updates);

			if (success) {
				notifications.show({
					title: 'Indhold opdateret',
					message: 'Indholdet er blevet opdateret med succes',
					color: 'green',
				});
				onClose();
			} else {
				throw new Error('Failed to update content');
			}
		} catch (error) {
			console.error('Error updating content:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under opdatering af indholdet',
				color: 'red',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!item) return null;

	return (
		<Modal opened={opened} onClose={onClose} title={`Rediger ${item.type === 'news' ? 'Nyhed' : 'Begivenhed'}`} size='lg'>
			<TextInput label='Titel' value={title} onChange={(e) => setTitle(e.currentTarget.value)} mb='md' required />

			<TextInput label='Kort beskrivelse' value={description} onChange={(e) => setDescription(e.currentTarget.value)} mb='md' required />

			<Textarea label='Indhold' value={content} onChange={(e) => setContent(e.currentTarget.value)} minRows={5} mb='md' />

			{item.type === 'news' && (
				<Box mb='md'>
					<Text size='sm' fw={500} mb='xs'>
						Type
					</Text>
					<SegmentedControl
						data={[
							{ label: 'Meddelelse', value: 'announcement' },
							{ label: 'Opdatering', value: 'update' },
							{ label: 'Changelog', value: 'changelog' },
						]}
						value={newsType}
						onChange={(value) => setNewsType(value as 'update' | 'announcement' | 'changelog')}
						fullWidth
					/>
				</Box>
			)}

			{item.type === 'event' && (
				<>
					<DateTimePicker label='Dato og tidspunkt' placeholder='Vælg dato og tidspunkt' valueFormat='DD MMM YYYY HH:mm' value={eventDate} onChange={setEventDate} locale='da' mb='md' clearable />

					<Box mb='md'>
						<Text size='sm' fw={500} mb='xs'>
							Type
						</Text>
						<SegmentedControl
							data={[
								{ label: 'Fællesskab', value: 'community' },
								{ label: 'Officiel', value: 'official' },
								{ label: 'Special', value: 'special' },
							]}
							value={eventType}
							onChange={(value) => setEventType(value as 'community' | 'official' | 'special')}
							fullWidth
						/>
					</Box>

					<TextInput label='Lokation' placeholder='Hvor afholdes begivenheden?' value={location} onChange={(e) => setLocation(e.currentTarget.value)} mb='md' />

					<TextInput label='Adresse' placeholder='Specifik adresse (valgfri)' value={address} onChange={(e) => setAddress(e.currentTarget.value)} mb='md' />
				</>
			)}

			<Switch label='Fastgør dette indhold (vises i toppen og på forsiden)' checked={isPinned} onChange={(e) => setIsPinned(e.currentTarget.checked)} mb='lg' />

			<Group justify='flex-end'>
				<Button variant='outline' onClick={onClose}>
					Annuller
				</Button>
				<Button onClick={handleSubmit} color='blue' loading={isSubmitting}>
					Gem ændringer
				</Button>
			</Group>
		</Modal>
	);
}
