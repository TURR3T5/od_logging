import { useState, useEffect } from 'react';
import { Box, Group, TextInput, Tabs, Textarea, MultiSelect, Switch, Button, Text, Paper, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Pencil, Eye, Trash } from '@phosphor-icons/react';
import RuleApiService, { Rule } from '../../lib/RuleApiService';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useDisclosure } from '@mantine/hooks';

interface EditRuleModalProps {
	currentRule: Rule | null;
	opened: boolean;
	onClose: () => void;
	onRuleUpdated: () => void;
	username?: string;
}

export default function EditRuleModal({ currentRule, opened, onClose, onRuleUpdated, username }: EditRuleModalProps) {
	const [editedTitle, setEditedTitle] = useState('');
	const [editedContent, setEditedContent] = useState('');
	const [editedTags, setEditedTags] = useState<string[]>([]);
	const [isPinned, setIsPinned] = useState(false);
	const [editedBadge, setEditedBadge] = useState('');
	const [changeNotes, setChangeNotes] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);

	useEffect(() => {
		if (opened && currentRule) {
			setEditedTitle(currentRule.title);
			setEditedContent(currentRule.content || '');
			setEditedTags(currentRule.tags || []);
			setIsPinned(currentRule.is_pinned);
			setEditedBadge(currentRule.badge);
			setChangeNotes('');
		}
	}, [opened, currentRule]);

	const handleSaveRule = async () => {
		if (!currentRule) return;

		setIsSaving(true);
		try {
			await RuleApiService.updateRule(
				currentRule.id,
				{
					title: editedTitle,
					content: editedContent,
					tags: editedTags,
					is_pinned: isPinned,
					badge: editedBadge,
					updated_by: username || 'Unknown',
				},
				changeNotes
			);

			notifications.show({
				title: 'Regel opdateret',
				message: 'Reglen er blevet opdateret med succes',
				color: 'green',
			});

			onRuleUpdated();
			onClose();
		} catch (error) {
			console.error('Error updating rule:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under opdatering af reglen',
				color: 'red',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteClick = (id: string) => {
		setItemToDelete(id);
		openConfirmModal();
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;

		setIsDeleting(true);
		try {
			await RuleApiService.deleteRule(itemToDelete);

			notifications.show({
				title: 'Regel slettet',
				message: 'Reglen er blevet slettet med succes',
				color: 'green',
			});

			onRuleUpdated();
			onClose();
		} catch (error) {
			console.error('Error deleting rule:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under sletning af reglen',
				color: 'red',
			});
		} finally {
			setIsDeleting(false);
			closeConfirmModal();
		}
	};

	return (
		<>
			<Modal opened={opened} onClose={onClose} title={<Text fw={700}>Rediger Regel {currentRule?.badge}</Text>} size='lg'>
				{currentRule && (
					<Box>
						<Group grow mb='md'>
							<TextInput label='Badge' value={editedBadge} onChange={(e) => setEditedBadge(e.target.value)} required />
							<TextInput label='Titel' value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} required />
						</Group>

						<Tabs defaultValue='edit'>
							<Tabs.List mb='xs'>
								<Tabs.Tab value='edit' leftSection={<Pencil size={14} />}>
									Rediger
								</Tabs.Tab>
								<Tabs.Tab value='preview' leftSection={<Eye size={14} />}>
									Forhåndsvisning
								</Tabs.Tab>
							</Tabs.List>

							<Tabs.Panel value='edit' pt='xs'>
								<Textarea label='Indhold' value={editedContent} onChange={(e) => setEditedContent(e.target.value)} minRows={10} mb='md' required />
							</Tabs.Panel>

							<Tabs.Panel value='preview' pt='xs'>
								<Paper withBorder p='md' style={{ minHeight: '200px' }}>
									{editedContent}
								</Paper>
							</Tabs.Panel>
						</Tabs>

						<MultiSelect
							label='Tags'
							data={[
								{ value: 'behavior', label: 'Opførsel' },
								{ value: 'combat', label: 'Kamp' },
								{ value: 'roleplay', label: 'Rollespil' },
								{ value: 'ooc', label: 'OOC' },
								{ value: 'fear', label: 'Fear RP' },
								{ value: 'rdm', label: 'RDM' },
								{ value: 'vdm', label: 'VDM' },
								{ value: 'metagaming', label: 'Metagaming' },
								{ value: 'powergaming', label: 'Powergaming' },
								{ value: 'nlr', label: 'NLR' },
								{ value: 'support', label: 'Support' },
								{ value: 'staff', label: 'Staff' },
								{ value: 'discord', label: 'Discord' },
							]}
							value={editedTags}
							onChange={setEditedTags}
							mb='md'
							searchable
						/>

						<Switch label='Fastgør til Hurtigt Overblik' checked={isPinned} onChange={(e) => setIsPinned(e.currentTarget.checked)} mb='md' />

						<Textarea label='Ændringsnoter (valgfrit)' placeholder='Beskriv kort hvad der er ændret og hvorfor' value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} mb='lg' />

						<Group justify='space-between'>
							<Button color='red' variant='outline' leftSection={<Trash size={16} />} onClick={() => handleDeleteClick(currentRule.id)}>
								Slet regel
							</Button>
							<Group>
								<Button variant='outline' onClick={onClose}>
									Annuller
								</Button>
								<Button onClick={handleSaveRule} loading={isSaving}>
									Gem Ændringer
								</Button>
							</Group>
						</Group>
					</Box>
				)}
			</Modal>

			<ConfirmationModal opened={confirmModalOpened} onClose={closeConfirmModal} onConfirm={handleConfirmDelete} title='Bekræft sletning' message='Er du sikker på, at du vil slette dette element? Denne handling kan ikke fortrydes.' confirmLabel='Slet' variant='danger' isLoading={isDeleting} />
		</>
	);
}
