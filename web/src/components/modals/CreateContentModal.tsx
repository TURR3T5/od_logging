import { useState, useEffect } from 'react';
import { Box, Button, Group, TextInput, Textarea, Modal, SegmentedControl, Tabs, Text, Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateTimePicker } from '@mantine/dates';
import { FileText, Calendar } from 'lucide-react';
import { ContentItem } from '../../lib/NewsEventsService';

interface CreateContentModalProps {
	opened: boolean;
	onClose: () => void;
	onCreate: (contentData: Omit<ContentItem, 'id' | 'created_at'>) => Promise<boolean>;
}

export function CreateContentModal({ opened, onClose, onCreate }: CreateContentModalProps) {
	const [newItem, setNewItem] = useState<Partial<ContentItem>>({
		title: '',
		description: '',
		content: '',
		type: 'news',
		news_type: 'announcement',
		event_type: 'community',
		is_pinned: false,
		category: 'general',
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [createType, setCreateType] = useState<'news' | 'event'>('news');

	useEffect(() => {
		if (opened) {
			resetForm();
		}
	}, [opened, createType]);

	const resetForm = () => {
		setNewItem({
			title: '',
			description: '',
			content: '',
			type: createType,
			news_type: 'announcement',
			event_type: 'community',
			is_pinned: false,
			category: 'general',
		});
	};

	const updateNewItem = (key: keyof ContentItem, value: any) => {
		setNewItem((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleCreateItem = async () => {
		if (!newItem.title || !newItem.description) {
			notifications.show({
				title: 'Manglende information',
				message: 'Venligst udfyld alle påkrævede felter',
				color: 'red',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const success = await onCreate({
				...newItem,
				type: createType,
			} as Omit<ContentItem, 'id' | 'created_at'>);

			console.log('Create content response:', newItem, success);

			if (success) {
				notifications.show({
					title: 'Indhold oprettet',
					message: 'Det nye indhold er blevet oprettet med succes',
					color: 'green',
				});
				onClose();
			} else {
				throw new Error('Failed to create content');
			}
		} catch (error) {
			console.error('Error creating content:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under oprettelse af indholdet',
				color: 'red',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal opened={opened} onClose={onClose} title='Opret nyt indhold' size='lg' centered>
			<Box>
				<Tabs value={createType} onChange={(value) => setCreateType(value as 'news' | 'event')}>
					<Tabs.List mb='md'>
						<Tabs.Tab value='news' leftSection={<FileText size={16} />}>
							Nyhed
						</Tabs.Tab>
						<Tabs.Tab value='event' leftSection={<Calendar size={16} />}>
							Begivenhed
						</Tabs.Tab>
					</Tabs.List>
				</Tabs>

				<TextInput label='Titel' placeholder='Skriv en titel' mb='md' required value={newItem.title || ''} onChange={(e) => updateNewItem('title', e.target.value)} />

				<TextInput label='Kort beskrivelse' placeholder='Kort beskrivelse (vises i oversigten)' mb='md' required value={newItem.description || ''} onChange={(e) => updateNewItem('description', e.target.value)} />

				{createType === 'news' && (
					<Box mb='md'>
						<Text fw={500} size='sm' mb='xs'>
							Nyhedstype
						</Text>
						<SegmentedControl
							value={newItem.news_type || 'announcement'}
							onChange={(value) => updateNewItem('news_type', value)}
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
						<DateTimePicker label='Dato og tidspunkt' placeholder='Vælg dato og tidspunkt' valueFormat='DD MMM YYYY HH:mm' mb='md' required value={newItem.event_date instanceof Date ? newItem.event_date : null} onChange={(date) => updateNewItem('event_date', date)} clearable={false} />

						<Box mb='md'>
							<Text fw={500} size='sm' mb='xs'>
								Begivenhedstype
							</Text>
							<SegmentedControl
								value={newItem.event_type || 'community'}
								onChange={(value) => updateNewItem('event_type', value)}
								data={[
									{ label: 'Fællesskab', value: 'community' },
									{ label: 'Officiel', value: 'official' },
									{ label: 'Special', value: 'special' },
								]}
								fullWidth
							/>
						</Box>

						<TextInput label='Lokation' placeholder='Hvor afholdes begivenheden?' mb='md' value={newItem.location || ''} onChange={(e) => updateNewItem('location', e.target.value)} />

						<TextInput label='Adresse' placeholder='Specifik adresse (valgfri)' mb='md' value={newItem.address || ''} onChange={(e) => updateNewItem('address', e.target.value)} />
					</>
				)}

				<Textarea label='Indhold' placeholder='Detaljeret beskrivelse af indholdet' minRows={6} mb='md' value={newItem.content || ''} onChange={(e) => updateNewItem('content', e.target.value)} />

				<Checkbox label='Fastgør dette indhold (vises i toppen og på forsiden)' checked={newItem.is_pinned || false} onChange={(e) => updateNewItem('is_pinned', e.currentTarget.checked)} mb='lg' />

				<Group justify='flex-end'>
					<Button variant='outline' onClick={onClose}>
						Annuller
					</Button>
					<Button onClick={handleCreateItem} loading={isSubmitting}>
						Opret
					</Button>
				</Group>
			</Box>
		</Modal>
	);
}

export default CreateContentModal;
